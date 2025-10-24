import { useEffect, useState, useRef } from 'react'
import { LineageGraph, Node, Edge } from '../types'
import { lineageApi } from '../api/client'
import { GraphVisualization } from '../components/GraphVisualization'
import { NodeDetailsPanel } from '../components/NodeDetailsPanel'
import './LineageView.css'

export function LineageView() {
  const [graph, setGraph] = useState<LineageGraph>({ nodes: [], edges: [] })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGraph()
    
    // Set up WebSocket for real-time updates
    const ws = new WebSocket(`ws://localhost:8080/ws/lineage`)
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)
      handleGraphUpdate(update)
    }

    ws.onerror = () => {
      console.error('WebSocket connection error')
    }

    return () => {
      ws.close()
    }
  }, [])

  const loadGraph = async () => {
    try {
      setLoading(true)
      const data = await lineageApi.getGraph()
      setGraph(data)
      setError(null)
    } catch (err) {
      setError('Failed to load lineage graph')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGraphUpdate = (update: Partial<LineageGraph>) => {
    setGraph((prev) => ({
      nodes: update.nodes || prev.nodes,
      edges: update.edges || prev.edges,
    }))
  }

  const handleNodeClick = (node: Node) => {
    setSelectedNode(node)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading lineage graph...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={loadGraph}>Retry</button>
      </div>
    )
  }

  return (
    <div className="lineage-view">
      <div className="lineage-main">
        <GraphVisualization
          graph={graph}
          onNodeClick={handleNodeClick}
          selectedNode={selectedNode}
        />
      </div>
      {selectedNode && (
        <NodeDetailsPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}

