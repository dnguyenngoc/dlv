import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../lib/auth'

export function Protected({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return children
}
