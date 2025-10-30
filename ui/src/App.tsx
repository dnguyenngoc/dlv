import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Dashboards } from './pages/Dashboards'
import { Nodes } from './pages/Nodes'
import { Lineage } from './pages/Lineage'
import { Login } from './pages/Login'

export function App() {
  return (
    <Routes>
      {/* Standalone auth page (no app shell) */}
      <Route path="/login" element={<Login />} />

      {/* App shell routes */}
      <Route
        path="/"
        element={
          <AppLayout>
            <Navigate to="/dashboards" replace />
          </AppLayout>
        }
      />
      <Route
        path="/dashboards"
        element={
          <AppLayout>
            <Dashboards />
          </AppLayout>
        }
      />
      <Route
        path="/nodes"
        element={
          <AppLayout>
            <Nodes />
          </AppLayout>
        }
      />
      <Route
        path="/lineage"
        element={
          <AppLayout>
            <Lineage />
          </AppLayout>
        }
      />
    </Routes>
  )
}
