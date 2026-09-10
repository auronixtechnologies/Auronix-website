"""
Application configuration.
Manages environment variables and application settings.

Secrets (SECRET_KEY, DB_PASSWORD, ADMIN_PASSWORD_HASH) have development-only
fallbacks. When ENVIRONMENT=production the app refuses to start unless they are
supplied via the environment — see validate() below.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Values that must never reach production. Kept here so validate() can detect
# a deployment that forgot to override them.
DEV_SECRET_KEY = "dev-only-secret-key-do-not-use-in-production"
DEV_DB_PASSWORD = "Auronix2602"


class Config:
    """Base application configuration."""

    # Application
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    IS_PRODUCTION = ENVIRONMENT.lower() == "production"

    # DEBUG defaults to False: when True, unhandled exception text (including
    # SQL statements and parameters) is returned to the client.
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"

    SECRET_KEY = os.getenv("SECRET_KEY", DEV_SECRET_KEY)
    PROJECT_NAME = os.getenv("PROJECT_NAME", "Auronix API")
    PROJECT_VERSION = os.getenv("PROJECT_VERSION", "1.0.0")

    # Database
    # A full DATABASE_URL wins if present — this is what Render, Neon and
    # Supabase hand you. Otherwise the URL is assembled from the parts below.
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "auronix_db")
    DB_USER = os.getenv("DB_USER", "auronix_admin")
    DB_PASSWORD = os.getenv("DB_PASSWORD", DEV_DB_PASSWORD)

    # Managed Postgres providers require TLS; a local docker container has no
    # certificate, so default to whatever suits the environment.
    DB_SSLMODE = os.getenv("DB_SSLMODE", "require" if IS_PRODUCTION else "disable")

    _database_url = os.getenv("DATABASE_URL")
    if _database_url:
        # SQLAlchemy 2.x does not accept the bare "postgres://" scheme that
        # some providers still emit.
        if _database_url.startswith("postgres://"):
            _database_url = _database_url.replace("postgres://", "postgresql://", 1)
        DATABASE_URL = _database_url
    else:
        DATABASE_URL = (
            f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            f"?sslmode={DB_SSLMODE}"
        )

    # Admin credentials (see app/auth.py)
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@auronix.local")
    ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "")

    # API
    API_TITLE = "Auronix API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "Backend API for Auronix project management system"

    # CORS
    ALLOWED_ORIGINS = [
        origin.strip()
        for origin in os.getenv(
            "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
        ).split(",")
        if origin.strip()
    ]

    # File uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

    @classmethod
    def validate(cls) -> None:
        """
        Refuse to start a production deployment that is still using development
        secrets. Called from app.main at import time.
        """
        if not cls.IS_PRODUCTION:
            if cls.SECRET_KEY == DEV_SECRET_KEY:
                print("WARNING: using the development SECRET_KEY. Set SECRET_KEY before deploying.")
            if not cls.ADMIN_PASSWORD_HASH:
                print("WARNING: ADMIN_PASSWORD_HASH is not set — admin login is disabled.")
            return

        problems = []
        if cls.SECRET_KEY == DEV_SECRET_KEY:
            problems.append("SECRET_KEY is still the development default")
        if len(cls.SECRET_KEY) < 32:
            problems.append("SECRET_KEY must be at least 32 characters")
        if not cls.ADMIN_PASSWORD_HASH:
            problems.append("ADMIN_PASSWORD_HASH is not set")
        if not os.getenv("DATABASE_URL") and cls.DB_PASSWORD == DEV_DB_PASSWORD:
            problems.append("DB_PASSWORD is still the development default")
        if cls.DEBUG:
            problems.append("DEBUG must be False in production (it leaks exception details)")
        if "*" in cls.ALLOWED_ORIGINS:
            problems.append("ALLOWED_ORIGINS must not be '*' when credentials are allowed")

        if problems:
            print("FATAL: insecure production configuration:", file=sys.stderr)
            for problem in problems:
                print(f"  - {problem}", file=sys.stderr)
            raise RuntimeError("Insecure production configuration; refusing to start.")


# Create config instance
config = Config()
