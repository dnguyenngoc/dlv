import { useEffect, useRef } from 'react'
import cytoscape from 'cytoscape'
import cytoscapeCoseBilkent from 'cytoscape-cose-bilkent'
import cytoscapeDagre from 'cytoscape-dagre'
import { LineageGraph, Node } from '../types'
import './GraphVisualization.css'

cytoscape.use(cytoscapeCoseBilkent)
cytoscape.use(cytoscapeDagre)

interface GraphVisualizationProps {
  graph: LineageGraph
  onNodeClick: (node: Node) => void
  selectedNode: Node | null
}

export function GraphVisualization({
  graph,
  onNodeClick,
  selectedNode,
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<cytoscape.Core | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...graph.nodes.map((node) => ({
          data: {
            id: node.id,
            label: node.label,
            type: node.type,
            ...node.properties,
          },
        })),
        ...graph.edges.map((edge) => ({
          data: {
            id: edge.id,
            source: edge.source,
            target: edge.target,
            type: edge.type,
          },
        })),
      ],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#1976d2',
            'label': 'data(label)',
            'width': 80,
            'height': 80,
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#fff',
            'font-size': '12px',
            'font-weight': 'bold',
            'shape': 'round-rectangle',
          },
        },
        {
          selector: 'node[type="table"]',
          style: {
            'background-color': '#388e3c',
          },
        },
        {
          selector: 'node[type="transformation"]',
          style: {
            'background-color': '#f57c00',
          },
        },
        {
          selector: 'node[type="topic"]',
          style: {
            'background-color': '#7b1fa2',
          },
        },
        {
          selector: 'node[type="view"]',
          style: {
            'background-color': '#0288d1',
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#666',
            'target-arrow-color': '#666',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[type="reads"]',
          style: {
            'line-color': '#4caf50',
          },
        },
        {
          selector: 'edge[type="writes"]',
          style: {
            'line-color': '#f44336',
          },
        },
        {
          selector: 'edge[type="transforms"]',
          style: {
            'line-color': '#ff9800',
          },
        },
      ],
      layout: {
        name: 'cose-bilkent',
        nodeDimensionsIncludeLabels: true,
        animate: true,
        animationDuration: 1000,
      },
    })

    cyRef.current = cy

    cy.on('tap', 'node', (evt) => {
      const node = graph.nodes.find((n) => n.id === evt.target.id())
      if (node) {
        onNodeClick(node)
      }
    })

    return () => {
      cy.destroy()
    }
  }, [graph.nodes.length, graph.edges.length])

  useEffect(() => {
    if (!cyRef.current || !selectedNode) return

    cyRef.current.$(`#${selectedNode.id}`).select()
  }, [selectedNode])

  return (
    <div className="graph-visualization">
      <div ref={containerRef} className="cytoscape-container" />
      <div className="graph-controls">
        <button onClick={() => cyRef.current?.fit()}>Fit</button>
        <button onClick={() => cyRef.current?.center()}>Center</button>
      </div>
    </div>
  )
}

