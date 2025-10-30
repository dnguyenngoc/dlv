export function Nodes() {
  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Nodes</h2>
      <p className="app-subtle">Browse and manage sources (Spark, Airflow, PostgreSQL).</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-primary" style={{ background: 'var(--color-accent)' }}>Add Node</button>
        <button className="btn-primary">Test Connections</button>
      </div>
    </div>
  )
}
