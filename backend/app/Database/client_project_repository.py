"""
Client Project Repository
Handles all direct SQL queries for client_projects table.
"""

import json
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session


class ClientProjectRepository:
    """Class containing raw SQL queries for client project operations."""

    @staticmethod
    def create(
        db: Session,
        client_name: str,
        project_title: str,
        description: str,
        technologies: List[str],
        completed_at: datetime,
        outcome: Optional[str] = None,
        testimonial: Optional[str] = None,
        project_url: Optional[str] = None,
        project_image_data: Optional[bytes] = None,
        project_image_type: Optional[str] = None,
        is_featured: bool = False,
    ) -> Dict[str, Any]:
        """Create a new client project."""
        query = text("""
            INSERT INTO client_projects 
            (client_name, project_title, description, technologies, outcome, testimonial, project_url,
             project_image_data, project_image_type, is_featured, completed_at, created_at, updated_at)
            VALUES (:client_name, :project_title, :description, :technologies, :outcome, :testimonial, :project_url,
                    :project_image_data, :project_image_type, :is_featured, :completed_at, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, client_name, project_title, description, technologies, outcome, testimonial, project_url,
                      project_image_data, project_image_type, is_featured, completed_at, created_at, updated_at;
        """)
        
        result = db.execute(query, {
            "client_name": client_name,
            "project_title": project_title,
            "description": description,
            "technologies": json.dumps(technologies) if technologies else json.dumps([]),
            "outcome": outcome,
            "testimonial": testimonial,
            "project_url": project_url,
            "project_image_data": project_image_data,
            "project_image_type": project_image_type,
            "is_featured": is_featured,
            "completed_at": completed_at,
        })
        
        db.commit()
        row = result.fetchone()
        return dict(row._mapping) if row else {}

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get paginated list of client projects."""
        query = text("""
            SELECT id, client_name, project_title, description, technologies, outcome, testimonial, project_url,
                   project_image_data, project_image_type, is_featured, completed_at, created_at, updated_at
            FROM client_projects
            ORDER BY completed_at DESC
            LIMIT :limit OFFSET :skip;
        """)
        
        result = db.execute(query, {"limit": limit, "skip": skip})
        return [dict(row._mapping) for row in result.fetchall()]

    @staticmethod
    def get_by_id(db: Session, project_id: int) -> Optional[Dict[str, Any]]:
        """Get a specific client project by ID."""
        query = text("""
            SELECT id, client_name, project_title, description, technologies, outcome, testimonial, project_url,
                   project_image_data, project_image_type, is_featured, completed_at, created_at, updated_at
            FROM client_projects
            WHERE id = :project_id;
        """)
        
        result = db.execute(query, {"project_id": project_id})
        row = result.fetchone()
        return dict(row._mapping) if row else None

    @staticmethod
    def update(db: Session, project_id: int, **kwargs) -> Optional[Dict[str, Any]]:
        """Update a client project."""
        set_clauses = []
        params = {"project_id": project_id, "updated_at": datetime.utcnow()}
        
        valid_fields = ["client_name", "project_title", "description", "technologies", 
                        "outcome", "testimonial", "project_url", "project_image_data", 
                        "project_image_type", "is_featured", "completed_at"]
        
        for key, value in kwargs.items():
            if key in valid_fields:
                if key == "technologies" and isinstance(value, list):
                    params[key] = json.dumps(value)
                else:
                    params[key] = value
                set_clauses.append(f"{key} = :{key}")
        
        if not set_clauses:
            return None
        
        set_clauses.append("updated_at = :updated_at")
        set_str = ", ".join(set_clauses)
        
        query = text(f"""
            UPDATE client_projects
            SET {set_str}
            WHERE id = :project_id
            RETURNING id, client_name, project_title, description, technologies, outcome, testimonial, project_url,
                      project_image_data, project_image_type, is_featured, completed_at, created_at, updated_at;
        """)
        
        result = db.execute(query, params)
        db.commit()
        row = result.fetchone()
        return dict(row._mapping) if row else None

    @staticmethod
    def delete(db: Session, project_id: int) -> bool:
        """Delete a client project."""
        query = text("DELETE FROM client_projects WHERE id = :project_id;")
        result = db.execute(query, {"project_id": project_id})
        db.commit()
        return result.rowcount > 0
