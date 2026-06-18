"""
Business logic and database service layer using Service-Specific Repositories.
Separates API routes from database operations.
"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

# Import service repositories
from app.Database.team_repository import TeamRepository
from app.Database.project_repository import ProjectRepository
from app.Database.client_project_repository import ClientProjectRepository
from app.Database.lead_repository import LeadRepository

# Import schemas for type hints
from app.schemas import (
    TeamMemberCreate, TeamMemberUpdate, ProjectCreate, ProjectUpdate,
    ClientProjectCreate, ClientProjectUpdate, LeadCreate
)

# Import utilities
from app.utils import convert_base64_to_binary, convert_binary_to_base64


# ===== Team Member Services =====

class TeamMemberService:
    """Service layer for team member operations using specialized repository."""

    @staticmethod
    def create_team_member(db: Session, team_member: TeamMemberCreate) -> Dict[str, Any]:
        """Create a new team member."""
        member_data = team_member.dict()
        
        # Convert base64 image to binary if provided
        profile_image_data = None
        if member_data.get('profile_image_data'):
            profile_image_data = convert_base64_to_binary(member_data['profile_image_data'])
        
        result = TeamRepository.create(
            db=db,
            name=member_data['name'],
            role=member_data['role'],
            bio=member_data.get('bio'),
            skills=member_data.get('skills'),
            linkedin_url=member_data.get('linkedin_url'),
            portfolio_url=member_data.get('portfolio_url'),
            profile_image_data=profile_image_data,
            profile_image_type=member_data.get('profile_image_type'),
            experience_level=member_data['experience_level'],
        )
        # Convert BYTEA to base64 in response
        if result and result.get('profile_image_data') and isinstance(result['profile_image_data'], (bytes, memoryview)):
            result['profile_image_data'] = convert_binary_to_base64(result['profile_image_data'])
        return result

    @staticmethod
    def get_team_members(db: Session, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        """Get paginated list of team members."""
        members = TeamRepository.get_all(db, skip=skip, limit=limit)
        # Convert BYTEA to base64 for each member
        for member in members:
            if member.get('profile_image_data') and isinstance(member['profile_image_data'], (bytes, memoryview)):
                member['profile_image_data'] = convert_binary_to_base64(member['profile_image_data'])
        return members

    @staticmethod
    def get_team_member_by_id(db: Session, member_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific team member by ID."""
        member = TeamRepository.get_by_id(db, member_id)
        # Convert BYTEA to base64
        if member and member.get('profile_image_data') and isinstance(member['profile_image_data'], (bytes, memoryview)):
            member['profile_image_data'] = convert_binary_to_base64(member['profile_image_data'])
        return member

    @staticmethod
    def update_team_member(
        db: Session, member_id: int, member: TeamMemberUpdate
    ) -> Optional[Dict[str, Any]]:
        """Update a team member."""
        update_data = member.dict(exclude_unset=True)
        
        # Convert base64 image to binary if provided
        if 'profile_image_data' in update_data and update_data['profile_image_data']:
            update_data['profile_image_data'] = convert_base64_to_binary(update_data['profile_image_data'])
        
        result = TeamRepository.update(db, member_id, **update_data)
        # Convert BYTEA to base64 in response
        if result and result.get('profile_image_data') and isinstance(result['profile_image_data'], (bytes, memoryview)):
            result['profile_image_data'] = convert_binary_to_base64(result['profile_image_data'])
        return result

    @staticmethod
    def delete_team_member(db: Session, member_id: int) -> bool:
        """Delete a team member."""
        return TeamRepository.delete(db, member_id)


# ===== Project Services =====

