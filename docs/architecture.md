# Architecture

## Overview

DLV (Data Lineage Visualizer) is a Kubernetes-native application that provides real-time data lineage tracking and visualization. It consists of several key components working together to provide comprehensive lineage insights.

## Components

### 1. Collectors

Collectors are lightweight agents that extract lineage information from various data sources.

#### Spark Collector
- Connects to Spark History Server REST API
- Parses Spark application logs and metrics
- Extracts table reads/writes from Spark plans
- Tracks job execution time and resource usage

#### Airflow Collector
- Polls Airflow REST API for DAG runs
- Extracts task dependencies from DAG structure
- Tracks data source connections (connections defined in Airflow)
- Monitors task execution and data lineage through XComs

#### Kafka Collector
- Connects to Kafka brokers via Kafka Admin API
- Tracks topic creation, deletion, and metadata
- Monitors producer/consumer relationships
- Collects message throughput metrics

#### Flink Collector
- Connects to Flink JobManager REST API
- Extracts checkpoint information
- Tracks streaming operators and their connections
- Monitors data flow through Flink jobs

### 2. Lineage Processor

The lineage processor aggregates data from collectors and builds a unified lineage graph.

#### Responsibilities
- Normalize data from different sources
- Build graph relationships (nodes and edges)
- Update graph in real-time
- Perform impact analysis
- Detect anomalies

#### Graph Structure
```
Node Types:
- Table (database table, file, etc.)
- Transformation (Spark job, Airflow task, etc.)
- Topic (Kafka topic)
- View (SQL view)

Edge Types:
- Reads (transformation reads from source)
- Writes (transformation writes to target)
- Transforms (transformation transforms data)
- DependsOn (transformation depends on upstream)
```

### 3. Graph Database

Storage backend for lineage information.

#### Neo4j
- **Pros**: Excellent graph query performance, Cypher query language
- **Cons**: Requires separate deployment
- **Use case**: Production deployments with complex queries

#### ArangoDB
- **Pros**: Multi-model database, built-in support for graphs
- **Cons**: Less optimized for pure graph queries
- **Use case**: Flexible deployments needing document storage

### 4. Frontend

React-based web application for lineage visualization.

#### Key Features
- Real-time updates via WebSocket
- Interactive graph visualization
- Advanced filtering and search
- Timeline view
- Impact analysis tools

#### Technology Stack
- React 18+
- D3.js or Cytoscape.js for graph rendering
- TypeScript for type safety
- WebSocket for real-time updates

## Data Flow

```
┌──────────────┐
│   Spark Job  │
└──────┬───────┘
       │ Executes
       ▼
┌─────────────────────────────────┐
│      Spark Collector            │
│  - Polls History Server         │
│  - Extracts lineage from logs   │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│    Lineage Processor            │
│  - Builds graph relationships   │
│  - Updates graph DB             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│      Graph Database             │
│  - Stores lineage graph         │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│      Frontend                   │
│  - Queries graph DB             │
│  - Visualizes lineage           │
└─────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       Kubernetes Cluster                    │
│                                                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │  DLV Backend   │  │  DLV Frontend  │  │  Graph DB    │   │
│  │   (Deploy)     │  │   (Deploy)     │  │   (Stateful) │   │
│  └────────┬───────┘  └────────┬───────┘  └──────┬───────┘   │
│           │                   │                  │          │
│           └───────────────────┼──────────────────┘          │
│                               │                             │
│  ┌────────────────────────────┴──────────────────────────┐  │
│  │                  Data Sources                         │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐       │  │
│  │  │ Spark  │  │Airflow │  │ Kafka  │  │ Flink  │       │  │
│  │  └────────┘  └────────┘  └────────┘  └────────┘       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Security Considerations

### Network Security
- Collectors communicate with data sources over TLS
- Graph database connections encrypted
- Frontend uses HTTPS

### Authentication
- Airflow collector uses API key authentication
- Kafka collector supports SASL/SCRAM
- Graph database uses username/password

### Authorization
- Kubernetes RBAC for pod access
- Service accounts with minimal permissions
- Network policies to restrict communication

## Scalability

### Horizontal Scaling
- Backend pods can be scaled horizontally
- Multiple collectors can run in parallel
- Graph database can be clustered

### Performance Optimization
- Caching of frequently accessed lineage data
- Batch updates to graph database
- Lazy loading of large graphs
- Efficient graph traversal algorithms

## Monitoring

### Metrics
- Collector health status
- Lineage update frequency
- Graph database query performance
- Frontend load times

### Logging
- Structured JSON logging
- Log levels: debug, info, warn, error
- Correlation IDs for tracing

## Future Enhancements

1. **Distributed Tracing Integration**: OpenTelemetry support
2. **ML-Powered Anomaly Detection**: Advanced pattern recognition
3. **Cost Tracking**: Integration with cost management tools
4. **Schema Evolution Tracking**: Monitor schema changes over time
5. **Automated Documentation**: Generate documentation from lineage
