from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..core.database import Base


class DataAsset(Base):
    """Data asset model (tables, views)."""

    __tablename__ = "data_assets"

    id: Mapped[str] = mapped_column(
        String, primary_key=True
    )  # e.g., "dlv.public.users"
    node_id: Mapped[str] = mapped_column(String, ForeignKey("nodes.id"), nullable=False)
    schema: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    asset_type: Mapped[str] = mapped_column(
        String(50), default="table", nullable=False
    )  # table, view

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    node = relationship("Node", back_populates="data_assets")


class Process(Base):
    """Process model (Airflow DAGs, Spark jobs)."""

    __tablename__ = "processes"

    id: Mapped[str] = mapped_column(
        String, primary_key=True
    )  # e.g., "airflow.dag_id.task_id"
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    process_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # airflow, spark, custom
    meta_data: Mapped[str] = mapped_column(
        "metadata", String(2048), nullable=True
    )  # JSON (using column name "metadata" in DB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class LineageEdge(Base):
    """Lineage edge model (relationships between assets/processes)."""

    __tablename__ = "lineage_edges"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    from_id: Mapped[str] = mapped_column(String, nullable=False)  # Asset or Process ID
    to_id: Mapped[str] = mapped_column(String, nullable=False)  # Asset or Process ID
    from_type: Mapped[str] = mapped_column(String(50), nullable=False)  # asset, process
    to_type: Mapped[str] = mapped_column(String(50), nullable=False)  # asset, process
    edge_type: Mapped[str] = mapped_column(
        String(50), nullable=False
    )  # reads, writes, transforms
    meta_data: Mapped[str] = mapped_column(
        "metadata", String(2048), nullable=True
    )  # JSON (using column name "metadata" in DB)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
