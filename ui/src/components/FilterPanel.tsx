import React, { useState } from 'react'
import './FilterPanel.css'

interface FilterPanelProps {
  onFilterChange: (filters: FilterState) => void
}

interface FilterState {
  nodeTypes: string[]
  status: string[]
  timeRange: string
  searchQuery: string
}

export function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>({
    nodeTypes: [],
    status: [],
    timeRange: '24h',
    searchQuery: '',
  })

  const nodeTypes = [
    { id: 'spark', label: 'Spark', color: '#f7931e' },
    { id: 'kafka', label: 'Kafka', color: '#4a4a4a' },
    { id: 'airflow', label: 'Airflow', color: '#00a0e1' },
    { id: 'database', label: 'Database', color: '#4a90e2' },
  ]

  const statusOptions = [
    { id: 'active', label: 'Active', color: '#10b981' },
    { id: 'running', label: 'Running', color: '#10b981' },
    { id: 'completed', label: 'Completed', color: '#3b82f6' },
    { id: 'failed', label: 'Failed', color: '#ef4444' },
    { id: 'warning', label: 'Warning', color: '#f59e0b' },
  ]

  const timeRanges = [
    { id: '1h', label: 'Last Hour' },
    { id: '24h', label: 'Last 24 Hours' },
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
  ]

  const handleNodeTypeChange = (nodeType: string) => {
    const newTypes = filters.nodeTypes.includes(nodeType)
      ? filters.nodeTypes.filter(t => t !== nodeType)
      : [...filters.nodeTypes, nodeType]

    const newFilters = { ...filters, nodeTypes: newTypes }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleStatusChange = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]

    const newFilters = { ...filters, status: newStatus }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleTimeRangeChange = (timeRange: string) => {
    const newFilters = { ...filters, timeRange }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearchChange = (searchQuery: string) => {
    const newFilters = { ...filters, searchQuery }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const newFilters = {
      nodeTypes: [],
      status: [],
      timeRange: '24h',
      searchQuery: '',
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filters</h3>
        <button
          className="clear-filters-btn"
          onClick={clearFilters}
          disabled={filters.nodeTypes.length === 0 && filters.status.length === 0 && filters.searchQuery === ''}
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <div className="filter-section">
        <label className="filter-label">Search</label>
        <input
          type="text"
          placeholder="Search nodes..."
          value={filters.searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Time Range */}
      <div className="filter-section">
        <label className="filter-label">Time Range</label>
        <div className="radio-group">
          {timeRanges.map((range) => (
            <label key={range.id} className="radio-item">
              <input
                type="radio"
                name="timeRange"
                value={range.id}
                checked={filters.timeRange === range.id}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
              />
              <span className="radio-label">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Node Types */}
      <div className="filter-section">
        <label className="filter-label">Node Types</label>
        <div className="checkbox-group">
          {nodeTypes.map((type) => (
            <label key={type.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.nodeTypes.includes(type.id)}
                onChange={() => handleNodeTypeChange(type.id)}
              />
              <span
                className="checkbox-indicator"
                style={{ backgroundColor: type.color }}
              />
              <span className="checkbox-label">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="filter-section">
        <label className="filter-label">Status</label>
        <div className="checkbox-group">
          {statusOptions.map((status) => (
            <label key={status.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={filters.status.includes(status.id)}
                onChange={() => handleStatusChange(status.id)}
              />
              <span
                className="checkbox-indicator"
                style={{ backgroundColor: status.color }}
              />
              <span className="checkbox-label">{status.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.nodeTypes.length > 0 || filters.status.length > 0) && (
        <div className="active-filters">
          <h4>Active Filters</h4>
          <div className="filter-tags">
            {filters.nodeTypes.map((type) => (
              <span key={type} className="filter-tag">
                {nodeTypes.find(t => t.id === type)?.label}
                <button
                  onClick={() => handleNodeTypeChange(type)}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            ))}
            {filters.status.map((status) => (
              <span key={status} className="filter-tag">
                {statusOptions.find(s => s.id === status)?.label}
                <button
                  onClick={() => handleStatusChange(status)}
                  className="remove-filter"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
