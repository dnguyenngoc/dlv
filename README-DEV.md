# DLV Development Guide

This guide provides instructions for setting up and developing the DLV (Data Lineage Visualizer) project.

## Prerequisites

- Docker and Docker Compose
- OR Go 1.24+ and Node.js 18+ for local development

## Quick Start with Docker Compose

The easiest way to start development is using Docker Compose:

```bash
# Start all services
make dev

# Or directly with docker-compose
docker-compose -f docker-compose.dev.yml up
```

This will start:
- **Neo4j** on ports 7474 (HTTP) and 7687 (Bolt)
- **Backend API** on port 8080
- **Frontend** on port 5173

### Access Services

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Neo4j Browser: http://localhost:7474
- Health Check: http://localhost:8080/health

### Useful Commands

```bash
# View logs
make logs

# View specific service logs
make logs-backend
make logs-frontend
make logs-neo4j

# Stop services
make down

# Restart services
make restart

# Clean everything (removes volumes)
make clean

# Rebuild services
make build
```

## Local Development (Without Docker)

### 1. Start Neo4j

```bash
make dev-local-neo4j

# Or manually
docker run -d \
  --name dlv-neo4j-local \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/dlv-dev-password \
  neo4j:5-community
```

### 2. Install Dependencies

```bash
# Backend
make install-deps

# Frontend
make install-deps-ui
```

### 3. Start Services

**Terminal 1 - Backend:**
```bash
make dev-local-backend
```

**Terminal 2 - Frontend:**
```bash
make dev-local-frontend
```

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
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── api/        # API client
│   │   └── types/      # TypeScript types
│   └── package.json
├── charts/             # Helm charts
├── docs/               # Documentation
├── docker-compose.dev.yml
└── Makefile
```

## Backend Development

### Configuration

Environment variables or command-line flags:

```bash
--port 8080                              # Server port
--graphdb-url bolt://neo4j:7687         # Graph DB URL
--graphdb-user neo4j                    # Graph DB username
--graphdb-pass password                  # Graph DB password
--spark-enabled true                     # Enable Spark collector
--spark-url http://localhost:18080      # Spark History Server URL
--log-level debug                        # Log level (debug, info, warn, error)
```

### API Endpoints

- `GET /health` - Health check
- `GET /api/v1/lineage/graph` - Get full lineage graph
- `GET /api/v1/lineage/nodes` - Get all nodes
- `GET /api/v1/lineage/nodes/:id` - Get node details
- `GET /api/v1/lineage/edges` - Get all edges
- `GET /api/v1/lineage/search?q=query` - Search lineage
- `WS /ws/lineage` - WebSocket for real-time updates

### Running Tests

```bash
make test
```

## Frontend Development

### Configuration

Create `ui/.env`:

```bash
VITE_API_URL=http://localhost:8080/api/v1
```

### Development Server

```bash
cd ui
npm run dev
```

Frontend will be available at http://localhost:5173

### Build for Production

```bash
cd ui
npm run build
```

Output will be in `ui/dist/`

## Docker Services Details

### Neo4j

- **Image**: neo4j:5-community
- **Ports**: 7474 (HTTP), 7687 (Bolt)
- **Credentials**: neo4j / dlv-dev-password
- **Data Volume**: neo4j-data
- **Logs Volume**: neo4j-logs

### Backend

- **Dockerfile**: Dockerfile.dev
- **Port**: 8080
- **Hot Reload**: Yes (volume mounted)
- **Dependencies**: Neo4j

### Frontend

- **Dockerfile**: ui/Dockerfile.dev
- **Port**: 5173
- **Hot Reload**: Yes (volume mounted)
- **Framework**: Vite + React

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8080  # Backend
lsof -i :5173  # Frontend
lsof -i :7687  # Neo4j

# Stop conflicting service or change port in docker-compose.dev.yml
```

### Neo4j Connection Failed

```bash
# Check Neo4j status
docker ps | grep neo4j

# View Neo4j logs
make logs-neo4j

# Restart Neo4j
docker restart dlv-neo4j
```

### Frontend Not Loading

1. Check backend is running: `curl http://localhost:8080/health`
2. Check `VITE_API_URL` in `ui/.env`
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)

### Docker Build Fails

```bash
# Clean build
make clean
make build

# Or rebuild specific service
docker-compose -f docker-compose.dev.yml build --no-cache backend
```

### Permission Issues

```bash
# Fix file permissions (Linux/Mac)
sudo chown -R $USER:$USER .
```

## Architecture

### Components

1. **Collectors** - Extract lineage from data sources (Spark, Airflow, Kafka, Flink)
2. **Processor** - Build and maintain lineage graph relationships
3. **Graph Database** - Store lineage graph (Neo4j)
4. **API** - REST API and WebSocket for frontend
5. **Frontend** - React-based visualization UI

### Data Flow

```
Data Sources → Collectors → Processor → Graph DB → API → Frontend
```

## Adding a New Collector

1. Create a new file in `internal/collector/` (e.g., `kafka.go`)
2. Implement the `Collector` interface
3. Register in `cmd/server/main.go`
4. Add configuration in Helm charts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `make dev`
5. Add tests
6. Submit a pull request

## License

Apache License 2.0
