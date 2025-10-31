from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...core.neo4j import get_neo4j_driver
from ...models.lineage import DataAsset, LineageEdge, Process
from ...schemas.lineage import (
    DataAssetCreate,
    DataAssetRead,
    LineageEdgeCreate,
    LineageEdgeRead,
    LineageGraphResponse,
    ProcessCreate,
    ProcessRead,
)
from .auth import get_current_user

router = APIRouter(prefix="/api/lineage", tags=["lineage"])


@router.post(
    "/assets", response_model=DataAssetRead, status_code=status.HTTP_201_CREATED
)
def create_asset(
    payload: DataAssetCreate,
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Create a data asset (table/view)."""
    asset_id = f"{payload.node_id}.{payload.schema_name}.{payload.name}"
    if db.query(DataAsset).filter(DataAsset.id == asset_id).first():
        raise HTTPException(status_code=400, detail="Asset already exists")

    asset = DataAsset(
        id=asset_id,
        node_id=payload.node_id,
        schema=payload.schema_name,
        name=payload.name,
        asset_type=payload.asset_type,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    # Sync to Neo4j
    driver = get_neo4j_driver()
    if driver:
        with driver.session() as session:
            session.run(
                """
                MERGE (a:Asset {id: $id})
                SET a.schema = $schema, a.name = $name, a.asset_type = $asset_type
                """,
                id=asset_id,
                schema=payload.schema_name,
                name=payload.name,
                asset_type=payload.asset_type,
            )

    return DataAssetRead.model_validate(asset)


@router.get("/assets", response_model=list[DataAssetRead])
def list_assets(
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
    node_id: str | None = Query(default=None),
):
    """List data assets."""
    query = db.query(DataAsset)
    if node_id:
        query = query.filter(DataAsset.node_id == node_id)
    return [DataAssetRead.model_validate(a) for a in query.all()]


@router.delete("/assets/{asset_id}")
def delete_asset(
    asset_id: str,
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Delete a data asset."""
    asset = db.query(DataAsset).filter(DataAsset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Delete from Neo4j first
    driver = get_neo4j_driver()
    if driver:
        with driver.session() as session:
            session.run(
                """
                MATCH (a:Asset {id: $id})
                DETACH DELETE a
                """,
                id=asset_id,
            )

    # Delete from database
    db.delete(asset)
    db.commit()
    return {"message": "Asset deleted"}


@router.post(
    "/processes", response_model=ProcessRead, status_code=status.HTTP_201_CREATED
)
def create_process(
    payload: ProcessCreate,
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Create a process (Airflow DAG, Spark job)."""
    if db.query(Process).filter(Process.id == payload.id).first():
        raise HTTPException(status_code=400, detail="Process already exists")

    import json

    process = Process(
        id=payload.id,
        name=payload.name,
        process_type=payload.process_type,
        meta_data=json.dumps(payload.metadata or {}),
    )
    db.add(process)
    db.commit()
    db.refresh(process)

    # Sync to Neo4j
    driver = get_neo4j_driver()
    if driver:
        with driver.session() as session:
            session.run(
                """
                MERGE (p:Process {id: $id})
                SET p.name = $name, p.process_type = $process_type
                """,
                id=payload.id,
                name=payload.name,
                process_type=payload.process_type,
            )

    return ProcessRead.model_validate(process)


@router.get("/processes", response_model=list[ProcessRead])
def list_processes(
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """List processes."""
    processes = db.query(Process).all()
    return [ProcessRead.model_validate(p) for p in processes]


@router.post(
    "/edges", response_model=LineageEdgeRead, status_code=status.HTTP_201_CREATED
)
def create_edge(
    payload: LineageEdgeCreate,
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Create a lineage edge."""
    edge_id = payload.id or str(uuid.uuid4())
    if db.query(LineageEdge).filter(LineageEdge.id == edge_id).first():
        raise HTTPException(status_code=400, detail="Edge already exists")

    import json

    edge = LineageEdge(
        id=edge_id,
        from_id=payload.from_id,
        to_id=payload.to_id,
        from_type=payload.from_type,
        to_type=payload.to_type,
        edge_type=payload.edge_type,
        meta_data=json.dumps(payload.metadata or {}),
    )
    db.add(edge)
    db.commit()
    db.refresh(edge)

    # Sync to Neo4j
    driver = get_neo4j_driver()
    if driver:
        with driver.session() as session:
            # Determine relationship type based on edge_type
            rel_type = payload.edge_type.upper()  # READS, WRITES, TRANSFORMS

            # Create nodes if they don't exist
            from_label = "Asset" if payload.from_type == "asset" else "Process"
            to_label = "Asset" if payload.to_type == "asset" else "Process"

            session.run(
                f"""
                MERGE (from:{from_label} {{id: $from_id}})
                MERGE (to:{to_label} {{id: $to_id}})
                MERGE (from)-[r:{rel_type}]->(to)
                SET r.id = $edge_id
                """,
                from_id=payload.from_id,
                to_id=payload.to_id,
                edge_id=edge_id,
            )

    return LineageEdgeRead.model_validate(edge)


@router.get("/graph", response_model=LineageGraphResponse)
def get_graph(
    asset_id: str | None = Query(default=None, description="Asset ID to query from"),
    process_id: str | None = Query(
        default=None, description="Process ID to query from"
    ),
    direction: str = Query(default="all", pattern="^(upstream|downstream|all)$"),
    depth: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    _: Annotated[object, Depends(get_current_user)] = None,
):
    """Get lineage graph using Neo4j."""
    driver = get_neo4j_driver()
    if not driver:
        raise HTTPException(status_code=503, detail="Neo4j not available")

    if not asset_id and not process_id:
        raise HTTPException(
            status_code=400, detail="Either asset_id or process_id required"
        )

    start_id = asset_id or process_id
    start_label = "Asset" if asset_id else "Process"

    with driver.session() as session:
        if direction == "upstream":
            # Traverse backwards
            query = (
                f"MATCH path = (start:{start_label} {{id: $start_id}})"
                f"<-[*1..{depth}]-(upstream) "
                "RETURN DISTINCT upstream, relationships(path) as rels "
                "LIMIT 100"
            )
        elif direction == "downstream":
            # Traverse forwards
            query = (
                f"MATCH path = (start:{start_label} {{id: $start_id}})"
                f"-[*1..{depth}]->(downstream) "
                "RETURN DISTINCT downstream, relationships(path) as rels "
                "LIMIT 100"
            )
        else:
            # Both directions
            query = f"""
            MATCH path = (start:{start_label} {{id: $start_id}})-[*1..{depth}]-(related)
            RETURN DISTINCT related, relationships(path) as rels
            LIMIT 100
            """

        result = session.run(query, start_id=start_id)
        nodes = []
        edges = []
        node_ids = set()

        for record in result:
            node = record["related"]
            node_id = node["id"]
            if node_id not in node_ids:
                nodes.append(
                    {
                        "id": node_id,
                        "type": node.labels[0].lower(),
                        "data": dict(node),
                    }
                )
                node_ids.add(node_id)

            # Extract relationships
            rels = record.get("rels", [])
            for rel in rels:
                edge_id = rel.get("id", str(uuid.uuid4()))
                edges.append(
                    {
                        "id": edge_id,
                        "source": rel.start_node["id"],
                        "target": rel.end_node["id"],
                        "type": rel.type.lower(),
                    }
                )

        # Add start node
        start_result = session.run(
            f"MATCH (n:{start_label} {{id: $id}}) RETURN n", id=start_id
        )
        for record in start_result:
            node = record["n"]
            nodes.append(
                {
                    "id": node["id"],
                    "type": node.labels[0].lower(),
                    "data": dict(node),
                }
            )

    return LineageGraphResponse(nodes=nodes, edges=edges)
