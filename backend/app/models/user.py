from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from ..core.database import Base


class UserRole(str):
    """User role types for authorization."""

    ADMIN = "admin"
    VIEWER = "viewer"


class User(Base):
    """User account model."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(16), default=UserRole.VIEWER, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
