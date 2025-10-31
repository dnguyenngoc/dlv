from __future__ import annotations

from neo4j import GraphDatabase

from .config import get_settings

settings = get_settings()

_driver = None


def get_neo4j_driver():
    """Get or create Neo4j driver instance."""
    global _driver
    if _driver is None and settings.neo4j_url:
        _driver = GraphDatabase.driver(
            settings.neo4j_url,
            auth=(settings.neo4j_user or "neo4j", settings.neo4j_password or "neo4j"),
        )
    return _driver


def close_neo4j_driver():
    """Close Neo4j driver connection."""
    global _driver
    if _driver:
        _driver.close()
        _driver = None


def verify_neo4j_connection() -> bool:
    """Verify Neo4j connection."""
    driver = get_neo4j_driver()
    if not driver:
        return False
    try:
        with driver.session() as session:
            session.run("RETURN 1")
        return True
    except Exception:
        return False
