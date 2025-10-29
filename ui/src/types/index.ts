export interface DataSource {
  id: string
  name: string
  type: 'spark' | 'kafka' | 'airflow' | 'database' | 'custom'
  connectionString?: string
  username?: string
  password?: string
  description?: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  lastSync: string
}

export interface LineageGraph {
  nodes: Node[]
  edges: Edge[]
}

export interface Node {
  id: string
  type: string
  label: string
  data: any
  position: { x: number; y: number }
}

export interface Edge {
  id: string
  source: string
  target: string
  type: string
  data: any
}

export interface SearchResult {
  nodes: Node[]
  edges: Edge[]
  total: number
}
