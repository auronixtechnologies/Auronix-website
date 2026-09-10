"""
Business logic and database service layer using Service-Specific Repositories.
Separates API routes from database operations.

Images: uploads arrive as base64 and are run through app.media.images.optimize()
before storage. Reads never return image bytes — responses carry a has_image
flag and clients fetch the picture from the dedicated /{id}/image endpoint.
"""

from typing import Any

from fastapi import HTTPException
from sqlalchemy.orm import Session

# Import utilities
from app.media.encoding import convert_base64_to_binary
from app.media.images import ImageTooLargeError, InvalidImageError, optimize
from app.repositories.client_project_repository import ClientProjectRepository
from app.repositories.lead_repository import LeadRepository
from app.repositories.project_repository import ProjectRepository

# Import service repositories
from app.repositories.team_repository import TeamRepository

# Import schemas for type hints
from app.schemas import (
    ClientProjectCreate,
    ClientProjectUpdate,
    LeadCreate,
    ProjectCreate,
    ProjectUpdate,
    TeamMemberCreate,
    TeamMemberUpdate,
)


def _prepare_image(base64_str: str | None) -> tuple[bytes | None, str | None]:
    """
    Decode a base64 upload and re-encode it to a bounded WebP.

    Returns (bytes, mime_type), or (None, None) when no image was supplied.
    Raises HTTPException(400) for payloads that are not usable images, so the
    admin panel shows a real message instead of a 500.
    """
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


def _apply_image_update(update_data: dict[str, Any], data_key: str, type_key: str) -> None:
    """
    Normalise the image fields of a partial update, in place.

    Three cases matter:
      - key absent          -> caller did not touch the image, leave it alone
      - key present, falsy  -> caller cleared the image, store NULL
      - key present, set    -> optimize and store, overriding any client mime
    """
    if data_key not in update_data:
        return

    if not update_data[data_key]:
        update_data[data_key] = None
        update_data[type_key] = None
        return

    data, mime = _prepare_image(update_data[data_key])
    update_data[data_key] = data
    update_data[type_key] = mime


# ===== Team Member Services =====


class TeamMemberService:
    """Service layer for team member operations using specialized repository."""

    @staticmethod
    def create_team_member(db: Session, team_member: TeamMemberCreate) -> dict[str, Any]:
        """Create a new team member."""
        member_data = team_member.model_dump()
        image_data, image_type = _prepare_image(member_data.get("profile_image_data"))

        return TeamRepository.create(
            db=db,
            name=member_data["name"],
            role=member_data["role"],
            bio=member_data.get("bio"),
            skills=member_data.get("skills"),
            linkedin_url=member_data.get("linkedin_url"),
            portfolio_url=member_data.get("portfolio_url"),
            profile_image_data=image_data,
            profile_image_type=image_type,
            experience_level=member_data["experience_level"],
        )

    @staticmethod
    def get_team_members(db: Session, skip: int = 0, limit: int = 10) -> list[dict[str, Any]]:
        """Get paginated list of team members."""
        return TeamRepository.get_all(db, skip=skip, limit=limit)

    @staticmethod
    def get_team_member_by_id(db: Session, member_id: int) -> dict[str, Any] | None:
        """Get a specific team member by ID."""
        return TeamRepository.get_by_id(db, member_id)

    @staticmethod
    def get_team_member_image(db: Session, member_id: int) -> dict[str, Any] | None:
        """Get the stored image bytes for a team member."""
        return TeamRepository.get_image(db, member_id)

    @staticmethod
    def update_team_member(
        db: Session, member_id: int, member: TeamMemberUpdate
    ) -> dict[str, Any] | None:
        """Update a team member."""
        update_data = member.model_dump(exclude_unset=True)
        _apply_image_update(update_data, "profile_image_data", "profile_image_type")
        return TeamRepository.update(db, member_id, **update_data)

    @staticmethod
    def delete_team_member(db: Session, member_id: int) -> bool:
        """Delete a team member."""
        return TeamRepository.delete(db, member_id)


# ===== Project Services =====


