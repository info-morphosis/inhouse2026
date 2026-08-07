'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

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

type ScannerState = 'idle' | 'scanning' | 'loading' | 'result' | 'error'

export default function GaritaPage() {
  // --- Auth ---
  const [pin, setPin] = useState('')
  const [authed, setAuthed] = useState(false)
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)

  // --- Scanner ---
  const [scannerState, setScannerState] = useState<ScannerState>('idle')
  const [result, setResult] = useState<LookupResult | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [manualCodigo, setManualCodigo] = useState('')
  const [showManual, setShowManual] = useState(false)

  const scannerRef = useRef<InstanceType<typeof import('html5-qrcode').Html5Qrcode> | null>(null)
  const processingRef = useRef(false)
  const pinRef = useRef(pin)

  useEffect(() => { pinRef.current = pin }, [pin])

  // --- PIN auth ---
  const handlePin = async (e: React.FormEvent) => {
    e.preventDefault()
    setPinError('')
    setPinLoading(true)
    try {
      const res = await fetch('/api/garita/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      if (!res.ok) { setPinError('PIN incorrecto'); setPin(''); return }
      setAuthed(true)
    } catch {
      setPinError('Error de conexión')
    } finally {
      setPinLoading(false)
    }
  }

  // --- API call ---
  const validarCodigo = useCallback(async (codigo: string) => {
    setScannerState('loading')
    setResult(null)
    setErrorMsg('')
    try {
      const res = await fetch('/api/garita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigo.trim(), pin: pinRef.current }),
      })
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || 'Error'); setScannerState('error'); return }
      setResult(data)
      setScannerState('result')
    } catch {
      setErrorMsg('Error de conexión')
      setScannerState('error')
    }
  }, [])

  // --- Camera ---
  const startScanner = useCallback(async () => {
    setScannerState('scanning')
    setResult(null)
    setErrorMsg('')
    processingRef.current = false

    const { Html5Qrcode } = await import('html5-qrcode')
    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (decoded) => {
          if (processingRef.current) return
          processingRef.current = true
          await scanner.stop()
          scannerRef.current = null
          await validarCodigo(decoded)
        },
        () => { /* ignore decode errors */ }
      )
    } catch {
      setErrorMsg('No se pudo acceder a la cámara. Usa el ingreso manual.')
      setScannerState('idle')
      setShowManual(true)
    }
  }, [validarCodigo])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* ignore */ }
      scannerRef.current = null
    }
    setScannerState('idle')
  }, [])

  useEffect(() => {
    return () => { if (scannerRef.current) { scannerRef.current.stop().catch(() => {}) } }
  }, [])

  const handleManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCodigo.trim()) return
    const codigo = manualCodigo
    setManualCodigo('')
    await validarCodigo(codigo)
  }

  // --- PIN screen ---
  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e2a' }}>
        <form onSubmit={handlePin} className="card w-full max-w-xs text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-xl font-bold mb-1">Control de Acceso</h1>
          <p className="text-white/40 text-sm mb-6">INHOUSE Tech 2026</p>
          <input
            type="password"
            inputMode="numeric"
            className="input-field text-center text-3xl tracking-[0.5em] mb-2"
            value={pin}
            onChange={e => setPin(e.target.value)}
            maxLength={8}
            autoFocus
            disabled={pinLoading}
            placeholder="••••"
          />
          {pinError
            ? <p className="text-red-400 text-sm mb-4">{pinError}</p>
            : <div className="mb-4" />
          }
          <button type="submit" disabled={pinLoading || !pin}
            className="btn-neon w-full disabled:opacity-40">
            {pinLoading ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </main>
    )
  }

  // --- Main garita screen ---
  return (
    <main className="min-h-screen flex flex-col px-4 pt-5 pb-10 max-w-sm mx-auto" style={{ background: '#0a0e2a' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold leading-tight">Control de Acceso <span style={{ color: '#00ff88' }}>INHOUSE 2026</span></h1>
        </div>
        <button onClick={() => { stopScanner(); setAuthed(false) }}
          className="text-white/30 text-xs hover:text-white px-2 py-1">
          Salir
        </button>
      </div>

      {/* Result card */}
      {scannerState === 'result' && result && (
        <div className="card text-center py-8 mb-5 border-[#00ff88] bg-[#00ff88]/10">
          <div className="text-6xl mb-3">✅</div>
          <p className="text-2xl font-bold mb-1">{result.nombres} {result.apellidos}</p>
          <p className="text-white/50 text-sm mb-3">CI: {result.ci}</p>
          <span className="inline-block px-4 py-1 rounded-full text-xs font-bold mb-4"
            style={{ backgroundColor: '#00ff88', color: '#0a0e2a' }}>
            {result.badge}
          </span>
          <p className="text-[#00ff88] font-bold text-lg">ACCESO PERMITIDO</p>
          <button onClick={startScanner} className="btn-neon w-full mt-6">
            Siguiente escaneo
          </button>
        </div>
      )}

      {/* Error card */}
      {scannerState === 'error' && (
        <div className="card border-red-500 bg-red-500/10 text-center py-8 mb-5">
          <div className="text-5xl mb-3">❌</div>
          <p className="text-red-400 font-bold">{errorMsg}</p>
          <button onClick={startScanner} className="btn-neon w-full mt-6">
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Camera */}
      {(scannerState === 'idle' || scannerState === 'scanning') && (
        <>
          <div className="card p-0 overflow-hidden mb-4" style={{ aspectRatio: '1/1', position: 'relative' }}>
            <div id="qr-reader" style={{ width: '100%', height: '100%' }} />
            {scannerState === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ background: 'rgba(10,14,42,0.85)' }}>
                <div className="text-6xl mb-4">📷</div>
                <p className="text-white/50 text-sm text-center px-6">
                  Presiona el botón para activar la cámara
                </p>
              </div>
            )}
            {scannerState === 'scanning' && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: '#00ff88' }} />
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: '#00ff88' }} />
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: '#00ff88' }} />
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: '#00ff88' }} />
              </div>
            )}
          </div>

          {scannerState === 'idle' && (
            <button onClick={startScanner} className="btn-neon w-full text-lg py-4 mb-4">
              Escanear QR
            </button>
          )}
          {scannerState === 'scanning' && (
            <button onClick={stopScanner}
              className="w-full py-3 mb-4 rounded-xl text-white/60 border border-white/20 hover:border-white/40 text-sm">
              Cancelar
            </button>
          )}
        </>
      )}

      {/* Loading */}
      {scannerState === 'loading' && (
        <div className="card text-center py-12 mb-4">
          <div className="text-4xl mb-3 animate-spin">⏳</div>
          <p className="text-white/60">Validando…</p>
        </div>
      )}

      {/* Manual input */}
      <div className="mt-2">
        <button onClick={() => setShowManual(v => !v)}
          className="text-white/30 text-xs w-full text-center hover:text-white/60 mb-2">
          {showManual ? 'Ocultar ingreso manual' : 'Ingresar código manualmente'}
        </button>
        {showManual && (
          <form onSubmit={handleManual} className="flex gap-2">
            <input
              className="input-field flex-1 text-sm"
              value={manualCodigo}
              onChange={e => setManualCodigo(e.target.value)}
              placeholder="INHOUSE2026-C-0001-01"
              autoCapitalize="characters"
            />
            <button type="submit" disabled={!manualCodigo.trim()} className="btn-neon px-4 disabled:opacity-40 text-sm">
              OK
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
