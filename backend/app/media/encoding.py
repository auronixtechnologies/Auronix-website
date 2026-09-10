"""
base64 <-> bytes helpers for image uploads.

The admin panel sends images as base64 in JSON; this decodes them before they
reach app/media/images.py. Responses never carry base64, so there is no
encode-side counterpart.
"""

import base64

from app.core.logging import get_logger

logger = get_logger(__name__)


def convert_base64_to_binary(base64_str: str | None) -> bytes | None:
    """
    Decode a base64 image payload, with or without a data URI prefix.

    Returns None for empty input or undecodable data; callers turn that into
    a 400 rather than letting it reach the database.
    """
    if not base64_str:
        return None

    # Strip a leading "data:image/jpeg;base64," if the client sent one.
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]

    # Some encoders wrap base64 at a fixed column; validate=True would reject
    # those newlines, so strip all whitespace before validating.
    compact = "".join(base64_str.split())

    try:
        return base64.b64decode(compact, validate=True)
    except (ValueError, TypeError) as exc:
        logger.warning("Rejected malformed base64 image payload: %s", exc)
        return None
