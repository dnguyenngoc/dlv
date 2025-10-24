# 🔍 Data Lineage Visualizer (DLV)

_A modern, real-time data lineage visualization tool for big data pipelines_

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Helm](https://img.shields.io/badge/helm-v3-brightgreen.svg)](https://helm.sh)

## 🎯 What is DLV?

DLV (Data Lineage Visualizer) is a lightweight Kubernetes-native tool that provides **real-time data lineage tracking and visualization** for your big data infrastructure. Unlike traditional lineage tools that show lineage after jobs complete, DLV visualizes data flow **while it's happening**.

### Key Differences from Other Tools

| Feature | DataHub / OpenLineage | **DLV** |
|---------|---------------------|---------|
| Lineage Timing | After job completes | **Real-time during execution** |
| Visualization | Static graph | **Live streaming graph** |
| Streaming Support | Limited | **First-class Kafka support** |
| Performance | Often slow | **Optimized for speed** |
| Deployment | Complex | **Simple Helm chart** |

## ✨ Core Features

### 🔴 Real-Time Lineage Tracking
- **Live updates**: See data flow as it happens
- **Streaming lineage**: Track Kafka topics, Pulsar streams in real-time
- **Job-level tracking**: Know which tables/pipelines are being processed right now
- **Data flow rate**: Visualize MB/s throughput in the graph

### 🎨 Interactive Visualization
- **Multiple layouts**: Force-directed, hierarchical, circular graphs
- **Advanced filtering**: Filter by team, service, time, or data type
- **Time-travel**: View lineage at any point in time
- **Smart clustering**: Automatically group related data sources

### 🔗 Auto-Discovery
- **Zero configuration**: Automatically discovers Spark, Airflow, Kafka, Flink jobs
- **Schema detection**: Extracts table schemas automatically
- **Relationship mapping**: Maps data dependencies without manual input
- **Multi-cluster support**: Track lineage across multiple Kubernetes clusters

### 📊 Impact Analysis
- **What-if scenarios**: "What happens if this table drops?"
- **Downstream impact**: Shows all affected jobs and pipelines
- **Cost impact**: Estimates the cost of failures
- **Alternative paths**: Suggests backup data sources

### 🚨 Anomaly Detection
- **Pattern detection**: Identifies unusual data flow patterns
- **Schema drift alerts**: Notifies when data structure changes unexpectedly
- **Bottleneck identification**: Highlights slow data transformations
- **Dependency changes**: Alerts when new dependencies appear

## 🚀 Quick Start

### Prerequisites

**For Production:**
- Kubernetes cluster (v1.24+)
- Helm 3.x
- PostgreSQL or Neo4j (for storage)

**For Development:**
- Docker and Docker Compose
- OR Go 1.24+ and Node.js 18+

### Installation (Production)

#### Option 1: Install with default values

```bash
# Add the Helm repository
helm repo add dlv https://dnguyenngoc.github.io/dlv
helm repo update

# Install DLV
helm install dlv dlv/dlv \
  --namespace lineage \
  --create-namespace
```

#### Option 2: Install with custom configuration

```bash
# Create a custom values file
cat > my-values.yaml <<EOF
collectors:
  spark:
    enabled: true
    historyServerUrl: "http://spark-history:18080"

  airflow:
    enabled: true
    apiUrl: "http://airflow:8080"

database:
  host: "postgresql"
  user: "postgres"
  password: "your-password"

frontend:
  enabled: true
EOF

# Install with custom values
helm install dlv dlv/dlv \
  --namespace lineage \
  --create-namespace \
  -f my-values.yaml
```

#### Option 3: Using kubectl

```bash
# Clone the repository
git clone https://github.com/dnguyenngoc/dlv.git
cd dlv

# Install using kubectl
helm template charts/dlv | kubectl apply -f -
```

### Access the UI

```bash
# Port forward to access the frontend
kubectl port-forward -n lineage svc/dlv-dlv 3000:3000

# Open browser
open http://localhost:3000
```

### Development Setup

The easiest way to start development is using Docker Compose:

```bash
# Start all services
docker-compose up

# Services will be available at:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8080
# - PostgreSQL: localhost:5432
```

#### Local Development (Without Docker)

**1. Start PostgreSQL:**

```bash
docker run -d \
  --name dlv-postgres \
  -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dlv \
  postgres:15-alpine
```

**2. Install Dependencies:**

```bash
# Backend
go mod download

# Frontend
cd ui && npm install
```

**3. Start Services:**

**Terminal 1 - Backend:**
```bash
go run ./cmd/server/main.go
```

**Terminal 2 - Frontend:**
```bash
cd ui && npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Health Check: http://localhost:8080/health

## 📋 Supported Integrations

### Apache Spark
- Structured Streaming jobs
- Batch jobs
- Spark History Server integration
- Real-time job tracking

### Apache Airflow
- DAG execution tracking
- Task-level lineage
- Cross-DAG dependencies
- Historical runs

### Apache Kafka
- Topic-level lineage
- Producer/consumer tracking
- Real-time message flow
- Consumer group monitoring

### Apache Flink
- Streaming jobs
- Stateful transformations
- Checkpoint tracking
- Backpressure detection

### Custom Integrations
- OpenTelemetry support
- Generic HTTP API integration
- Custom collectors via plugins

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Sources                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │  Spark  │  │ Airflow │  │  Kafka  │  │  Flink  │         │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘         │
└───────┼────────────┼────────────┼────────────┼──────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Collectors                              │
│  Parsing logs, metrics, API responses                       │
│  Extracting lineage information                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                Lineage Processor                            │
│  - Build graph relationships                                │
│  - Real-time updates                                        │
│  - Impact analysis                                          │
│  - Anomaly detection                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                      │
│  Store lineage relationships and metadata                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Frontend                                │
│  React + Cytoscape.js                                       │
│  Interactive visualization                                  │
│  Real-time updates via WebSocket                            │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
dlv/
├── cmd/server/          # Main entry point
├── internal/
│   ├── api/            # HTTP API and WebSocket handlers
│   ├── auth/           # Authentication and authorization
│   ├── collector/      # Data source collectors
│   ├── processor/      # Lineage graph processor
│   ├── repository/     # Database repositories
│   └── middleware/     # HTTP middleware
├── pkg/
│   ├── database/       # Database client and migrations
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
├── docker-compose.yml  # Development environment
└── Makefile            # Build automation
```

## 🔧 Configuration

### Collector Configuration

Configure which data sources to track:

```yaml
collectors:
  spark:
    enabled: true
    historyServerUrl: "http://spark-history:18080"
    refreshInterval: 5s

  airflow:
    enabled: true
    apiUrl: "http://airflow:8080"
    username: "admin"
    password: "password"

  kafka:
    enabled: true
    brokers: "kafka:9092"
    saslEnabled: false
```

### Database Configuration

PostgreSQL database settings:

```yaml
database:
  host: "postgresql"
  port: 5432
  user: "postgres"
  password: "your-password"
  name: "dlv"
  sslMode: "disable"
```

### Authentication Configuration

JWT-based authentication:

```yaml
auth:
  secretKey: "your-secret-key"
  jwtExpiration: 86400  # 24 hours
```

### Frontend Configuration

Customize the visualization:

```yaml
frontend:
  enabled: true

  visualization:
    layout: "force-directed"  # force-directed, hierarchical, circular
    nodeSize: "auto"
    showLabels: true
    animationSpeed: 500

  features:
    realtimeUpdates: true
    streamingMode: true
    whatIfAnalysis: true
    impactAnalysis: true
```

See [docs/configuration.md](docs/configuration.md) for complete configuration options.

## 📖 Use Cases

### 1. Debugging Slow Pipelines
**Problem**: A Spark job is running slowly, but you don't know where the bottleneck is.

**Solution**: Use DLV to see which tables are being processed and identify the large data source causing the slowdown.

### 2. Impact Analysis
**Problem**: You need to drop a table but don't know what will break.

**Solution**: DLV shows all downstream jobs and estimates the impact before you make changes.

### 3. Streaming Data Flow
**Problem**: Need to understand how data flows through Kafka topics in real-time.

**Solution**: DLV visualizes Kafka topic relationships and shows live message flow rates.

### 4. Documentation
**Problem**: Your team doesn't understand the data architecture.

**Solution**: DLV auto-generates an interactive lineage graph that everyone can explore.

## 🎓 Examples

See the [examples/](examples/) directory for complete examples including:

- [Spark lineage tracking](examples/spark-lineage/)
- [Airflow DAG tracking](examples/airflow-lineage/)
- [Multi-cluster setup](examples/multi-cluster/)

## 📊 Metrics & Monitoring

DLV exposes Prometheus metrics:

- `dlv_jobs_tracked`: Number of jobs being tracked
- `dlv_lineage_updates_total`: Total lineage updates
- `dlv_graph_nodes`: Number of nodes in the graph
- `dlv_graph_edges`: Number of edges in the graph
- `dlv_collector_errors`: Collector errors

## 🔍 API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /ready` - Readiness check

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Lineage
- `GET /api/v1/lineage/graph` - Get full lineage graph
- `GET /api/v1/lineage/nodes` - Get all nodes
- `GET /api/v1/lineage/nodes/:id` - Get node details
- `GET /api/v1/lineage/edges` - Get all edges
- `GET /api/v1/lineage/search?q=query` - Search lineage
- `WS /ws/lineage` - WebSocket for real-time updates

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dnguyenngoc/dlv.git
cd dlv

# Start development environment
docker-compose up

# Or install dependencies
make deps

# Run tests
make test

# Build Helm chart
make helm-build
```

### Useful Commands

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild services
docker-compose up --build

# Clean everything (removes volumes)
docker-compose down -v
```

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :8080  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Stop conflicting service or change port in docker-compose.yml
```

### Database Connection Failed

```bash
# Check PostgreSQL status
docker ps | grep postgres

# View PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Frontend Not Loading

1. Check backend is running: `curl http://localhost:8080/health`
2. Check `VITE_API_URL` in browser console
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)

### Docker Build Fails

```bash
# Clean build
docker-compose down -v
docker-compose up --build

# Or rebuild specific service
docker-compose build --no-cache backend
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [DataHub](https://datahubproject.io/) and [OpenLineage](https://openlineage.io/)
- Built with [PostgreSQL](https://www.postgresql.org/) and [Neo4j](https://neo4j.com/)
- Visualization powered by [React](https://react.dev/) and [Cytoscape.js](https://js.cytoscape.org/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dnguyenngoc/dlv/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dnguyenngoc/dlv/discussions)
- **Documentation**: [docs/](docs/)

---

**Made with ❤️ for data engineers**
