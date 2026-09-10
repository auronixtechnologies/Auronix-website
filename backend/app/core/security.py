"""
Authentication utilities for the admin panel.
Handles JWT token creation/verification and credential validation.

Credentials come from the environment (ADMIN_EMAIL / ADMIN_PASSWORD_HASH).
Generate a hash with:
    python -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt()).decode())"

bcrypt is used directly rather than through passlib: passlib 1.7.4 reads
bcrypt.__about__, which bcrypt removed in 4.1, so the pair raises on every
hash from bcrypt 5.0 onward. Hashes are interchangeable either way.
"""

import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.core.config import config

# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24

# bcrypt hashes at most 72 bytes and raises on anything longer.
BCRYPT_MAX_BYTES = 72


def hash_password(password: str) -> str:
    """Hash a password for storage in ADMIN_PASSWORD_HASH."""
    return bcrypt.hashpw(_encode(password), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Check a password against a bcrypt hash, returning False on a malformed hash."""
    try:
        return bcrypt.checkpw(_encode(password), hashed.encode())
    except (ValueError, TypeError):
        return False


def _encode(password: str) -> bytes:
    """
    Encode a password for bcrypt, truncated to the algorithm's 72-byte limit.

    bcrypt only ever considers the first 72 bytes, so truncating here matches
    what it would use anyway and avoids raising on long passphrases.
    """
    return password.encode("utf-8")[:BCRYPT_MAX_BYTES]


# A valid bcrypt hash of a random value. Verified against when the submitted
# email is unknown, so that a wrong email costs the same time as a wrong
# password and cannot be distinguished by an attacker.
_DUMMY_HASH = hash_password(secrets.token_urlsafe(32))

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
        verify_password(password, _DUMMY_HASH)
        return False

    email_ok = secrets.compare_digest(email.strip().lower(), config.ADMIN_EMAIL.strip().lower())
    # Always run a verification so the response time does not reveal whether
    # the email matched.
    password_ok = verify_password(password, expected_hash if email_ok else _DUMMY_HASH)

    return email_ok and password_ok


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + (
        expires_delta if expires_delta else timedelta(hours=JWT_EXPIRE_HOURS)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, config.SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

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
    credentials: HTTPAuthorizationCredentials | None = Security(bearer_scheme),
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
