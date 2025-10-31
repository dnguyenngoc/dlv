import { useState, useEffect } from 'react'
import { authFetch } from '../lib/auth'
import { DashboardList } from '../components/dashboard/DashboardList'
import { DashboardViewer } from '../components/dashboard/DashboardViewer'
import { DashboardEditor } from '../components/dashboard/DashboardEditor'

const DASHBOARD_SIDEBAR_HIDDEN_KEY = 'dlv-dashboard-sidebar-hidden'

type Dashboard = {
  id: string
  name: string
  description?: string
  layout?: any
  created_at: string
  updated_at: string
}

export function Dashboards() {
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null)
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>('view')
  const [newDashboardId, setNewDashboardId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [listKey, setListKey] = useState(0) // Force reload dashboard list
  const [editingName, setEditingName] = useState('')
  const [editingDescription, setEditingDescription] = useState('')
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    const saved = localStorage.getItem(DASHBOARD_SIDEBAR_HIDDEN_KEY)
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem(DASHBOARD_SIDEBAR_HIDDEN_KEY, String(sidebarHidden))
  }, [sidebarHidden])

  function toggleSidebar() {
    setSidebarHidden(prev => !prev)
  }

  async function createDashboard() {
    setCreating(true)
    try {
      const res = await authFetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'New Dashboard',
          description: '',
          layout: { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } }
        }),
      })
      if (!res.ok) throw new Error('Failed to create dashboard')
      const data = await res.json()
      setNewDashboardId(data.id)
      setSelectedDashboard(data)
      setMode('edit')
      // Reload dashboard list
      setListKey(prev => prev + 1)
    } catch (e: any) {
      console.error(e)
      alert('Failed to create dashboard: ' + (e.message || 'Unknown error'))
    } finally {
      setCreating(false)
    }
  }

  function handleSelectDashboard(dashboard: Dashboard | null) {
    setSelectedDashboard(dashboard)
    if (dashboard) {
      setMode('view')
      setNewDashboardId(null)
    } else {
      setMode('view')
      setNewDashboardId(null)
    }
  }

  function handleEdit() {
    if (selectedDashboard) {
      setEditingName(selectedDashboard.name)
      setEditingDescription(selectedDashboard.description || '')
      setMode('edit')
    }
  }

  function handleCancel() {
    setMode('view')
    setEditingName('')
    setEditingDescription('')
  }

  async function handleSaveNameAndDescription() {
    if (!selectedDashboard) return
    try {
      const res = await authFetch(`/api/dashboards/${selectedDashboard.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingName,
          description: editingDescription || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to update dashboard')
      const data = await res.json()
      setSelectedDashboard(data)
    } catch (e: any) {
      console.error(e)
      alert('Failed to update dashboard name: ' + (e.message || 'Unknown error'))
    }
  }

  function handleSave() {
    setMode('view')
    // Reload dashboard list to get updated data
    setListKey(prev => prev + 1)
    // Reload selected dashboard to get updated data
    if (selectedDashboard) {
      loadDashboard(selectedDashboard.id)
    }
  }

  async function loadDashboard(id: string) {
    try {
      const res = await authFetch(`/api/dashboards/${id}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedDashboard(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  function handleNewDashboard() {
    setSelectedDashboard(null)
    setMode('create')
    createDashboard()
  }

  async function handleDeleteDashboard(dashboardId: string) {
    try {
      const res = await authFetch(`/api/dashboards/${dashboardId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: 'Failed to delete dashboard' }))
        throw new Error(errorData.detail || 'Failed to delete dashboard')
      }

      // If deleted dashboard was selected, clear selection
      if (selectedDashboard?.id === dashboardId) {
        setSelectedDashboard(null)
        setMode('view')
      }

      // Reload dashboard list
      setListKey(prev => prev + 1)
    } catch (e: any) {
      console.error('Delete dashboard error:', e)
      alert('Failed to delete dashboard: ' + (e.message || 'Unknown error'))
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 12 }}>
      {/* Left sidebar: Dashboard list */}
      {!sidebarHidden && (
        <aside style={{ width: 300, background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span>Dashboards</span>
              <button
                onClick={toggleSidebar}
                className="icon-btn"
                style={{
                  width: 24,
                  height: 24,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
                title="Hide dashboards sidebar"
              >
                ✕
              </button>
            </h3>
            <button
              className="btn-primary"
              onClick={handleNewDashboard}
              disabled={creating}
              style={{ width: '100%', marginBottom: 8 }}
            >
              {creating ? 'Creating...' : 'New Dashboard'}
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            <DashboardList
              key={listKey}
              onSelectDashboard={handleSelectDashboard}
              selectedDashboardId={selectedDashboard?.id || null}
              onDeleteDashboard={handleDeleteDashboard}
            />
          </div>
        </aside>
      )}

      {/* Main content: View or Edit */}
      <div style={{ flex: 1, background: 'var(--color-surface)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
        {sidebarHidden && (
          <button
            onClick={toggleSidebar}
            className="icon-btn"
            style={{
              position: 'absolute',
              top: 5,
              left: 10,
              zIndex: 11,
              width: 32,
              height: 32,
              fontSize: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-surface)',
              border: '1px solid rgba(255,255,255,.08)',
              borderRadius: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,.3), 0 2px 4px rgba(0,0,0,.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.4), 0 2px 6px rgba(0,0,0,.3)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.3), 0 2px 4px rgba(0,0,0,.2)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            title="Show dashboards sidebar"
          >
            ☰
          </button>
        )}
        {mode === 'view' && selectedDashboard ? (
          <>
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, background: 'var(--color-surface)', padding: 8, borderRadius: 8, border: '1px solid rgba(255,255,255,.08)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{selectedDashboard.name}</div>
              {selectedDashboard.description && (
                <div className="app-subtle" style={{ fontSize: 12 }}>{selectedDashboard.description}</div>
              )}
              <div style={{ marginLeft: 'auto' }}>
                <button className="btn-primary" onClick={handleEdit} style={{ padding: '4px 12px', fontSize: 12 }}>
                  Edit
                </button>
              </div>
            </div>
            <DashboardViewer dashboardId={selectedDashboard.id} />
          </>
        ) : mode === 'edit' && selectedDashboard ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: 12, paddingLeft: 52, borderBottom: '1px solid rgba(255,255,255,.08)', background: 'var(--color-surface)', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,.08)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,.08)'
                      handleSaveNameAndDescription()
                    }}
                  />
                  <input
                    type="text"
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    placeholder="Description (optional)"
                    style={{
                      fontSize: 12,
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,.08)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      color: 'var(--color-muted)',
                      outline: 'none',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--color-accent)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(255,255,255,.08)'
                      handleSaveNameAndDescription()
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-ghost" onClick={handleCancel} style={{ padding: '4px 12px', fontSize: 12 }}>
                  Cancel
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <DashboardEditor dashboardId={selectedDashboard.id} onSave={handleSave} />
            </div>
          </div>
        ) : mode === 'create' && newDashboardId ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: 12, paddingLeft: 52, borderBottom: '1px solid rgba(255,255,255,.08)', background: 'var(--color-surface)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>New Dashboard - Drag nodes from the left sidebar to start building</div>
              <div style={{ marginLeft: 'auto' }}>
                <button className="btn-ghost" onClick={handleCancel} style={{ padding: '4px 12px', fontSize: 12 }}>
                  Cancel
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <DashboardEditor dashboardId={newDashboardId} onSave={handleSave} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className="app-subtle">Select or create a dashboard to start</div>
          </div>
        )}
      </div>
    </div>
  )
}
