export interface Node {
  id: string
  label: string
  type: 'table' | 'transformation' | 'topic' | 'view'
  metadata?: Record<string, unknown>
  properties?: Record<string, unknown>
}

export interface Edge {
  id: string
  source: string
  target: string
  type: 'reads' | 'writes' | 'transforms' | 'dependsOn'
  metadata?: Record<string, unknown>
}

export interface LineageGraph {
  nodes: Node[]
  edges: Edge[]
}

export interface SparkJob {
  appId: string
  name: string
  startTime: number
  endTime?: number
  status: string
  tablesRead: string[]
  tablesWritten: string[]
}

export interface SearchResult {
  nodes: Node[]
  edges: Edge[]
  totalNodes: number
  totalEdges: number
}
