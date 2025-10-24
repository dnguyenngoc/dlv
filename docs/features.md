# DLV Features Roadmap

## Core Features

### 1. **Data Collectors** 📊
Collect lineage data from various sources:

#### 1.1 Spark Collector
- [ ] Connect to Spark History Server REST API
- [ ] Parse Spark application logs
- [ ] Extract table reads/writes from Spark plans
- [ ] Track job execution time and resource usage
- [ ] Handle Structured Streaming jobs
- [ ] Support batch jobs

#### 1.2 Airflow Collector
- [ ] Poll Airflow REST API for DAG runs
- [ ] Extract task dependencies from DAG structure
- [ ] Track data source connections
- [ ] Monitor task execution through XComs
- [ ] Support historical runs

#### 1.3 Kafka Collector
- [ ] Connect to Kafka brokers via Admin API
- [ ] Track topic creation, deletion, and metadata
- [ ] Monitor producer/consumer relationships
- [ ] Collect message throughput metrics
- [ ] Track consumer groups

#### 1.4 Flink Collector
- [ ] Connect to Flink JobManager REST API
- [ ] Extract checkpoint information
- [ ] Track streaming operators and connections
- [ ] Monitor data flow through Flink jobs

### 2. **Lineage Processor** 🔄
Process and store lineage data:

- [ ] Build graph relationships (nodes and edges)
- [ ] Update graph in real-time
- [ ] Batch processing for performance
- [ ] Normalize data from different sources
- [ ] Handle schema evolution
- [ ] Track lineage history

### 3. **Graph Database** 🗄️
Store and query lineage:

- [ ] Neo4j client implementation
- [ ] Node creation and management
- [ ] Edge creation and management
- [ ] Cypher query support
- [ ] Index management
- [ ] Connection pooling

### 4. **REST API** 🌐
Expose lineage data via HTTP:

#### Endpoints:
- [ ] `GET /api/v1/lineage/graph` - Get full lineage graph
- [ ] `GET /api/v1/lineage/nodes` - List all nodes
- [ ] `GET /api/v1/lineage/edges` - List all edges
- [ ] `GET /api/v1/lineage/search` - Search lineage
- [ ] `GET /api/v1/lineage/node/:id` - Get node details
- [ ] `GET /api/v1/lineage/impact/:id` - Impact analysis
- [ ] `GET /api/v1/health` - Health check
- [ ] `GET /api/v1/metrics` - Prometheus metrics

### 5. **Frontend** 🎨
React-based web interface:

#### 5.1 Graph Visualization
- [ ] Interactive graph view with Cytoscape.js
- [ ] Multiple layout algorithms (force-directed, hierarchical)
- [ ] Node and edge styling
- [ ] Zoom and pan controls
- [ ] Filter by node type
- [ ] Search integration

#### 5.2 Search & Filter
- [ ] Global search bar
- [ ] Filter by data source
- [ ] Filter by time range
- [ ] Filter by node type
- [ ] Quick filters

#### 5.3 Impact Analysis
- [ ] Select node to analyze
- [ ] Show downstream dependencies
- [ ] Show upstream dependencies
- [ ] Visualize impact path
- [ ] Estimate affected jobs

#### 5.4 Real-time Updates
- [ ] WebSocket connection
- [ ] Live graph updates
- [ ] Node change indicators
- [ ] Notification system

#### 5.5 Dashboard
- [ ] Overview statistics
- [ ] Recent lineage updates
- [ ] Active data sources
- [ ] Performance metrics

### 6. **Additional Features** 🚀

- [ ] Time-travel debugging (view lineage at a point in time)
- [ ] What-if analysis (simulate changes)
- [ ] Export lineage graph (PNG, SVG, JSON)
- [ ] Multi-cluster support
- [ ] Custom resource definitions (CRDs)
- [ ] Graph comparison
- [ ] Anomaly detection

## MVP Features (Minimum Viable Product)

For the first release:

1. ✅ Helm chart structure
2. ✅ Docker configuration
3. ✅ Go backend scaffold
4. ✅ React frontend scaffold
5. ⏳ Neo4j client implementation
6. ⏳ Spark collector
7. ⏳ Basic lineage processor
8. ⏳ REST API endpoints
9. ⏳ Graph visualization
10. ⏳ Search functionality

## Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Neo4j client implementation
2. Basic lineage processor
3. Spark collector MVP
4. REST API skeleton
5. Health checks

### Phase 2: Core Features (Week 3-4)
1. Complete Spark collector
2. Airflow collector
3. Graph visualization frontend
4. Search functionality
5. Basic impact analysis

### Phase 3: Enhancement (Week 5-6)
1. Kafka collector
2. Flink collector
3. Real-time updates
4. Advanced visualizations
5. Export functionality

### Phase 4: Polish (Week 7-8)
1. Performance optimization
2. Error handling improvements
3. Documentation
4. Tests
5. Release preparation
