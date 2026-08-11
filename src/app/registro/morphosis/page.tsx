'use client'
import { useState } from 'react'
import EventHeader from '@/components/EventHeader'
import LogoBadge from '@/components/LogoBadge'
import EventFooter from '@/components/EventFooter'
import { normalizarWhatsappEc } from '@/lib/phone'

export default function RegistroMorphosisPage() {
  const [form, setForm] = useState({
    nombres: '', apellidos: '', tipo_id: 'cedula', ci_pasaporte: '',
    email: '', telefono: '', empresa: '',
  })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/registro', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'campana', slug: 'morphosis', ...form, whatsapp: normalizarWhatsappEc(form.telefono), empresa: form.empresa }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally { setLoading(false) }
  }

  if (done) return (
    <>
    <EventHeader />
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-3">¡Registro confirmado!</h1>
        <p className="text-white/60">Tu ticket QR llegará por email y WhatsApp.</p>
      </div>
    </main>
    <EventFooter />
    </>
  )

  return (
    <>
    <EventHeader />
    <main className="max-w-lg mx-auto px-4 py-8">
      <LogoBadge />
      <div className="text-center mb-8">
        <div className="inline-block bg-[#00ff88] text-[#0a0e2a] font-bold px-4 py-1 rounded-full text-sm mb-4">
          INVITADOS MORPHOSIS
        </div>
        <h1 className="text-2xl font-bold">Invitados Morphosis</h1>
        <p className="text-white/50 mt-2 text-sm">20 agosto · Tenis Club Samborondón</p>
      </div>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Nombres *</label>
            <input className="input-field" required value={form.nombres} onChange={e => setForm(f => ({ ...f, nombres: e.target.value }))} /></div>
          <div><label className="label">Apellidos *</label>
            <input className="input-field" required value={form.apellidos} onChange={e => setForm(f => ({ ...f, apellidos: e.target.value }))} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">Tipo de ID *</label>
            <select className="input-field" value={form.tipo_id} onChange={e => setForm(f => ({ ...f, tipo_id: e.target.value }))}>
              <option value="cedula">Cédula</option><option value="pasaporte">Pasaporte</option>
            </select></div>
          <div><label className="label">Número de ID *</label>
            <input className="input-field" required value={form.ci_pasaporte} onChange={e => setForm(f => ({ ...f, ci_pasaporte: e.target.value }))} /></div>
        </div>
        <div><label className="label">Email *</label>
          <input className="input-field" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="label">WhatsApp *</label>
            <input className="input-field" type="tel" inputMode="numeric" maxLength={10} pattern="0[0-9]{9}" title="Ingresa 10 dígitos que empiezan con 0 (ej: 0987654321)" placeholder="0987654321" required value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value.replace(/\D/g, '').slice(0, 10) }))} />
            <p className="text-white/40 text-xs mt-1">10 dígitos que inician con 0.</p>
          </div>
          <div><label className="label">Empresa *</label>
            <input className="input-field" placeholder="Nombre de empresa u organización" required value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} /></div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-neon w-full text-center disabled:opacity-50">
          {loading ? 'Registrando…' : 'Confirmar registro'}
        </button>
      </form>
    </main>
    <EventFooter />
    </>
  )
}
