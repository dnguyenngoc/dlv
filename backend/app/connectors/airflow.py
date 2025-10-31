from __future__ import annotations

from urllib.parse import urlparse

import requests
from requests.auth import HTTPBasicAuth


class AirflowConnector:
    """Connector for Apache Airflow."""

    def _get_session(self, connection_string: str) -> requests.Session:
        """Get or create a requests session with authentication."""
        parsed = urlparse(connection_string)
        session = requests.Session()

        if parsed.username and parsed.password:
            auth = HTTPBasicAuth(parsed.username, parsed.password)
            session.auth = auth

        return session

    def _get_base_url(self, connection_string: str) -> str:
        """Extract base URL from connection string."""
        parsed = urlparse(connection_string)
        # Always use scheme + netloc as base (e.g., http://localhost:8080)
        # Don't include path from connection string as it might be incomplete
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        return base_url

    def test_connection(self, connection_string: str) -> dict[str, object]:
        """Test the connection to Airflow API."""
        try:
            parsed = urlparse(connection_string)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                return {
                    "success": False,
                    "error": "Invalid Airflow URL. Must be http:// or https://",
                }

            base_url = self._get_base_url(connection_string)
            session = self._get_session(connection_string)

            # Try both /health and /api/v1/health endpoints
            health_endpoints = [
                f"{base_url}/health",
                f"{base_url}/api/v1/health",
            ]

            last_error = None
            for health_url in health_endpoints:
                try:
                    response = session.get(health_url, timeout=5)
                    if response.status_code == 200:
                        # Determine API base - prefer /api/v1 if available
                        if "/api/v1" in health_url:
                            api_base = f"{base_url}/api/v1"
                        else:
                            api_base = (
                                f"{base_url}/api/v1"  # Default to /api/v1 for API calls
                            )
                        return {"success": True, "api_base": api_base}
                    last_error = f"HTTP {response.status_code}"
                except requests.exceptions.ConnectionError as e:
                    last_error = f"Connection error: {str(e)}"
                    continue
                except requests.exceptions.Timeout as e:
                    last_error = f"Timeout: {str(e)}"
                    continue
                except requests.exceptions.RequestException as e:
                    last_error = f"Request error: {str(e)}"
                    continue

            return {
                "success": False,
                "error": f"Unable to connect to Airflow health endpoint. {last_error}",
            }
        except ImportError:
            return {
                "success": False,
                "error": (
                    "requests library not installed. Install with: pip install requests"
                ),
            }
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}

    def list_dags(self, connection_string: str) -> dict[str, object]:
        """List all DAGs from Airflow."""
        try:
            base_url = self._get_base_url(connection_string)
            session = self._get_session(connection_string)

            # Use /api/v1/dags endpoint
            dags_url = f"{base_url}/api/v1/dags"

            response = session.get(dags_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "dags": data.get("dags", []),
                    "total_entries": data.get("total_entries", 0),
                }

            return {
                "success": False,
                "error": f"Airflow returned status {response.status_code}",
            }
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}

    def get_dag(self, connection_string: str, dag_id: str) -> dict[str, object]:
        """Get a specific DAG by ID."""
        try:
            base_url = self._get_base_url(connection_string)
            session = self._get_session(connection_string)

            dag_url = f"{base_url}/api/v1/dags/{dag_id}"

            response = session.get(dag_url, timeout=10)
            if response.status_code == 200:
                return {"success": True, "dag": response.json()}

            if response.status_code == 404:
                return {"success": False, "error": f"DAG '{dag_id}' not found"}

            return {
                "success": False,
                "error": f"Airflow returned status {response.status_code}",
            }
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}

    def get_dag_tasks(self, connection_string: str, dag_id: str) -> dict[str, object]:
        """Get all tasks in a DAG."""
        try:
            base_url = self._get_base_url(connection_string)
            session = self._get_session(connection_string)

            tasks_url = f"{base_url}/api/v1/dags/{dag_id}/tasks"

            response = session.get(tasks_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "tasks": data.get("tasks", []),
                    "total_entries": data.get("total_entries", 0),
                }

            if response.status_code == 404:
                return {"success": False, "error": f"DAG '{dag_id}' not found"}

            return {
                "success": False,
                "error": f"Airflow returned status {response.status_code}",
            }
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}

    def get_datasets(self, connection_string: str) -> dict[str, object]:
        """Get all datasets from Airflow (for lineage tracking)."""
        try:
            base_url = self._get_base_url(connection_string)
            session = self._get_session(connection_string)

            datasets_url = f"{base_url}/api/v1/datasets"

            response = session.get(datasets_url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "datasets": data.get("datasets", []),
                    "total_entries": data.get("total_entries", 0),
                }

            return {
                "success": False,
                "error": f"Airflow returned status {response.status_code}",
            }
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}

    def discover_lineage(
        self, connection_string: str, dag_id: str | None = None
    ) -> dict[str, object]:
        """Discover lineage information from Airflow DAGs.

        This extracts DAG structure, task dependencies, and datasets
        to build a lineage graph.
        """
        try:
            # Get DAGs
            if dag_id:
                dag_result = self.get_dag(connection_string, dag_id)
                if not dag_result.get("success"):
                    return dag_result
                dags = [dag_result["dag"]]
            else:
                dags_result = self.list_dags(connection_string)
                if not dags_result.get("success"):
                    return dags_result
                dags = dags_result.get("dags", [])

            processes = []
            edges = []

            # Process each DAG
            for dag in dags:
                dag_id_val = dag.get("dag_id", "")

                # Get tasks for this DAG
                tasks_result = self.get_dag_tasks(connection_string, dag_id_val)
                if tasks_result.get("success"):
                    tasks = tasks_result.get("tasks", [])

                    # Create process node for each task
                    for task in tasks:
                        task_id = task.get("task_id", "")
                        task_type = task.get("task_type", "unknown")

                        process_id = f"airflow.{dag_id_val}.{task_id}"
                        processes.append(
                            {
                                "id": process_id,
                                "name": f"{dag_id_val}.{task_id}",
                                "type": "airflow",
                                "metadata": {
                                    "dag_id": dag_id_val,
                                    "task_id": task_id,
                                    "task_type": task_type,
                                    "operator": task.get("operator", ""),
                                },
                            }
                        )

                        # Extract dependencies from upstream_task_ids
                        upstream_tasks = task.get("upstream_task_ids", [])
                        for upstream_task_id in upstream_tasks:
                            upstream_process_id = (
                                f"airflow.{dag_id_val}.{upstream_task_id}"
                            )
                            edges.append(
                                {
                                    "from": upstream_process_id,
                                    "to": process_id,
                                    "type": "airflow_dependency",
                                }
                            )

            return {
                "success": True,
                "processes": processes,
                "edges": edges,
            }
        except Exception as err:  # noqa: BLE001
            return {"success": False, "error": str(err)}
