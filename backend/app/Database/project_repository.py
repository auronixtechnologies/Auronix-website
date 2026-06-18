"""
Project Repository
Handles all direct SQL queries for projects and project_members tables.
"""

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session


class ProjectRepository:
    """Class containing raw SQL queries for project operations."""

    @staticmethod
    def create(
        db: Session,
        title: str,
        description: str,
        domain: str,
        tech_stack: List[str],
        created_by: int,
        github_link: Optional[str] = None,
        demo_link: Optional[str] = None,
        price: Optional[str] = None,
        project_image_data: Optional[bytes] = None,
        project_image_type: Optional[str] = None,
        is_featured: bool = False,
        team_member_ids: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """Create a new project and link team members."""
        query = text("""
            INSERT INTO projects 
            (title, description, domain, tech_stack, github_link, demo_link, price,
             project_image_data, project_image_type, created_by, is_featured, created_at, updated_at)
            VALUES (:title, :description, :domain, :tech_stack, :github_link, :demo_link, :price,
                    :project_image_data, :project_image_type, :created_by, :is_featured,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, title, description, domain, tech_stack, github_link, demo_link, price,
                      project_image_data, project_image_type, created_by, is_featured, created_at, updated_at;
        """)
        
        result = db.execute(query, {
            "title": title,
            "description": description,
            "domain": domain,
            "tech_stack": json.dumps(tech_stack) if tech_stack else json.dumps([]),
            "github_link": github_link,
            "demo_link": demo_link,
            "price": price,
            "project_image_data": project_image_data,
            "project_image_type": project_image_type,
            "created_by": created_by,
            "is_featured": is_featured,
        })
        
        db.commit()
        row = result.fetchone()
        project_dict = dict(row._mapping) if row else {}
        project_id = project_dict.get("id")
        
        if project_id and team_member_ids:
            for member_id in team_member_ids:
                insert_member = text("""
                    INSERT INTO project_members (project_id, team_member_id)
                    VALUES (:project_id, :member_id)
                    ON CONFLICT DO NOTHING;
                """)
                db.execute(insert_member, {"project_id": project_id, "member_id": member_id})
            db.commit()
        
        return project_dict

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get paginated list of projects."""
        query = text("""
            SELECT id, title, description, domain, tech_stack, github_link, demo_link, price,
                   project_image_data, project_image_type, created_by, is_featured, created_at, updated_at
            FROM projects
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :skip;
        """)
        
        result = db.execute(query, {"limit": limit, "skip": skip})
        projects = [dict(row._mapping) for row in result.fetchall()]
        
        # Fetch team members for each project
        for project in projects:
            project["team_members"] = ProjectRepository.get_team_members(db, project["id"])
        
        return projects

    @staticmethod
    def get_by_id(db: Session, project_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific project by ID with its team members."""
        query = text("""
            SELECT id, title, description, domain, tech_stack, github_link, demo_link, price,
                   project_image_data, project_image_type, created_by, is_featured, created_at, updated_at
            FROM projects
            WHERE id = :project_id;
        """)
        
        result = db.execute(query, {"project_id": project_id})
        row = result.fetchone()
        
        if row:
            project_dict = dict(row._mapping)
            project_dict["team_members"] = ProjectRepository.get_team_members(db, project_id)
            return project_dict
        return None

    @staticmethod
    def get_team_members(db: Session, project_id: int) -> List[Dict[str, Any]]:
        """Get all team members assigned to a project."""
        query = text("""
            SELECT tm.id, tm.name, tm.role, tm.bio, tm.skills, tm.linkedin_url, tm.portfolio_url,
                   tm.profile_image_data, tm.profile_image_type, tm.experience_level, tm.created_at, tm.updated_at
            FROM team_members tm
            INNER JOIN project_members pm ON tm.id = pm.team_member_id
            WHERE pm.project_id = :project_id
            ORDER BY tm.name;
        """)
        
        result = db.execute(query, {"project_id": project_id})
        return [dict(row._mapping) for row in result.fetchall()]

    @staticmethod
    def update(
        db: Session, project_id: int, team_member_ids: Optional[List[int]] = None, **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Update a project and optionally its team members."""
        set_clauses = []
        params = {"project_id": project_id, "updated_at": datetime.utcnow()}
        
        valid_fields = ["title", "description", "domain", "tech_stack", "github_link", 
                        "demo_link", "price", "project_image_data", "project_image_type", "is_featured"]
        
        for key, value in kwargs.items():
            if key in valid_fields:
                if key == "tech_stack" and isinstance(value, list):
                    params[key] = json.dumps(value)
                else:
                    params[key] = value
                set_clauses.append(f"{key} = :{key}")
        
        if set_clauses:
            set_clauses.append("updated_at = :updated_at")
            set_str = ", ".join(set_clauses)
            
            query = text(f"""
                UPDATE projects
                SET {set_str}
                WHERE id = :project_id
                RETURNING id, title, description, domain, tech_stack, github_link, demo_link, price,
                          project_image_data, project_image_type, created_by, is_featured, created_at, updated_at;
            """)
            db.execute(query, params)
            db.commit()

        # Update team members if provided
        if team_member_ids is not None:
            # Delete existing associations
            db.execute(text("DELETE FROM project_members WHERE project_id = :project_id;"), {"project_id": project_id})
            # Insert new associations
            for member_id in team_member_ids:
                db.execute(text("""
                    INSERT INTO project_members (project_id, team_member_id)
                    VALUES (:project_id, :member_id);
                """), {"project_id": project_id, "member_id": member_id})
            db.commit()
        
        return ProjectRepository.get_by_id(db, project_id)

    @staticmethod
    def delete(db: Session, project_id: int) -> bool:
        """Delete a project."""
        query = text("DELETE FROM projects WHERE id = :project_id;")
        result = db.execute(query, {"project_id": project_id})
        db.commit()
        return result.rowcount > 0
