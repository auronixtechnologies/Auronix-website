"""
Database connection, session management and schema bootstrap.

Queries are written as raw SQL in app/repositories; SQLAlchemy is used for its
engine, connection pooling and session handling rather than as an ORM. The one
exception is BlogPost, which is still accessed through the ORM.
"""

from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from app.core.config import config
from app.core.logging import get_logger

logger = get_logger(__name__)

# app/core/db.py -> app/core -> app -> backend
BACKEND_ROOT = Path(__file__).resolve().parents[2]
SQL_DIR = BACKEND_ROOT / "Database"
SCHEMA_FILE = SQL_DIR / "schemas.sql"
MIGRATION_FILE = SQL_DIR / "migration_alter_queries.sql"

# Set echo=True to log every statement (useful when debugging a query).
engine = create_engine(
    config.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Verify connections before handing them out
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative base for the ORM models in app/models.
Base = declarative_base()


def get_db() -> Iterator[Session]:
    """FastAPI dependency yielding a session that is always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _run_sql_file(connection: Connection, path: Path, label: str) -> bool:
    """
    Execute every statement in a .sql file. Returns False if the file is absent.

    Statements are split on the semicolon character with no awareness of
    quoting or comments, so files under Database/ must keep one statement per
    terminator and avoid semicolons elsewhere. "Already exists" failures are
    treated as success, which is what makes re-running this safe.
    """
    if not path.is_file():
        logger.warning("%s file not found at %s", label, path)
        return False

    statements = [s.strip() for s in path.read_text(encoding="utf-8").split(";") if s.strip()]

    succeeded = failed = 0
    for statement in statements:
        try:
            connection.execute(text(statement))
            succeeded += 1
        except Exception as exc:  # noqa: BLE001 - inspected and re-classified below
            message = str(exc).lower()
            if "already exists" in message or "duplicate" in message:
                succeeded += 1
                continue
            logger.error("%s statement failed: %s", label, str(exc)[:200])
            failed += 1

    logger.info("%s applied: %d succeeded, %d failed", label, succeeded, failed)
    return True


def init_db() -> None:
    """
    Create tables from Database/schemas.sql, then apply incremental changes
    from Database/migration_alter_queries.sql.

    Both files are idempotent, so this runs on every startup.
    """
    try:
        with engine.connect() as connection, connection.begin():
            if not _run_sql_file(connection, SCHEMA_FILE, "Schema"):
                logger.warning("Falling back to ORM metadata for table creation")
                Base.metadata.create_all(bind=engine)

            _run_sql_file(connection, MIGRATION_FILE, "Migration")
    except Exception:
        logger.exception("Database initialization failed")
        raise
