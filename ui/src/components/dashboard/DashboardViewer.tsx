import { useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { authFetch } from '../../lib/auth'
import { nodeTypes as nodeTypeSpecs } from '../../lib/nodeTypes'

const nodeTypes: NodeTypes = {
  asset: AssetNode,
  process: ProcessNode,
}

function AssetNode({ data }: { data: any }) {
  return (
    <div style={{
      padding: 12,
      borderRadius: 10,
      background: 'var(--color-surface)',
      border: '2px solid var(--color-accent)',
      minWidth: 150,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      position: 'relative',
    }}>
      <Handle
        type="source"
        id="source"
        position={Position.Right}
        style={{
          background: 'var(--color-accent)',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="target"
        id="target"
        position={Position.Left}
        style={{
          background: 'var(--color-accent)',
          width: 10,
          height: 10,
        }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {(() => {
          const nodeType = data.asset_type as keyof typeof nodeTypeSpecs | undefined
          const icon = nodeType && nodeTypeSpecs[nodeType]?.icon
          return icon ? (
            <img
              src={icon}
              alt={nodeType}
              style={{
                width: 20,
                height: 20,
                objectFit: 'contain',
              }}
            />
          ) : null
        })()}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.name || data.id}</div>
          <div className="app-subtle" style={{ fontSize: 12 }}>{data.asset_type || 'asset'}</div>
          {data.schema && (
            <div className="app-subtle" style={{ fontSize: 11, marginTop: 4 }}>
              {data.schema}.{data.name}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProcessNode({ data }: { data: any }) {
  return (
    <div style={{
      padding: 12,
      borderRadius: 10,
      background: 'var(--color-surface-2)',
      border: '2px solid var(--color-muted)',
      minWidth: 150,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      position: 'relative',
    }}>
      <Handle
        type="source"
        id="source"
        position={Position.Right}
        style={{
          background: 'var(--color-muted)',
          width: 10,
          height: 10,
        }}
      />
      <Handle
        type="target"
        id="target"
        position={Position.Left}
        style={{
          background: 'var(--color-muted)',
          width: 10,
          height: 10,
        }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {(() => {
          const nodeType = data.process_type as keyof typeof nodeTypeSpecs | undefined
          const icon = nodeType && nodeTypeSpecs[nodeType]?.icon
          return icon ? (
            <img
              src={icon}
              alt={nodeType}
              style={{
                width: 20,
                height: 20,
                objectFit: 'contain',
              }}
            />
          ) : null
        })()}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{data.name || data.id}</div>
          <div className="app-subtle" style={{ fontSize: 12 }}>{data.process_type || 'process'}</div>
        </div>
      </div>
    </div>
  )
}

type Props = {
  dashboardId: string
}

export function DashboardViewer({ dashboardId }: Props) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboard()
  }, [dashboardId])

  async function loadDashboard() {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(`/api/dashboards/${dashboardId}`)
      if (!res.ok) throw new Error('Failed to load dashboard')
      const data = await res.json()
      if (data.layout) {
        // Load nodes
        const loadedNodes = (data.layout.nodes || []) as Node[]
        setNodes(loadedNodes)

        // Load edges and ensure they have proper format
        const loadedEdges = (data.layout.edges || []) as Edge[]

        // Ensure edges have id and proper format (ReactFlow requires it)
        // Create edges with explicit sourceHandle and targetHandle
        const formattedEdges = loadedEdges.map((edge, index) => {
          const cleanEdge: any = {
            id: edge.id || `${edge.source}-${edge.target}-${index}`,
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || 'source',
            targetHandle: edge.targetHandle || 'target',
            animated: edge.animated !== undefined ? edge.animated : true,
            style: edge.style || { strokeWidth: 2, stroke: 'var(--color-accent)' },
          }
          // Only add optional fields if they exist
          if (edge.type) cleanEdge.type = edge.type
          if (edge.label !== undefined) cleanEdge.label = edge.label
          if (edge.markerEnd !== undefined) cleanEdge.markerEnd = edge.markerEnd
          if (edge.markerStart !== undefined) cleanEdge.markerStart = edge.markerStart
          return cleanEdge
        })
        setEdges(formattedEdges)
      }
    } catch (e: any) {
      setError(e.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="app-subtle">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div style={{ color: 'var(--color-danger)' }}>{error}</div>
      </div>
    )
  }

  if (nodes.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <div className="app-subtle">Dashboard is empty</div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        fitView
        fitViewOptions={{ padding: 0.2, minZoom: 0.1, maxZoom: 2 }}
        style={{ background: 'var(--color-background)', width: '100%', height: '100%' }}
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2, stroke: 'var(--color-accent)' },
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
