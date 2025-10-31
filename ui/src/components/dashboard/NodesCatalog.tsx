import { useEffect, useState } from 'react'
import { authFetch } from '../../lib/auth'

type Node = { id: string; name: string; type: string; status?: string }

type Props = {
  onSelectNode: (node: Node | null) => void
  selectedNodeId?: string | null
  onDragNode?: (node: Node, event: React.DragEvent) => void
}

export function NodesCatalog({ onSelectNode, selectedNodeId, onDragNode }: Props) {
  const [nodes, setNodes] = useState<Node[]>([])
  const [filteredNodes, setFilteredNodes] = useState<Node[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadNodes()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNodes(nodes)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredNodes(
        nodes.filter(node =>
          node.name.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query) ||
          node.id.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, nodes])

  async function loadNodes() {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/nodes')
      if (!res.ok) throw new Error('Failed to load nodes')
      const data = await res.json()
      const nodeList = (data.items || data) as Node[]
      setNodes(nodeList)
      setFilteredNodes(nodeList)
    } catch (e: any) {
      setError(e.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <h4 style={{ marginTop: 0, marginBottom: 12 }}>Nodes Catalog</h4>
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 8,
            background: 'var(--color-surface-2)',
            color: 'var(--color-text)',
            border: '1px solid rgba(255,255,255,.08)',
            fontSize: 12,
            outline: 'none',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-accent)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255,255,255,.08)'
          }}
        />
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {error && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginBottom: 8 }}>{error}</div>}
        {loading ? (
          <div className="app-subtle" style={{ fontSize: 12 }}>Loading...</div>
        ) : filteredNodes.length === 0 ? (
          <div className="app-subtle" style={{ fontSize: 12 }}>
            {searchQuery ? 'No nodes found matching your search' : 'No nodes found'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredNodes.map((node) => (
              <div
                key={node.id}
                draggable={!!onDragNode}
                onDragStart={(e) => {
                  if (onDragNode) {
                    onDragNode(node, e)
                  }
                }}
                onClick={() => onSelectNode(node)}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  background: selectedNodeId === node.id ? 'var(--color-accent)' : 'var(--color-surface-2)',
                  border: `1px solid ${selectedNodeId === node.id ? 'var(--color-accent)' : 'rgba(255,255,255,.08)'}`,
                  color: selectedNodeId === node.id ? 'white' : 'var(--color-text)',
                  textAlign: 'left',
                  fontSize: 12,
                  cursor: onDragNode ? 'grab' : 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: selectedNodeId === node.id ? '0 2px 8px rgba(0,0,0,.2)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (selectedNodeId !== node.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,.06)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.12)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedNodeId !== node.id) {
                    e.currentTarget.style.background = 'var(--color-surface-2)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'
                  }
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{node.name}</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{node.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
