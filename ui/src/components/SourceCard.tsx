import React, { memo, useState } from 'react'
import { DataSource } from '../types'
import './SourceCard.css'

interface SourceCardProps {
  source: DataSource
  dataSourceTypes: Array<{
    id: string
    name: string
    icon: string
    description: string
  }>
  onEdit: (source: DataSource) => void
  onTest: (source: DataSource) => void
  onAnalyze: (source: DataSource) => void
  onDelete: (sourceId: string) => void
  isAnalyzing: boolean
  analysis?: any
  getStatusColor: (status: string) => string
}

const SourceCard = memo(({
  source,
  dataSourceTypes,
  onEdit,
  onTest,
  onAnalyze,
  onDelete,
  isAnalyzing,
  analysis,
  getStatusColor
}: SourceCardProps) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const sourceType = dataSourceTypes.find(t => t.id === source.type)
  const statusColor = getStatusColor(source.status)

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(source.id)
      setShowDeleteConfirm(false)
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 3000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      action()
    }
  }

  return (
    <div
      className="source-card-modern"
      role="button"
      tabIndex={0}
      aria-label={`${source.name} - ${source.type} data source`}
    >
      {/* Card Header */}
      <div className="card-header-modern">
        <div className="source-icon-modern">
          <img
            src={sourceType?.icon}
            alt={sourceType?.name}
            className="source-icon-img"
            loading="lazy"
          />
          <div className="icon-badge">
            <span className="icon-badge-text">{source.type}</span>
          </div>
        </div>

        <div className="source-info-modern">
          <h3 className="source-name-modern" title={source.name}>
            {source.name}
          </h3>
          {source.description && (
            <p className="source-description" title={source.description}>
              {source.description}
            </p>
          )}
        </div>

        <div className="status-indicator-modern">
          <div
            className="status-dot-modern"
            style={{ backgroundColor: statusColor }}
            aria-label={`Status: ${source.status}`}
          />
          <span className="status-text-modern">{source.status}</span>
        </div>
      </div>

      {/* Analysis Results */}
      {source.type === 'database' && analysis && (
        <div className="analysis-preview">
          <div className="analysis-stats">
            <span className="stat">
              <strong>{analysis.total_tables}</strong> tables
            </span>
            <span className="stat">
              <strong>{analysis.total_schemas}</strong> schemas
            </span>
            <span className="stat">
              <strong>{analysis.total_views}</strong> views
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="card-actions-modern">
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(source)}
          onKeyDown={(e) => handleKeyDown(e, () => onEdit(source))}
          title="Configure source"
          aria-label="Configure source"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>

        <button
          className="action-btn test-btn"
          onClick={() => onTest(source)}
          onKeyDown={(e) => handleKeyDown(e, () => onTest(source))}
          title="Test connection"
          aria-label="Test connection"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </button>

        {source.type === 'database' && (
          <button
            className="action-btn analyze-btn"
            onClick={() => onAnalyze(source)}
            onKeyDown={(e) => handleKeyDown(e, () => onAnalyze(source))}
            disabled={isAnalyzing}
            title="Analyze database"
            aria-label="Analyze database"
          >
            {isAnalyzing ? (
              <div className="loading-spinner" />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v5h5"/>
                <path d="M21 21v-5h-5"/>
                <path d="M21 3l-7 7"/>
                <path d="M3 21l7-7"/>
              </svg>
            )}
          </button>
        )}

        <button
          className={`action-btn delete-btn ${showDeleteConfirm ? 'confirm' : ''}`}
          onClick={handleDelete}
          onKeyDown={(e) => handleKeyDown(e, handleDelete)}
          title={showDeleteConfirm ? "Click again to confirm" : "Delete source"}
          aria-label={showDeleteConfirm ? "Click again to confirm deletion" : "Delete source"}
        >
          {showDeleteConfirm ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20,6 9,17 4,12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
            </svg>
          )}
        </button>
      </div>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner large" />
            <span>Analyzing...</span>
          </div>
        </div>
      )}
    </div>
  )
})

SourceCard.displayName = 'SourceCard'

export default SourceCard
