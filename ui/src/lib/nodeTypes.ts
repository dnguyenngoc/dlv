export type NodeTypeKey = 'postgres' | 'api' | 'airflow'

export type NodeTypeSpec = {
  key: NodeTypeKey
  label: string
  icon: string
  defaultConnection?: string
  toDisplayTarget: (connection: string) => string
}

function parsePostgresTarget(conn: string): string {
  try {
    const withoutScheme = conn.replace(/^postgres(ql)?:\/\//, '')
    const atIdx = withoutScheme.indexOf('@')
    const hostPart = atIdx >= 0 ? withoutScheme.slice(atIdx + 1) : withoutScheme
    const slashIdx = hostPart.indexOf('/')
    const hostPort = slashIdx >= 0 ? hostPart.slice(0, slashIdx) : hostPart
    const dbName = slashIdx >= 0 ? hostPart.slice(slashIdx + 1) : ''
    return dbName ? `${hostPort} · ${dbName}` : hostPort
  } catch { return '' }
}

function parseApiTarget(conn: string): string {
  try { const u = new URL(conn); return u.host } catch { return '' }
}

function parseAirflowTarget(conn: string): string {
  try {
    const u = new URL(conn)
    // Remove username:password if present
    const host = u.host
    return host
  } catch { return '' }
}

export const nodeTypes: Record<NodeTypeKey, NodeTypeSpec> = {
  postgres: {
    key: 'postgres',
    label: 'PostgreSQL',
    icon: '/icons/nodes/postgres.png',
    defaultConnection: 'postgresql://postgres:postgres@postgres:5432/dlv',
    toDisplayTarget: parsePostgresTarget,
  },
  api: {
    key: 'api',
    label: 'API',
    icon: '',
    defaultConnection: 'https://api.example.com?key=...',
    toDisplayTarget: parseApiTarget,
  },
  airflow: {
    key: 'airflow',
    label: 'Airflow',
    icon: '/icons/nodes/airflow.png',
    defaultConnection: 'http://admin:admin@localhost:8080',
    toDisplayTarget: parseAirflowTarget,
  },
}

export const nodeTypeOptions = Object.values(nodeTypes).map(t => ({ value: t.key, label: t.label }))
