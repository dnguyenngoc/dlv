import React, { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { SparkNode } from '../components/nodes/SparkNode'
import { KafkaNode } from '../components/nodes/KafkaNode'
import { AirflowNode } from '../components/nodes/AirflowNode'
import { DatabaseNode } from '../components/nodes/DatabaseNode'
import { CustomEdge } from '../components/edges/CustomEdge'
import { MetricsPanel } from '../components/MetricsPanel'
import { FilterPanel } from '../components/FilterPanel'
import { DashboardManager } from '../components/DashboardManager'
import { lineageApi } from '../api/client'
import './Dashboard.css'

// Define node types
const nodeTypes: NodeTypes = {
  spark: SparkNode,
  kafka: KafkaNode,
  airflow: AirflowNode,
  database: DatabaseNode,
}

// Define edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
}

// Initial nodes for demonstration
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'kafka',
    position: { x: 100, y: 100 },
    data: {
      label: 'user-events',
      topic: 'user-events',
      throughput: '1.2M msg/s',
      status: 'active',
      partitions: 12
    },
  },
  {
    id: '2',
    type: 'spark',
    position: { x: 400, y: 100 },
    data: {
      label: 'Spark Streaming Job',
      jobId: 'spark-001',
      status: 'running',
      throughput: '850MB/s',
      executors: 8
    },
  },
  {
    id: '3',
    type: 'database',
    position: { x: 700, y: 100 },
    data: {
      label: 'Analytics DB',
      database: 'analytics',
      table: 'user_events_processed',
      status: 'active',
      size: '2.3TB'
    },
  },
  {
    id: '4',
    type: 'airflow',
    position: { x: 400, y: 300 },
    data: {
      label: 'Data Pipeline DAG',
      dagId: 'user_events_pipeline',
      status: 'running',
      lastRun: '2024-01-15 10:30:00',
      nextRun: '2024-01-15 11:00:00'
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'custom',
    data: {
      throughput: '1.2M msg/s',
      latency: '50ms',
      status: 'healthy'
    },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'custom',
    data: {
      throughput: '850MB/s',
      latency: '200ms',
      status: 'healthy'
    },
  },
  {
    id: 'e4-2',
    source: '4',
    target: '2',
    type: 'custom',
    data: {
      schedule: 'every 30min',
      status: 'active'
    },
  },
]

