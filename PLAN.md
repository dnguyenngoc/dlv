# Data Lineage Visualizer - Python Version

## Architecture Overview

### Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Task Queue**: Celery + Redis
- **Databases**: PostgreSQL (metadata), Neo4j (lineage graph), Redis (cache/queue)
- **Frontend**: React 18 + TypeScript + React Flow
- **Real-time**: WebSocket (FastAPI WebSocket + Socket.io)
- **Visualization**: React Flow (drag-drop), D3.js (custom visualizations)

## Project Structure

```
dlv-python/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── nodes.py          # CRUD for data source nodes
│   │   │   │   ├── dashboards.py     # Dashboard management
│   │   │   │   ├── lineage.py        # Lineage query & traversal
│   │   │   │   └── monitoring.py     # Real-time monitoring endpoints
│   │   │   └── websocket.py          # WebSocket connections
│   │   ├── core/
│   │   │   ├── config.py             # Settings & environment
│   │   │   ├── database.py           # DB connections
│   │   │   └── security.py           # Auth & JWT
│   │   ├── models/
│   │   │   ├── node.py               # Node models (Spark, Airflow, etc.)
│   │   │   ├── dashboard.py          # Dashboard & layout models
│   │   │   └── lineage.py            # Lineage relationship models
│   │   ├── schemas/
│   │   │   └── pydantic models       # Request/response schemas
│   │   ├── services/
│   │   │   ├── node_service.py       # Node business logic
│   │   │   ├── lineage_service.py    # Lineage graph operations
│   │   │   └── monitor_service.py    # Health check & monitoring
│   │   ├── tasks/                    # Celery tasks
│   │   │   ├── collectors/
│   │   │   │   ├── spark_collector.py
│   │   │   │   ├── airflow_collector.py
│   │   │   │   └── database_collector.py
│   │   │   └── monitoring.py         # Periodic health checks
│   │   └── main.py                   # FastAPI app entry
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FlowEditor/           # React Flow drag-drop editor
│   │   │   │   ├── NodePalette.tsx   # Available node types
│   │   │   │   ├── CustomNodes/      # Custom node components
│   │   │   │   └── FlowCanvas.tsx    # Main editor canvas
│   │   │   ├── Dashboard/
│   │   │   │   ├── DashboardList.tsx
│   │   │   │   └── DashboardView.tsx
│   │   │   └── Monitoring/
│   │   │       ├── StatusPanel.tsx   # Real-time status
│   │   │       └── LineageGraph.tsx  # D3 lineage viz
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts       # WebSocket hook
│   │   │   └── useReactFlow.ts       # Flow editor hook
│   │   ├── services/
│   │   │   └── api.ts                # API client
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Implementation Phases

### Phase 1: Core Backend Infrastructure

**Database Setup**

- PostgreSQL: Users, nodes, dashboards, configurations
- Neo4j: Lineage graph (nodes as vertices, data flow as edges)
- Redis: Celery broker, WebSocket pub/sub, caching

**FastAPI Application**

- Setup FastAPI with proper project structure
- Implement authentication (JWT)
- Database connections (SQLAlchemy for PostgreSQL, Neo4j driver)
- CORS configuration for frontend

**Core Models**

```python
# models/node.py
class Node(Base):
    id: UUID
    name: str
    type: NodeType  # SPARK, AIRFLOW, POSTGRES, etc.
    connection_config: JSON
    status: NodeStatus
    metadata: JSON

# models/dashboard.py
class Dashboard(Base):
    id: UUID
    name: str
    description: str
    layout: JSON  # React Flow layout data
    nodes: List[Node]
    edges: List[Edge]
```

### Phase 2: Node Management & Collectors

**Node API Endpoints**

- POST /api/nodes - Create node
- GET /api/nodes - List nodes
- PUT /api/nodes/{id} - Update node
- DELETE /api/nodes/{id} - Delete node
- POST /api/nodes/{id}/test - Test connection

**Celery Collectors**

```python
# tasks/collectors/base.py
class BaseCollector:
    def collect_metadata(self)
    def check_health(self)
    def extract_lineage(self)

# tasks/collectors/spark_collector.py
class SparkCollector(BaseCollector):
    # Connect to Spark, extract job lineage

# tasks/collectors/airflow_collector.py
class AirflowCollector(BaseCollector):
    # Connect to Airflow API, extract DAG lineage
