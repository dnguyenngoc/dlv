import React from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react'
import './EdgeComponents.css'

export function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
        return '#10b981'
      case 'warning':
        return '#f59e0b'
      case 'error':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  const getEdgeStyle = () => {
    const status = data?.status || 'healthy'
    const color = getStatusColor(status)

    return {
      ...style,
      stroke: color,
      strokeWidth: 2,
      strokeDasharray: status === 'warning' ? '5,5' : 'none',
    }
  }

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={getEdgeStyle()}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="edge-label"
        >
          <div className="edge-label-content">
            {data?.throughput && (
              <div className="edge-metric">
                <span className="metric-icon">📊</span>
                <span>{data.throughput}</span>
              </div>
            )}
            {data?.latency && (
              <div className="edge-metric">
                <span className="metric-icon">⏱️</span>
                <span>{data.latency}</span>
              </div>
            )}
            {data?.schedule && (
              <div className="edge-metric">
                <span className="metric-icon">⏰</span>
                <span>{data.schedule}</span>
              </div>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
