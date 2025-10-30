from pydantic import BaseModel


class UserBase(BaseModel):
    """Base user schema."""

    username: str
    role: str


class UserCreate(BaseModel):
    """Payload for creating a user."""

    username: str
    password: str
    role: str


class UserRead(UserBase):
    """User object returned to clients."""

    id: int

    class Config:
        from_attributes = True
