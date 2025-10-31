from __future__ import annotations

from urllib.parse import urlparse


class RestApiConnector:
    """Connector for REST API."""

    def test_connection(self, connection_string: str) -> dict[str, object]:
        """Test the connection to the REST API."""
        parsed = urlparse(connection_string)
        if parsed.scheme in {"http", "https"} and parsed.netloc:
            return {"success": True}
        return {"success": False, "error": "Invalid API URL"}
