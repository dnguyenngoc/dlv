import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LineageView } from './pages/LineageView'
import { NodeDetails } from './pages/NodeDetails'
import { SearchPage } from './pages/SearchPage'
import { Layout } from './components/Layout'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LineageView />} />
          <Route path="/node/:id" element={<NodeDetails />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App

