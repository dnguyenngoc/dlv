# Getting Started with DLV

This guide will help you get started with Data Lineage Visualizer (DLV).

## Prerequisites

Before you begin, ensure you have:

- Kubernetes cluster (v1.24+)
- Helm 3.x installed
- kubectl configured
- Neo4j or ArangoDB instance (for graph storage)

## Quick Start

### 1. Install Neo4j (if not already installed)

```bash
# Using Helm
helm repo add neo4j https://helm.neo4j.com/neo4j
helm install neo4j neo4j/neo4j -n neo4j --create-namespace

# Or use Docker
docker run -d \
  --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
  neo4j:latest
```

### 2. Install DLV

```bash
# Add Helm repository
helm repo add dlv https://dnguyenngoc.github.io/dlv
helm repo update

# Install DLV
helm install dlv dlv/dlv \
  --namespace lineage \
  --create-namespace \
  --set processor.graphdb.neo4j.password=your-password
```

### 3. Configure Collectors

Create a custom values file for your environment:

```bash
cat > my-values.yaml <<EOF
collectors:
  spark:
    enabled: true
    historyServerUrl: "http://spark-history:18080"

  airflow:
    enabled: true
    apiUrl: "http://airflow:8080"
    username: "admin"
    password: "password"

processor:
  graphdb:
    provider: "neo4j"
    neo4j:
      url: "bolt://neo4j:7687"
      username: "neo4j"
      password: "password"
EOF

# Install with custom values
helm install dlv dlv/dlv \
  --namespace lineage \
  --create-namespace \
  -f my-values.yaml
```

### 4. Access the UI

```bash
# Port forward
kubectl port-forward -n lineage svc/dlv-dlv 3000:3000

# Open browser
open http://localhost:3000
```

## Configuration Examples

### Spark Integration

```yaml
collectors:
  spark:
    enabled: true
    historyServerUrl: "http://spark-history-server:18080"
    refreshInterval: 5s
```

### Airflow Integration

```yaml
collectors:
  airflow:
    enabled: true
    apiUrl: "http://airflow-webserver:8080"
    username: "admin"
    password: "your-password"
    refreshInterval: 10s
```

### Kafka Integration

```yaml
collectors:
  kafka:
    enabled: true
    brokers: "kafka-0:9092,kafka-1:9092"
    refreshInterval: 5s
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n lineage
```

### View Logs

```bash
# Backend logs
kubectl logs -f -n lineage deployment/dlv-dlv

# Frontend logs
kubectl logs -f -n lineage deployment/dlv-dlv-frontend
```

### Common Issues

#### 1. Cannot connect to Graph Database

**Problem**: Collector cannot connect to Neo4j/ArangoDB

**Solution**: Check network connectivity and credentials

```bash
# Test Neo4j connection
kubectl exec -it -n lineage deployment/dlv-dlv -- \
  nc -zv neo4j 7687
```

#### 2. Collectors not discovering jobs

**Problem**: No lineage data appearing

**Solution**: Verify collector configuration

```bash
# Check collector configuration
kubectl get configmap -n lineage dlv-dlv -o yaml
```

#### 3. Frontend not loading

**Problem**: Frontend returns 502 or cannot connect

**Solution**: Check service endpoints

```bash
# Verify service
kubectl get svc -n lineage

# Check endpoints
kubectl get endpoints -n lineage dlv-dlv
```

## Next Steps

- Read the [Architecture Guide](architecture.md)
- Explore [Configuration Options](configuration.md)
- Check out [Examples](../examples/)
- Learn about [Contributing](../CONTRIBUTING.md)

## Support

- Open an [Issue](https://github.com/dnguyenngoc/dlv/issues)
- Join [Discussions](https://github.com/dnguyenngoc/dlv/discussions)
