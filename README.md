# DLV (Data Lineage Visualizer)

DLV is a tool to observe and visualize data lineage across systems
(Spark, Airflow, PostgreSQL/MySQL, etc.) with near real-time monitoring goals.

This repository currently contains the Backend (FastAPI) with JWT auth (admin/viewer roles).
The UI will be added in later phases (React Flow + D3).

## Architecture (from PLAN.md)

- Backend: FastAPI (Python 3.12), SQLAlchemy, JWT
- Task Queue: Celery + Redis (planned next phases)
- Databases: PostgreSQL (metadata), Neo4j (lineage graph, planned), Redis (cache/queue)
- Frontend: React 24 + TypeScript + React Flow (planned)
- Real-time: WebSocket (planned)

## Repository Structure (MVP)

```
./
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/      # auth endpoints (login, me, create user)
│   │   ├── core/            # config, database
│   │   ├── models/          # SQLAlchemy models (User)
│   │   └── schemas/         # Pydantic schemas (Auth/User)
│   ├── main.py              # FastAPI app entry
│   ├── pyproject.toml       # Python deps (via uv)
│   ├── Dockerfile           # API container (uv + uvicorn)
│   └── docker-compose.yaml  # API + Postgres (dev)
├── .pre-commit-config.yaml  # Ruff lint/format hooks
├── PLAN.md                  # Detailed implementation plan (high-level roadmap)
└── README.md                # You are here
```

## Prerequisites

- Python 3.12
- uv (Python package/dependency manager): https://docs.astral.sh/uv/
- Docker & Docker Compose (optional but recommended for local DB)

Install uv:
```bash
pip install -U uv
# or with pipx
pipx install uv
```

Enable pre-commit hooks:
```bash
cd backend
uv run pre-commit install
```

## Start Backend (simplest)

Option A — Docker (recommended)
```bash
cd backend
docker compose up --build
# API: http://localhost:8000
```

Option B — Local (uv)
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

## Auth API (current scope)

- POST /api/auth/login { username, password } -> { access_token, token_type }
- GET  /api/auth/me (Bearer token) -> current user
- POST /api/auth/users (admin only) -> create user { username, password, role }

Example login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=admin&password=admin123'
```

Swagger UI:
- http://localhost:8000/docs
- Click Authorize (lock icon) to test endpoints requiring Bearer token.

## Code Quality: pre-commit + ruff

- Hooks are defined in .pre-commit-config.yaml
- They run automatically on commit; run manually with:
```bash
uv run pre-commit run --all-files
```

## Next Phases (from PLAN.md)

- Nodes & Dashboards CRUD, lineage storage (Neo4j)
- Collectors (Spark, Airflow, DB) via Celery + Redis
- Real-time status via WebSocket
- React Flow editor and D3 lineage visualization

UI (temporarily empty):
- Frontend will be created with React + TypeScript, React Flow for the drag-drop editor, and D3 for lineage graph.
- UI code is not present in this phase to focus on backend + auth foundation.

## License

TBD
