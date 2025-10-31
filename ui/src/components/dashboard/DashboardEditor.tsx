import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  NodeTypes,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { authFetch } from '../../lib/auth'
import { NodesCatalog } from './NodesCatalog'
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
      {/* Source handle - can connect to other nodes */}
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
      {/* Target handle - can receive connections */}
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
      {/* Source handle - can connect to other nodes */}
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
      {/* Target handle - can receive connections */}
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
  dashboardId: string | null
  onSave: () => void
}

export function DashboardEditor({ dashboardId, onSave }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [selectedCanvasNode, setSelectedCanvasNode] = useState<Node | null>(null)
  const [draggedNode, setDraggedNode] = useState<any>(null)
  const [tables, setTables] = useState<any[]>([])
  const [dags, setDags] = useState<any[]>([])
  const [loadingTables, setLoadingTables] = useState(false)
  const [loadingDags, setLoadingDags] = useState(false)

  useEffect(() => {
    if (dashboardId) {
      loadDashboard()
    } else {
      setNodes([])
      setEdges([])
    }
  }, [dashboardId])

  useEffect(() => {
    if (selectedCanvasNode) {
      loadNodeResources()
    } else {
      setTables([])
      setDags([])
    }
  }, [selectedCanvasNode])

  async function loadDashboard() {
    if (!dashboardId) return
    try {
      const res = await authFetch(`/api/dashboards/${dashboardId}`)
      if (!res.ok) throw new Error('Failed to load dashboard')
      const data = await res.json()
      if (data.layout) {
        // Load nodes and ensure they have node_type
        const loadedNodes = (data.layout.nodes || []).map((n: any) => ({
          ...n,
          data: {
            ...n.data,
            // Ensure node_type is set - prefer node_type, fallback to asset_type
            node_type: n.data?.node_type || n.data?.asset_type || n.data?.process_type || 'node',
            // Ensure node_id is set for API calls
            node_id: n.data?.node_id || n.id,
          },
        })) as Node[]
        setNodes(loadedNodes)

        // Load edges and ensure they have proper format
        const loadedEdges = (data.layout.edges || []) as Edge[]
        // Ensure edges have id (ReactFlow requires it)
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
      console.error(e)
    }
  }

  async function loadNodeResources() {
    if (!selectedCanvasNode) return

    // Get node type: prefer node_type, fallback to asset_type or process_type
    const nodeType = selectedCanvasNode.data?.node_type || selectedCanvasNode.data?.asset_type || selectedCanvasNode.data?.process_type
    // Use node_id from data, fallback to node.id
    const nodeId = selectedCanvasNode.data?.node_id || selectedCanvasNode.id

    // Only load tables for database/postgres nodes
    if (nodeType === 'postgres' && nodeId) {
      setLoadingTables(true)
      try {
        const res = await authFetch(`/api/nodes/${nodeId}/tables`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setTables(data.tables || [])
          }
        }
      } catch (e: any) {
        console.error('Failed to load tables:', e)
      } finally {
        setLoadingTables(false)
      }
    } else {
      setTables([])
      setLoadingTables(false)
    }

    // Only load DAGs for airflow nodes
    if (nodeType === 'airflow' && nodeId) {
      setLoadingDags(true)
      try {
        const res = await authFetch(`/api/nodes/${nodeId}/dags`)
        if (res.ok) {
          const data = await res.json()
          if (data.success) {
            setDags(data.dags || [])
          }
        }
      } catch (e: any) {
        console.error('Failed to load DAGs:', e)
      } finally {
        setLoadingDags(false)
      }
    } else {
      setDags([])
      setLoadingDags(false)
    }
  }

  function handleTableSelect(tableSchema: string, tableName: string) {
    if (!selectedCanvasNode) return

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedCanvasNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              selected_table_schema: tableSchema,
              selected_table_name: tableName,
            },
          }
        }
        return n
      })
    )
  }

  function handleDagSelect(dagId: string) {
    if (!selectedCanvasNode) return

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedCanvasNode.id) {
          return {
            ...n,
            data: {
              ...n.data,
              selected_dag_id: dagId,
            },
          }
        }
        return n
      })
    )
  }

  async function saveDashboard() {
    if (!dashboardId) return
    setSaving(true)
    try {
      const layout = {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
        })),
        edges: edges.map((e, index) => {
          // Save sourceHandle and targetHandle with explicit IDs
          const cleanEdge: any = {
            id: e.id || `${e.source}-${e.target}-${index}`,
            source: e.source,
            target: e.target,
            sourceHandle: e.sourceHandle || 'source',
            targetHandle: e.targetHandle || 'target',
            type: e.type,
            animated: e.animated !== undefined ? e.animated : true,
            style: e.style || { strokeWidth: 2, stroke: 'var(--color-accent)' },
          }
          // Only add optional fields if they exist and are not undefined
          if (e.label !== undefined) cleanEdge.label = e.label
          if (e.markerEnd !== undefined) cleanEdge.markerEnd = e.markerEnd
          if (e.markerStart !== undefined) cleanEdge.markerStart = e.markerStart
          return cleanEdge
        }),
      }
      const res = await authFetch(`/api/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to save dashboard' }))
        throw new Error(errorData.detail || 'Failed to save dashboard')
      }

      // Reload dashboard to get the saved version
      await loadDashboard()
      onSave()
    } catch (e: any) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleConnect = useCallback((connection: Connection) => {
    if (!connection.source || !connection.target) return

    // Just add the edge to the dashboard layout - don't create lineage edge automatically
    // Lineage edges should be created separately when nodes are properly registered
    setEdges((eds) => addEdge(connection, eds))
  }, [setEdges])


  const handleNodeDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    if (!draggedNode) return

    const reactFlowBounds = (event.currentTarget as HTMLElement).getBoundingClientRect()
    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    }

    // Add node to canvas
    // Use the node ID from NodesCatalog as the node_id (DLV node ID)
    // draggedNode.type is the actual node type from backend: 'postgres', 'api', 'airflow'
    const newNode: Node = {
      id: draggedNode.id,
      type: 'asset',
      position,
      data: {
        id: draggedNode.id,
        name: draggedNode.name,
        node_type: draggedNode.type || 'node', // Store actual node type: postgres, api, airflow
        node_id: draggedNode.id, // Store DLV node ID for API calls
        asset_type: draggedNode.type || 'node', // Keep for compatibility
      },
    }

    setNodes((nds) => [...nds, newNode])
    setDraggedNode(null)
  }, [draggedNode, setNodes])

  const handleNodeDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  return (
    <div style={{ display: 'flex', height: '100%', gap: 12 }}>
      {/* Left sidebar: Catalog */}
      <aside style={{ width: 220, background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <NodesCatalog
          onSelectNode={setSelectedNode}
          selectedNodeId={selectedNode?.id}
          onDragNode={(node: any, event: React.DragEvent) => {
            setDraggedNode(node)
            event.dataTransfer.effectAllowed = 'move'
          }}
        />

        {dashboardId && (
          <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)', marginTop: 'auto' }}>
            <button
              className="btn-primary"
              onClick={saveDashboard}
              disabled={saving}
              style={{ width: '100%' }}
            >
              {saving ? 'Saving...' : 'Save Dashboard'}
            </button>
          </div>
        )}
      </aside>

      {/* Main canvas */}
      <div
        style={{
          flex: 1,
          background: 'var(--color-surface)',
          borderRadius: 12,
          overflow: 'hidden',
          position: 'relative',
          border: '2px solid rgba(110,168,254,.3)',
          boxShadow: '0 4px 20px rgba(0,0,0,.3), inset 0 0 0 1px rgba(110,168,254,.1)',
        }}
        onDrop={handleNodeDrop}
        onDragOver={handleNodeDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onNodeClick={(_, n)=>setSelectedCanvasNode(n)}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: 'var(--color-background)' }}
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

      {/* Right properties panel */}
      <aside style={{ width: 220, background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,.08)', overflow: 'auto', flex: 1 }}>
          <h4 style={{ margin:'0 0 12px 0' }}>Properties</h4>
          {!selectedCanvasNode && (
            <div className="app-subtle" style={{ fontSize:12 }}>Select a node to view properties</div>
          )}
          {selectedCanvasNode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13 }}>
                <div style={{ marginBottom: 4 }}><b>ID:</b> {selectedCanvasNode.id}</div>
                <div style={{ marginBottom: 4 }}><b>Name:</b> {selectedCanvasNode.data?.name}</div>
                {(selectedCanvasNode.data?.node_type || selectedCanvasNode.data?.asset_type || selectedCanvasNode.data?.process_type) && (
                  <div style={{ marginBottom: 4 }}>
                    <b>Type:</b> {selectedCanvasNode.data?.node_type || selectedCanvasNode.data?.asset_type || selectedCanvasNode.data?.process_type}
                  </div>
                )}
                {selectedCanvasNode.data?.schema && (
                  <div style={{ marginBottom: 4 }}><b>Schema:</b> {selectedCanvasNode.data.schema}</div>
                )}
              </div>

              {/* Database/Postgres: Table selector - only show for postgres nodes */}
              {(selectedCanvasNode.data?.node_type === 'postgres' || selectedCanvasNode.data?.asset_type === 'postgres') && (
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Select Table
                  </label>
                  {loadingTables ? (
                    <div className="app-subtle" style={{ fontSize: 11 }}>Loading tables...</div>
                  ) : tables.length === 0 ? (
                    <div className="app-subtle" style={{ fontSize: 11 }}>No tables found</div>
                  ) : (
                    <select
                      value={`${selectedCanvasNode.data?.selected_table_schema || ''}.${selectedCanvasNode.data?.selected_table_name || ''}`}
                      onChange={(e) => {
                        const [schema, name] = e.target.value.split('.')
                        if (schema && name) {
                          handleTableSelect(schema, name)
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text)',
                        border: '1px solid rgba(255,255,255,.08)',
                        fontSize: 12,
                        outline: 'none',
                      }}
                    >
                      <option value="">-- Select table --</option>
                      {tables.map((table) => (
                        <option key={`${table.schema}.${table.name}`} value={`${table.schema}.${table.name}`}>
                          {table.schema}.{table.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Airflow: DAG selector - only show for airflow nodes */}
              {(selectedCanvasNode.data?.node_type === 'airflow' || selectedCanvasNode.data?.asset_type === 'airflow') && (
                <div>
                  <label style={{ fontSize: 12, display: 'block', marginBottom: 6, fontWeight: 600 }}>
                    Select DAG
                  </label>
                  {loadingDags ? (
                    <div className="app-subtle" style={{ fontSize: 11 }}>Loading DAGs...</div>
                  ) : dags.length === 0 ? (
                    <div className="app-subtle" style={{ fontSize: 11 }}>No DAGs found</div>
                  ) : (
                    <select
                      value={selectedCanvasNode.data?.selected_dag_id || ''}
                      onChange={(e) => handleDagSelect(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        borderRadius: 6,
                        background: 'var(--color-surface-2)',
                        color: 'var(--color-text)',
                        border: '1px solid rgba(255,255,255,.08)',
                        fontSize: 12,
                        outline: 'none',
                      }}
                    >
                      <option value="">-- Select DAG --</option>
                      {dags.map((dag) => (
                        <option key={dag.dag_id} value={dag.dag_id}>
                          {dag.dag_id}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
