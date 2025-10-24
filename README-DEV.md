# DLV Development Guide

This guide provides instructions for setting up and developing the DLV (Data Lineage Visualizer) project.

## Prerequisites

- Go 1.21 or higher
- Node.js 18+ and npm
- Neo4j or ArangoDB (for graph storage)
- Make (optional, for build automation)

## Project Structure

```
dlv/
├── cmd/server/          # Main entry point
├── internal/
│   ├── api/            # HTTP API and WebSocket handlers
│   ├── collector/      # Data source collectors
│   └── processor/      # Lineage graph processor
├── pkg/
│   ├── graph/          # Graph database client
│   └── models/         # Data models
├── ui/                 # React frontend
├── charts/             # Helm charts
└── docs/               # Documentation
```

## Backend Setup

### 1. Install Dependencies

```bash
# Install Go dependencies
go mod download

# If you need WebSocket support (not yet added to go.mod)
go get github.com/gorilla/websocket
```

### 2. Configure Environment

Create a `.env` file or set environment variables:

```bash
# Graph Database
GRAPHDB_URL=bolt://localhost:7687
GRAPHDB_USER=neo4j
GRAPHDB_PASS=password

# Server
PORT=8080
LOG_LEVEL=info

# Collectors
SPARK_ENABLED=true
SPARK_URL=http://localhost:18080
```

### 3. Start Neo4j (Local Development)

```bash
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

### 4. Run the Server

```bash
go run cmd/server/main.go \
  --port 8080 \
  --graphdb-url bolt://localhost:7687 \
  --graphdb-user neo4j \
  --graphdb-pass password \
  --spark-enabled true \
  --spark-url http://localhost:18080
```

## Frontend Setup

### 1. Install Dependencies

```bash
cd ui
npm install
```

### 2. Configure Environment

Create `ui/.env`:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

### 3. Run Development Server

```bash
cd ui
npm run dev
```

The UI will be available at `http://localhost:5173`

## Building

### Backend

```bash
# Build binary
go build -o bin/dlv cmd/server/main.go

# Build with ldflags for version
go build -ldflags "-X main.version=v1.0.0 -X main.commit=$(git rev-parse HEAD)" \
  -o bin/dlv cmd/server/main.go
```

### Frontend

```bash
cd ui
npm run build
```

The built files will be in `ui/dist/`

## Testing

### Backend Tests

```bash
go test ./...
```

### Frontend Tests

```bash
cd ui
npm test
```

## Docker Development

### Backend + Frontend

```bash
docker-compose -f docker-compose.dev.yml up
```

This will start:
- DLV backend server
- Neo4j database
- Frontend development server

## API Endpoints

### REST API

- `GET /health` - Health check
- `GET /api/v1/lineage/graph` - Get full lineage graph
- `GET /api/v1/lineage/nodes` - Get all nodes
- `GET /api/v1/lineage/nodes/:id` - Get node details
- `GET /api/v1/lineage/edges` - Get all edges
- `GET /api/v1/lineage/search?q=query` - Search lineage

### WebSocket

- `WS /ws/lineage` - Real-time lineage updates

## Architecture Overview

### Components

1. **Collectors** - Extract lineage from data sources (Spark, Airflow, Kafka, Flink)
2. **Processor** - Build and maintain lineage graph relationships
3. **Graph Database** - Store lineage graph (Neo4j/ArangoDB)
4. **API** - REST API and WebSocket for frontend
5. **Frontend** - React-based visualization UI

### Data Flow

```
Data Sources → Collectors → Processor → Graph DB → API → Frontend
```

## Development Workflow

1. Start Neo4j: `docker run -d -p 7687:7687 neo4j`
2. Start backend: `go run cmd/server/main.go`
3. Start frontend: `cd ui && npm run dev`
4. Make changes and test
5. Run tests: `go test ./... && cd ui && npm test`
6. Build and deploy

## Adding a New Collector

1. Create a new file in `internal/collector/` (e.g., `kafka.go`)
2. Implement the `Collector` interface
3. Register in `cmd/server/main.go`
4. Add configuration in Helm charts

## Troubleshooting

### Neo4j Connection Issues

- Check if Neo4j is running: `docker ps | grep neo4j`
- Verify credentials in environment variables
- Check Neo4j logs: `docker logs neo4j`

### WebSocket Connection Failed

- Ensure backend is running on port 8080
- Check CORS settings in development
- Verify WebSocket endpoint: `ws://localhost:8080/ws/lineage`

### Frontend Not Loading

- Check if backend is running
- Verify `VITE_API_URL` in `ui/.env`
- Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

Apache License 2.0
