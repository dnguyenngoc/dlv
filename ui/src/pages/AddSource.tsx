import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { lineageApi } from '../api/client'
import SourceCard from '../components/SourceCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { DataSource } from '../types'
import './AddSource.css'

export function AddSource() {
  const [sources, setSources] = useState<DataSource[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'spark' as DataSource['type'],
    connectionString: '',
    description: ''
  })
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionMessage, setConnectionMessage] = useState('')
  const [editingSource, setEditingSource] = useState<DataSource | null>(null)
  const [analyzingSource, setAnalyzingSource] = useState<string | null>(null)
  const [sourceAnalysis, setSourceAnalysis] = useState<{[key: string]: any}>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

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
      setIsLoading(true)
      setError(null)
      try {
        const sourcesData = await lineageApi.getSources()
        setSources(sourcesData.map((source: any) => ({
          id: source.id.toString(),
          name: source.name,
          type: source.type,
          status: source.status || 'disconnected',
          lastSync: source.lastSync ? new Date(source.lastSync).toLocaleString() : 'Never',
          description: source.description,
          connectionString: source.connection_string,
          username: source.username,
          password: source.password
        })))
      } catch (error) {
        console.error('Failed to load sources:', error)
        setError('Failed to load data sources. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    loadSources()
  }, [])

  // Auto-refresh source status every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const refreshSourceStatus = async () => {
        try {
          const sourcesData = await lineageApi.getSources()
          setSources(prevSources =>
            prevSources.map(prevSource => {
              const updatedSource = sourcesData.find((s: any) => s.id.toString() === prevSource.id)
              if (updatedSource) {
                return {
                  ...prevSource,
                  status: updatedSource.status || prevSource.status, // Keep previous status if backend doesn't have it
                  lastSync: updatedSource.lastSync ? new Date(updatedSource.lastSync).toLocaleString() : prevSource.lastSync
                }
              }
              return prevSource
            })
          )
        } catch (error) {
          console.error('Failed to refresh source status:', error)
        }
      }
      refreshSourceStatus()
    }, 5 * 60 * 1000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  // Manual refresh function
  const handleRefreshStatus = useCallback(async () => {
    try {
      const sourcesData = await lineageApi.getSources()
      setSources(prevSources =>
        prevSources.map(prevSource => {
          const updatedSource = sourcesData.find((s: any) => s.id.toString() === prevSource.id)
          if (updatedSource) {
            return {
              ...prevSource,
              status: updatedSource.status || prevSource.status, // Keep previous status if backend doesn't have it
              lastSync: updatedSource.lastSync ? new Date(updatedSource.lastSync).toLocaleString() : prevSource.lastSync
            }
          }
          return prevSource
        })
      )
    } catch (error) {
      console.error('Failed to refresh source status:', error)
    }
  }, [])

  const handleTestConnection = async () => {
    if (!formData.connectionString || !formData.connectionString.trim()) {
      setConnectionStatus('error')
      setConnectionMessage('Please enter a connection string')
      return
    }

    setTestingConnection(true)
    setConnectionStatus('idle')
    setConnectionMessage('Testing connection...')

    try {
      // Extract username and password from connection string
      let username = ''
      let password = ''

      const connectionString = formData.connectionString.trim()
      const urlMatch = connectionString.match(/(?:postgresql|postgres):\/\/([^:]+):([^@]+)@/)
      if (urlMatch) {
        username = urlMatch[1]
        password = urlMatch[2]
      }

      const result = await lineageApi.testSourceConnection({
        connection_string: connectionString,
        username: username,
        password: password,
        type: formData.type
      })

      if (result.success) {
        setConnectionStatus('success')
        setConnectionMessage(`✅ Connection successful! (${result.latency_ms}ms) - SSL automatically disabled for testing`)
      } else {
        setConnectionStatus('error')
        setConnectionMessage(`❌ ${result.message}`)
      }
    } catch (error: any) {
      setConnectionStatus('error')
      setConnectionMessage(`❌ ${error.response?.data?.error || 'Connection failed'}`)
    } finally {
      setTestingConnection(false)
    }
  }

  const handleAddSource = async () => {
    // Clear previous errors
    setFormErrors({})

    // Validate required fields for saving
    const errors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      errors.name = 'Please enter a source name'
    }
    if (!formData.connectionString.trim()) {
      errors.connectionString = 'Please enter a connection string'
    }

    // Check for duplicate source names
    const trimmedName = formData.name.trim()
    if (trimmedName) {
      const existingSource = sources.find(source =>
        source.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (existingSource) {
        errors.name = `A source with the name "${trimmedName}" already exists. Please choose a different name.`
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first')
      window.location.href = '/login'
      return
    }

    console.log('Creating source with data:', {
      name: formData.name,
      type: formData.type,
      connectionString: formData.connectionString,
      description: formData.description
    })

    try {
      // Extract username and password from connection string
      let username = ''
      let password = ''

      const connectionString = formData.connectionString
      const urlMatch = connectionString.match(/(?:postgresql|postgres):\/\/([^:]+):([^@]+)@/)
      if (urlMatch) {
        username = urlMatch[1]
        password = urlMatch[2]
      }

      const newSource = await lineageApi.createSource({
        name: formData.name,
        type: formData.type,
        connection_string: formData.connectionString,
        username: username,
        password: password,
        description: formData.description
      })

      // Add to local state
      setSources(prev => [...prev, {
        id: newSource.id.toString(),
        name: newSource.name,
        type: newSource.type,
        status: newSource.status || 'disconnected',
        lastSync: newSource.lastSync ? new Date(newSource.lastSync).toLocaleString() : 'Never',
        description: newSource.description,
        connectionString: newSource.connection_string,
        username: newSource.username,
        password: newSource.password
      }])

      setShowAddForm(false)
      setFormData({
        name: '',
        type: 'spark',
        connectionString: '',
        description: ''
      })
      setConnectionStatus('idle')
      setConnectionMessage('')
      setFormErrors({})
    } catch (error: any) {
      console.error('Failed to create source:', error)

      if (error.response?.status === 401) {
        alert('Session expired. Please login again.')
        window.location.href = '/login'
      } else {
        const errorMessage = error.response?.data?.error || error.message
        if (errorMessage.includes('already exists')) {
          setFormErrors({ name: errorMessage })
        } else {
          alert(`Failed to create source: ${errorMessage}`)
        }
      }
    }
  }


  const handleUpdateSource = async () => {
    if (!editingSource) return

    // Clear previous errors
    setFormErrors({})

    // Validate required fields
    const errors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      errors.name = 'Please enter a source name'
    }
    if (!formData.connectionString.trim()) {
      errors.connectionString = 'Please enter a connection string'
    }

    // Check for duplicate source names (excluding current source being edited)
    const trimmedName = formData.name.trim()
    if (trimmedName) {
      const existingSource = sources.find(source =>
        source.id !== editingSource.id &&
        source.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (existingSource) {
        errors.name = `A source with the name "${trimmedName}" already exists. Please choose a different name.`
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      const updatedSource = await lineageApi.updateSource(parseInt(editingSource.id), {
        name: formData.name,
        type: formData.type,
        connection_string: formData.connectionString,
        description: formData.description
      })

      setSources(prev => prev.map(s =>
        s.id === editingSource.id
          ? { ...s, name: formData.name, type: formData.type, description: formData.description }
          : s
      ))

      setEditingSource(null)
      setShowAddForm(false)
      setFormData({
        name: '',
        type: 'spark',
        connectionString: '',
        description: ''
      })
    } catch (error: any) {
      console.error('Failed to update source:', error)
      const errorMessage = error.response?.data?.error || error.message
      if (errorMessage.includes('already exists')) {
        setFormErrors({ name: errorMessage })
      } else {
        alert(`Failed to update source: ${errorMessage}`)
      }
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

  // Memoized filtered and paginated sources
  const filteredSources = useMemo(() =>
    sources.filter(source =>
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [sources, searchQuery]
  )

  const totalPages = useMemo(() =>
    Math.ceil(filteredSources.length / itemsPerPage),
    [filteredSources.length, itemsPerPage]
  )

  const paginatedSources = useMemo(() =>
    filteredSources.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [filteredSources, currentPage, itemsPerPage]
  )

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    // Scroll to top of sources section
    const sourcesSection = document.getElementById('sources-section')
    if (sourcesSection) {
      sourcesSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleEditSource = useCallback((source: DataSource) => {
    setEditingSource(source)
    setFormData({
      name: source.name,
      type: source.type,
      connectionString: source.connectionString || '',
      description: source.description || ''
    })
    setShowAddForm(true)
    setFormErrors({}) // Clear any previous errors
  }, [])

  const handleTestExistingConnection = useCallback(async (source: DataSource) => {
    if (!source.connectionString || !source.connectionString.trim()) {
      alert('❌ No connection string available for this source')
      return
    }

    try {
      const result = await lineageApi.testSourceConnection({
        connection_string: source.connectionString.trim(),
        username: source.username || '',
        password: source.password || '',
        type: source.type
      })

      if (result.success) {
        alert(`✅ Connection successful! (${result.latency_ms}ms)`)

        // Update status in database
        try {
          await lineageApi.updateSource(parseInt(source.id), {
            status: 'connected'
          })

          // Update local state
          setSources(prev => prev.map(s =>
            s.id === source.id
              ? { ...s, status: 'connected' as const }
              : s
          ))
        } catch (updateError) {
          console.error('Failed to update source status:', updateError)
          // Still update local state even if API call fails
          setSources(prev => prev.map(s =>
            s.id === source.id
              ? { ...s, status: 'connected' as const }
              : s
          ))
        }
      } else {
        alert(`❌ ${result.message}`)

        // Update status in database
        try {
          await lineageApi.updateSource(parseInt(source.id), {
            status: 'error'
          })

          // Update local state
          setSources(prev => prev.map(s =>
            s.id === source.id
              ? { ...s, status: 'error' as const }
              : s
          ))
        } catch (updateError) {
          console.error('Failed to update source status:', updateError)
          // Still update local state even if API call fails
          setSources(prev => prev.map(s =>
            s.id === source.id
              ? { ...s, status: 'error' as const }
              : s
          ))
        }
      }
    } catch (error: any) {
      console.error('Failed to test connection:', error)
      alert(`❌ ${error.response?.data?.error || 'Connection test failed'}`)

      // Update status in database
      try {
        await lineageApi.updateSource(parseInt(source.id), {
          status: 'error'
        })

        // Update local state
        setSources(prev => prev.map(s =>
          s.id === source.id
            ? { ...s, status: 'error' as const }
            : s
        ))
      } catch (updateError) {
        console.error('Failed to update source status:', updateError)
        // Still update local state even if API call fails
        setSources(prev => prev.map(s =>
          s.id === source.id
            ? { ...s, status: 'error' as const }
            : s
        ))
      }
    }
  }, [])

  const handleAnalyzeDatabase = useCallback(async (source: DataSource) => {
    if (source.type !== 'database') {
      alert('Database analysis is only available for database sources')
      return
    }

    setAnalyzingSource(source.id)
    try {
      const analysis = await lineageApi.analyzeDatabase(parseInt(source.id))
      setSourceAnalysis(prev => ({
        ...prev,
        [source.id]: analysis
      }))
    } catch (error: any) {
      console.error('Failed to analyze database:', error)
      alert(`Failed to analyze database: ${error.response?.data?.error || error.message}`)
    } finally {
      setAnalyzingSource(null)
    }
  }, [])

  const handleDeleteSource = useCallback(async (sourceId: string) => {
    try {
      await lineageApi.deleteSource(parseInt(sourceId))
      setSources(prev => prev.filter(s => s.id !== sourceId))
    } catch (error) {
      console.error('Failed to delete source:', error)
    }
  }, [])

  const handleSourceTypeClick = useCallback((typeId: string) => {
    const defaultConnectionStrings = {
      spark: 'spark://localhost:7077',
      kafka: 'kafka://localhost:9092',
      airflow: 'http://localhost:8080',
      database: 'postgresql://postgres:postgres@localhost:5432/dlv',
      custom: 'custom://localhost:8080'
    }

    const defaultDescriptions = {
      spark: 'Apache Spark cluster for big data processing',
      kafka: 'Apache Kafka for real-time event streaming',
      airflow: 'Apache Airflow for workflow orchestration',
      database: 'PostgreSQL database for data storage',
      custom: 'Custom data source integration'
    }

    setFormData({
      name: '',
      type: typeId as DataSource['type'],
      connectionString: defaultConnectionStrings[typeId as keyof typeof defaultConnectionStrings] || '',
      description: defaultDescriptions[typeId as keyof typeof defaultDescriptions] || ''
    })
    setShowAddForm(true)
    setEditingSource(null)
  }, [])

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
          <div className="header-top">
            <Link to="/" className="back-btn">
              <span className="back-icon">←</span>
              Back to Dashboard
            </Link>
          </div>
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
                <div
                  key={type.id}
                  className="type-card"
                  onClick={() => handleSourceTypeClick(type.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSourceTypeClick(type.id)
                    }
                  }}
                >
                  <div className="type-icon">
                    <img src={type.icon} alt={type.name} className="type-icon-img" />
                  </div>
                  <h3>{type.name}</h3>
                  <p>{type.description}</p>
                  <div className="type-status">
                    <span className="status-dot connected"></span>
                    <span>Click to add</span>
                  </div>
                </div>
              ))}
            </div>
        </div>

        {/* Existing Sources */}
        <div className="sources-list" id="sources-section">
          <div className="sources-header">
            <div className="sources-title">
              <h2>Connected Sources</h2>
              <span className="sources-count">{filteredSources.length} sources</span>
            </div>
            <div className="sources-controls">
              <button
                className="btn btn-secondary refresh-btn"
                onClick={handleRefreshStatus}
                title="Refresh source status"
              >
                <span className="btn-icon">🔄</span>
                Refresh
              </button>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
            </div>
          </div>

          {isLoading ? (
            <LoadingSkeleton count={6} />
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Failed to load sources</h3>
              <p>{error}</p>
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : sources.length === 0 ? (
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
            <>
              <div className="sources-grid-modern">
                {paginatedSources.map(source => (
                  <SourceCard
                    key={source.id}
                    source={source}
                    dataSourceTypes={dataSourceTypes}
                    onEdit={handleEditSource}
                    onTest={handleTestExistingConnection}
                    onAnalyze={handleAnalyzeDatabase}
                    onDelete={handleDeleteSource}
                    isAnalyzing={analyzingSource === source.id}
                    analysis={sourceAnalysis[source.id]}
                    getStatusColor={getStatusColor}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>

                  <div className="pagination-pages">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Source Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingSource ? 'Edit Data Source' : 'Add New Data Source'}</h2>
              <button
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false)
                  setEditingSource(null)
                  setFormData({
                    name: '',
                    type: 'spark',
                    connectionString: '',
                    description: ''
                  })
                }}
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
                  className={`form-input ${formErrors.name ? 'error' : ''}`}
                />
                {formErrors.name && (
                  <div className="form-error">{formErrors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label>Source Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value as DataSource['type']
                    const defaultConnectionStrings = {
                      spark: 'spark://localhost:7077',
                      kafka: 'kafka://localhost:9092',
                      airflow: 'http://localhost:8080',
                      database: 'postgresql://postgres:postgres@localhost:5432/dlv',
                      custom: 'custom://localhost:8080'
                    }
                    const defaultDescriptions = {
                      spark: 'Apache Spark cluster for big data processing',
                      kafka: 'Apache Kafka for real-time event streaming',
                      airflow: 'Apache Airflow for workflow orchestration',
                      database: 'PostgreSQL database for data storage',
                      custom: 'Custom data source integration'
                    }
                    setFormData(prev => ({
                      ...prev,
                      type: newType,
                      connectionString: defaultConnectionStrings[newType] || '',
                      description: defaultDescriptions[newType] || ''
                    }))
                  }}
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
                          placeholder="postgresql://postgres:postgres@localhost:5432/dlv"
                          className={`form-input ${formErrors.connectionString ? 'error' : ''}`}
                        />
                        <button
                          type="button"
                          className={`btn btn-sm btn-secondary test-connection-btn ${testingConnection ? 'loading' : ''}`}
                          onClick={handleTestConnection}
                          disabled={testingConnection || !formData.connectionString.trim()}
                        >
                          {testingConnection ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
                      <div className="form-help">
                        💡 Include credentials in connection string: postgresql://username:password@host:port/database
                        <br />
                        🔒 SSL will be automatically disabled during connection testing
                      </div>
                      {connectionMessage && (
                        <div className={`connection-message ${connectionStatus}`}>
                          <span className="connection-icon">
                            {connectionStatus === 'success' ? '✅' : connectionStatus === 'error' ? '❌' : '⏳'}
                          </span>
                          <span>{connectionMessage}</span>
                        </div>
                      )}
                      {formErrors.connectionString && (
                        <div className="form-error">{formErrors.connectionString}</div>
                      )}
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
                onClick={editingSource ? handleUpdateSource : handleAddSource}
                disabled={!formData.name.trim()}
              >
                {editingSource ? 'Update Source' : 'Add Source'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
