from pydantic import BaseModel


class Token(BaseModel):
    """JWT access token response."""

    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """Decoded JWT payload."""

    sub: str
    role: str


class LoginRequest(BaseModel):
    """Login credentials payload."""

    username: str
    password: str
