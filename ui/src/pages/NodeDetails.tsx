import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Node } from '../types'
import { lineageApi } from '../api/client'
import './NodeDetails.css'

export function NodeDetails() {
  const { id } = useParams<{ id: string }>()
  const [node, setNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadNode(id)
    }
  }, [id])

  const loadNode = async (nodeId: string) => {
    try {
      setLoading(true)
      const data = await lineageApi.getNodeDetails(nodeId)
      setNode(data)
    } catch (err) {
      console.error('Failed to load node:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading node details...</div>
  }

  if (!node) {
    return <div className="error">Node not found</div>
  }

  return (
    <div className="node-details-page">
      <h1>{node.label}</h1>
      <div className="details-grid">
        <div className="detail-card">
          <h3>Basic Information</h3>
          <div className="detail-item">
            <label>ID</label>
            <p>{node.id}</p>
          </div>
          <div className="detail-item">
            <label>Type</label>
            <p className="type-badge">{node.type}</p>
          </div>
        </div>
        {node.metadata && (
          <div className="detail-card">
            <h3>Metadata</h3>
            <pre>{JSON.stringify(node.metadata, null, 2)}</pre>
          </div>
        )}
        {node.properties && (
          <div className="detail-card">
            <h3>Properties</h3>
            <pre>{JSON.stringify(node.properties, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

