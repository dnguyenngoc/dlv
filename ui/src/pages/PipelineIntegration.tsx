import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './PipelineIntegration.css'

interface Pipeline {
  id: string
  name: string
  sourceId: string
  sourceName: string
  status: 'active' | 'inactive' | 'error'
  lastRun: string
  nextRun: string
  schedule: string
  description: string
}

export function PipelineIntegration() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sourceId: '',
    schedule: '*/5 * * * *',
    description: ''
  })

  const [sources] = useState([
    { id: '1', name: 'Production Spark Cluster' },
    { id: '2', name: 'Kafka Event Streams' }
  ])

  useEffect(() => {
    // Load existing pipelines
    const loadPipelines = async () => {
      try {
        // TODO: Load from API
        setPipelines([
          {
            id: '1',
            name: 'User Events Pipeline',
            sourceId: '2',
            sourceName: 'Kafka Event Streams',
            status: 'active',
            lastRun: '2024-01-15 10:30:00',
            nextRun: '2024-01-15 10:35:00',
            schedule: '*/5 * * * *',
            description: 'Process user events from Kafka'
          },
          {
            id: '2',
            name: 'ETL Data Pipeline',
            sourceId: '1',
            sourceName: 'Production Spark Cluster',
            status: 'active',
            lastRun: '2024-01-15 10:25:00',
            nextRun: '2024-01-15 11:00:00',
            schedule: '0 * * * *',
            description: 'Daily ETL processing'
          }
        ])
      } catch (error) {
        console.error('Failed to load pipelines:', error)
      }
    }

    loadPipelines()
  }, [])

  const handleAddPipeline = () => {
    const source = sources.find(s => s.id === formData.sourceId)
    const newPipeline: Pipeline = {
      id: Date.now().toString(),
      name: formData.name,
      sourceId: formData.sourceId,
      sourceName: source?.name || '',
      status: 'active',
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
      schedule: formData.schedule,
      description: formData.description
    }

    setPipelines(prev => [...prev, newPipeline])
    setShowAddForm(false)
    setFormData({
      name: '',
      sourceId: '',
      schedule: '*/5 * * * *',
      description: ''
    })
  }

  const handleTogglePipeline = (pipelineId: string) => {
    setPipelines(prev =>
      prev.map(p =>
        p.id === pipelineId
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    )
  }

  const handleDeletePipeline = (pipelineId: string) => {
    if (window.confirm('Are you sure you want to delete this pipeline?')) {
      setPipelines(prev => prev.filter(p => p.id !== pipelineId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'inactive': return '#6b7280'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢'
      case 'inactive': return '⚪'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="pipeline-integration">
      <div className="page-header">
        <div className="header-content">
          <h1>Pipeline Integration</h1>
          <p>Configure and manage data lineage pipelines</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <span className="btn-icon">🔗</span>
          Create Pipeline
        </button>
      </div>

      <div className="page-content">
        {/* Pipeline Overview */}
        <div className="pipeline-stats">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{pipelines.length}</div>
              <div className="stat-label">Total Pipelines</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🟢</div>
            <div className="stat-content">
              <div className="stat-value">{pipelines.filter(p => p.status === 'active').length}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚪</div>
            <div className="stat-content">
              <div className="stat-value">{pipelines.filter(p => p.status === 'inactive').length}</div>
              <div className="stat-label">Inactive</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🔴</div>
            <div className="stat-content">
              <div className="stat-value">{pipelines.filter(p => p.status === 'error').length}</div>
              <div className="stat-label">Errors</div>
            </div>
          </div>
        </div>

        {/* Pipelines List */}
        <div className="pipelines-list">
          <h2>Data Pipelines</h2>
          {pipelines.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔗</div>
              <h3>No pipelines configured</h3>
              <p>Create your first pipeline to start tracking data lineage</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                Create Pipeline
              </button>
            </div>
          ) : (
            <div className="pipelines-grid">
              {pipelines.map(pipeline => (
                <div key={pipeline.id} className="pipeline-card">
                  <div className="card-header">
                    <div className="pipeline-info">
                      <h3>{pipeline.name}</h3>
                      <p>{pipeline.description}</p>
                    </div>
                    <div className="pipeline-status">
                      <span className="status-icon">{getStatusIcon(pipeline.status)}</span>
                      <span
                        className="status-text"
                        style={{ color: getStatusColor(pipeline.status) }}
                      >
                        {pipeline.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="pipeline-details">
                      <div className="detail-item">
                        <span className="detail-label">Source:</span>
                        <span className="detail-value">{pipeline.sourceName}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Schedule:</span>
                        <span className="detail-value">{pipeline.schedule}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Last Run:</span>
                        <span className="detail-value">{pipeline.lastRun}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Next Run:</span>
                        <span className="detail-value">{pipeline.nextRun}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className={`btn btn-sm ${pipeline.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => handleTogglePipeline(pipeline.id)}
                    >
                      {pipeline.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      Configure
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      View Logs
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeletePipeline(pipeline.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Pipeline Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New Pipeline</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Pipeline Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter pipeline name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Data Source</label>
                <select
                  value={formData.sourceId}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceId: e.target.value }))}
                  className="form-select"
                >
                  <option value="">Select a data source</option>
                  {sources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Schedule (Cron Expression)</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                  placeholder="*/5 * * * *"
                  className="form-input"
                />
                <small className="form-help">
                  Examples: */5 * * * * (every 5 minutes), 0 * * * * (hourly), 0 0 * * * (daily)
                </small>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this pipeline"
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddPipeline}
                disabled={!formData.name.trim() || !formData.sourceId}
              >
                Create Pipeline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
