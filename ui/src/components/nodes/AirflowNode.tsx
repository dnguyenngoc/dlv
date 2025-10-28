import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import './NodeComponents.css'

export function AirflowNode({ data }: NodeProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
        return '#10b981'
      case 'success':
        return '#3b82f6'
      case 'failed':
        return '#ef4444'
      case 'queued':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="airflow-node">
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <div className="node-icon airflow-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
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
          <span className="detail-label">DAG ID:</span>
          <span className="detail-value">{data.dagId}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Last Run:</span>
          <span className="detail-value">{data.lastRun}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Next Run:</span>
          <span className="detail-value">{data.nextRun}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
