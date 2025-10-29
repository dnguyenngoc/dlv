import axios from 'axios'
import { LineageGraph, SearchResult, Node, Edge } from '../types'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080/api/v1'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

interface Dashboard {
  id: string
  name: string
  description: string
  isDefault: boolean
  permissions: {
    read: string[]
    write: string[]
  }
  nodes: Node[]
  edges: Edge[]
  createdAt: string
  updatedAt: string
}

export const lineageApi = {
  getGraph: async (): Promise<LineageGraph> => {
    const response = await client.get('/lineage/graph')
    return response.data
  },

  getNodes: async (): Promise<Node[]> => {
    const response = await client.get('/lineage/nodes')
    return response.data
  },

  getEdges: async (): Promise<Edge[]> => {
    const response = await client.get('/lineage/edges')
    return response.data
  },

  search: async (query: string): Promise<SearchResult> => {
    const response = await client.get('/lineage/search', {
      params: { q: query },
    })
    return response.data
  },

  getNodeDetails: async (nodeId: string): Promise<Node> => {
    const response = await client.get(`/lineage/nodes/${nodeId}`)
    return response.data
  },

  // Source management APIs
      getSources: async (): Promise<any[]> => {
        try {
          const response = await client.get('/sources')
          return response.data
        } catch (error) {
          console.warn('Sources API not available, returning empty array')
          return []
        }
      },

  createSource: async (source: any): Promise<any> => {
    try {
      const response = await client.post('/sources', source)
      return response.data
    } catch (error) {
      console.error('Failed to create source:', error)
      throw error
    }
  },

  updateSource: async (id: number, source: any): Promise<any> => {
    try {
      const response = await client.put(`/sources/${id}`, source)
      return response.data
    } catch (error) {
      console.error('Failed to update source:', error)
      throw error
    }
  },

  deleteSource: async (id: number): Promise<void> => {
    try {
      await client.delete(`/sources/${id}`)
    } catch (error) {
      console.error('Failed to delete source:', error)
      throw error
    }
  },

      testSourceConnection: async (connectionData: any): Promise<any> => {
        try {
          const response = await client.post('/sources/test', connectionData)
          return response.data
        } catch (error) {
          console.error('Failed to test connection:', error)
          throw error
        }
      },

      analyzeDatabase: async (sourceId: number): Promise<any> => {
        try {
          const response = await client.post(`/sources/${sourceId}/analyze`)
          return response.data
        } catch (error) {
          console.error('Failed to analyze database:', error)
          throw error
        }
      },

  // Dashboard management APIs
  getDashboards: async (): Promise<Dashboard[]> => {
    try {
      const response = await client.get('/dashboards')
      return response.data
    } catch (error) {
      // Fallback to demo data if API not available
      console.warn('Dashboard API not available, using demo data')
      return [
        {
          id: 'demo',
          name: 'Demo Dashboard',
          description: 'Default demo dashboard with sample data',
          isDefault: true,
          permissions: { read: ['*'], write: ['admin'] },
          nodes: [],
          edges: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    }
  },

  saveDashboard: async (dashboard: Dashboard): Promise<Dashboard> => {
    try {
      const response = await client.post('/dashboards', dashboard)
      return response.data
    } catch (error) {
      console.warn('Save dashboard API not available, saving locally')
      // Save to localStorage as fallback
      const savedDashboards = JSON.parse(localStorage.getItem('dashboards') || '[]')
      const updatedDashboards = savedDashboards.filter((d: Dashboard) => d.id !== dashboard.id)
      updatedDashboards.push(dashboard)
      localStorage.setItem('dashboards', JSON.stringify(updatedDashboards))
      return dashboard
    }
  },

  deleteDashboard: async (dashboardId: string): Promise<void> => {
    try {
      await client.delete(`/dashboards/${dashboardId}`)
    } catch (error) {
      console.warn('Delete dashboard API not available, removing locally')
      const savedDashboards = JSON.parse(localStorage.getItem('dashboards') || '[]')
      const updatedDashboards = savedDashboards.filter((d: Dashboard) => d.id !== dashboardId)
      localStorage.setItem('dashboards', JSON.stringify(updatedDashboards))
    }
  }
}

export default client
