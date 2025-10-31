import { useEffect, useState } from 'react'
import { authFetch } from '../../lib/auth'

type Dashboard = {
  id: string
  name: string
  description?: string
  layout?: any
  created_at: string
  updated_at: string
}

type Props = {
  onSelectDashboard: (dashboard: Dashboard | null) => void
  selectedDashboardId?: string | null
  onDeleteDashboard?: (dashboardId: string) => void
}

export function DashboardList({ onSelectDashboard, selectedDashboardId, onDeleteDashboard }: Props) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboards()
  }, [])

  async function loadDashboards() {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch('/api/dashboards')
      if (!res.ok) throw new Error('Failed to load dashboards')
      const data = await res.json()
      setDashboards(data || [])
    } catch (e: any) {
      console.error('Load dashboards error:', e)
      setError(e.message || 'Load failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,.08)' }}>
      <h4 style={{ marginTop: 0, marginBottom: 12 }}>Dashboards</h4>
      {error && <div style={{ color: 'var(--color-danger)', fontSize: 12, marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div className="app-subtle" style={{ fontSize: 12 }}>Loading...</div>
      ) : dashboards.length === 0 ? (
        <div className="app-subtle" style={{ fontSize: 12 }}>No dashboards. Create one to start.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {dashboards.map((d) => (
            <div
              key={d.id}
              style={{
                padding: 10,
                borderRadius: 8,
                background: selectedDashboardId === d.id ? 'var(--color-accent)' : 'var(--color-surface-2)',
                border: `1px solid ${selectedDashboardId === d.id ? 'var(--color-accent)' : 'rgba(255,255,255,.08)'}`,
                color: selectedDashboardId === d.id ? 'white' : 'var(--color-text)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <button
                onClick={() => onSelectDashboard(d)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  fontSize: 12,
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  padding: 0,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                {d.description && (
                  <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4 }}>{d.description}</div>
                )}
                <div style={{ fontSize: 10, opacity: 0.7 }}>
                  Updated: {new Date(d.updated_at).toLocaleDateString()}
                </div>
              </button>
              {onDeleteDashboard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Are you sure you want to delete "${d.name}"? This action cannot be undone.`)) {
                      onDeleteDashboard(d.id)
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    background: 'var(--color-danger)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    opacity: 0.8,
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                  title="Delete dashboard"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
