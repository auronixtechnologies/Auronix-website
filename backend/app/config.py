"""
Application configuration.
Manages environment variables and application settings.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Config:
    """Base application configuration."""
    
    # Database
    DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "auronix_db")
    DB_USER = os.getenv("DB_USER", "auronix_admin")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "Auronix2602")
    
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=disable"
    
    # Application
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
    SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    PROJECT_NAME = os.getenv("PROJECT_NAME", "Auronix API")
    PROJECT_VERSION = os.getenv("PROJECT_VERSION", "1.0.0")
    
    # API
    API_TITLE = "Auronix API"
    API_VERSION = "1.0.0"
    API_DESCRIPTION = "Backend API for Auronix project management system"
    
    # CORS
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
    
    # File uploads
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "./uploads")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Create config instance
config = Config()
