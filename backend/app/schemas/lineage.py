from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

AssetType = Literal["table", "view"]
ProcessType = Literal["airflow", "spark", "custom"]
EdgeType = Literal["reads", "writes", "transforms"]


class DataAssetBase(BaseModel):
    """Base data asset schema."""

    schema_name: str = Field(alias="schema", min_length=1, max_length=255)
    name: str = Field(min_length=1, max_length=255)
    asset_type: AssetType = Field(default="table")


class DataAssetCreate(DataAssetBase):
    """Payload for creating a data asset."""

    node_id: str


class DataAssetRead(DataAssetBase):
    """Data asset object returned to clients."""

    id: str
    node_id: str
    schema: str  # Use "schema" for API response
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class ProcessBase(BaseModel):
    """Base process schema."""

    name: str = Field(min_length=1, max_length=255)
    process_type: ProcessType
    metadata: dict | None = None


class ProcessCreate(ProcessBase):
    """Payload for creating a process."""

    id: str  # e.g., "airflow.dag_id.task_id"


class ProcessRead(ProcessBase):
    """Process object returned to clients."""

    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class LineageEdgeBase(BaseModel):
    """Base lineage edge schema."""

    from_id: str
    to_id: str
    from_type: Literal["asset", "process"]
    to_type: Literal["asset", "process"]
    edge_type: EdgeType
    metadata: dict | None = None


class LineageEdgeCreate(LineageEdgeBase):
    """Payload for creating a lineage edge."""

    id: str | None = None


class LineageEdgeRead(LineageEdgeBase):
    """Lineage edge object returned to clients."""

    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class LineageGraphResponse(BaseModel):
    """Lineage graph response."""

    nodes: list[dict]
    edges: list[dict]