class ProjectService:
    """Service layer for project operations using specialized repository."""

    @staticmethod
    def create_project(db: Session, project: ProjectCreate) -> dict[str, Any]:
        """Create a new project with team members."""
        project_data = project.model_dump()
        team_member_ids = project_data.pop("team_member_ids", None)
        image_data, image_type = _prepare_image(project_data.get("project_image_data"))

        return ProjectRepository.create(
            db=db,
            title=project_data["title"],
            description=project_data["description"],
            category=project_data.get("category", "Student Projects"),
            domain=project_data["domain"],
            tech_stack=project_data.get("tech_stack", []),
            created_by=project_data["created_by"],
            github_link=project_data.get("github_link"),
            demo_link=project_data.get("demo_link"),
            price=project_data.get("price"),
            project_image_data=image_data,
            project_image_type=image_type,
            is_featured=project_data.get("is_featured", False),
            team_member_ids=team_member_ids,
        )

    @staticmethod
    def get_projects(
        db: Session,
        domain: str | None = None,
        category: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> list[dict[str, Any]]:
        """Get projects with optional domain and category filter."""
        return ProjectRepository.get_all(
            db, skip=skip, limit=limit, domain=domain, category=category
        )

    @staticmethod
    def get_featured_projects(db: Session, limit: int = 6) -> list[dict[str, Any]]:
        """Get featured projects."""
        return ProjectRepository.get_all(db, skip=0, limit=limit, is_featured=True)

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> dict[str, Any] | None:
        """Get a specific project by ID."""
        return ProjectRepository.get_by_id(db, project_id)

    @staticmethod
    def get_project_image(db: Session, project_id: int) -> dict[str, Any] | None:
        """Get the stored image bytes for a project."""
        return ProjectRepository.get_image(db, project_id)

    @staticmethod
    def update_project(
        db: Session, project_id: int, project: ProjectUpdate
    ) -> dict[str, Any] | None:
        """Update a project and its team members."""
        update_data = project.model_dump(exclude_unset=True)
        team_member_ids = update_data.pop("team_member_ids", None)
        _apply_image_update(update_data, "project_image_data", "project_image_type")

        return ProjectRepository.update(
            db=db, project_id=project_id, team_member_ids=team_member_ids, **update_data
        )

    @staticmethod
    def delete_project(db: Session, project_id: int) -> bool:
        """Delete a project."""
        return ProjectRepository.delete(db, project_id)


# ===== Client Project Services =====


class ClientProjectService:
    """Service layer for client project operations using specialized repository."""

    @staticmethod
    def create_client_project(db: Session, client_project: ClientProjectCreate) -> dict[str, Any]:
        """Create a new client project."""
        project_data = client_project.model_dump()
        image_data, image_type = _prepare_image(project_data.get("project_image_data"))

        return ClientProjectRepository.create(
            db=db,
            client_name=project_data["client_name"],
            project_title=project_data["project_title"],
            description=project_data["description"],
            technologies=project_data.get("technologies", []),
            completed_at=project_data["completed_at"],
            outcome=project_data.get("outcome"),
            testimonial=project_data.get("testimonial"),
            project_url=project_data.get("project_url"),
            project_image_data=image_data,
            project_image_type=image_type,
            is_featured=project_data.get("is_featured", False),
        )

    @staticmethod
    def get_client_projects(db: Session, skip: int = 0, limit: int = 100) -> list[dict[str, Any]]:
        """Get paginated list of client projects."""
        return ClientProjectRepository.get_all(db, skip=skip, limit=limit)

    @staticmethod
    def get_client_project_by_id(db: Session, project_id: int) -> dict[str, Any] | None:
        """Get a specific client project by ID."""
        return ClientProjectRepository.get_by_id(db, project_id)

    @staticmethod
    def get_client_project_image(db: Session, project_id: int) -> dict[str, Any] | None:
        """Get the stored image bytes for a client project."""
        return ClientProjectRepository.get_image(db, project_id)

    @staticmethod
    def update_client_project(
        db: Session, project_id: int, client_project: ClientProjectUpdate
    ) -> dict[str, Any] | None:
        """Update a client project."""
        update_data = client_project.model_dump(exclude_unset=True)
        _apply_image_update(update_data, "project_image_data", "project_image_type")
        return ClientProjectRepository.update(db, project_id, **update_data)

    @staticmethod
    def delete_client_project(db: Session, project_id: int) -> bool:
        """Delete a client project."""
        return ClientProjectRepository.delete(db, project_id)


# ===== Lead Services =====


class LeadService:
    """Service layer for lead operations using specialized repository."""

    @staticmethod
    def create_lead(db: Session, lead: LeadCreate) -> dict[str, Any]:
        """Create a new lead."""
        lead_data = lead.model_dump()

        return LeadRepository.create(
            db=db,
            name=lead_data["name"],
            email=lead_data["email"],
            phone=lead_data.get("phone"),
            service_type=lead_data.get("service_type"),
            budget=lead_data.get("budget"),
            message=lead_data.get("message"),
        )

    @staticmethod
    def get_leads(
        db: Session, status: str | None = None, skip: int = 0, limit: int = 100
    ) -> list[dict[str, Any]]:
        """Get paginated list of leads with optional status filter."""
        return LeadRepository.get_all(db, skip=skip, limit=limit, status=status)

    @staticmethod
    def get_lead_by_id(db: Session, lead_id: int) -> dict[str, Any] | None:
        """Get a specific lead by ID."""
        return LeadRepository.get_by_id(db, lead_id)

    @staticmethod
    def update_lead(db: Session, lead_id: int, lead: dict[str, Any]) -> dict[str, Any] | None:
        """Update a lead."""
        return LeadRepository.update(db, lead_id, **lead)

    @staticmethod
    def delete_lead(db: Session, lead_id: int) -> bool:
        """Delete a lead."""
        return LeadRepository.delete(db, lead_id)
