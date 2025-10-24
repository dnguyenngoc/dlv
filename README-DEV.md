# DLV Development Guide

## Quick Start

### Prerequisites

- **Go 1.21+**: [Install Go](https://go.dev/doc/install)
- **Node.js 18+**: [Install Node.js](https://nodejs.org/)
- **Docker & Docker Compose**: [Install Docker](https://docs.docker.com/get-docker/)
- **Neo4j**: Will run in Docker
- **Make**: Usually pre-installed on macOS/Linux

### Option 1: Local Development (Recommended)

#### 1. Start Neo4j

```bash
# Using Docker Compose
docker-compose -f docker-compose.dev.yml up neo4j -d

# Or use local Neo4j
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/dlv-dev-password \
  neo4j:5-community
```

#### 2. Start Backend

```bash
# Install Go dependencies
make deps

# Run backend
make run

# Or directly
go run ./cmd/server \
  --graphdb-url=bolt://localhost:7687 \
  --graphdb-user=neo4j \
  --graphdb-pass=dlv-dev-password \
  --spark-enabled=false \
  --log-level=debug
```

#### 3. Start Frontend

```bash
# Install dependencies
cd ui
npm install

# Start dev server
npm run dev
```

### Option 2: Docker Development

```bash
# Start all services
docker-compose -f docker-compose.dev.yml up

# Backend: http://localhost:8080
# Frontend: http://localhost:3000
# Neo4j Browser: http://localhost:7474
```

## Development Workflow

### Backend Development

```bash
# Build binary
make build

# Run tests
make test

# Format code
make fmt

# Run linter
make lint

# Run server
make run
```

### Frontend Development

```bash
cd ui

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Build Docker Images

```bash
# Build backend image
make docker-build

# Build frontend image (standalone)
cd ui && docker build -t dlv-ui:latest .

# Build both (production)
docker-compose build
```

## Testing

### Backend Tests

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run specific test
go test ./internal/collector
```

### Frontend Tests

```bash
cd ui

# Run tests (when implemented)
npm test

# Run with coverage
npm test -- --coverage
```

## Database Setup

### Neo4j Browser

1. Open http://localhost:7474
2. Login with:
   - Username: `neo4j`
   - Password: `dlv-dev`

### Create Test Data

```cypher
// Create sample lineage
CREATE (src:Table {name: "users", source: "postgres"})
CREATE (tgt:Table {name: "users_enriched", source: "postgres"})
CREATE (job:Job {name: "enrich_users", type: "spark"})
CREATE (src)-[:READS]->(job)
CREATE (job)-[:WRITES]->(tgt)
```

## API Testing

### Using curl

```bash
# Health check
curl http://localhost:8080/health

# Get lineage graph
curl http://localhost:8080/api/v1/lineage/graph

# Search lineage
curl "http://localhost:8080/api/v1/lineage/search?q=users"
```

### Using HTTPie

```bash
# Install httpie
brew install httpie  # macOS
# or
pip install httpie

# Make requests
http GET http://localhost:8080/health
http GET http://localhost:8080/api/v1/lineage/nodes
```

## Debugging

### Backend Debugging

```bash
# Run with debug logging
go run ./cmd/server --log-level=debug

# Use Delve debugger
dlv debug ./cmd/server
```

### Frontend Debugging

- Open Chrome DevTools (F12)
- Use React DevTools extension
- Check Network tab for API calls
- Use Console for errors

### Database Debugging

```bash
# Connect to Neo4j shell
docker exec -it dlv-neo4j cypher-shell -u neo4j -p dlv-dev-password

# Run queries
MATCH (n) RETURN n LIMIT 10;
```

## Environment Variables

Create `.env` file:

```env
# Graph Database
GRAPHDB_URL=bolt://localhost:7687
GRAPHDB_USER=neo4j
GRAPHDB_PASS=dlv-dev-password

# Spark Collector
SPARK_ENABLED=false
SPARK_URL=http://localhost:18080

# Airflow Collector
AIRFLOW_ENABLED=false
AIRFLOW_URL=http://localhost:8080

# Server
PORT=8080
LOG_LEVEL=debug
```

## Project Structure

```
dlv/
├── cmd/server/          # Application entry point
├── internal/            # Private application code
│   ├── api/            # HTTP handlers
│   ├── collector/      # Data collectors
│   └── processor/     # Lineage processor
├── pkg/                # Public packages
│   ├── graph/         # Graph DB client
│   └── models/       # Data models
├── ui/                 # Frontend
│   ├── src/           # Source code
│   ├── public/        # Static files
│   └── dist/          # Build output
├── charts/dlv/         # Helm chart
└── docs/              # Documentation
```

## Useful Commands

```bash
# Quick restart everything
make clean && make build && make run

# Format all code
make fmt && cd ui && npm run format

# Run complete build
make docker-build

# Check for issues
make lint && cd ui && npm run lint

# Clean up
make clean
docker-compose -f docker-compose.dev.yml down -v
```

## Next Steps

1. ✅ Setup complete - Start implementing features
2. Start with Neo4j client implementation
3. Implement Spark collector
4. Build REST API endpoints
5. Create frontend components

## Getting Help

- Check [README.md](README.md) for overview
- See [docs/](docs/) for detailed documentation
- Open an issue on GitHub
- Read the code (it's documented!)

