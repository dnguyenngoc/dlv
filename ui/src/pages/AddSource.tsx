import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './AddSource.css'

interface DataSource {
  id: string
  name: string
  type: 'spark' | 'kafka' | 'airflow' | 'database' | 'custom'
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  description: string
}

export function AddSource() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'spark' as DataSource['type'],
    connectionString: '',
    username: '',
    password: '',
    description: ''
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')

  const dataSourceTypes = [
    {
      id: 'spark',
      name: 'Apache Spark',
      icon: '/icons/sources/spark.png',
      description: 'Spark jobs and streaming applications'
    },
    {
      id: 'kafka',
      name: 'Apache Kafka',
      icon: '/icons/sources/kafka.png',
      description: 'Kafka topics and message streams'
    },
    {
      id: 'airflow',
      name: 'Apache Airflow',
      icon: '/icons/sources/airflow.png',
      description: 'DAGs and workflow orchestration'
    },
    {
      id: 'database',
      name: 'Database',
      icon: '/icons/sources/postgresql.png',
      description: 'SQL databases and tables'
    },
    {
      id: 'custom',
      name: 'Custom Source',
      icon: '/icons/sources/custom.png',
      description: 'Custom data source integration'
    }
  ]

  useEffect(() => {
    // Load existing sources
    const loadSources = async () => {
      try {
        // TODO: Load from API
        setSources([
          {
            id: '1',
            name: 'Production Spark Cluster',
            type: 'spark',
            status: 'connected',
            lastSync: '2024-01-15 10:30:00',
            description: 'Main Spark cluster for ETL jobs'
          },
          {
            id: '2',
            name: 'Kafka Event Streams',
            type: 'kafka',
            status: 'connected',
            lastSync: '2024-01-15 10:25:00',
            description: 'Real-time event streaming'
          }
        ])
      } catch (error) {
        console.error('Failed to load sources:', error)
      }
    }

    loadSources()
  }, [])

  const handleTestConnection = async () => {
    if (!formData.connectionString.trim()) {
      setConnectionStatus('error')
      setConnectionMessage('Please enter a connection string')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')
    setConnectionMessage('')

    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock connection test logic
      const isValidConnection = formData.connectionString.includes('://') &&
                                formData.username.trim() !== '' &&
                                formData.password.trim() !== ''

      if (isValidConnection) {
        setConnectionStatus('success')
        setConnectionMessage('Connection successful!')
      } else {
        setConnectionStatus('error')
        setConnectionMessage('Invalid connection parameters')
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionMessage('Connection failed: ' + (error as Error).message)
    } finally {
      setTestingConnection(false)
    }
  }

  const handleAddSource = () => {
    const newSource: DataSource = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      status: connectionStatus === 'success' ? 'connected' : 'error',
      lastSync: new Date().toISOString(),
      description: formData.description
    }

    setSources(prev => [...prev, newSource])
    setShowAddForm(false)
    setFormData({
      name: '',
      type: 'spark',
      connectionString: '',
      username: '',
      password: '',
      description: ''
    })
    setConnectionStatus('idle')
    setConnectionMessage('')
  }

  const handleDeleteSource = (sourceId: string) => {
    if (window.confirm('Are you sure you want to delete this data source?')) {
      setSources(prev => prev.filter(s => s.id !== sourceId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return '#10b981'
      case 'disconnected': return '#6b7280'
      case 'error': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '🟢'
      case 'disconnected': return '⚪'
      case 'error': return '🔴'
      default: return '⚪'
    }
  }

  return (
    <div className="add-source">
      <div className="page-header">
        <div className="header-content">
          <h1>Data Sources</h1>
          <p>Connect and manage your data sources for lineage tracking</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <span className="btn-icon">➕</span>
          Add Data Source
        </button>
      </div>

      <div className="page-content">
        {/* Data Source Types Overview */}
        <div className="source-types">
          <h2>Supported Data Sources</h2>
          <div className="types-grid">
            {dataSourceTypes.map(type => (
              <div key={type.id} className="type-card">
                <div className="type-icon">
                  <img src={type.icon} alt={type.name} className="type-icon-img" />
                </div>
                <h3>{type.name}</h3>
                <p>{type.description}</p>
                <div className="type-status">
                  <span className="status-dot connected"></span>
                  <span>Supported</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Sources */}
        <div className="sources-list">
          <h2>Connected Sources</h2>
          {sources.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>No data sources connected</h3>
              <p>Add your first data source to start tracking lineage</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowAddForm(true)}
              >
                Add Data Source
              </button>
            </div>
          ) : (
            <div className="sources-grid">
              {sources.map(source => (
                <div key={source.id} className="source-card">
                  <div className="card-header">
                    <div className="source-info">
                      <div className="source-icon">
                        <img
                          src={dataSourceTypes.find(t => t.id === source.type)?.icon}
                          alt={source.type}
                          className="source-icon-img"
                        />
                      </div>
                      <div>
                        <h3>{source.name}</h3>
                        <p>{source.description}</p>
                      </div>
                    </div>
                    <div className="source-status">
                      <span className="status-icon">{getStatusIcon(source.status)}</span>
                      <span
                        className="status-text"
                        style={{ color: getStatusColor(source.status) }}
                      >
                        {source.status}
                      </span>
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="source-metrics">
                      <div className="metric">
                        <span className="metric-label">Type:</span>
                        <span className="metric-value">{source.type}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Last Sync:</span>
                        <span className="metric-value">{source.lastSync}</span>
                      </div>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="btn btn-sm btn-secondary">
                      Configure
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      Test Connection
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteSource(source.id)}
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

      {/* Add Source Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Data Source</h2>
              <button
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="form-group">
                <label>Source Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter source name"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Source Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DataSource['type'] }))}
                  className="form-select"
                >
                  {dataSourceTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Connection String</label>
                <div className="connection-input-group">
                  <input
                    type="text"
                    value={formData.connectionString}
                    onChange={(e) => setFormData(prev => ({ ...prev, connectionString: e.target.value }))}
                    placeholder="jdbc:postgresql://localhost:5432/db"
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary test-connection-btn"
                    onClick={handleTestConnection}
                    disabled={testingConnection || !formData.connectionString.trim()}
                  >
                    {testingConnection ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
                {connectionMessage && (
                  <div className={`connection-message ${connectionStatus}`}>
                    <span className="connection-icon">
                      {connectionStatus === 'success' ? '✅' : connectionStatus === 'error' ? '❌' : '⏳'}
                    </span>
                    <span>{connectionMessage}</span>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Username"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this data source"
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
                onClick={handleAddSource}
                disabled={!formData.name.trim()}
              >
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
