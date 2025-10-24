import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Header />
      <div className="layout-body">
        <Sidebar />
        <main className="layout-content">{children}</main>
      </div>
    </div>
  )
}
