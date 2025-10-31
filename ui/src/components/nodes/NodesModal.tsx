import { useEffect, useState } from 'react'
import { authFetch } from '../../lib/auth'
import { nodeTypeOptions, nodeTypes, type NodeTypeKey } from '../../lib/nodeTypes'

type NodeItem = { id: string; name: string; type: string; connection_string?: string }

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  editingNode?: NodeItem | null
}

export function NodesModal({ open, onClose, onSaved, editingNode }: Props) {
  const [name, setName] = useState('')
  const [type, setType] = useState<NodeTypeKey>('postgres')
  const [conn, setConn] = useState(nodeTypes.postgres.defaultConnection || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      if (editingNode) {
        setName(editingNode.name)
        setType((editingNode.type as any) || 'postgres')
        setConn(editingNode.connection_string || '')
      } else {
        setName('')
        setType('postgres')
        setConn(nodeTypes.postgres.defaultConnection || '')
      }
      setMessage(null)
      setError(null)
    }
  }, [open, editingNode])

  if (!open) return null

  async function testConnection() {
    setMessage(null); setError(null); setLoading(true)
    try {
      const res = await authFetch('/api/nodes/test', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, connection_string: conn })
      })
      const data = await res.json()
      if (!res.ok || data.success === false) throw new Error(data.error || 'Test failed')
      setMessage('✅ Connection successful')
    } catch (e: any) {
      setError(e.message || 'Test failed')
    } finally { setLoading(false) }
  }

  async function save() {
    setMessage(null); setError(null); setLoading(true)
    try {
      const isEdit = !!editingNode?.id
      const url = isEdit ? `/api/nodes/${editingNode!.id}` : '/api/nodes'
      const method = isEdit ? 'PUT' : 'POST'
      const res = await authFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, connection_string: conn })
      })
      if (!res.ok) {
        let detail = ''
        try { const data = await res.json(); detail = data?.detail || data?.error || '' } catch { /* ignore */ }
        const fallback = isEdit ? 'Failed to update node' : 'Failed to create node'
        throw new Error(detail || fallback)
      }
      onSaved(); onClose()
    } catch (e: any) {
      setError(e.message || 'Save failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">{editingNode ? 'Edit Node' : 'Add Node'}</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 180px', gap:8 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                placeholder="e.g. prod-postgres"
                style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', background:'var(--color-surface-2)', color:'var(--color-text)', border:'1px solid rgba(255,255,255,.08)'}} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Type</label>
              <select value={type} onChange={e=>{ const v = e.target.value as NodeTypeKey; setType(v); setConn(nodeTypes[v].defaultConnection || ''); }}
                style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', background:'var(--color-surface-2)', color:'var(--color-text)', border:'1px solid rgba(255,255,255,.08)'}}>
                {nodeTypeOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Connection string</label>
            <input value={conn} onChange={e => setConn(e.target.value)} required
              placeholder={nodeTypes[type].defaultConnection || ''}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'10px', background:'var(--color-surface-2)', color:'var(--color-text)', border:'1px solid rgba(255,255,255,.08)'}} />
            <div className="app-subtle" style={{ fontSize:12, marginTop:6 }}>
              {nodeTypes[type].defaultConnection ? `Example: ${nodeTypes[type].defaultConnection}` : ''}
            </div>
          </div>
          {message && <div style={{ color:'var(--color-accent)', fontSize:14 }}>{message}</div>}
          {error && <div style={{ color:'var(--color-danger)', fontSize:14 }}>{error}</div>}
          <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
            <button className="btn-primary" onClick={testConnection} disabled={loading} style={{ background:'var(--color-accent)'}}>
              {loading ? 'Testing…' : 'Test connection'}
            </button>
            <button className="btn-primary" onClick={save} disabled={loading || !name || !conn}>{editingNode ? 'Update' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
