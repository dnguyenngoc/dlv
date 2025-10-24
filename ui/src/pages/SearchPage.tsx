import { useState } from 'react'
import { SearchResult } from '../types'
import { lineageApi } from '../api/client'
import './SearchPage.css'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    try {
      setLoading(true)
      const data = await lineageApi.search(query)
      setResults(data)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search Lineage</h1>
        <div className="search-bar">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search nodes by name, type, or properties..."
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
      {results && (
        <div className="search-results">
          <div className="results-summary">
            Found {results.totalNodes} nodes and {results.totalEdges} edges
          </div>
          <div className="results-list">
            {results.nodes.map((node) => (
              <div key={node.id} className="result-item">
                <div className="result-label">{node.label}</div>
                <div className="result-type">{node.type}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

