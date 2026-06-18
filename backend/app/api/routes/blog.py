from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db import get_db
from app.models import BlogPost
from app.schemas import BlogPostResponse, BlogPostCreate, BlogPostUpdate, PaginationParams

router = APIRouter(prefix="/blog", tags=["Blog Posts"])


@router.get("", response_model=List[BlogPostResponse])
def get_blog_posts(
    params: PaginationParams = Depends(),
    db: Session = Depends(get_db)
):
    """Get all published blog posts with pagination."""
    posts = db.query(BlogPost)\
        .filter(BlogPost.is_published == True)\
        .order_by(BlogPost.published_at.desc())\
        .offset(params.skip)\
        .limit(params.limit)\
        .all()
    return posts


@router.get("/{slug}", response_model=BlogPostResponse)
def get_blog_post_by_slug(slug: str, db: Session = Depends(get_db)):
    """Get a specific blog post by slug."""
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@router.post("", response_model=BlogPostResponse, status_code=status.HTTP_201_CREATED)
def create_blog_post(post_in: BlogPostCreate, db: Session = Depends(get_db)):
    """Create a new blog post."""
    existing = db.query(BlogPost).filter(BlogPost.slug == post_in.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")
    
    post = BlogPost(**post_in.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.put("/{id}", response_model=BlogPostResponse)
def update_blog_post(id: int, post_in: BlogPostUpdate, db: Session = Depends(get_db)):
    """Update a blog post."""
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_data = post_in.model_dump(exclude_unset=True)
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
def delete_blog_post(id: int, db: Session = Depends(get_db)):
    """Delete a blog post."""
    post = db.query(BlogPost).filter(BlogPost.id == id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(post)
    db.commit()
    return None
