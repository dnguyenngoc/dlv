from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

NodeType = Literal["postgres", "api", "airflow"]


class NodeBase(BaseModel):
    """Base node schema."""

    name: str = Field(min_length=1, max_length=255)
    type: NodeType
    connection_string: str = Field(min_length=1, max_length=2048)


class NodeCreate(NodeBase):
    """Payload for creating a node."""

    pass


class NodeUpdate(BaseModel):
    """Payload for updating a node."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: NodeType | None = None
    connection_string: str | None = Field(default=None, min_length=1, max_length=2048)


class NodeRead(BaseModel):
    """Node object returned to clients."""

    id: str
    name: str
    type: NodeType
    status: str
    connection_string: str | None | None = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class NodeTest(BaseModel):
    """Lightweight payload for connection tests."""

    type: NodeType
    connection_string: str = Field(min_length=1, max_length=2048)


class NodeListResponse(BaseModel):
    """Response for listing nodes."""

    items: list[NodeRead]
    total: int
    page: int
    page_size: int
