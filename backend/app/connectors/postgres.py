from __future__ import annotations


class PostgresConnector:
    """Connector for PostgreSQL database."""

    def test_connection(self, connection_string: str) -> dict[str, object]:
        """Test the connection to the PostgreSQL database."""
        try:
            import psycopg2

            conn = psycopg2.connect(connection_string, connect_timeout=3)  # type: ignore[arg-type]
            conn.close()
            return {"success": True}
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}

    def list_tables(
        self, connection_string: str, schema: str | None = None
    ) -> dict[str, object]:
        """List tables from PostgreSQL database."""
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor

            conn = psycopg2.connect(connection_string, connect_timeout=5)  # type: ignore[arg-type]
            cur = conn.cursor(cursor_factory=RealDictCursor)

            # Query to get tables
            if schema:
                query = """
                    SELECT table_schema, table_name, table_type
                    FROM information_schema.tables
                    WHERE table_schema = %s
                    ORDER BY table_schema, table_name
                """
                cur.execute(query, (schema,))
            else:
                query = """
                    SELECT table_schema, table_name, table_type
                    FROM information_schema.tables
                    WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
                    ORDER BY table_schema, table_name
                """
                cur.execute(query)

            tables = []
            for row in cur.fetchall():
                tables.append(
                    {
                        "schema": row["table_schema"],
                        "name": row["table_name"],
                        "type": row["table_type"],
                    }
                )

            cur.close()
            conn.close()

            return {
                "success": True,
                "tables": tables,
                "total": len(tables),
            }
        except ImportError:
            return {"success": False, "error": "psycopg2 library not installed"}
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}
