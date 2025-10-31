from __future__ import annotations

import json
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.dashboard import Dashboard
from ...models.user import User
from ...schemas.dashboard import DashboardCreate, DashboardRead, DashboardUpdate
from .auth import get_current_user

router = APIRouter(prefix="/api/dashboards", tags=["dashboards"])


@router.get("", response_model=list[DashboardRead])
def list_dashboards(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List dashboards (user's own + public)."""
    dashboards = (
        db.query(Dashboard)
        .filter(
            (Dashboard.owner_id == user.id) | (Dashboard.is_public == True)  # noqa: E712
        )
        .all()
    )
    result = []
    for d in dashboards:
        dashboard_dict = {
            "id": d.id,
            "name": d.name,
            "description": d.description,
            "is_public": d.is_public,
            "owner_id": d.owner_id,
            "layout": json.loads(d.layout) if d.layout else None,
            "created_at": d.created_at,
            "updated_at": d.updated_at,
        }
        result.append(DashboardRead.model_validate(dashboard_dict))
    return result


@router.get("/{dashboard_id}", response_model=DashboardRead)
def get_dashboard(
    dashboard_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get dashboard by ID."""
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    if dashboard.owner_id != user.id and not dashboard.is_public:
        raise HTTPException(status_code=403, detail="Access denied")
    dashboard_dict = {
        "id": dashboard.id,
        "name": dashboard.name,
        "description": dashboard.description,
        "is_public": dashboard.is_public,
        "owner_id": dashboard.owner_id,
        "layout": json.loads(dashboard.layout) if dashboard.layout else None,
        "created_at": dashboard.created_at,
        "updated_at": dashboard.updated_at,
    }
    return DashboardRead.model_validate(dashboard_dict)


@router.post("", response_model=DashboardRead, status_code=status.HTTP_201_CREATED)
def create_dashboard(
    payload: DashboardCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new dashboard."""
    dashboard = Dashboard(
        id=str(uuid.uuid4()),
        name=payload.name,
        description=payload.description,
        owner_id=user.id,
        layout=json.dumps(
            payload.layout
            or {"nodes": [], "edges": [], "viewport": {"x": 0, "y": 0, "zoom": 1}}
        ),
        is_public=payload.is_public,
    )
    db.add(dashboard)
    db.commit()
    db.refresh(dashboard)
    dashboard_dict = {
        "id": dashboard.id,
        "name": dashboard.name,
        "description": dashboard.description,
        "is_public": dashboard.is_public,
        "owner_id": dashboard.owner_id,
        "layout": json.loads(dashboard.layout) if dashboard.layout else None,
        "created_at": dashboard.created_at,
        "updated_at": dashboard.updated_at,
    }
    return DashboardRead.model_validate(dashboard_dict)


@router.put("/{dashboard_id}", response_model=DashboardRead)
def update_dashboard(
    dashboard_id: str,
    payload: DashboardUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update dashboard."""
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    if dashboard.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    if payload.name is not None:
        dashboard.name = payload.name
    if payload.description is not None:
        dashboard.description = payload.description
    if payload.layout is not None:
        dashboard.layout = json.dumps(payload.layout)
    if payload.is_public is not None:
        dashboard.is_public = payload.is_public

    db.commit()
    db.refresh(dashboard)
    dashboard_dict = {
        "id": dashboard.id,
        "name": dashboard.name,
        "description": dashboard.description,
        "is_public": dashboard.is_public,
        "owner_id": dashboard.owner_id,
        "layout": json.loads(dashboard.layout) if dashboard.layout else None,
        "created_at": dashboard.created_at,
        "updated_at": dashboard.updated_at,
    }
    return DashboardRead.model_validate(dashboard_dict)


@router.delete("/{dashboard_id}")
def delete_dashboard(
    dashboard_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete dashboard."""
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    if dashboard.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    db.delete(dashboard)
    db.commit()
    return {"message": "Dashboard deleted"}
