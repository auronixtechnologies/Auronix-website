"""
Database models using SQLAlchemy ORM.
Defines all tables: team_members, projects, client_projects, and leads.
"""

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Table,
    Text,
)
from sqlalchemy.orm import relationship

from app.core.db import Base

# Association table for many-to-many relationship between projects and team members
project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
    Column("team_member_id", Integer, ForeignKey("team_members.id"), primary_key=True),
)


class TeamMember(Base):
    """
    Team Members Table
    Stores information about Auronix Technologies team members.
    """

    __tablename__ = "team_members"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)  # frontend, backend, UI/UX, etc.
    bio = Column(Text)
    skills = Column(JSON, nullable=True)  # List of skills
    linkedin_url = Column(String(500), nullable=True)
    portfolio_url = Column(String(500), nullable=True)
    profile_image_data = Column(LargeBinary, nullable=True)  # Binary image data (BYTEA)
    profile_image_type = Column(
        String(50), nullable=True
    )  # MIME type (e.g., 'image/jpeg', 'image/png')
    experience_level = Column(String(50), nullable=False)  # junior, mid, senior, lead
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    projects_created = relationship(
        "Project", back_populates="creator", foreign_keys="Project.created_by"
    )
    projects_members = relationship(
        "Project", secondary=project_members, back_populates="team_members"
    )

    def __repr__(self):
        return f"<TeamMember(id={self.id}, name={self.name}, role={self.role})>"


class Project(Base):
    """
    Portfolio Projects Table
    Stores Auronix Technologies portfolio projects.
    """

    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(
        String(100), nullable=False, default="Student Projects"
    )  # Client Projects, Student Projects, Auronix's Arsenal
    domain = Column(String(100), nullable=False)  # Web, ML, LLM, MCP, etc.
    tech_stack = Column(JSON, nullable=False)  # List of technologies
    github_link = Column(String(500), nullable=True)
    demo_link = Column(String(500), nullable=True)
    price = Column(String(100), nullable=True)
    project_image_data = Column(LargeBinary, nullable=True)  # Binary image data (BYTEA)
    project_image_type = Column(
        String(50), nullable=True
    )  # MIME type (e.g., 'image/jpeg', 'image/png')
    created_by = Column(Integer, ForeignKey("team_members.id"), nullable=False)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    creator = relationship(
        "TeamMember", back_populates="projects_created", foreign_keys=[created_by]
    )
    team_members = relationship(
        "TeamMember", secondary=project_members, back_populates="projects_members"
    )

    def __repr__(self):
        return f"<Project(id={self.id}, title={self.title}, category={self.category}, domain={self.domain})>"


class ClientProject(Base):
    """
    Client Projects Table
    Stores completed client projects and case studies.
    """

    __tablename__ = "client_projects"

    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(255), nullable=False)
    project_title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    technologies = Column(JSON, nullable=False)  # List of tech used
    outcome = Column(Text)  # Results/achievements
    testimonial = Column(Text)  # Client testimonial
    project_url = Column(String(500), nullable=True)
    project_image_data = Column(LargeBinary, nullable=True)  # Binary image data (BYTEA)
    project_image_type = Column(
        String(50), nullable=True
    )  # MIME type (e.g., 'image/jpeg', 'image/png')
    is_featured = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<ClientProject(id={self.id}, title={self.project_title})>"


class Lead(Base):
    """
    Leads/Contact Table
    Stores inquiries and leads from the contact form.
    """

    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    service_type = Column(String(255), nullable=True)  # Renamed from service_interest
    budget = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    status = Column(String(50), default="new")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Lead(id={self.id}, name={self.name}, email={self.email})>"


class BlogPost(Base):
    """
    Blog Posts Table
    Stores technical case studies and blog posts.
    """

    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    content = Column(Text, nullable=False)  # Markdown or HTML content
    author_id = Column(Integer, ForeignKey("team_members.id"), nullable=True)
    published_at = Column(DateTime, nullable=True)
    is_published = Column(Boolean, default=False)
    image_data = Column(LargeBinary, nullable=True)
    image_type = Column(String(50), nullable=True)
    tags = Column(JSON, nullable=True)  # List of tags e.g., ["React", "FastAPI"]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("TeamMember")

    def __repr__(self):
        return f"<BlogPost(id={self.id}, title={self.title}, slug={self.slug})>"
