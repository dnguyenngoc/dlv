import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { Protected } from './components/Protected'
import { Dashboards } from './pages/Dashboards'
import { Nodes } from './pages/Nodes'
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
          <Protected>
            <AppLayout>
              <Dashboards />
            </AppLayout>
          </Protected>
        }
      />
      <Route
        path="/nodes"
        element={
          <Protected>
            <AppLayout>
              <Nodes />
            </AppLayout>
          </Protected>
        }
      />
    </Routes>
  )
}
