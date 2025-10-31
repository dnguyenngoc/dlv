from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class DashboardBase(BaseModel):
    """Base dashboard schema."""

    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    is_public: bool = Field(default=False)


class DashboardCreate(DashboardBase):
    """Payload for creating a dashboard."""

    layout: dict | None = None  # JSON layout structure


class DashboardUpdate(BaseModel):
    """Payload for updating a dashboard."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    layout: dict | None = None
    is_public: bool | None = None


class DashboardRead(DashboardBase):
    """Dashboard object returned to clients."""

    id: str
    owner_id: int
    layout: dict | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
