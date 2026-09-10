"""
Project Repository
Handles all direct SQL queries for projects and project_members tables.
"""

import json
from datetime import datetime
from typing import Any

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
        tech_stack: list[str],
        created_by: int,
        category: str = "Student Projects",
        github_link: str | None = None,
        demo_link: str | None = None,
        price: str | None = None,
        project_image_data: bytes | None = None,
        project_image_type: str | None = None,
        is_featured: bool = False,
        team_member_ids: list[int] | None = None,
    ) -> dict[str, Any]:
        """Create a new project and link team members."""
        query = text("""
            INSERT INTO projects
            (title, description, category, domain, tech_stack, github_link, demo_link, price,
             project_image_data, project_image_type, created_by, is_featured, created_at, updated_at)
            VALUES (:title, :description, :category, :domain, :tech_stack, :github_link, :demo_link, :price,
                    :project_image_data, :project_image_type, :created_by, :is_featured,
                    CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, title, description, category, domain, tech_stack, github_link, demo_link, price,
                      (project_image_data IS NOT NULL) AS has_image,
                      project_image_type, created_by, is_featured, created_at, updated_at;
        """)

        result = db.execute(
            query,
            {
                "title": title,
                "description": description,
                "category": category,
                "domain": domain,
                "tech_stack": json.dumps(tech_stack) if tech_stack else json.dumps([]),
                "github_link": github_link,
                "demo_link": demo_link,
                "price": price,
                "project_image_data": project_image_data,
                "project_image_type": project_image_type,
                "created_by": created_by,
                "is_featured": is_featured,
            },
        )

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
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        domain: str | None = None,
        category: str | None = None,
        is_featured: bool | None = None,
    ) -> list[dict[str, Any]]:
        """
        Get a paginated list of projects, optionally filtered.

        Filtering happens in SQL rather than in Python after the fact. The
        previous version applied LIMIT first and then filtered the page it got
        back, so any project past the limit was invisible to a filtered query
        and featured lookups could return fewer rows than asked for.
        """
        # Each clause is a fixed string; only values are parameterised.
        where = []
        params: dict[str, Any] = {"limit": limit, "skip": skip}

        if domain:
            where.append("domain = :domain")
            params["domain"] = domain
        if category:
            where.append("category = :category")
            params["category"] = category
        if is_featured is not None:
            where.append("is_featured = :is_featured")
            params["is_featured"] = is_featured

        where_sql = f"WHERE {' AND '.join(where)}" if where else ""

        query = text(f"""
            SELECT id, title, description, category, domain, tech_stack, github_link, demo_link, price,
                   (project_image_data IS NOT NULL) AS has_image,
                   project_image_type, created_by, is_featured, created_at, updated_at
            FROM projects
            {where_sql}
            ORDER BY created_at DESC
            LIMIT :limit OFFSET :skip;
        """)

        result = db.execute(query, params)
        projects = [dict(row._mapping) for row in result.fetchall()]

        # Fetch team members for each project
        for project in projects:
            project["team_members"] = ProjectRepository.get_team_members(db, project["id"])

        return projects

    @staticmethod
    def get_by_id(db: Session, project_id: int) -> dict[str, Any] | None:
        """Get a specific project by ID with its team members."""
        query = text("""
            SELECT id, title, description, category, domain, tech_stack, github_link, demo_link, price,
                   (project_image_data IS NOT NULL) AS has_image,
                   project_image_type, created_by, is_featured, created_at, updated_at
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
    def get_team_members(db: Session, project_id: int) -> list[dict[str, Any]]:
        """Get all team members assigned to a project."""
        query = text("""
            SELECT tm.id, tm.name, tm.role, tm.bio, tm.skills, tm.linkedin_url, tm.portfolio_url,
                   (tm.profile_image_data IS NOT NULL) AS has_image,
                   tm.profile_image_type, tm.experience_level, tm.created_at, tm.updated_at
            FROM team_members tm
            INNER JOIN project_members pm ON tm.id = pm.team_member_id
            WHERE pm.project_id = :project_id
            ORDER BY tm.name;
        """)

        result = db.execute(query, {"project_id": project_id})
        return [dict(row._mapping) for row in result.fetchall()]

    @staticmethod
    def get_image(db: Session, project_id: int) -> dict[str, Any] | None:
        """
        Fetch only the image bytes for one project.

        This is the sole query that reads project_image_data — every other
        query reports presence via a has_image boolean, so listing projects
        never drags image payloads out of the database.
        """
        query = text("""
            SELECT project_image_data, project_image_type, updated_at
            FROM projects
            WHERE id = :project_id AND project_image_data IS NOT NULL;
        """)
        row = db.execute(query, {"project_id": project_id}).fetchone()
        return dict(row._mapping) if row else None

    @staticmethod
    def update(
        db: Session, project_id: int, team_member_ids: list[int] | None = None, **kwargs
    ) -> dict[str, Any] | None:
        """Update a project and optionally its team members."""
        set_clauses = []
        params = {"project_id": project_id, "updated_at": datetime.utcnow()}

        valid_fields = [
            "title",
            "description",
            "category",
            "domain",
            "tech_stack",
            "github_link",
            "demo_link",
            "price",
            "project_image_data",
            "project_image_type",
            "is_featured",
        ]

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
                RETURNING id, title, description, category, domain, tech_stack, github_link, demo_link, price,
                          project_image_data, project_image_type, created_by, is_featured, created_at, updated_at;
            """)
            db.execute(query, params)
            db.commit()

        # Update team members if provided
        if team_member_ids is not None:
            # Delete existing associations
            db.execute(
                text("DELETE FROM project_members WHERE project_id = :project_id;"),
                {"project_id": project_id},
            )
            # Insert new associations
            for member_id in team_member_ids:
                db.execute(
                    text("""
                    INSERT INTO project_members (project_id, team_member_id)
                    VALUES (:project_id, :member_id);
                """),
                    {"project_id": project_id, "member_id": member_id},
                )
            db.commit()

        return ProjectRepository.get_by_id(db, project_id)

    @staticmethod
    def delete(db: Session, project_id: int) -> bool:
        """Delete a project."""
        query = text("DELETE FROM projects WHERE id = :project_id;")
        result = db.execute(query, {"project_id": project_id})
        db.commit()
        return result.rowcount > 0
