"""
Pydantic schemas for request/response validation.
Separates database models from API contracts.
"""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# Image fields are write-only. Uploads arrive as base64 on the *Base schemas;
# responses expose has_image and the bytes are served from a dedicated
# /{id}/image endpoint, so a list of 20 records no longer carries 20 images.
def _derive_has_image(model, field: str):
    """Set has_image from a raw byte payload, then drop the payload."""
    if getattr(model, field, None) is not None:
        model.has_image = True
        setattr(model, field, None)
    return model


# ===== Team Members Schemas =====


class TeamMemberBase(BaseModel):
    """Base schema for team member data."""

    name: str
    role: str
    bio: str | None = None
    skills: list[str] | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    profile_image_data: str | None = None  # Base64 encoded image
    profile_image_type: str | None = None  # MIME type (e.g., 'image/jpeg')
    experience_level: str  # junior, mid, senior, lead


class TeamMemberCreate(TeamMemberBase):
    """Schema for creating a team member."""

    pass


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member (all fields optional)."""

    name: str | None = None
    role: str | None = None
    bio: str | None = None
    skills: list[str] | None = None
    linkedin_url: str | None = None
    portfolio_url: str | None = None
    profile_image_data: str | None = None  # Base64 encoded image
    profile_image_type: str | None = None  # MIME type (e.g., 'image/jpeg')
    experience_level: str | None = None


class TeamMemberResponse(TeamMemberBase):
    """
    Schema for team member response.

    profile_image_data is excluded: image bytes are served from
    GET /team/{id}/image instead of being inlined as base64 on every read.
    """

    id: int
    has_image: bool = False
    created_at: datetime
    updated_at: datetime
    projects: list[dict[str, Any]] | None = None

    profile_image_data: Any | None = Field(default=None, exclude=True)

    @model_validator(mode="after")
    def derive_has_image(self):
        return _derive_has_image(self, "profile_image_data")

    class Config:
        from_attributes = True  # Allows reading from ORM models


# ===== Projects Schemas =====


class ProjectBase(BaseModel):
    """Base schema for project data."""

    title: str
    description: str
    category: str | None = (
        "Student Projects"  # Client Projects, Student Projects, Auronix's Arsenal
    )
    domain: str  # Web, ML, LLM, MCP
    tech_stack: list[str]
    github_link: str | None = None
    demo_link: str | None = None
    price: str | None = None
    project_image_data: str | None = None  # Base64 encoded image
    project_image_type: str | None = None  # MIME type (e.g., 'image/jpeg')
    is_featured: bool | None = False


class ProjectCreate(ProjectBase):
    """Schema for creating a project."""

    created_by: int
    team_member_ids: list[int] | None = None  # List of team member IDs


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""

    title: str | None = None
    description: str | None = None
    category: str | None = None
    domain: str | None = None
    tech_stack: list[str] | None = None
    github_link: str | None = None
    demo_link: str | None = None
    price: str | None = None
    project_image_data: str | None = None  # Base64 encoded image
    project_image_type: str | None = None  # MIME type (e.g., 'image/jpeg')
    is_featured: bool | None = None
    team_member_ids: list[int] | None = None  # List of team member IDs


class ProjectResponse(ProjectBase):
    """
    Schema for project response.

    project_image_data is excluded: image bytes are served from
    GET /projects/{id}/image instead of being inlined as base64 on every read.
    """

    id: int
    has_image: bool = False
    created_by: int | None = None
    team_members: list[TeamMemberResponse] = []  # List of assigned team members
    created_at: datetime
    updated_at: datetime

    project_image_data: Any | None = Field(default=None, exclude=True)

    @model_validator(mode="after")
    def derive_has_image(self):
        return _derive_has_image(self, "project_image_data")

    class Config:
        from_attributes = True


# ===== Client Projects Schemas =====


class ClientProjectBase(BaseModel):
    """Base schema for client project data."""

    client_name: str
    project_title: str
    description: str
    technologies: list[str]
    outcome: str | None = None
    testimonial: str | None = None
    project_url: str | None = None
    project_image_data: str | None = None  # Base64 encoded image
    project_image_type: str | None = None  # MIME type (e.g., 'image/jpeg')
    is_featured: bool | None = False
    completed_at: datetime


class ClientProjectCreate(ClientProjectBase):
    """Schema for creating a client project."""

    pass


class ClientProjectUpdate(BaseModel):
    """Schema for updating a client project."""

    client_name: str | None = None
    project_title: str | None = None
    description: str | None = None
    technologies: list[str] | None = None
    outcome: str | None = None
    testimonial: str | None = None
    project_url: str | None = None
    project_image_data: str | None = None  # Base64 encoded image
    project_image_type: str | None = None  # MIME type (e.g., 'image/jpeg')
    is_featured: bool | None = None
    completed_at: datetime | None = None


class ClientProjectResponse(ClientProjectBase):
    """
    Schema for client project response.

    project_image_data is excluded: image bytes are served from
    GET /client-projects/{id}/image.
    """

    id: int
    has_image: bool = False
    created_at: datetime
    updated_at: datetime

    project_image_data: Any | None = Field(default=None, exclude=True)

    @model_validator(mode="after")
    def derive_has_image(self):
        return _derive_has_image(self, "project_image_data")

    class Config:
        from_attributes = True


# ===== Leads Schemas =====


class LeadBase(BaseModel):
    """Base schema for lead data."""

    name: str
    email: EmailStr  # Validates email format
    phone: str | None = None
    service_type: str | None = None
    budget: str | None = None
    message: str


class LeadCreate(LeadBase):
    """Schema for creating a lead."""

    pass


class LeadResponse(LeadBase):
    """Schema for lead response."""

    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== Pagination Schemas =====


class PaginationParams(BaseModel):
    """Schema for pagination parameters."""

    skip: int = 0
    limit: int = 10

    @field_validator("skip")
    @classmethod
    def skip_must_be_ge_zero(cls, v):
        if v < 0:
            raise ValueError("skip must be greater than or equal to 0")
        return v

    @field_validator("limit")
    @classmethod
    def limit_must_be_between(cls, v):
        if v < 1 or v > 100:
            raise ValueError("limit must be between 1 and 100")
        return v


# ===== Blog Posts Schemas =====


class BlogPostBase(BaseModel):
    """Base schema for blog post data."""

    title: str
    slug: str
    content: str
    published_at: datetime | None = None
    is_published: bool | None = False
    image_data: str | None = None
    image_type: str | None = None
    tags: list[str] | None = None


class BlogPostCreate(BlogPostBase):
    """Schema for creating a blog post."""

    author_id: int | None = None


class BlogPostUpdate(BaseModel):
    """Schema for updating a blog post."""

    title: str | None = None
    slug: str | None = None
    content: str | None = None
    author_id: int | None = None
    published_at: datetime | None = None
    is_published: bool | None = None
    image_data: str | None = None
    image_type: str | None = None
    tags: list[str] | None = None


class BlogPostResponse(BlogPostBase):
    """
    Schema for blog post response.

    image_data is excluded: image bytes are served from GET /blog/{slug}/image.
    """

    id: int
    author_id: int | None = None
    created_at: datetime
    updated_at: datetime

    has_image: bool = False
    image_data: Any | None = Field(default=None, exclude=True)

    @model_validator(mode="after")
    def derive_has_image(self):
        return _derive_has_image(self, "image_data")

    class Config:
        from_attributes = True
