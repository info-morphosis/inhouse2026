'use client'
import { useState, useEffect, useRef } from 'react'

type LookupResult = {
  codigo: string
  nombres: string
  apellidos: string
  ci: string
  badge: string
  origen: string
  usado: boolean
  usado_at: string | null
}

export default function GaritaPage() {
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authed) inputRef.current?.focus()
  }, [authed])

  const handlePin = (e: React.FormEvent) => {
    e.preventDefault()
    // PIN validated server-side
    setAuthed(true)
  }

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/garita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.trim(), pin }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
      setCodigo('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handlePin} className="card w-full max-w-sm text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold mb-6">Garita — INHOUSE 2026</h1>
          <label className="label text-center">PIN de acceso</label>
          <input
            type="password"
            className="input-field text-center text-2xl tracking-widest mb-4"
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={8}
            autoFocus
          />
          <button type="submit" className="btn-neon w-full">Ingresar</button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Garita <span style={{ color: '#00ff88' }}>INHOUSE 2026</span></h1>
        <button onClick={() => setAuthed(false)} className="text-white/40 text-sm hover:text-white">Cerrar sesión</button>
      </div>

      <form onSubmit={handleScan} className="card mb-6">
        <label className="label">Escanear / ingresar código QR</label>
        <div className="flex gap-3 mt-1">
          <input
            ref={inputRef}
            className="input-field flex-1"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="INHOUSE2026-C-0001-01"
          />
          <button type="submit" disabled={loading} className="btn-neon px-6 disabled:opacity-50">
            {loading ? '…' : 'Validar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="card border-red-500 bg-red-500/10 text-center py-8">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-red-400 font-bold text-lg">{error}</p>
        </div>
      )}

      {result && (
        <div className={`card text-center py-8 transition-all ${
          result.usado ? 'border-red-500 bg-red-500/10' : 'border-[#00ff88] bg-[#00ff88]/10'
        }`}>
          <div className="text-5xl mb-4">{result.usado ? '🚫' : '✅'}</div>
          <p className="text-2xl font-bold mb-1">{result.nombres} {result.apellidos}</p>
          <p className="text-white/60 mb-3">CI: {result.ci}</p>
          <span className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-4"
            style={{ backgroundColor: '#00ff88', color: '#0a0e2a' }}>
            {result.badge}
          </span>
          {result.usado && (
            <p className="text-red-400 font-semibold mt-2">
              ⚠️ Ya ingresó — {result.usado_at ? new Date(result.usado_at).toLocaleTimeString('es') : ''}
            </p>
          )}
          {!result.usado && <p className="text-[#00ff88] font-bold text-lg">¡ACCESO PERMITIDO!</p>}
        </div>
      )}
    </main>
  )
}
