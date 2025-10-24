# Helm Chart Guide

This guide covers the structure and usage of the DLV Helm chart.

## Chart Structure

```
charts/realtime-lineage/
├── Chart.yaml              # Chart metadata
├── values.yaml             # Default configuration values
└── templates/              # Kubernetes manifests
    ├── _helpers.tpl        # Template helpers
    ├── deployment.yaml     # Application deployment
    ├── service.yaml        # Service definition
    ├── ingress.yaml        # Ingress configuration
    ├── pvc.yaml            # Persistent volume claim
    ├── serviceaccount.yaml # Service account
    └── hpa.yaml            # Horizontal Pod Autoscaler
```

## Templates

### Deployment
- Main application deployment
- Supports autoscaling (HPA)
- Configurable security context
- Multi-container support (backend + frontend)

### Service
- ClusterIP service for backend
- Optional frontend port exposure
- Configurable service type

### Ingress
- Optional ingress configuration
- Supports TLS
- Multiple host configurations

### PVC
- Optional persistent storage
- Configurable storage class
- Volume mounting for stateful data

### ServiceAccount
- Kubernetes service account
- Configurable annotations
- Supports RBAC

### HPA
- Horizontal Pod Autoscaler
- CPU and memory-based scaling
- Configurable min/max replicas

## Values Configuration

### Autoscaling

```yaml
autoscaling:
  enabled: false              # Enable/disable HPA
  minReplicas: 1              # Minimum pods
  maxReplicas: 3              # Maximum pods
  targetCPUUtilizationPercentage: 80
  targetMemoryUtilizationPercentage: 80
```

### Collectors

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
  
  flink:
    enabled: true
    restPort: 8081
    restHost: "flink-jobmanager"
```

### Graph Database

Choose Neo4j or ArangoDB:

```yaml
processor:
  graphdb:
    provider: "neo4j"  # or "arangodb"
    
    neo4j:
      url: "bolt://neo4j:7687"
      username: "neo4j"
      password: "password"
    
    arangodb:
      url: "http://arangodb:8529"
      username: "root"
      password: "password"
```

### Security

Pod and container security contexts:

```yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000

securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

## Installation

### Basic Installation

```bash
helm install dlv dlv/realtime-lineage \
  --namespace lineage \
  --create-namespace
```

### With Custom Values

```bash
helm install dlv dlv/realtime-lineage \
  --namespace lineage \
  --create-namespace \
  -f my-values.yaml
```

### With Inline Values

```bash
helm install dlv dlv/realtime-lineage \
  --namespace lineage \
  --create-namespace \
  --set collectors.spark.enabled=true \
  --set processor.graphdb.neo4j.password=secret
```

## Upgrading

```bash
helm upgrade dlv dlv/realtime-lineage \
  --namespace lineage \
  -f updated-values.yaml
```

## Uninstalling

```bash
helm uninstall dlv --namespace lineage
```

## Troubleshooting

### Chart Linting

```bash
helm lint charts/realtime-lineage
```

### Dry Run

```bash
helm install dlv charts/realtime-lineage \
  --namespace lineage \
  --dry-run \
  --debug
```

### Template Rendering

```bash
helm template dlv charts/realtime-lineage
```

### Show Values

```bash
helm show values dlv/realtime-lineage
```

## Best Practices

1. **Use values files**: Store configuration in version-controlled values files
2. **Test with dry-run**: Always test changes with `--dry-run`
3. **Use secrets**: Never commit passwords or secrets to values files
4. **Enable autoscaling**: For production deployments, enable HPA
5. **Resource limits**: Always set resource requests and limits
6. **Security**: Enable pod security contexts for production

## Examples

See the [examples/](../examples/) directory for complete example configurations.

