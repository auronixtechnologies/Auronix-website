"""
Team Member Repository
Handles all direct SQL queries for team_members table.
"""

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session


class TeamRepository:
    """Class containing raw SQL queries for team member operations."""

    @staticmethod
    def create(
        db: Session,
        name: str,
        role: str,
        bio: Optional[str],
        skills: Optional[List[str]],
        linkedin_url: Optional[str],
        portfolio_url: Optional[str],
        profile_image_data: Optional[bytes],
        profile_image_type: Optional[str],
        experience_level: str,
    ) -> Dict[str, Any]:
        """Create a new team member using raw SQL."""
        query = text("""
            INSERT INTO team_members 
            (name, role, bio, skills, linkedin_url, portfolio_url, 
             profile_image_data, profile_image_type, experience_level, created_at, updated_at)
            VALUES (:name, :role, :bio, :skills, :linkedin_url, :portfolio_url,
                    :profile_image_data, :profile_image_type, :experience_level, 
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, name, role, bio, skills, linkedin_url, portfolio_url,
                      profile_image_data, profile_image_type, experience_level, created_at, updated_at;
        """)
        
        result = db.execute(query, {
            "name": name,
            "role": role,
            "bio": bio,
            "skills": json.dumps(skills) if skills else None,
            "linkedin_url": linkedin_url,
            "portfolio_url": portfolio_url,
            "profile_image_data": profile_image_data,
            "profile_image_type": profile_image_type,
            "experience_level": experience_level,
        })
        db.commit()
        row = result.fetchone()
        return dict(row._mapping) if row else {}

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 10) -> List[Dict[str, Any]]:
        """Get paginated list of team members."""
        query = text("""
            SELECT id, name, role, bio, skills, linkedin_url, portfolio_url,
                   profile_image_data, profile_image_type, experience_level, created_at, updated_at
            FROM team_members
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :skip;
        """)
        
        result = db.execute(query, {"limit": limit, "skip": skip})
        members = [dict(row._mapping) for row in result.fetchall()]
        for member in members:
            member["projects"] = TeamRepository.get_member_projects(db, member["id"])
        return members

    @staticmethod
    def get_by_id(db: Session, member_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific team member by ID."""
        query = text("""
            SELECT id, name, role, bio, skills, linkedin_url, portfolio_url,
                   profile_image_data, profile_image_type, experience_level, created_at, updated_at
            FROM team_members
            WHERE id = :member_id;
        """)
        
        result = db.execute(query, {"member_id": member_id})
        row = result.fetchone()
        if row:
            member = dict(row._mapping)
            member["projects"] = TeamRepository.get_member_projects(db, member_id)
            return member
        return None

    @staticmethod
    def update(db: Session, member_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        """Update a team member with provided fields."""
        set_clauses = []
        params = {"member_id": member_id, "updated_at": datetime.utcnow()}
        
        valid_fields = ["name", "role", "bio", "skills", "linkedin_url", "portfolio_url", 
                        "profile_image_data", "profile_image_type", "experience_level"]
        
        for key, value in kwargs.items():
            if key in valid_fields:
                if key == "skills" and isinstance(value, list):
                    params[key] = json.dumps(value)
                else:
                    params[key] = value
                set_clauses.append(f"{key} = :{key}")
        
        if not set_clauses:
            return None
        
        set_clauses.append("updated_at = :updated_at")
        set_str = ", ".join(set_clauses)
        
        query = text(f"""
            UPDATE team_members
            SET {set_str}
            WHERE id = :member_id
            RETURNING id, name, role, bio, skills, linkedin_url, portfolio_url,
                      profile_image_data, profile_image_type, experience_level, created_at, updated_at;
        """)
        
        result = db.execute(query, params)
        db.commit()
        row = result.fetchone()
        return dict(row._mapping) if row else None

    @staticmethod
    def delete(db: Session, member_id: int) -> bool:
        """Delete a team member, safely handling FK references first."""
        # 1. Nullify projects.created_by that reference this member
        db.execute(
            text("UPDATE projects SET created_by = NULL WHERE created_by = :member_id;"),
            {"member_id": member_id}
        )
        # 2. Remove memberships in project_members junction table
        db.execute(
            text("DELETE FROM project_members WHERE team_member_id = :member_id;"),
            {"member_id": member_id}
        )
        # 3. Now safe to delete the team member
        result = db.execute(
            text("DELETE FROM team_members WHERE id = :member_id;"),
            {"member_id": member_id}
        )
        db.commit()
        return result.rowcount > 0

    @staticmethod
    def get_member_projects(db: Session, member_id: int) -> List[Dict[str, Any]]:
        """Get all projects a team member worked on or created."""
        query = text("""
            SELECT p.id, p.title, p.domain
            FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE pm.team_member_id = :member_id
            UNION
            SELECT p.id, p.title, p.domain
            FROM projects p
            WHERE p.created_by = :member_id
            ORDER BY title
        """)
        result = db.execute(query, {"member_id": member_id})
        return [dict(row._mapping) for row in result.fetchall()]
