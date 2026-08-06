'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import EventHeader from '@/components/EventHeader'
import LogoBadge from '@/components/LogoBadge'
import EventFooter from '@/components/EventFooter'

const PAQUETES = {
  individual: { label: 'Entrada Individual', cantidad: 1, precio: 120 },
  pack5:      { label: 'Pack Empresarial 5', cantidad: 5, precio: 100 },
  pack10:     { label: 'Pack Corporativo 10', cantidad: 10, precio: 80 },
} as const

function CheckoutForm() {
  const router = useRouter()
  const params = useSearchParams()
  const paqueteId = (params.get('paquete') || 'individual') as keyof typeof PAQUETES
  const paquete = PAQUETES[paqueteId] || PAQUETES.individual

  const [form, setForm] = useState({
    nombres: '', apellidos: '', tipo_id: 'cedula', ci_pasaporte: '',
    email: '', whatsapp: '', razon_social: '', ruc: '', direccion: '',
  })
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
        body: JSON.stringify({ ...form, paquete: paqueteId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar')
      // Datafast: redirigir al widget de pago
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        router.push(`/confirmacion?order=${data.orderId}`)
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

        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Tipo de ID *</label>
            <select className="input-field" value={form.tipo_id}
              onChange={e => setForm(f => ({ ...f, tipo_id: e.target.value }))}>
              <option value="cedula">Cédula</option>
              <option value="pasaporte">Pasaporte</option>
              <option value="licencia">Licencia</option>
            </select>
          </div>
          <div>
            <label className="label">Número de ID *</label>
            <input className="input-field" required value={form.ci_pasaporte}
              onChange={e => setForm(f => ({ ...f, ci_pasaporte: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="label">Correo electrónico *</label>
          <input className="input-field" type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>

        <div>
          <label className="label">WhatsApp (con código país) *</label>
          <input className="input-field" placeholder="+5939..." required value={form.whatsapp}
            onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} />
        </div>

        <details className="border-t border-white/10 pt-4">
          <summary className="text-white/50 text-sm cursor-pointer hover:text-white">
            Datos de facturación (opcional)
          </summary>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Razón social</label>
              <input className="input-field" value={form.razon_social}
                onChange={e => setForm(f => ({ ...f, razon_social: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">RUC</label>
                <input className="input-field" value={form.ruc}
                  onChange={e => setForm(f => ({ ...f, ruc: e.target.value }))} />
              </div>
              <div>
                <label className="label">Dirección</label>
                <input className="input-field" value={form.direccion}
                  onChange={e => setForm(f => ({ ...f, direccion: e.target.value }))} />
              </div>
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
              checked={politicas}
              onChange={e => setPoliticas(e.target.checked)}
              className="mt-1 w-4 h-4 accent-[#00ff88] flex-shrink-0"
            />
            <span className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
              He leído y acepto las{' '}
              <Link href="/politicas" target="_blank"
                className="underline hover:text-[#00ff88] transition-colors" style={{ color: '#00ff88' }}>
                políticas de privacidad, cancelación y devolución
              </Link>
            </span>
          </label>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button type="submit" disabled={loading || !politicas} className="btn-neon w-full text-center text-lg disabled:opacity-40">
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
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  )
}
