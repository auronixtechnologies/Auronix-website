"""
Database connection and session management.
Uses raw SQL queries with PostgreSQL through SQLAlchemy engine.
"""

from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from app.config import config

# Create database engine
# Note: Set echo=True to see SQL queries in console (useful for debugging)
engine = create_engine(
    config.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,  # Verify connections before using them
    pool_size=10,
    max_overflow=20,
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Base class for ORM models (kept for reference, not used for queries)
Base = declarative_base()


def get_db():
    """
    Dependency for FastAPI to get database session.
    Yields a database session and ensures proper cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables using raw SQL schemas and migrations.
    Executes statements one by one for robustness.
    """
    db_dir = os.path.join(os.path.dirname(__file__), "..", "Database")
    schema_path = os.path.join(db_dir, "schemas.sql")
    migration_path = os.path.join(db_dir, "migration_alter_queries.sql")
    
    def run_sql_file(connection, file_path, label):
        if not os.path.exists(file_path):
            print(f"⚠ Warning: {label} file not found at {file_path}")
            return False
            
        with open(file_path, "r") as f:
            content = f.read()
            
        # Split by semicolon, but handle cases where semicolon might be inside quotes
        # For simplicity, we'll split and filter empty statements
        statements = [s.strip() for s in content.split(";") if s.strip()]
        
        success_count = 0
        fail_count = 0
        
        for statement in statements:
            try:
                connection.execute(text(statement))
                success_count += 1
            except Exception as e:
                # Ignore "already exists" errors for robustness
                e_str = str(e).lower()
                if "already exists" in e_str or "duplicate" in e_str:
                    success_count += 1
                    continue
                print(f"  ✗ Error in {label} statement: {str(e)[:200]}...")
                fail_count += 1
        
        print(f"✓ {label} processed: {success_count} succeeded, {fail_count} failed")
        return True

    try:
        with engine.connect() as connection:
            with connection.begin():
                # 1. Try to initialize schema
                found_schema = run_sql_file(connection, schema_path, "Schema")
                if not found_schema:
                    print("  Creating tables from ORM models instead...")
                    Base.metadata.create_all(bind=engine)
                
                # 2. Try to apply migrations (ALTER statements)
                run_sql_file(connection, migration_path, "Migration")
                
    except Exception as e:
        print(f"✗ Critical error during database initialization: {e}")
        raise
