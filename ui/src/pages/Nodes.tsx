import { useState } from 'react'
import { NodesList } from '../components/nodes/NodesList'
import { NodesModal } from '../components/nodes/NodesModal'

export function Nodes() {
  const [open, setOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [editingNode, setEditingNode] = useState<null | { id: string; name: string; type: string; connection_string?: string }>(null)
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Nodes</h2>
      <p className="app-subtle">Manage and connect data sources (PostgreSQL, API, ...). Add a node to start syncing and analyzing.</p>
      <NodesList
        key={refreshKey}
        onAdd={() => { setEditingNode(null); setOpen(true) }}
        onEdit={(node) => { setEditingNode(node); setOpen(true) }}
      />
      <NodesModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => { setOpen(false); setRefreshKey(k=>k+1) }}
        editingNode={editingNode}
      />
    </div>
  )
}
