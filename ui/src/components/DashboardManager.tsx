import React, { useState } from 'react'
import { Node, Edge } from '@xyflow/react'
import './DashboardManager.css'

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

interface DashboardManagerProps {
  dashboards: Dashboard[]
  currentDashboard: Dashboard | null
  onClose: () => void
  onSave: (dashboard: Dashboard) => void
  canWrite: boolean
}

export function DashboardManager({
  dashboards,
  currentDashboard,
  onClose,
  onSave,
  canWrite
}: DashboardManagerProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list')
  const [editingDashboard, setEditingDashboard] = useState<Dashboard | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isDefault: false,
    permissions: {
      read: ['*'],
      write: ['admin']
    }
  })

  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      isDefault: false,
      permissions: {
        read: ['*'],
        write: ['admin']
      }
    })
    setEditingDashboard(null)
    setActiveTab('create')
  }

  const handleEdit = (dashboard: Dashboard) => {
    setFormData({
      name: dashboard.name,
      description: dashboard.description,
      isDefault: dashboard.isDefault,
      permissions: dashboard.permissions
    })
    setEditingDashboard(dashboard)
    setActiveTab('edit')
  }

  const handleSave = () => {
    const dashboard: Dashboard = {
      id: editingDashboard?.id || `dashboard_${Date.now()}`,
      name: formData.name,
      description: formData.description,
      isDefault: formData.isDefault,
      permissions: formData.permissions,
      nodes: editingDashboard?.nodes || [],
      edges: editingDashboard?.edges || [],
      createdAt: editingDashboard?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    onSave(dashboard)
    setActiveTab('list')
  }

  const handleDelete = (dashboardId: string) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      // TODO: Implement delete API call
      console.log('Delete dashboard:', dashboardId)
    }
  }

  return (
    <div className="dashboard-manager-overlay">
      <div className="dashboard-manager">
        <div className="manager-header">
          <h2>Dashboard Manager</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="manager-tabs">
          <button
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 All Dashboards
          </button>
          {canWrite && (
            <button
              className={`tab ${activeTab === 'create' ? 'active' : ''}`}
              onClick={handleCreateNew}
            >
              ➕ Create New
            </button>
          )}
          {canWrite && editingDashboard && (
            <button
              className={`tab ${activeTab === 'edit' ? 'active' : ''}`}
              onClick={() => setActiveTab('edit')}
            >
              ✏️ Edit Dashboard
            </button>
          )}
        </div>

        <div className="manager-content">
          {activeTab === 'list' && (
            <div className="dashboard-list">
              <div className="list-header">
                <h3>Available Dashboards</h3>
                <div className="list-actions">
                  <input
                    type="text"
                    placeholder="Search dashboards..."
                    className="search-input"
                  />
                </div>
              </div>

              <div className="dashboard-grid">
                {dashboards.map(dashboard => (
                  <div key={dashboard.id} className="dashboard-card">
                    <div className="card-header">
                      <h4>{dashboard.name}</h4>
                      {dashboard.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                    </div>
                    <p className="card-description">{dashboard.description}</p>
                    <div className="card-metrics">
                      <span className="metric">
                        <span className="metric-icon">📊</span>
                        {dashboard.nodes.length} nodes
                      </span>
                      <span className="metric">
                        <span className="metric-icon">🔗</span>
                        {dashboard.edges.length} edges
                      </span>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          // Switch to this dashboard
                          onClose()
                        }}
                      >
                        Open
                      </button>
                      {canWrite && (
                        <>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEdit(dashboard)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(dashboard.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                    <div className="card-footer">
                      <small>Updated: {new Date(dashboard.updatedAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(activeTab === 'create' || activeTab === 'edit') && canWrite && (
            <div className="dashboard-form">
              <h3>{activeTab === 'create' ? 'Create New Dashboard' : 'Edit Dashboard'}</h3>

              <div className="form-group">
                <label htmlFor="name">Dashboard Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter dashboard name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter dashboard description"
                  className="form-textarea"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <span>Set as default dashboard</span>
                </label>
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  <div className="permission-group">
                    <label>Read Access</label>
                    <input
                      type="text"
                      value={formData.permissions.read.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          read: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }
                      }))}
                      placeholder="admin, user, *"
                      className="form-input"
                    />
                  </div>
                  <div className="permission-group">
                    <label>Write Access</label>
                    <input
                      type="text"
                      value={formData.permissions.write.join(', ')}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        permissions: {
                          ...prev.permissions,
                          write: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        }
                      }))}
                      placeholder="admin"
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('list')}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={!formData.name.trim()}
                >
                  {activeTab === 'create' ? 'Create Dashboard' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
