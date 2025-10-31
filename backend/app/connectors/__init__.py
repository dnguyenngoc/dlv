from __future__ import annotations

from .airflow import AirflowConnector
from .postgres import PostgresConnector
from .rest_api import RestApiConnector


class ConnectorRegistry:
    """Registry for connectors."""

    def __init__(self) -> None:
        """Initialize the connector registry."""
        self._registry = {
            "postgres": PostgresConnector(),
            "api": RestApiConnector(),
            "airflow": AirflowConnector(),
        }

    def get(self, key: str):
        """Get a connector by key."""
        return self._registry.get(key)


registry = ConnectorRegistry()
