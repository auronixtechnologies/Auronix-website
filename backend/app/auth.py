"""
Authentication utilities for the admin panel.
Handles JWT token creation/verification and credential validation.
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

ADMIN_EMAIL = "auronixtechnologies@gmail.com"
ADMIN_PASSWORD = "Aura@2003!"

# Use the SECRET_KEY from env, or a sensible default for dev
JWT_SECRET = os.getenv("SECRET_KEY", "auronix-super-secret-jwt-2024-do-not-expose")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token extractor for FastAPI dependency injection
bearer_scheme = HTTPBearer(auto_error=False)


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def verify_admin_credentials(email: str, password: str) -> bool:
    """Check if the supplied email and password match the admin credentials."""
    return email.lower().strip() == ADMIN_EMAIL.lower() and password == ADMIN_PASSWORD


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(hours=JWT_EXPIRE_HOURS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("sub") != "admin":
            raise HTTPException(status_code=401, detail="Not authorized")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ──────────────────────────────────────────────
# FastAPI dependency: require valid admin token
# ──────────────────────────────────────────────

def require_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(bearer_scheme),
) -> dict:
    """
    FastAPI dependency that validates the Bearer token on admin endpoints.
    Usage:
        @router.post("/something")
        def handler(..., _=Depends(require_admin)):
            ...
    """
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return decode_token(credentials.credentials)
