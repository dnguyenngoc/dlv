# Configuration Guide

## Overview

DLV is configured via Helm values file or command-line arguments. This guide covers all available configuration options.

## Collectors

### Spark Collector

```yaml
collectors:
  spark:
    enabled: true                    # Enable Spark collector
    historyServerUrl: "http://spark-history-server:18080"
    refreshInterval: 5s              # How often to poll for updates
    timeout: 30s                     # API request timeout
    parseExecutors: 2                # Number of concurrent parsers
```

**Key Features:**
- Auto-discovers all Spark applications
- Extracts lineage from Spark plans
- Tracks job performance metrics

### Airflow Collector

```yaml
collectors:
  airflow:
    enabled: true
    apiUrl: "http://airflow-webserver:8080"
    username: "admin"
    password: ""                     # Can be set via environment variable
    refreshInterval: 10s
    trackHistoricalRuns: true       # Track completed DAG runs
    maxHistoricalDays: 7            # How many days of history to keep
```

**Authentication:**
```yaml
# Using RBAC token
collectors:
  airflow:
    authType: "token"
    token: "your-token-here"

# Using basic auth
collectors:
  airflow:
    authType: "basic"
    username: "admin"
    password: "password"
```

### Kafka Collector

```yaml
collectors:
  kafka:
    enabled: true
    brokers: "kafka-0:9092,kafka-1:9092"
    refreshInterval: 5s
    
    # Security (optional)
    saslEnabled: false
    saslMechanism: "PLAIN"
    saslUsername: ""
    saslPassword: ""
    
    # TLS (optional)
    tlsEnabled: false
    tlsInsecure: false
    tlsCaCert: ""
```

**Security Configuration:**
```yaml
collectors:
  kafka:
    saslEnabled: true
    saslMechanism: "SCRAM-SHA-256"
    saslUsername: "dlv-user"
    saslPassword: "secret-password"
    
    tlsEnabled: true
    tlsCaCert: "/etc/kafka/ca-cert.pem"
```

### Flink Collector

```yaml
collectors:
  flink:
    enabled: true
    restPort: 8081
    restHost: "flink-jobmanager"
    refreshInterval: 5s
    trackCheckpoints: true          # Track checkpoint information
```

## Lineage Processor

### Graph Database

#### Neo4j Configuration

```yaml
processor:
  graphdb:
    provider: "neo4j"
    
    neo4j:
      url: "bolt://neo4j-server:7687"
      username: "neo4j"
      password: "change-me"
      database: "lineage"
      
      # Connection pool settings
      maxConnections: 50
      connectionTimeout: 30s
      
      # Index settings
      autoIndex: true
      nodeIndexProperties: ["name", "type"]
```

#### ArangoDB Configuration

```yaml
processor:
  graphdb:
    provider: "arangodb"
    
    arangodb:
      url: "http://arangodb-server:8529"
      username: "root"
      password: "change-me"
      database: "lineage"
      
      # Connection settings
      maxConnections: 50
      timeout: 30s
```

### Processing Configuration

```yaml
processor:
  # Auto-discovery
  autoDiscover:
    enabled: true
    sources:
      - spark
      - airflow
      - kafka
      - flink
  
  # Lineage depth
  maxDepth: 10                      # Maximum lineage depth to traverse
  
  # Update settings
  updateInterval: 5s                # How often to update lineage
  
  # Batch settings
  batchSize: 100                    # Batch size for database writes
  
  # Anomaly detection
  anomalyDetection:
    enabled: true
    sensitivity: "medium"           # low, medium, high
    checkInterval: 60s
  
  # Impact analysis
  impactAnalysis:
    enabled: true
    maxImpactDepth: 5               # Maximum depth for impact calculation
```

## Frontend

### Basic Configuration

```yaml
frontend:
  enabled: true
  
  image:
    repository: "dlv/dlv-ui"
    tag: "latest"
    pullPolicy: "IfNotPresent"
  
  # Resource limits
  resources:
    limits:
      cpu: 500m
      memory: 512Mi
    requests:
      cpu: 100m
      memory: 128Mi
```

### Visualization Settings

