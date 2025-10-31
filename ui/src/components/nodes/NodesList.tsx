import { useEffect, useMemo, useState } from 'react'
import { authFetch } from '../../lib/auth'
import { nodeTypeOptions, nodeTypes } from '../../lib/nodeTypes'

type NodeItem = { id: string; name: string; type: string; status?: string; connection_string?: string }

type Props = {
  onAdd: () => void
  onEdit: (node: NodeItem) => void
}

export function NodesList({ onAdd, onEdit }: Props) {
  const [items, setItems] = useState<NodeItem[] | null>(null)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState<'all' | 'postgres' | 'api' | 'airflow'>('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<'name_asc' | 'name_desc' | 'newest' | 'oldest'>('newest')
  const pageSize = 9

  async function load() {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (debouncedSearch) params.set('q', debouncedSearch.trim())
      if (typeFilter !== 'all') params.set('type', typeFilter)
      params.set('page', String(page))
      params.set('page_size', String(pageSize))
      const [s, o] = sort === 'name_asc' ? ['name','asc']
        : sort === 'name_desc' ? ['name','desc']
        : sort === 'oldest' ? ['created_at','asc']
        : ['created_at','desc']
      params.set('sort', s)
      params.set('order', o)
      const res = await authFetch(`/api/nodes?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load nodes')
      const data = await res.json()
      setItems((data?.items as NodeItem[]) || [])
      setTotal(data?.total || 0)
    } catch (e: any) { setError(e.message || 'Load failed') }
  }

  useEffect(() => { load() }, [page, debouncedSearch, typeFilter, sort])

  useEffect(() => { setPage(1) }, [typeFilter, debouncedSearch, sort])

  // URL sync: read on mount
  useEffect(() => {
    const url = new URL(window.location.href)
    const q = url.searchParams.get('q') || ''
    const t = (url.searchParams.get('type') as any) || 'all'
    const p = parseInt(url.searchParams.get('page') || '1', 10)
    const s = (url.searchParams.get('sortKey') as any) || ''
    const o = (url.searchParams.get('order') as any) || ''
    const combined: any = (s === 'name' && o === 'asc') ? 'name_asc'
      : (s === 'name' && o === 'desc') ? 'name_desc'
      : (s === 'created_at' && o === 'asc') ? 'oldest'
      : (s === 'created_at' && o === 'desc') ? 'newest'
      : ''
    if (q) setSearch(q)
    if (t === 'postgres' || t === 'api' || t === 'airflow' || t === 'all') setTypeFilter(t)
    if (!Number.isNaN(p) && p > 0) setPage(p)
    if (combined) setSort(combined)
  }, [])

  // URL sync: write on changes
  useEffect(() => {
    const url = new URL(window.location.href)
    const [s, o] = sort === 'name_asc' ? ['name','asc']
      : sort === 'name_desc' ? ['name','desc']
      : sort === 'oldest' ? ['created_at','asc']
      : ['created_at','desc']
    if (debouncedSearch) url.searchParams.set('q', debouncedSearch)
    else url.searchParams.delete('q')
    if (typeFilter !== 'all') url.searchParams.set('type', typeFilter)
    else url.searchParams.delete('type')
    url.searchParams.set('page', String(page))
    url.searchParams.set('sortKey', s)
    url.searchParams.set('order', o)
    window.history.replaceState({}, '', url.toString())
  }, [debouncedSearch, typeFilter, page, sort])

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handle)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const paged = items || []

  function getTarget(n: NodeItem): string {
    if (!n.connection_string) return ''
    const spec = nodeTypes[n.type as keyof typeof nodeTypes]
    return spec ? spec.toDisplayTarget(n.connection_string) : ''
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', marginBottom:16, gap:8, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name (server-side)"
            style={{ background:'var(--color-surface)', color:'var(--color-text)', border:'1px solid rgba(255,255,255,.12)', borderRadius:10, padding:'8px 10px' }}
          />
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value as any)}
            style={{ background:'var(--color-surface)', color:'var(--color-text)', border:'1px solid rgba(255,255,255,.12)', borderRadius:10, padding:'8px 10px' }}>
            <option value="all">All</option>
            {nodeTypeOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value as any)}
            style={{ background:'var(--color-surface)', color:'var(--color-text)', border:'1px solid rgba(255,255,255,.12)', borderRadius:10, padding:'8px 10px' }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
          </select>
          <button className="btn-primary" onClick={onAdd}>Add Node</button>
        </div>
      </div>
      {error && (
        <div style={{ display:'flex', justifyContent:'center', marginBottom:16 }}>
          <div role="alert" aria-live="polite"
            style={{ width:'100%', maxWidth:720, display:'flex', alignItems:'center', gap:12, padding:12, borderRadius:12,
                     background:'var(--color-surface)', border:'1px solid rgba(255,255,255,.14)', borderLeft:'4px solid var(--color-danger)'}}>
            <div style={{ fontSize:18 }}>⚠️</div>
            <div style={{ flex:1 }}>
              <div style={{ color:'var(--color-danger)', fontWeight:600 }}>Failed to load nodes</div>
              <div className="app-subtle" style={{ marginTop:2 }}>{error}</div>
            </div>
            <button className="btn-primary" onClick={() => { setError(null); load() }}>Retry</button>
          </div>
        </div>
      )}
      {!items && (
        <div className="grid-skeleton">
          {[...Array(6)].map((_,i)=>(<div key={i} className="card-skeleton" />))}
        </div>
      )}
      {items && total === 0 && (
        <div className="app-subtle">No nodes found. Try adjusting filters or add a new node.</div>
      )}
      {items && total > 0 && (
        <>
          <div className="grid-cards">
            {paged.map(n => (
              <div
                key={n.id}
                className="node-card"
                style={{
                  display:'grid', gridTemplateRows:'auto 1fr auto',
                  padding:14, borderRadius:14, background:'var(--color-surface)',
                  border:'1px solid rgba(255,255,255,.08)',
                  transition:'transform .12s ease, box-shadow .12s ease',
                  minHeight:220
                }}
              >
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div aria-hidden style={{
                    width:44, height:44, borderRadius:10, display:'grid', placeItems:'center',
                    background:'var(--color-surface-2)', border:'1px solid rgba(255,255,255,.06)', fontSize:22,
                    overflow:'hidden'
                  }}>
                    {(() => {
                      const spec = nodeTypes[n.type as keyof typeof nodeTypes]
                      if (spec && spec.icon) {
                        return <img src={spec.icon} alt={spec.label} style={{ width:36, height:36, objectFit:'contain' }} />
                      }
                      return spec ? <span>{spec.label.charAt(0).toUpperCase()}</span> : '🔌'
                    })()}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <div className="node-name" style={{ fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{n.name}</div>
                    <div className="app-subtle" style={{ fontSize:12 }}>Name: {n.name}</div>
                  </div>
                </div>

                <div style={{ marginTop:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    {(() => {
                      const spec = nodeTypes[n.type as keyof typeof nodeTypes]
                      return spec ? (
                        <span className="app-subtle" style={{ fontSize:12, padding:'2px 8px', border:'1px solid rgba(255,255,255,.08)', borderRadius:999 }}>{spec.label}</span>
                      ) : (
                        <span className="app-subtle" style={{ fontSize:12, padding:'2px 8px', border:'1px solid rgba(255,255,255,.08)', borderRadius:999 }}>{n.type}</span>
                      )
                    })()}
                    {getTarget(n) && <span className="app-subtle" style={{ fontSize:12 }}>{getTarget(n)}</span>}
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, marginTop:12 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                    <span className={`status-dot ${n.status || 'unknown'}`} />
                    <span className={`badge ${n.status || 'unknown'}`} style={{ borderRadius:999, padding:'2px 8px' }}>{n.status || 'unknown'}</span>
                  </div>
                  <div className="node-right" style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button className="btn-ghost" onClick={() => onEdit(n)} style={{ border:'1px solid rgba(255,255,255,.08)', borderRadius:10 }}>Edit</button>
                    <button className="btn-ghost" style={{ border:'1px solid rgba(255,255,255,.08)', borderRadius:10 }}>Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8, marginTop:12 }}>
            <button className="btn-ghost" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Prev</button>
            <div className="app-subtle">Page {page} of {totalPages}</div>
            <button className="btn-ghost" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))}>Next</button>
          </div>
        </>
      )}
    </div>
  )
}
