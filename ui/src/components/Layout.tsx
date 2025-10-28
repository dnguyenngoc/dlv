import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
  onLogout?: () => void
}

export function Layout({ children, onLogout }: LayoutProps) {
  return (
    <div className="layout">
      <div className="layout-body">
        <main className="layout-content">{children}</main>
      </div>
    </div>
  )
}
