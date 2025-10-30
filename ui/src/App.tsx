import { AppLayout } from './components/layout/AppLayout'

export function App() {
  return (
    <AppLayout>
      <h2 style={{ marginTop: 0 }}>Welcome</h2>
      <p className="app-subtle">Smooth and modern UI foundation is ready.</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button className="btn-primary">Create Dashboard</button>
        <button className="btn-primary" style={{ background: 'var(--color-accent)' }}>Add Node</button>
      </div>
    </AppLayout>
  )
}
