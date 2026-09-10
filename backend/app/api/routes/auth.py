"""
Auth routes — login endpoint for the admin panel.
POST /api/v1/auth/login  →  returns { access_token, token_type }
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.auth import verify_admin_credentials, create_access_token, require_admin

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=TokenResponse)
def admin_login(body: LoginRequest):
    """
    Admin login endpoint.
    Validates hardcoded credentials and returns a signed JWT.
    """
    if not verify_admin_credentials(body.email, body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": "admin"})
    return TokenResponse(access_token=token, token_type="bearer")


@router.get("/verify", tags=["auth"])
def verify_token_endpoint(claims: dict = Depends(require_admin)):
    """
    Lightweight token verification endpoint (used by the frontend health-check).

    Reads the token from the Authorization header. It was previously a query
    parameter, which wrote live tokens into access logs and browser history.
    """
    return {"valid": True, "sub": claims.get("sub")}
