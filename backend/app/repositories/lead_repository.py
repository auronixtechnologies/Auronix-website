"""
Lead Repository
Handles all direct SQL queries for leads table.
"""

from datetime import datetime
from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session


class LeadRepository:
    """Class containing raw SQL queries for lead (contact) operations."""

    @staticmethod
    def create(
        db: Session,
        name: str,
        email: str,
        message: str,
        phone: str | None = None,
        service_type: str | None = None,
        budget: str | None = None,
    ) -> dict[str, Any]:
        """Create a new lead using raw SQL."""
        query = text("""
            INSERT INTO leads (name, email, phone, service_type, budget, message, status, created_at, updated_at)
            VALUES (:name, :email, :phone, :service_type, :budget, :message, 'new', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id, name, email, phone, service_type, budget, message, status, created_at, updated_at;
        """)

        result = db.execute(
            query,
            {
                "name": name,
                "email": email,
                "phone": phone,
                "service_type": service_type,
                "budget": budget,
                "message": message,
            },
        )

        db.commit()
        row = result.fetchone()
        return dict(row._mapping) if row else {}

    @staticmethod
    def get_all(
        db: Session, skip: int = 0, limit: int = 100, status: str | None = None
    ) -> list[dict[str, Any]]:
        """Get paginated list of leads with optional status filter."""
        if status:
            query = text("""
                SELECT id, name, email, phone, service_type, budget, message, status, created_at, updated_at
                FROM leads
                WHERE status = :status
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :skip;
            """)
            result = db.execute(query, {"status": status, "limit": limit, "skip": skip})
        else:
            query = text("""
                SELECT id, name, email, phone, service_type, budget, message, status, created_at, updated_at
                FROM leads
                ORDER BY created_at DESC
                LIMIT :limit OFFSET :skip;
            """)
            result = db.execute(query, {"limit": limit, "skip": skip})

        return [dict(row._mapping) for row in result.fetchall()]

    @staticmethod
    def get_by_id(db: Session, lead_id: int) -> dict[str, Any] | None:
        """Get a specific lead by ID."""
        query = text("""
            SELECT id, name, email, phone, service_type, budget, message, status, created_at, updated_at
            FROM leads
            WHERE id = :lead_id;
        """)

        result = db.execute(query, {"lead_id": lead_id})
        row = result.fetchone()
        return dict(row._mapping) if row else None

    @staticmethod
    def update(db: Session, lead_id: int, **kwargs) -> dict[str, Any] | None:
        """Update a lead."""
        set_clauses = []
        params = {"lead_id": lead_id, "updated_at": datetime.utcnow()}

        valid_fields = ["name", "email", "phone", "service_type", "budget", "message", "status"]

        for key, value in kwargs.items():
            if key in valid_fields:
                params[key] = value
                set_clauses.append(f"{key} = :{key}")

        if not set_clauses:
            return None

        set_clauses.append("updated_at = :updated_at")
        set_str = ", ".join(set_clauses)

        query = text(f"""
            UPDATE leads
            SET {set_str}
            WHERE id = :lead_id
            RETURNING id, name, email, phone, service_type, budget, message, status, created_at, updated_at;
        """)

        result = db.execute(query, params)
        db.commit()
        row = result.fetchone()
        return dict(row._mapping) if row else None

    @staticmethod
    def delete(db: Session, lead_id: int) -> bool:
        """Delete a lead."""
        query = text("DELETE FROM leads WHERE id = :lead_id;")
        result = db.execute(query, {"lead_id": lead_id})
        db.commit()
        return result.rowcount > 0
