import { useEffect, useState } from 'react'
import { Node } from '../types'
import { lineageApi } from '../api/client'
import './NodeDetailsPanel.css'

interface NodeDetailsPanelProps {
  node: Node
  onClose: () => void
}

export function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  const [details, setDetails] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNodeDetails()
  }, [node.id])

  const loadNodeDetails = async () => {
    try {
      setLoading(true)
      const data = await lineageApi.getNodeDetails(node.id)
      setDetails(data)
    } catch (err) {
      console.error('Failed to load node details:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="node-details-panel">
      <div className="panel-header">
        <h3>Node Details</h3>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="panel-content">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            <div className="detail-group">
              <label>ID</label>
              <p>{details?.id || node.id}</p>
            </div>
            <div className="detail-group">
              <label>Label</label>
              <p>{details?.label || node.label}</p>
            </div>
            <div className="detail-group">
              <label>Type</label>
              <p className="type-badge">{details?.type || node.type}</p>
            </div>
            {details?.metadata && (
              <div className="detail-group">
                <label>Metadata</label>
                <pre>{JSON.stringify(details.metadata, null, 2)}</pre>
              </div>
            )}
            {details?.properties && (
              <div className="detail-group">
                <label>Properties</label>
                <pre>{JSON.stringify(details.properties, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
