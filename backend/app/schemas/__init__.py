"""
Pydantic schemas for request/response validation.
Separates database models from API contracts.
"""

from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.utils import convert_binary_to_base64


# ===== Team Members Schemas =====

class TeamMemberBase(BaseModel):
    """Base schema for team member data."""
    name: str
    role: str
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_image_data: Optional[str] = None  # Base64 encoded image
    profile_image_type: Optional[str] = None  # MIME type (e.g., 'image/jpeg')
    experience_level: str  # junior, mid, senior, lead


class TeamMemberCreate(TeamMemberBase):
    """Schema for creating a team member."""
    pass


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member (all fields optional)."""
    name: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    profile_image_data: Optional[str] = None  # Base64 encoded image
    profile_image_type: Optional[str] = None  # MIME type (e.g., 'image/jpeg')
    experience_level: Optional[str] = None


class TeamMemberResponse(TeamMemberBase):
    """Schema for team member response."""
    id: int
    created_at: datetime
    updated_at: datetime
    projects: Optional[List[Dict[str, Any]]] = None

    @model_validator(mode='after')
    def convert_image_to_base64(self):
        """Convert binary image data to base64 string."""
        if isinstance(self.profile_image_data, bytes):
            self.profile_image_data = convert_binary_to_base64(self.profile_image_data)
        return self

    class Config:
        from_attributes = True  # Allows reading from ORM models


# ===== Projects Schemas =====

class ProjectBase(BaseModel):
    """Base schema for project data."""
    title: str
    description: str
    domain: str  # Web, ML, LLM, MCP
    tech_stack: List[str]
    github_link: Optional[str] = None
    demo_link: Optional[str] = None
    price: Optional[str] = None
    project_image_data: Optional[str] = None  # Base64 encoded image
    project_image_type: Optional[str] = None  # MIME type (e.g., 'image/jpeg')
    is_featured: Optional[bool] = False


class ProjectCreate(ProjectBase):
    """Schema for creating a project."""
    created_by: int
    team_member_ids: Optional[List[int]] = None  # List of team member IDs


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    github_link: Optional[str] = None
    demo_link: Optional[str] = None
    price: Optional[str] = None
    project_image_data: Optional[str] = None  # Base64 encoded image
    project_image_type: Optional[str] = None  # MIME type (e.g., 'image/jpeg')
    is_featured: Optional[bool] = None
    team_member_ids: Optional[List[int]] = None  # List of team member IDs


class ProjectResponse(ProjectBase):
    """Schema for project response."""
    id: int
    created_by: Optional[int] = None
    team_members: List[TeamMemberResponse] = []  # List of assigned team members
    created_at: datetime
    updated_at: datetime

    @model_validator(mode='after')
    def convert_image_to_base64(self):
        """Convert binary image data to base64 string."""
        if isinstance(self.project_image_data, bytes):
            self.project_image_data = convert_binary_to_base64(self.project_image_data)
        return self

    class Config:
        from_attributes = True


# ===== Client Projects Schemas =====

class ClientProjectBase(BaseModel):
    """Base schema for client project data."""
    client_name: str
    project_title: str
    description: str
    technologies: List[str]
    outcome: Optional[str] = None
    testimonial: Optional[str] = None
    project_url: Optional[str] = None
    project_image_data: Optional[str] = None  # Base64 encoded image
    project_image_type: Optional[str] = None  # MIME type (e.g., 'image/jpeg')
    is_featured: Optional[bool] = False
    completed_at: datetime


class ClientProjectCreate(ClientProjectBase):
    """Schema for creating a client project."""
    pass


class ClientProjectUpdate(BaseModel):
    """Schema for updating a client project."""
    client_name: Optional[str] = None
    project_title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[List[str]] = None
    outcome: Optional[str] = None
    testimonial: Optional[str] = None
    project_url: Optional[str] = None
    project_image_data: Optional[str] = None  # Base64 encoded image
    project_image_type: Optional[str] = None  # MIME type (e.g., 'image/jpeg')
    is_featured: Optional[bool] = None
    completed_at: Optional[datetime] = None


class ClientProjectResponse(ClientProjectBase):
    """Schema for client project response."""
    id: int
    created_at: datetime
    updated_at: datetime

    @model_validator(mode='after')
    def convert_image_to_base64(self):
        """Convert binary image data to base64 string."""
        if isinstance(self.project_image_data, bytes):
            self.project_image_data = convert_binary_to_base64(self.project_image_data)
        return self

    class Config:
        from_attributes = True


# ===== Leads Schemas =====

class LeadBase(BaseModel):
    """Base schema for lead data."""
    name: str
    email: EmailStr  # Validates email format
    phone: Optional[str] = None
    service_type: Optional[str] = None
    budget: Optional[str] = None
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

    @field_validator('skip')
    @classmethod
    def skip_must_be_ge_zero(cls, v):
        if v < 0:
            raise ValueError('skip must be greater than or equal to 0')
        return v

    @field_validator('limit')
    @classmethod
    def limit_must_be_between(cls, v):
        if v < 1 or v > 100:
            raise ValueError('limit must be between 1 and 100')
        return v


# ===== Blog Posts Schemas =====

class BlogPostBase(BaseModel):
    """Base schema for blog post data."""
    title: str
    slug: str
    content: str
    published_at: Optional[datetime] = None
    is_published: Optional[bool] = False
    image_data: Optional[str] = None
    image_type: Optional[str] = None
    tags: Optional[List[str]] = None


class BlogPostCreate(BlogPostBase):
    """Schema for creating a blog post."""
    author_id: Optional[int] = None


class BlogPostUpdate(BaseModel):
    """Schema for updating a blog post."""
    title: Optional[str] = None
    slug: Optional[str] = None
    content: Optional[str] = None
    author_id: Optional[int] = None
    published_at: Optional[datetime] = None
    is_published: Optional[bool] = None
    image_data: Optional[str] = None
    image_type: Optional[str] = None
    tags: Optional[List[str]] = None


class BlogPostResponse(BlogPostBase):
    """Schema for blog post response."""
    id: int
    author_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    @model_validator(mode='after')
    def convert_image_to_base64(self):
        """Convert binary image data to base64 string."""
        if isinstance(self.image_data, bytes):
            self.image_data = convert_binary_to_base64(self.image_data)
        return self

    class Config:
        from_attributes = True