```yaml
frontend:
  visualization:
    # Layout algorithm
    layout: "force-directed"        # force-directed, hierarchical, circular
    
    # Node appearance
    nodeSize: "auto"                # auto, fixed
    fixedNodeSize: 30
    
    # Labels
    showLabels: true
    labelFontSize: 12
    
    # Animation
    animationSpeed: 500             # milliseconds
    smoothTransitions: true
    
    # Colors
    colorScheme: "default"          # default, dark, colorful
    useGradients: true
```

### Feature Flags

```yaml
frontend:
  features:
    realtimeUpdates: true           # Enable WebSocket updates
    streamingMode: true              # Show streaming data flow
    whatIfAnalysis: true             # Enable what-if scenarios
    impactAnalysis: true             # Show impact analysis
    timelineView: true               # Time-travel debugging
    exportGraph: true                # Export graph as image/JSON
    searchEnabled: true              # Enable search functionality
```

## Kubernetes Configuration

### Deployment

```yaml
replicaCount: 1

image:
  repository: "dlv/dlv"
  pullPolicy: "IfNotPresent"
  tag: "latest"

nameOverride: ""
fullnameOverride: ""
```

### Resources

```yaml
resources:
  limits:
    cpu: 1000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi
```

### Persistence

```yaml
persistence:
  enabled: true
  storageClass: ""                  # Use default storage class
  accessMode: ReadWriteOnce
  size: 10Gi
```

### Service

```yaml
service:
  type: ClusterIP                   # ClusterIP, NodePort, LoadBalancer
  port: 8080
  frontendPort: 3000
```

### Ingress

```yaml
ingress:
  enabled: true
  className: "nginx"
  
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
  
  hosts:
    - host: lineage.example.com
      paths:
        - path: /
          pathType: Prefix
  
  tls:
    - secretName: lineage-tls
      hosts:
        - lineage.example.com
```

## Security

### Security Context

```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
```

### Pod Security

```yaml
podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 1000
  seccompProfile:
    type: RuntimeDefault
```

### Network Policies

```yaml
networkPolicy:
  enabled: true
  
  ingress:
    - from:
      - namespaceSelector:
          matchLabels:
            name: airflow
      ports:
      - protocol: TCP
        port: 8080
```

## Monitoring

### Service Monitor (Prometheus)

```yaml
monitoring:
  enabled: true
  
  serviceMonitor:
    enabled: true
    interval: 30s
    scrapeTimeout: 10s
    path: /metrics
    
    # Additional labels
    labels:
      release: prometheus
```

### Logging

```yaml
logging:
  level: info                       # debug, info, warn, error
  format: json                      # json, text
  
  # Structured fields
  fields:
    service: "dlv"
    version: "1.0.0"
```

## Environment Variables

```yaml
env:
  - name: DEBUG
    value: "false"
  
  - name: LOG_LEVEL
    value: "info"
  
  - name: CUSTOM_CONFIG
    value: "custom-value"
```

## Example: Production Configuration

```yaml
# Production-ready configuration
replicaCount: 3

collectors:
  spark:
    enabled: true
    historyServerUrl: "http://spark-history:18080"
  
  airflow:
    enabled: true
    apiUrl: "http://airflow:8080"
    authType: "token"
    token: "production-token"
  
  kafka:
    enabled: true
    brokers: "kafka:9092"
    saslEnabled: true
    saslMechanism: "SCRAM-SHA-256"

processor:
  graphdb:
    provider: "neo4j"
    neo4j:
      url: "bolt://neo4j:7687"
      username: "neo4j"
      password: "secure-password"

frontend:
  enabled: true
  visualization:
    layout: "force-directed"

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: lineage.production.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 2000m
    memory: 4Gi
  requests:
    cpu: 1000m
    memory: 2Gi

persistence:
  enabled: true
  size: 50Gi
  storageClass: "fast-ssd"

monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
```

## Advanced Configuration

### Custom Collectors

```yaml
collectors:
  custom:
    enabled: true
    image: "my-custom-collector:v1.0"
    config:
      customProperty: "value"
```

### Multiple Graph Databases

```yaml
processor:
  graphdb:
    provider: "multi"
    databases:
      - name: "neo4j"
        provider: "neo4j"
        url: "bolt://neo4j:7687"
      - name: "arangodb"
        provider: "arangodb"
        url: "http://arangodb:8529"
```

For more examples, see the [examples/](examples/) directory.

