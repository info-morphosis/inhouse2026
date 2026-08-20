'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import EventHeader from '@/components/EventHeader'
import LogoBadge from '@/components/LogoBadge'
import EventFooter from '@/components/EventFooter'
import { normalizarWhatsappEc } from '@/lib/phone'

const SOLD_OUT = true

const PAQUETES = {
  individual: { label: 'Entrada Individual', cantidad: 1, precio: 120 },
  pack5:      { label: 'Pack Empresarial 5', cantidad: 5, precio: 100 },
  pack10:     { label: 'Pack Corporativo 10', cantidad: 10, precio: 80 },
} as const

function SoldOutNotice() {
  return (
    <>
    <EventHeader />
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8">
      <LogoBadge />
      <a href="/" className="text-white/40 text-sm hover:text-white mb-8 inline-block">← Volver</a>
      <div className="card text-center py-12">
        <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full mb-6"
          style={{ background: '#00ff88', color: '#0a0e2a' }}>
          Aforo completo
        </span>
        <h1 className="text-5xl font-extrabold uppercase tracking-tight mb-4" style={{ color: '#00ff88' }}>Agotado</h1>
        <p className="text-white/60 mb-2">Todas las entradas están vendidas · Sold Out</p>
        <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
          La venta de entradas está cerrada. Escríbenos por WhatsApp para cualquier consulta.
        </p>
        <a href="https://wa.me/593984309726" target="_blank" rel="noopener noreferrer"
          className="btn-outline inline-block text-sm px-8 py-3">Contactar por WhatsApp</a>
      </div>
    </main>
    <EventFooter />
    </>
  )
}

function CheckoutForm() {
  const router = useRouter()
  const params = useSearchParams()
  const paqueteId = (params.get('paquete') || 'individual') as keyof typeof PAQUETES
  const paquete = PAQUETES[paqueteId] || PAQUETES.individual

  const [form, setForm] = useState({
    nombres: '', apellidos: '', tipo_id: 'cedula' as const, ci_pasaporte: '',
    email: '', whatsapp: '', razon_social: '', ruc: '', direccion: '',
  })
  const [privacidad, setPrivacidad] = useState(false)
  const [politicas, setPoliticas] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = paquete.cantidad * paquete.precio

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, whatsapp: normalizarWhatsappEc(form.whatsapp), paquete: paqueteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar')
      // Datafast: ir al widget de pago con el checkoutId
      if (data.checkoutId) {
        router.push(`/pago?checkoutId=${data.checkoutId}`)
      } else {
        router.push(`/confirmacion?order=${data.orderId}&estado=ok`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <EventHeader />
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-8">
      <LogoBadge />
      <a href="/" className="text-white/40 text-sm hover:text-white mb-8 inline-block">← Volver</a>

      <div className="card mb-6 flex justify-between items-center">
        <div>
          <p className="font-bold text-lg">{paquete.label}</p>
          <p className="text-white/50 text-sm">{paquete.cantidad} entrada{paquete.cantidad > 1 ? 's' : ''}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-extrabold" style={{ color: '#00ff88' }}>${total}</p>
          {paquete.cantidad > 1 && <p className="text-white/40 text-xs">${paquete.precio}/entrada</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        <h2 className="text-xl font-bold mb-2">Datos del comprador</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Nombres *</label>
            <input className="input-field" required value={form.nombres}
              onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} />
          </div>
          <div>
            <label className="label">Apellidos *</label>
            <input className="input-field" required value={form.apellidos}
              onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="label">Cédula *</label>
          <input className="input-field" type="text" inputMode="numeric" maxLength={10}
            pattern="[0-9]{10}" title="Ingresa los 10 dígitos de tu cédula"
            placeholder="0102030405" required value={form.ci_pasaporte}
            onChange={e => setForm(f => ({ ...f, ci_pasaporte: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
          <p className="text-white/40 text-xs mt-1">Cédula ecuatoriana de 10 dígitos (requerida por el banco).</p>
        </div>

        <div>
          <label className="label">Correo electrónico *</label>
          <input className="input-field" type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>

        <div>
          <label className="label">Dirección *</label>
          <input className="input-field" required value={form.direccion}
            placeholder="Calle principal y secundaria, ciudad"
            onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
          <p className="text-white/40 text-xs mt-1">Requerida por Datafast para la validación del pago.</p>
        </div>

        <div>
          <label className="label">WhatsApp *</label>
          <input className="input-field" type="tel" inputMode="numeric" maxLength={10}
            pattern="0[0-9]{9}" title="Ingresa 10 dígitos que empiezan con 0 (ej: 0987654321)"
            placeholder="0987654321" required value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
          <p className="text-white/40 text-xs mt-1">Número de 10 dígitos que empieza con 0.</p>
        </div>

        <details className="border-t border-white/10 pt-4">
          <summary className="text-white/50 text-sm cursor-pointer hover:text-white">
            Datos de facturación (opcional)
          </summary>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Razón social</label>
              <input className="input-field" value={form.razon_social}
                onChange={e => setForm(f => ({ ...f, razon_social: e.target.value }))} />
            </div>
            <div>
              <label className="label">RUC</label>
              <input className="input-field" value={form.ruc}
                onChange={e => setForm(f => ({ ...f, ruc: e.target.value }))} />
            </div>
          </div>
        </details>

        <div className="border-t border-white/10 pt-4">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-white/50 text-sm text-center py-1">
              <span className="inline-block text-lg">📩</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Tu ticket digital será enviado <strong className="text-white">inmediatamente</strong> por correo electrónico y WhatsApp tras confirmar el pago.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              required
              checked={privacidad}
              onChange={e => setPrivacidad(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#00ff88] flex-shrink-0"
            />
            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
              He leído y acepto la{' '}
              <Link href="/privacidad" target="_blank"
                className="underline hover:text-[#00ff88] transition-colors" style={{ color: '#00ff88' }}>
                Política de Protección de Datos Personales
              </Link>
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group mt-3">
            <input
              type="checkbox"
              required
              checked={politicas}
              onChange={e => setPoliticas(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#00ff88] flex-shrink-0"
            />
            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
              He leído y acepto las{' '}
              <Link href="/politicas" target="_blank"
                className="underline hover:text-[#00ff88] transition-colors" style={{ color: '#00ff88' }}>
                Políticas de Cancelación y Devolución
              </Link>
            </span>
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading || !privacidad || !politicas} className="btn-neon w-full text-center text-lg disabled:opacity-40">
          {loading ? 'Procesando…' : `Proceder al pago — $${total}`}
        </button>

        <p className="text-white/30 text-xs text-center">Pago seguro vía Datafast · Powered by Morphosis</p>
      </form>
    </main>
    <EventFooter />
    </>
  )
}

export default function CheckoutPage() {
  if (SOLD_OUT) return <SoldOutNotice />
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  )
}