class ProjectService:
    """Service layer for project operations using specialized repository."""

    @staticmethod
    def create_project(db: Session, project: ProjectCreate) -> Dict[str, Any]:
        """Create a new project with team members."""
        project_data = project.dict()
        team_member_ids = project_data.pop('team_member_ids', None)
        
        # Convert base64 image to binary if provided
        project_image_data = None
        if project_data.get('project_image_data'):
            project_image_data = convert_base64_to_binary(project_data['project_image_data'])
        
        result = ProjectRepository.create(
            db=db,
            title=project_data['title'],
            description=project_data['description'],
            domain=project_data['domain'],
            tech_stack=project_data.get('tech_stack', []),
            created_by=project_data['created_by'],
            github_link=project_data.get('github_link'),
            demo_link=project_data.get('demo_link'),
            price=project_data.get('price'),
            project_image_data=project_image_data,
            project_image_type=project_data.get('project_image_type'),
            is_featured=project_data.get('is_featured', False),
            team_member_ids=team_member_ids,
        )
        # Convert BYTEA to base64 in response
        if result and result.get('project_image_data') and isinstance(result['project_image_data'], (bytes, memoryview)):
            result['project_image_data'] = convert_binary_to_base64(result['project_image_data'])
        if result and result.get('team_members'):
            for tm in result['team_members']:
                if tm.get('profile_image_data') and isinstance(tm['profile_image_data'], (bytes, memoryview)):
                    tm['profile_image_data'] = convert_binary_to_base64(tm['profile_image_data'])
        return result

    @staticmethod
    def get_projects(
        db: Session, domain: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get projects with optional domain filter."""
        projects = ProjectRepository.get_all(db, skip=skip, limit=limit)
        
        # Convert BYTEA to base64 for each project
        for project in projects:
            if project.get('project_image_data') and isinstance(project['project_image_data'], (bytes, memoryview)):
                project['project_image_data'] = convert_binary_to_base64(project['project_image_data'])
            if project.get('team_members'):
                for tm in project['team_members']:
                    if tm.get('profile_image_data') and isinstance(tm['profile_image_data'], (bytes, memoryview)):
                        tm['profile_image_data'] = convert_binary_to_base64(tm['profile_image_data'])
        
        # Filter by domain if provided
        if domain:
            projects = [p for p in projects if p.get('domain') == domain]
        
        return projects

    @staticmethod
    def get_featured_projects(db: Session, limit: int = 6) -> List[Dict[str, Any]]:
        """Get featured projects."""
        projects = ProjectRepository.get_all(db, skip=0, limit=limit * 2)
        
        # Convert BYTEA to base64 for each project
        for project in projects:
            if project.get('project_image_data') and isinstance(project['project_image_data'], (bytes, memoryview)):
                project['project_image_data'] = convert_binary_to_base64(project['project_image_data'])
            if project.get('team_members'):
                for tm in project['team_members']:
                    if tm.get('profile_image_data') and isinstance(tm['profile_image_data'], (bytes, memoryview)):
                        tm['profile_image_data'] = convert_binary_to_base64(tm['profile_image_data'])
        
        return [p for p in projects if p.get('is_featured')][:limit]

    @staticmethod
    def get_project_by_id(db: Session, project_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific project by ID."""
        project = ProjectRepository.get_by_id(db, project_id)
        # Convert BYTEA to base64
        if project and project.get('project_image_data') and isinstance(project['project_image_data'], (bytes, memoryview)):
            project['project_image_data'] = convert_binary_to_base64(project['project_image_data'])
        if project and project.get('team_members'):
            for tm in project['team_members']:
                if tm.get('profile_image_data') and isinstance(tm['profile_image_data'], (bytes, memoryview)):
                    tm['profile_image_data'] = convert_binary_to_base64(tm['profile_image_data'])
        return project

    @staticmethod
    def update_project(
        db: Session, project_id: int, project: ProjectUpdate
    ) -> Optional[Dict[str, Any]]:
        """Update a project and its team members."""
        update_data = project.dict(exclude_unset=True)
        team_member_ids = update_data.pop('team_member_ids', None)
        
        # Convert base64 image to binary if provided
        if 'project_image_data' in update_data and update_data['project_image_data']:
            update_data['project_image_data'] = convert_base64_to_binary(update_data['project_image_data'])
        
        result = ProjectRepository.update(
            db=db,
            project_id=project_id,
            team_member_ids=team_member_ids,
            **update_data
        )
        # Convert BYTEA to base64 in response
        if result and result.get('project_image_data') and isinstance(result['project_image_data'], (bytes, memoryview)):
            result['project_image_data'] = convert_binary_to_base64(result['project_image_data'])
        if result and result.get('team_members'):
            for tm in result['team_members']:
                if tm.get('profile_image_data') and isinstance(tm['profile_image_data'], (bytes, memoryview)):
                    tm['profile_image_data'] = convert_binary_to_base64(tm['profile_image_data'])
        return result

    @staticmethod
    def delete_project(db: Session, project_id: int) -> bool:
        """Delete a project."""
        return ProjectRepository.delete(db, project_id)


# ===== Client Project Services =====

class ClientProjectService:
    """Service layer for client project operations using specialized repository."""

    @staticmethod
    def create_client_project(
        db: Session, client_project: ClientProjectCreate
    ) -> Dict[str, Any]:
        """Create a new client project."""
        project_data = client_project.dict()
        
        # Convert base64 image to binary if provided
        project_image_data = None
        if project_data.get('project_image_data'):
            project_image_data = convert_base64_to_binary(project_data['project_image_data'])
        
        result = ClientProjectRepository.create(
            db=db,
            client_name=project_data['client_name'],
            project_title=project_data['project_title'],
            description=project_data['description'],
            technologies=project_data.get('technologies', []),
            completed_at=project_data['completed_at'],
            outcome=project_data.get('outcome'),
            testimonial=project_data.get('testimonial'),
            project_url=project_data.get('project_url'),
            project_image_data=project_image_data,
            project_image_type=project_data.get('project_image_type'),
            is_featured=project_data.get('is_featured', False),
        )
        # Convert BYTEA to base64 in response
        if result and result.get('project_image_data') and isinstance(result['project_image_data'], (bytes, memoryview)):
            result['project_image_data'] = convert_binary_to_base64(result['project_image_data'])
        return result

    @staticmethod
    def get_client_projects(db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get paginated list of client projects."""
        projects = ClientProjectRepository.get_all(db, skip=skip, limit=limit)
        # Convert BYTEA to base64 for each project
        for project in projects:
            if project.get('project_image_data') and isinstance(project['project_image_data'], (bytes, memoryview)):
                project['project_image_data'] = convert_binary_to_base64(project['project_image_data'])
        return projects

    @staticmethod
    def get_client_project_by_id(db: Session, project_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific client project by ID."""
        project = ClientProjectRepository.get_by_id(db, project_id)
        # Convert BYTEA to base64
        if project and project.get('project_image_data') and isinstance(project['project_image_data'], (bytes, memoryview)):
            project['project_image_data'] = convert_binary_to_base64(project['project_image_data'])
        return project

    @staticmethod
    def update_client_project(
        db: Session, project_id: int, client_project: ClientProjectUpdate
    ) -> Optional[Dict[str, Any]]:
        """Update a client project."""
        update_data = client_project.dict(exclude_unset=True)
        
        # Convert base64 image to binary if provided
        if 'project_image_data' in update_data and update_data['project_image_data']:
            update_data['project_image_data'] = convert_base64_to_binary(update_data['project_image_data'])
        
        result = ClientProjectRepository.update(db, project_id, **update_data)
        # Convert BYTEA to base64 in response
        if result and result.get('project_image_data') and isinstance(result['project_image_data'], (bytes, memoryview)):
            result['project_image_data'] = convert_binary_to_base64(result['project_image_data'])
        return result

    @staticmethod
    def delete_client_project(db: Session, project_id: int) -> bool:
        """Delete a client project."""
        return ClientProjectRepository.delete(db, project_id)


# ===== Lead Services =====

class LeadService:
    """Service layer for lead operations using specialized repository."""

    @staticmethod
    def create_lead(db: Session, lead: LeadCreate) -> Dict[str, Any]:
        """Create a new lead."""
        lead_data = lead.dict()
        
        # Handle legacy field mapping if frontend hasn't updated
        service_type = lead_data.get('service_type') or lead_data.get('service_interest')
        
        return LeadRepository.create(
            db=db,
            name=lead_data['name'],
            email=lead_data['email'],
            phone=lead_data.get('phone'),
            service_type=service_type,
            budget=lead_data.get('budget'),
            message=lead_data.get('message'),
        )

    @staticmethod
    def get_leads(
        db: Session, status: Optional[str] = None, skip: int = 0, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get paginated list of leads with optional status filter."""
        return LeadRepository.get_all(db, skip=skip, limit=limit, status=status)

    @staticmethod
    def get_lead_by_id(db: Session, lead_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific lead by ID."""
        return LeadRepository.get_by_id(db, lead_id)

    @staticmethod
    def update_lead(
        db: Session, lead_id: int, lead: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        """Update a lead."""
        return LeadRepository.update(db, lead_id, **lead)

    @staticmethod
    def delete_lead(db: Session, lead_id: int) -> bool:
        """Delete a lead."""
        return LeadRepository.delete(db, lead_id)