```

**Celery Tasks**

- Periodic health checks (every 5 min)
- Lineage extraction (scheduled or on-demand)
- Data flow analysis

### Phase 3: Dashboard Editor (Frontend)

**React Flow Integration**

```tsx
// components/FlowEditor/FlowCanvas.tsx
const FlowCanvas = () => {
  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])

  // Custom node types: Spark, Airflow, Database
  const nodeTypes = useMemo(() => ({
    spark: SparkNode,
    airflow: AirflowNode,
    database: DatabaseNode,
  }), [])

  // Handle node drag from palette
  const onNodeDragStop = (event, node) => {
    // Save position
  }

  // Handle edge creation
  const onConnect = (connection) => {
    // Create lineage edge
  }
}
```

**Node Palette**

- Drag-drop interface for node types
- Search/filter nodes
- Node templates with default configs

**Dashboard Management**

- Create/edit/delete dashboards
- Save layout to backend
- Load existing dashboards

### Phase 4: Lineage Graph & Visualization

**Neo4j Lineage Storage**

```cypher
// Store lineage in Neo4j
CREATE (source:DataSource {id: $id, name: $name, type: $type})
CREATE (target:DataSource {id: $id, name: $name, type: $type})
CREATE (source)-[:FLOWS_TO {timestamp: $ts, job_id: $job}]->(target)
```

**Lineage Service**

```python
# services/lineage_service.py
class LineageService:
    def get_upstream(node_id, depth=3)
    def get_downstream(node_id, depth=3)
    def get_full_lineage(node_id)
    def find_path(source_id, target_id)
```

**D3.js Visualization**

- Force-directed graph for lineage
- Zoom/pan capabilities
- Node filtering
- Path highlighting

### Phase 5: Real-time Monitoring

**WebSocket Implementation**

```python
# api/websocket.py
@app.websocket("/ws/monitoring/{dashboard_id}")
async def monitoring_websocket(websocket: WebSocket, dashboard_id: str):
    await websocket.accept()
    # Subscribe to Redis pub/sub
    # Send status updates to client
```

**Status Broadcasting**

- Celery tasks publish status to Redis
- WebSocket server subscribes to Redis
- Push updates to connected clients

**Frontend WebSocket**

```tsx
// hooks/useWebSocket.ts
const useWebSocket = (dashboardId: string) => {
  const [status, setStatus] = useState({})

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8000/ws/monitoring/${dashboardId}`)
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setStatus(prev => ({...prev, [data.node_id]: data.status}))
    }
  }, [dashboardId])

  return status
}
```

**Monitoring Features**

- Real-time node status (connected, error, running)
- Data flow metrics
- Job execution status
- Alert notifications

### Phase 6: Advanced Features

**Dashboard Features**

- Annotations/notes on nodes
- Custom metrics display
- Historical data view
- Export/import dashboards

**Monitoring Enhancements**

- Alert rules configuration
- Notification channels (email, Slack)
- Performance metrics
- SLA tracking

## Key Technical Decisions

**Why FastAPI?**

- Modern async Python framework
- Auto-generated OpenAPI docs
- Built-in WebSocket support
- Type hints with Pydantic

**Why Celery?**

- Robust task queue for Python
- Scheduled periodic tasks
- Retry logic and error handling
- Scalable workers

**Why Neo4j?**

- Purpose-built for graph queries
- Efficient lineage traversal
- Cypher query language
- Built-in graph algorithms

**Why React Flow?**

- Purpose-built for node editors
- Handles layout algorithms
- Extensible node types
- Good performance

## Deployment

**Docker Compose**

```yaml
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    depends_on: [postgres, neo4j, redis]

  celery-worker:
    build: ./backend
    command: celery -A app.tasks worker
    depends_on: [redis, postgres, neo4j]

  celery-beat:
    build: ./backend
    command: celery -A app.tasks beat

  frontend:
    build: ./frontend
    ports: ["3000:3000"]

  postgres:
    image: postgres:15

  neo4j:
    image: neo4j:5

  redis:
    image: redis:7
```

## Testing Strategy

- Unit tests: pytest for backend, Jest for frontend
- Integration tests: API endpoints with test database
- E2E tests: Playwright for critical flows
- Load tests: Locust for WebSocket performance

## Next Steps

1. Setup project structure and dependencies
2. Implement core FastAPI application with database connections
3. Create basic CRUD for nodes
4. Setup Celery with sample collector
5. Build React Flow editor UI
6. Implement WebSocket monitoring
7. Add Neo4j lineage storage
8. Create D3.js visualizations
