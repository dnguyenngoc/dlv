import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LineageView } from './pages/LineageView'
import { Dashboard } from './pages/Dashboard'
import { AddSource } from './pages/AddSource'
import { PipelineIntegration } from './pages/PipelineIntegration'
import { NodeDetails } from './pages/NodeDetails'
import { SearchPage } from './pages/SearchPage'
import { LoginPage } from './pages/LoginPage'
import { Layout } from './components/Layout'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
  }

  if (loading) {
    return <div className="loading-container">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sources" element={<AddSource />} />
                  <Route path="/pipelines" element={<PipelineIntegration />} />
                  <Route path="/lineage" element={<LineageView />} />
                  <Route path="/node/:id" element={<NodeDetails />} />
                  <Route path="/search" element={<SearchPage />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
