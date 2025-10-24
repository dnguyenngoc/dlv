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

- Kubernetes cluster (v1.24+)
- Helm 3.x
- Neo4j or ArangoDB (for graph storage)

### Installation

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

  kafka:
    enabled: true
    brokers: "kafka:9092"

processor:
  graphdb:
    provider: "neo4j"
    neo4j:
      url: "bolt://neo4j:7687"
      username: "neo4j"
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
│                  Graph Database                             │
│  Neo4j / ArangoDB                                           │
│  Store lineage relationships                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     Frontend                                │
│  React + D3.js / Cytoscape.js                               │
│  Interactive visualization                                  │
│  Real-time updates via WebSocket                            │
└─────────────────────────────────────────────────────────────┘
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

### Graph Database Configuration

Choose your graph database backend:

```yaml
processor:
  graphdb:
    provider: "neo4j"  # or "arangodb"

    neo4j:
      url: "bolt://neo4j:7687"
      username: "neo4j"
      password: "password"
      database: "lineage"

    arangodb:
      url: "http://arangodb:8529"
      username: "root"
      password: "password"
      database: "lineage"
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

- [Spark streaming pipeline](examples/spark-streaming/)
- [Airflow DAG tracking](examples/airflow-dags/)
- [Kafka-based ETL](examples/kafka-etl/)
- [Multi-cluster setup](examples/multi-cluster/)

## 📊 Metrics & Monitoring

DLV exposes Prometheus metrics:

- `dlv_jobs_tracked`: Number of jobs being tracked
- `dlv_lineage_updates_total`: Total lineage updates
- `dlv_graph_nodes`: Number of nodes in the graph
- `dlv_graph_edges`: Number of edges in the graph
- `dlv_collector_errors`: Collector errors

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/dnguyenngoc/dlv.git
cd dlv

# Install dependencies
make deps

# Run tests
make test

# Build Helm chart
make helm-build
```

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [DataHub](https://datahubproject.io/) and [OpenLineage](https://openlineage.io/)
- Built with [Neo4j](https://neo4j.com/) and [ArangoDB](https://www.arangodb.com/)
- Visualization powered by [D3.js](https://d3js.org/) and [Cytoscape.js](https://js.cytoscape.org/)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/dnguyenngoc/dlv/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dnguyenngoc/dlv/discussions)
- **Documentation**: [docs/](docs/)

---

**Made with ❤️ for data engineers**
