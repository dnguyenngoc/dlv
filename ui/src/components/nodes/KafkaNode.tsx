import React from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import './NodeComponents.css'

export function KafkaNode({ data }: NodeProps) {
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
    <div className="kafka-node">
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <div className="node-icon kafka-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            <circle cx="12" cy="12" r="3" fill="white"/>
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
          <span className="detail-label">Topic:</span>
          <span className="detail-value">{data.topic}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Throughput:</span>
          <span className="detail-value">{data.throughput}</span>
        </div>
        <div className="node-detail">
          <span className="detail-label">Partitions:</span>
          <span className="detail-value">{data.partitions}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  )
}
