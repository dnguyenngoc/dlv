from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc
from sqlalchemy.orm import Session

from ...connectors import registry as connector_registry
from ...core.database import get_db
from ...models.node import Node
from ...schemas.node import NodeCreate, NodeListResponse, NodeRead, NodeTest, NodeUpdate
from .auth import get_current_user

router = APIRouter(prefix="/api/nodes", tags=["nodes"])


@router.get("", response_model=NodeListResponse)
def list_nodes(
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
    q: str | None = Query(default=None, description="Search by name"),
    type: str | None = Query(default=None, description="Filter by type"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=9, ge=1, le=100),
    sort: str = Query(default="created_at", pattern="^(name|created_at)$"),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
):
    """List nodes with total count and pagination."""
    base = db.query(Node)
    if q:
        base = base.filter(Node.name.ilike(f"%{q}%"))
    if type:
        base = base.filter(Node.type == type)
    total = base.count()
    # Sorting
    sort_col = Node.created_at if sort == "created_at" else Node.name
    sort_fn = asc if order == "asc" else desc
    query = base.order_by(sort_fn(sort_col))
    query = query.limit(page_size).offset((page - 1) * page_size)
    rows = query.all()
    return NodeListResponse(
        items=[NodeRead.model_validate(r) for r in rows],
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", response_model=NodeRead, status_code=status.HTTP_201_CREATED)
def create_node(
    payload: NodeCreate,
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Create a node."""
    if db.query(Node).filter(Node.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Name already exists")

    node = Node(
        id=str(uuid.uuid4()),
        name=payload.name,
        type=payload.type,
        connection_string=payload.connection_string,
        status="unknown",
    )
    db.add(node)
    db.commit()
    db.refresh(node)
    return NodeRead.model_validate(node)


@router.put("/{node_id}", response_model=NodeRead)
def update_node(
    node_id: str,
    payload: NodeUpdate,
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Update a node."""
    node: Node | None = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    if payload.name:
        # Unique name constraint
        if db.query(Node).filter(Node.name == payload.name, Node.id != node_id).first():
            raise HTTPException(status_code=400, detail="Name already exists")
        node.name = payload.name
    if payload.type:
        node.type = payload.type
    if payload.connection_string:
        node.connection_string = payload.connection_string

    db.commit()
    db.refresh(node)
    return NodeRead.model_validate(node)


@router.post("/test")
def test_connection(
    payload: NodeTest,
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Test connectivity using connector registry."""
    connector = connector_registry.get(payload.type)
    if not connector:
        return {"success": False, "error": f"Unsupported node type: {payload.type}"}
    return connector.test_connection(payload.connection_string)


@router.get("/{node_id}/tables")
def list_node_tables(
    node_id: str,
    schema: str | None = Query(
        default=None, description="Schema name to filter tables"
    ),
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """List tables from a PostgreSQL node."""
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    if node.type != "postgres":
        raise HTTPException(status_code=400, detail="Node type must be postgres")

    connector = connector_registry.get("postgres")
    if not connector or not hasattr(connector, "list_tables"):
        raise HTTPException(
            status_code=500, detail="Postgres connector does not support list_tables"
        )

    return connector.list_tables(node.connection_string, schema)


@router.get("/{node_id}/dags")
def list_node_dags(
    node_id: str,
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """List DAGs from an Airflow node."""
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")

    if node.type != "airflow":
        raise HTTPException(status_code=400, detail="Node type must be airflow")

    connector = connector_registry.get("airflow")
    if not connector or not hasattr(connector, "list_dags"):
        raise HTTPException(
            status_code=500, detail="Airflow connector does not support list_dags"
        )

    return connector.list_dags(node.connection_string)
