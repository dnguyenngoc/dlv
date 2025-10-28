# 🔍 Data Lineage Visualizer (DLV)

_A modern, real-time data lineage visualization tool for big data pipelines_

## 🎯 What is DLV?

DLV (Data Lineage Visualizer) provides **real-time data lineage tracking and visualization** for your big data infrastructure. Unlike traditional tools that show lineage after jobs complete, DLV visualizes data flow **while it's happening**.

## ✨ Key Features

- **🔴 Real-Time Tracking**: See data flow as it happens
- **🎨 Interactive Dashboard**: React Flow visualization with custom nodes
- **📊 Live Metrics**: Charts and analytics for throughput, health, distribution
- **🔗 Auto-Discovery**: Automatically discovers Spark, Airflow, Kafka, Flink jobs
- **🚨 Anomaly Detection**: Identifies unusual patterns and bottlenecks

## 🚀 Quick Start

### Development Setup (Recommended)

```bash
# 1. Start backend + database
./dev-start.sh

# 2. In a new terminal, start frontend
cd ui
npm run dev
```

**Access URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

### Production Setup

```bash
# Build and start all services
docker-compose up --build

# Access production app
open http://localhost:80
```

## 🎨 Dashboard Features

### Interactive Visualization
- **Custom Nodes**: Spark, Kafka, Airflow, Database nodes with real-time status
- **Animated Edges**: Data flow visualization with throughput metrics
- **Filtering**: Search, node types, status, time ranges
- **Charts**: Throughput trends, node distribution, system health

### Node Types
- **SparkNode**: Job tracking, throughput, executors
- **KafkaNode**: Topic monitoring, partitions, message flow
- **AirflowNode**: DAG execution, scheduling
- **DatabaseNode**: Table monitoring, size tracking

## 🛠️ Development

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Go 1.24+ (for backend development)

### Commands

```bash
# Frontend development
cd ui
npm run dev              # Start dev server
npm run build            # Build for production

# Backend + Database
docker-compose -f docker-compose.dev.yml up -d    # Start services
docker-compose -f docker-compose.dev.yml down     # Stop services
docker-compose -f docker-compose.dev.yml logs     # View logs
```

## 📁 Project Structure

```
dlv/
├── ui/                          # React frontend
│   ├── src/
│   │   ├── pages/Dashboard.tsx   # Main dashboard with React Flow
│   │   ├── components/
│   │   │   ├── nodes/           # Custom React Flow nodes
│   │   │   ├── edges/           # Custom React Flow edges
│   │   │   ├── MetricsPanel.tsx # Charts and metrics
│   │   │   └── FilterPanel.tsx  # Filter controls
│   │   └── ...
│   └── Dockerfile               # Production build only
├── docker-compose.dev.yml       # Development setup
├── docker-compose.yml           # Production setup
└── dev-start.sh                 # Development script
```

## 🔧 Configuration

### Environment Variables
- `VITE_API_URL`: Backend API URL (default: http://localhost:8080/api/v1)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: Database config
- `SECRET_KEY`: JWT secret key
- `LOG_LEVEL`: Logging level (debug/info)

### API Endpoints
- `GET /health` - Health check
- `GET /api/v1/lineage/graph` - Get lineage graph
- `GET /api/v1/lineage/nodes` - Get all nodes
- `GET /api/v1/lineage/edges` - Get all edges
- `WS /ws/lineage` - WebSocket for real-time updates

## 🚨 Troubleshooting

### Frontend Issues
```bash
cd ui
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Issues
```bash
docker-compose -f docker-compose.dev.yml restart backend
docker-compose -f docker-compose.dev.yml logs backend
```

### Database Issues
```bash
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

## 📋 Supported Integrations

- **Apache Spark**: Structured Streaming, batch jobs, history server
- **Apache Airflow**: DAG execution, task-level lineage
- **Apache Kafka**: Topic-level lineage, producer/consumer tracking
- **Apache Flink**: Streaming jobs, stateful transformations
- **Custom**: OpenTelemetry, HTTP API, plugin support

## 🏗️ Architecture

```
Data Sources (Spark, Kafka, Airflow, Flink)
           ↓
    Collectors (Parse logs, metrics, APIs)
           ↓
   Lineage Processor (Build relationships, real-time updates)
           ↓
    Database (PostgreSQL)
           ↓
    Frontend (React + React Flow)
```

## 📄 License

Apache License 2.0 - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for data engineers**
