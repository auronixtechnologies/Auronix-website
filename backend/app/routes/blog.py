from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_admin
from app.media.encoding import convert_base64_to_binary
from app.media.images import ImageTooLargeError, InvalidImageError, build_image_response, optimize
from app.models import BlogPost
from app.schemas import BlogPostCreate, BlogPostResponse, BlogPostUpdate, PaginationParams

router = APIRouter(prefix="/blog", tags=["Blog Posts"])


def _prepare_blog_image(base64_str):
    """Decode and optimise an uploaded cover image. Mirrors the service layer."""
    if not base64_str:
        return None, None
    raw = convert_base64_to_binary(base64_str)
    if raw is None:
        raise HTTPException(status_code=400, detail="Image is not valid base64")
    try:
        return optimize(raw)
    except ImageTooLargeError as exc:
        raise HTTPException(status_code=413, detail=str(exc)) from exc
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("", response_model=list[BlogPostResponse])
def get_blog_posts(params: PaginationParams = Depends(), db: Session = Depends(get_db)):
    """Get all published blog posts with pagination."""
    posts = (
        db.query(BlogPost)
        .filter(BlogPost.is_published.is_(True))
        .order_by(BlogPost.published_at.desc())
        .offset(params.skip)
        .limit(params.limit)
        .all()
    )
    return posts


@router.get("/{slug}/image")
def get_blog_post_image(slug: str, request: Request, db: Session = Depends(get_db)):
    """
    Serve a published post's cover image.

    Only the image columns are selected, so listing posts never pulls image
    bytes out of the database.
    """
    row = (
        db.query(BlogPost.image_data, BlogPost.image_type, BlogPost.updated_at)
        .filter(BlogPost.slug == slug, BlogPost.is_published.is_(True))
        .first()
    )
    record = {"image_data": row[0], "image_type": row[1], "updated_at": row[2]} if row else None
    return build_image_response(record, "image_data", "image_type", request)


@router.get("/{slug}", response_model=BlogPostResponse)
def get_blog_post_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a specific blog post by slug."""
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published.is_(True)).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
def create_blog_post(
    post_in: BlogPostCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Create a new blog post.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    existing = db.query(BlogPost).filter(BlogPost.slug == post_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    payload = post_in.model_dump()
    payload["image_data"], payload["image_type"] = _prepare_blog_image(payload.get("image_data"))

    post = BlogPost(**payload)
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{id}", response_model=BlogPostResponse)
def update_blog_post(
    id: int,
    post_in: BlogPostUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Update a blog post.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")

    update_data = post_in.model_dump(exclude_unset=True)
    if "image_data" in update_data:
        update_data["image_data"], update_data["image_type"] = _prepare_blog_image(
            update_data["image_data"]
        )
    if "slug" in update_data and update_data["slug"] != post.slug:
        existing = db.query(BlogPost).filter(BlogPost.slug == update_data["slug"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already exists")

    for key, value in update_data.items():
        setattr(post, key, value)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog_post(
    id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Delete a blog post.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(post)
    db.commit()
    return None
