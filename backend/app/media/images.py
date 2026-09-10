"""
Image ingest pipeline.

Uploaded images are decoded, validated, re-encoded to a bounded WebP and stored
as bytes in Postgres. Storing in the database (rather than on disk) is a
deliberate choice: the app is deployed as a container with an ephemeral
filesystem, so anything written to disk is lost on the next deploy or restart.

A typical 3-4MB phone photo lands at roughly 150-250KB after optimize(), which
keeps the whole library comfortably inside a small managed Postgres.
"""

import hashlib
import io
from datetime import UTC
from email.utils import format_datetime

from fastapi import HTTPException, Request, Response
from PIL import Image, ImageOps, UnidentifiedImageError

# Reject anything larger than this before handing it to Pillow, so a huge
# upload cannot be used to exhaust memory.
MAX_UPLOAD_BYTES = 16 * 1024 * 1024  # 16MB

# Guard against decompression bombs: a small file that expands to an enormous
# bitmap. Pillow warns above ~89M pixels by default; be stricter.
MAX_PIXELS = 50_000_000

# Longest edge of the stored image. Large enough for a full-width hero on a
# retina display, small enough to stay cheap.
DEFAULT_MAX_DIM = 1600
DEFAULT_QUALITY = 82

OUTPUT_MIME = "image/webp"


class ImageTooLargeError(ValueError):
    """Raised when an upload exceeds MAX_UPLOAD_BYTES or MAX_PIXELS."""


class InvalidImageError(ValueError):
    """Raised when the payload is not a decodable image."""


def optimize(
    raw: bytes,
    max_dim: int = DEFAULT_MAX_DIM,
    quality: int = DEFAULT_QUALITY,
) -> tuple[bytes, str]:
    """
    Validate, downscale and re-encode an uploaded image.

    Returns (encoded_bytes, mime_type). Raises InvalidImageError if the payload
    is not an image, or ImageTooLargeError if it exceeds the configured limits.
    """
    if not raw:
        raise InvalidImageError("Empty image payload")

    if len(raw) > MAX_UPLOAD_BYTES:
        raise ImageTooLargeError(
            f"Image is {len(raw) // 1024}KB; limit is {MAX_UPLOAD_BYTES // 1024}KB"
        )

    try:
        img = Image.open(io.BytesIO(raw))
        # Confirms the payload really is an image before we allocate for it.
        img.verify()
        # verify() leaves the file object unusable, so reopen to actually read.
        img = Image.open(io.BytesIO(raw))
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise InvalidImageError(f"Not a readable image: {exc}") from exc

    width, height = img.size
    if width * height > MAX_PIXELS:
        raise ImageTooLargeError(f"Image is {width}x{height}; limit is {MAX_PIXELS} pixels")

    # Honour the EXIF orientation flag, then drop the metadata with it —
    # phone photos otherwise appear rotated, and EXIF can carry GPS location.
    img = ImageOps.exif_transpose(img)

    # WebP has no palette/alpha edge cases to worry about once we are in RGB.
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # thumbnail() only ever shrinks, so small uploads are left at their size.
    img.thumbnail((max_dim, max_dim), Image.LANCZOS)

    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality, method=6)
    return buf.getvalue(), OUTPUT_MIME


def optimize_or_none(raw: bytes | None) -> tuple[bytes | None, str | None]:
    """
    Convenience wrapper for the service layer: passes None straight through so
    callers do not have to special-case "no image supplied".
    """
    if not raw:
        return None, None
    return optimize(raw)


def build_image_response(
    record: dict | None,
    data_key: str,
    type_key: str,
    request: Request | None = None,
) -> Response:
    """
    Turn a {bytes, mime, updated_at} row into a cacheable HTTP response.

    Callers hit these URLs as /{id}/image?v=<updated_at>, so the bytes at a
    given URL never change and can be cached indefinitely. The ETag lets a
    client that ignores the version parameter still revalidate cheaply.
    """
    if not record or not record.get(data_key):
        raise HTTPException(status_code=404, detail="Image not found")

    payload = record[data_key]
    if isinstance(payload, memoryview):
        payload = bytes(payload)

    updated_at = record.get("updated_at")
    etag = f'"{hashlib.sha256(payload).hexdigest()[:32]}"'

    if request is not None and request.headers.get("if-none-match") == etag:
        return Response(status_code=304, headers={"ETag": etag})

    headers = {
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
    }
    if updated_at is not None:
        # The columns are TIMESTAMP WITHOUT TIME ZONE and are written with
        # CURRENT_TIMESTAMP / utcnow(), so the naive value is already UTC —
        # but format_datetime(usegmt=True) demands that be explicit.
        if updated_at.tzinfo is None:
            updated_at = updated_at.replace(tzinfo=UTC)
        headers["Last-Modified"] = format_datetime(updated_at, usegmt=True)

    return Response(
        content=payload,
        media_type=record.get(type_key) or OUTPUT_MIME,
        headers=headers,
    )
