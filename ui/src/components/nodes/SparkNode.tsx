import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import './NodeComponents.css'

export function SparkNode({ data }: NodeProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return '#10b981'
      case 'completed':
        return '#3b82f6'
      case 'failed':
        return '#ef4444'
      case 'pending':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="spark-node">
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <div className="node-icon spark-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            <circle cx="12" cy="12" r="2" fill="white"/>
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
          <span className="detail-label">Job ID:</span>
          <span className="detail-value">{data.jobId}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Throughput:</span>
          <span className="detail-value">{data.throughput}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Executors:</span>
          <span className="detail-value">{data.executors}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