interface Dashboard {
  id: string
  name: string
  description: string
  isDefault: boolean
  permissions: {
    read: string[]
    write: string[]
  }
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

export function Dashboard() {
  const location = useLocation()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showDashboardManager, setShowDashboardManager] = useState(false)
  const [userRole, setUserRole] = useState<string>('read')
  const [metrics, setMetrics] = useState({
    totalNodes: 0,
    activeConnections: 0,
    dataThroughput: '0 MB/s',
    systemHealth: 'healthy'
  })

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  // Load user info and dashboards
  useEffect(() => {
    const loadUserAndDashboards = async () => {
      try {
        // Get user info
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        setUserRole(user.role || 'read')

        // Load dashboards from API
        const dashboardsData = await lineageApi.getDashboards()
        setDashboards(dashboardsData)

        // Set default dashboard
        const defaultDashboard = dashboardsData.find(d => d.isDefault) || dashboardsData[0]
        if (defaultDashboard) {
          setCurrentDashboard(defaultDashboard)
          setNodes(defaultDashboard.nodes)
          setEdges(defaultDashboard.edges)
          setMetrics({
            totalNodes: defaultDashboard.nodes.length,
            activeConnections: defaultDashboard.edges.length,
            dataThroughput: '1.2M msg/s',
            systemHealth: 'healthy'
          })
        }
      } catch (error) {
        console.error('Failed to load dashboards:', error)
        // Fallback to demo data
        setDashboards([{
          id: 'demo',
          name: 'Demo Dashboard',
          description: 'Default demo dashboard',
          isDefault: true,
          permissions: { read: ['*'], write: ['admin'] },
          nodes: initialNodes,
          edges: initialEdges,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }])
        setCurrentDashboard({
          id: 'demo',
          name: 'Demo Dashboard',
          description: 'Default demo dashboard',
          isDefault: true,
          permissions: { read: ['*'], write: ['admin'] },
          nodes: initialNodes,
          edges: initialEdges,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        setNodes(initialNodes)
        setEdges(initialEdges)
      }
    }

    loadUserAndDashboards()
  }, [])

  const handleDashboardChange = (dashboard: Dashboard) => {
    setCurrentDashboard(dashboard)
    setNodes(dashboard.nodes)
    setEdges(dashboard.edges)
    setMetrics({
      totalNodes: dashboard.nodes.length,
      activeConnections: dashboard.edges.length,
      dataThroughput: '1.2M msg/s',
      systemHealth: 'healthy'
    })
  }

  const handleSaveDashboard = async (dashboard: Dashboard) => {
    try {
      await lineageApi.saveDashboard(dashboard)
      setDashboards(prev =>
        prev.map(d => d.id === dashboard.id ? dashboard : d)
      )
      setCurrentDashboard(dashboard)
    } catch (error) {
      console.error('Failed to save dashboard:', error)
    }
  }

  const canWrite = userRole === 'admin' || userRole === 'write'

  return (
    <div className="dashboard">
      {/* Top Navigation Bar */}
      <div className="dashboard-nav">
        <div className="nav-left">
          <h1 className="nav-title">Data Lineage Visualizer</h1>
          <div className="nav-breadcrumb">
            <span>Dashboards</span>
            {currentDashboard && (
              <>
                <span className="breadcrumb-separator">/</span>
                <span className="breadcrumb-current">{currentDashboard.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="nav-center">
          <div className="nav-tabs">
            <Link to="/sources" className={`nav-tab ${location.pathname === '/sources' ? 'active' : ''}`}>
              <span className="tab-icon">📊</span>
              <span className="tab-label">Sources</span>
            </Link>
            <Link to="/pipelines" className={`nav-tab ${location.pathname === '/pipelines' ? 'active' : ''}`}>
              <span className="tab-icon">🔗</span>
              <span className="tab-label">Pipelines</span>
            </Link>
            <Link to="/" className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}>
              <span className="tab-icon">📈</span>
              <span className="tab-label">Dashboard</span>
            </Link>
            <Link to="/lineage" className={`nav-tab ${location.pathname === '/lineage' ? 'active' : ''}`}>
              <span className="tab-icon">🌐</span>
              <span className="tab-label">Lineage</span>
            </Link>
            <Link to="/search" className={`nav-tab ${location.pathname === '/search' ? 'active' : ''}`}>
              <span className="tab-icon">🔍</span>
              <span className="tab-label">Search</span>
            </Link>
          </div>
        </div>

        <div className="nav-right">
          <div className="nav-metrics">
            <div className="metric-item">
              <span className="metric-icon">📊</span>
              <span className="metric-value">{metrics.totalNodes}</span>
              <span className="metric-label">Nodes</span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">🔗</span>
              <span className="metric-value">{metrics.activeConnections}</span>
              <span className="metric-label">Connections</span>
            </div>
            <div className="metric-item">
              <span className="metric-icon">⚡</span>
              <span className="metric-value">{metrics.dataThroughput}</span>
              <span className="metric-label">Throughput</span>
            </div>
            <div className={`metric-item health-${metrics.systemHealth}`}>
              <span className="metric-icon">💚</span>
              <span className="metric-value">{metrics.systemHealth}</span>
              <span className="metric-label">Health</span>
            </div>
          </div>

          <div className="nav-actions">
            {canWrite && (
              <button
                className="btn btn-primary"
                onClick={() => setShowDashboardManager(true)}
              >
                <span className="btn-icon">⚙️</span>
                Manage Dashboards
              </button>
            )}
            <button className="btn btn-secondary">
              <span className="btn-icon">📊</span>
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <FilterPanel
            onFilterChange={(filters) => {
              console.log('Filters changed:', filters)
            }}
          />
          <MetricsPanel
            selectedNode={selectedNode}
            metrics={metrics}
          />
        </div>

        <div className="dashboard-main">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls />
              <MiniMap />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>

      {/* Dashboard Manager Modal */}
      {showDashboardManager && (
        <DashboardManager
          dashboards={dashboards}
          currentDashboard={currentDashboard}
          onClose={() => setShowDashboardManager(false)}
          onSave={handleSaveDashboard}
          canWrite={canWrite}
        />
      )}
    </div>
  )
}
