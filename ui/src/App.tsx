import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboards } from './pages/Dashboards'
import { Nodes } from './pages/Nodes'
import { Lineage } from './pages/Lineage'

export function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboards" replace />} />
        <Route path="/dashboards" element={<Dashboards />} />
        <Route path="/nodes" element={<Nodes />} />
        <Route path="/lineage" element={<Lineage />} />
      </Routes>
    </AppLayout>
  )
}
