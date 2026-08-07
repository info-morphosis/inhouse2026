'use client'
import { useState, useCallback } from 'react'

type Tab = 'resumen' | 'tickets' | 'invitados' | 'ingresados' | 'facturas'

type Stats = {
  orders: { total: number; pagados: number; recaudado: number }
  tickets: { emitidos: number; registrados: number; usados: number }
  invitados: { total: number; usados: number }
  campañas: { nombre: string; tipo: string; slug: string; limite: number; registrados: number; activo: boolean }[]
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="card py-5 px-4">
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-extrabold" style={{ color: color ?? '#00ff88' }}>{value}</p>
      {sub && <p className="text-white/40 text-xs mt-1">{sub}</p>}
    </div>
  )
}

function Badge({ text, color = '#00ff88' }: { text: string; color?: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ background: color + '22', color, border: `1px solid ${color}55` }}>
      {text}
    </span>
  )
}

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinVal, setPinVal] = useState('')

  const [tab, setTab] = useState<Tab>('resumen')
  const [stats, setStats] = useState<Stats | null>(null)
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [retrying, setRetrying] = useState<string | null>(null)
  const [retryMsg, setRetryMsg] = useState<Record<string, string>>({})

  const fetchData = useCallback(async (view: string, currentPin: string) => {
    setLoading(true)
    setTableData([])
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: currentPin, view }),
      })
      const json = await res.json()
      if (view === 'stats') setStats(json)
      else setTableData(json.data ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  const handlePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError(''); setPinLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (!res.ok) { setPinError('PIN incorrecto'); setPin(''); return }
      setPinVal(pin)
      setAuthed(true)
      fetchData('stats', pin)
    } catch { setPinError('Error de conexión') }
    finally { setPinLoading(false) }
  }

  const switchTab = (t: Tab) => {
    setTab(t); setSearch('')
    fetchData(t === 'resumen' ? 'stats' : t, pinVal)
  }

  if (!authed) return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e2a' }}>
      <form onSubmit={handlePin} className="card w-full max-w-xs text-center">
        <div className="text-4xl mb-3">🛡️</div>
        <h1 className="text-xl font-bold mb-1">Panel Administrativo</h1>
        <p className="text-white/40 text-sm mb-6">INHOUSE Tech 2026</p>
        <input type="password" inputMode="numeric" className="input-field text-center text-3xl tracking-[0.5em] mb-2"
          value={pin} onChange={e => setPin(e.target.value)} maxLength={8} autoFocus disabled={pinLoading} placeholder="••••" />
        {pinError ? <p className="text-red-400 text-sm mb-4">{pinError}</p> : <div className="mb-4" />}
        <button type="submit" disabled={pinLoading || !pin} className="btn-neon w-full disabled:opacity-40">
          {pinLoading ? 'Verificando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )

  const reintentarAutorizacion = async (orderId: string) => {
    setRetrying(orderId)
    setRetryMsg(m => ({ ...m, [orderId]: 'Intentando…' }))
    try {
      const res = await fetch('/api/sri/autorizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-sri-key': 'sri-test-key-2026' },
        body: JSON.stringify({ orderId }),
      })
      const json = await res.json()
      if (json.estado === 'autorizada') {
        setRetryMsg(m => ({ ...m, [orderId]: `AUTORIZADA: ${json.factura_num}` }))
        fetchData('facturas', pinVal)
      } else {
        setRetryMsg(m => ({ ...m, [orderId]: json.message ?? json.error ?? 'Error' }))
      }
    } catch {
      setRetryMsg(m => ({ ...m, [orderId]: 'Error de conexión' }))
    } finally {
      setRetrying(null)
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'resumen', label: 'Resumen' },
    { id: 'tickets', label: 'Tickets vendidos' },
    { id: 'invitados', label: 'Invitados' },
    { id: 'ingresados', label: 'Ingresados' },
    { id: 'facturas', label: 'Facturas SRI' },
  ]

  const filtered = tableData.filter(row => {
    if (!search) return true
    const s = search.toLowerCase()
    return Object.values(row).some(v => String(v ?? '').toLowerCase().includes(s))
  })

  return (
    <main className="min-h-screen px-4 pt-6 pb-16 max-w-5xl mx-auto" style={{ background: '#0a0e2a' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold">Panel <span style={{ color: '#00ff88' }}>INHOUSE 2026</span></h1>
          <p className="text-white/30 text-xs">20 agosto · Tenis Club Samborondón</p>
        </div>
        <button onClick={() => setAuthed(false)} className="text-white/30 text-xs hover:text-white px-2 py-1">Salir</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => switchTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all"
            style={tab === t.id
              ? { background: '#00ff88', color: '#0a0e2a' }
              : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-20 text-white/40">Cargando…</div>}

      {/* RESUMEN */}
      {!loading && tab === 'resumen' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Recaudado" value={`$${Number(stats.orders.recaudado).toFixed(0)}`} sub={`${stats.orders.pagados} ventas`} />
            <StatCard label="Tickets emitidos" value={stats.tickets.emitidos} sub={`${stats.tickets.registrados} registrados`} color="#60a5fa" />
            <StatCard label="Invitados" value={stats.invitados.total} sub={`${stats.invitados.usados} ingresaron`} color="#c084fc" />
            <StatCard label="Ingresaron" value={stats.tickets.usados + stats.invitados.usados}
              sub={`de ${stats.tickets.emitidos + stats.invitados.total} totales`} color="#fb923c" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-3">Campañas activas</h2>
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <th className="text-left px-4 py-3 text-white/40 font-medium">Campaña</th>
                    <th className="text-left px-4 py-3 text-white/40 font-medium">Tipo</th>
                    <th className="text-right px-4 py-3 text-white/40 font-medium">Registrados</th>
                    <th className="text-right px-4 py-3 text-white/40 font-medium">Límite</th>
                    <th className="text-center px-4 py-3 text-white/40 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.campañas.map((c, i) => (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-4 py-3 text-white font-medium">{c.nombre}</td>
                      <td className="px-4 py-3 text-white/50">{c.tipo}</td>
                      <td className="px-4 py-3 text-right font-bold" style={{ color: '#00ff88' }}>{c.registrados}</td>
                      <td className="px-4 py-3 text-right text-white/50">{c.limite}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge text={c.activo ? 'Activa' : 'Cerrada'} color={c.activo ? '#00ff88' : '#ef4444'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TICKETS VENDIDOS */}
      {!loading && tab === 'tickets' && (
        <div>
          <input className="input-field mb-4 text-sm" placeholder="Buscar por nombre, código, email…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="text-xs text-white/30 mb-3">{filtered.length} registros</div>
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Código', 'Asistente', 'CI', 'Email', 'Registrado', 'Ingresó', 'Comprador'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-white/40 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const row = r as {
                    codigo: string; asistente_nombres: string; asistente_apellidos: string;
                    asistente_ci: string; asistente_email: string; asistente_registrado: boolean;
                    usado: boolean; usado_at: string;
                    orders: { nombres: string; apellidos: string; estado: string } | null
                  }
                  return (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-3 py-2.5 font-mono text-xs" style={{ color: '#00ff88' }}>{row.codigo}</td>
                      <td className="px-3 py-2.5 text-white whitespace-nowrap">
                        {row.asistente_nombres ? `${row.asistente_nombres} ${row.asistente_apellidos}` : <span className="text-white/30">Sin registrar</span>}
                      </td>
                      <td className="px-3 py-2.5 text-white/60 font-mono text-xs">{row.asistente_ci ?? '—'}</td>
                      <td className="px-3 py-2.5 text-white/50 text-xs">{row.asistente_email ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <Badge text={row.asistente_registrado ? 'Sí' : 'No'} color={row.asistente_registrado ? '#00ff88' : '#f59e0b'} />
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge text={row.usado ? 'Sí' : 'No'} color={row.usado ? '#00ff88' : '#60a5fa'} />
                      </td>
                      <td className="px-3 py-2.5 text-white/50 text-xs whitespace-nowrap">
                        {row.orders ? `${row.orders.nombres} ${row.orders.apellidos}` : '—'}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVITADOS */}
      {!loading && tab === 'invitados' && (
        <div>
          <input className="input-field mb-4 text-sm" placeholder="Buscar por nombre, código, email…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="text-xs text-white/30 mb-3">{filtered.length} registros</div>
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Código', 'Nombre', 'CI', 'Email', 'WhatsApp', 'Campaña', 'Badge', 'Ingresó'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-white/40 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const row = r as {
                    codigo: string; nombres: string; apellidos: string; ci_pasaporte: string;
                    email: string; whatsapp: string; badge_tipo: string; usado: boolean; usado_at: string;
                    registration_campaigns: { nombre: string; tipo: string } | null
                  }
                  return (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-3 py-2.5 font-mono text-xs" style={{ color: '#00ff88' }}>{row.codigo}</td>
                      <td className="px-3 py-2.5 text-white whitespace-nowrap">{row.nombres} {row.apellidos}</td>
                      <td className="px-3 py-2.5 text-white/60 font-mono text-xs">{row.ci_pasaporte ?? '—'}</td>
                      <td className="px-3 py-2.5 text-white/50 text-xs">{row.email ?? '—'}</td>
                      <td className="px-3 py-2.5 text-white/50 text-xs">{row.whatsapp ?? '—'}</td>
                      <td className="px-3 py-2.5 text-white/50 text-xs">{row.registration_campaigns?.nombre ?? '—'}</td>
                      <td className="px-3 py-2.5">
                        <Badge text={row.badge_tipo ?? '—'} color="#c084fc" />
                      </td>
                      <td className="px-3 py-2.5">
                        {row.usado
                          ? <span className="text-xs text-white/50">{new Date(row.usado_at).toLocaleTimeString('es')}</span>
                          : <Badge text="No" color="#60a5fa" />}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-white/30">Sin resultados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FACTURAS SRI */}
      {!loading && tab === 'facturas' && (
        <div>
          <input className="input-field mb-4 text-sm" placeholder="Buscar por nombre, email, factura…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="text-xs text-white/30 mb-3">{filtered.length} órdenes</div>
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Comprador', 'Paquete', 'Total', 'Estado SRI', 'Factura Nº', 'Acción'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-white/40 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const row = r as {
                    id: string; nombres: string; apellidos: string; email: string;
                    paquete: string; total: string; factura_estado: string;
                    factura_num: string | null; factura_clave: string | null; factura_url: string | null;
                  }
                  const estado = row.factura_estado ?? 'sin_factura'
                  const estadoColor = estado === 'autorizada' ? '#00ff88' : estado === 'recibida' ? '#f59e0b' : '#ef4444'
                  const msg = retryMsg[row.id]
                  return (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-3 py-2.5">
                        <p className="text-white whitespace-nowrap">{row.nombres} {row.apellidos}</p>
                        <p className="text-white/40 text-xs">{row.email}</p>
                      </td>
                      <td className="px-3 py-2.5 text-white/60 capitalize">{row.paquete ?? '—'}</td>
                      <td className="px-3 py-2.5 font-bold" style={{ color: '#00ff88' }}>${Number(row.total).toFixed(2)}</td>
                      <td className="px-3 py-2.5">
                        <Badge text={estado} color={estadoColor} />
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs text-white/60">
                        {row.factura_num
                          ? <a href={row.factura_url ?? '#'} target="_blank" rel="noreferrer"
                              className="underline" style={{ color: '#00ff88' }}>{row.factura_num}</a>
                          : row.factura_clave
                            ? <span className="text-white/30 text-xs">Clave guardada</span>
                            : '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        {estado !== 'autorizada' && row.factura_clave && (
                          <div>
                            <button
                              onClick={() => reintentarAutorizacion(row.id)}
                              disabled={retrying === row.id}
                              className="btn-neon text-xs px-3 py-1 disabled:opacity-40">
                              {retrying === row.id ? 'Intentando…' : 'Autorizar'}
                            </button>
                            {msg && <p className="text-xs mt-1 text-white/50">{msg}</p>}
                          </div>
                        )}
                        {estado === 'sin_factura' && !row.factura_clave && (
                          <span className="text-white/20 text-xs">Sin emitir</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30">Sin órdenes</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INGRESADOS */}
      {!loading && tab === 'ingresados' && (
        <div>
          <input className="input-field mb-4 text-sm" placeholder="Buscar por nombre, código, CI…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <div className="text-xs text-white/30 mb-3">{filtered.length} personas ingresaron</div>
          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                  {['Hora entrada', 'Nombre', 'CI', 'Badge', 'Código', 'Origen'].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-white/40 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const row = r as { usado_at: string; nombres: string; apellidos: string; ci: string; badge: string; codigo: string; origen: string }
                  return (
                    <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <td className="px-3 py-2.5 text-white/60 text-xs whitespace-nowrap">
                        {row.usado_at ? new Date(row.usado_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-white whitespace-nowrap">{row.nombres} {row.apellidos}</td>
                      <td className="px-3 py-2.5 text-white/60 font-mono text-xs">{row.ci ?? '—'}</td>
                      <td className="px-3 py-2.5"><Badge text={row.badge ?? '—'} /></td>
                      <td className="px-3 py-2.5 font-mono text-xs text-white/40">{row.codigo}</td>
                      <td className="px-3 py-2.5">
                        <Badge text={row.origen} color={row.origen === 'ticket' ? '#60a5fa' : '#c084fc'} />
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-white/30">Nadie ha ingresado aún</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
