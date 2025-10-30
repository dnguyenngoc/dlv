import { useState } from 'react'

export function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const body = new URLSearchParams()
      body.append('username', username)
      body.append('password', password)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      localStorage.setItem('dlv_token', data.access_token)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark">⎈</div>
          <div>
            <div className="app-title">DLV</div>
            <div className="app-subtle" style={{ fontSize: 12 }}>Data Lineage Visualizer</div>
          </div>
        </div>
        <h2 style={{ margin: '8px 0 4px 0' }}>Sign in</h2>
        <p className="app-subtle" style={{ marginBottom: 16 }}>Use your admin or viewer credentials</p>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              background: 'var(--color-surface-2)', color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,.08)'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: 'var(--color-muted)' }}>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            style={{
              width: '100%', padding: '10px 12px', borderRadius: '10px',
              background: 'var(--color-surface-2)', color: 'var(--color-text)',
              border: '1px solid rgba(255,255,255,.08)'
            }}
          />
        </div>
        {error && (
          <div style={{ color: 'var(--color-danger)', fontSize: 14 }}>{error}</div>
        )}
        <button className="btn-primary" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      </div>
    </div>
  )}
