"""
Authentication utilities for the admin panel.
Handles JWT token creation/verification and credential validation.

Credentials come from the environment (ADMIN_EMAIL / ADMIN_PASSWORD_HASH).
Generate a hash with:
    python -c "from passlib.context import CryptContext; \
print(CryptContext(schemes=['bcrypt']).hash('your-password'))"
"""

import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import config

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# A valid bcrypt hash of a random value. Verified against when the submitted
# email is unknown, so that a wrong email costs the same time as a wrong
# password and cannot be distinguished by an attacker.
_DUMMY_HASH = pwd_context.hash(secrets.token_urlsafe(32))

# Bearer token extractor for FastAPI dependency injection
bearer_scheme = HTTPBearer(auto_error=False)


# ──────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────

def verify_admin_credentials(email: str, password: str) -> bool:
    """
    Check the supplied email and password against the configured admin
    credentials. Runs in constant time with respect to which field was wrong.
    """
    expected_hash = config.ADMIN_PASSWORD_HASH
    if not expected_hash:
        # No credentials configured — login is disabled rather than open.
        pwd_context.verify(password, _DUMMY_HASH)
        return False

    email_ok = secrets.compare_digest(
        email.strip().lower(), config.ADMIN_EMAIL.strip().lower()
    )
    # Always run a verification so the response time does not reveal whether
    # the email matched.
    password_ok = pwd_context.verify(password, expected_hash if email_ok else _DUMMY_HASH)

    return email_ok and password_ok


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(hours=JWT_EXPIRE_HOURS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if payload.get("sub") != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authorized",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


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
