import axios from 'axios'
import { LineageGraph, SearchResult, Node } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const lineageApi = {
  getGraph: async (): Promise<LineageGraph> => {
    const response = await client.get('/lineage/graph')
    return response.data
  },

  getNodes: async (): Promise<Node[]> => {
    const response = await client.get('/lineage/nodes')
    return response.data
  },

  getEdges: async (): Promise<any[]> => {
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
}

export default client

