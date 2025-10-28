import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import './NodeComponents.css'

export function DatabaseNode({ data }: NodeProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981'
      case 'inactive':
        return '#6b7280'
      case 'error':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="database-node">
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <div className="node-icon database-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.58 3 4 4.79 4 7s3.58 4 8 4 8-1.79 8-4-3.58-4-8-4zM4 9c0 2.21 3.58 4 8 4s8-1.79 8-4v2c0 2.21-3.58 4-8 4s-8-1.79-8-4V9zM4 15c0 2.21 3.58 4 8 4s8-1.79 8-4v2c0 2.21-3.58 4-8 4s-8-1.79-8-4v-2z"/>
          </svg>
        </div>
        <div className="node-title">{data.label}</div>
        <div
          className="node-status"
          style={{ backgroundColor: getStatusColor(data.status) }}
        />
      </div>

      <div className="node-content">
        <div className="node-detail">
          <span className="detail-label">Database:</span>
          <span className="detail-value">{data.database}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Table:</span>
          <span className="detail-value">{data.table}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Size:</span>
          <span className="detail-value">{data.size}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
