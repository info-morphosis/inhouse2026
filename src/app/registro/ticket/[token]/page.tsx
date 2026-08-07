'use client'
import { useState, use } from 'react'
import EventHeader from '@/components/EventHeader'
import LogoBadge from '@/components/LogoBadge'
import EventFooter from '@/components/EventFooter'

const PAISES = [
  ['+593','🇪🇨'],['+57','🇨🇴'],['+51','🇵🇪'],['+58','🇻🇪'],['+591','🇧🇴'],
  ['+56','🇨🇱'],['+54','🇦🇷'],['+598','🇺🇾'],['+595','🇵🇾'],['+52','🇲🇽'],
  ['+506','🇨🇷'],['+507','🇵🇦'],['+502','🇬🇹'],['+504','🇭🇳'],['+503','🇸🇻'],
  ['+505','🇳🇮'],['+1','🇺🇸'],['+55','🇧🇷'],['+34','🇪🇸'],['+44','🇬🇧'],
  ['+33','🇫🇷'],['+49','🇩🇪'],['+39','🇮🇹'],['+351','🇵🇹'],
]

export default function RegistroTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [form, setForm] = useState({
    nombres: '', apellidos: '', tipo_id: 'cedula', ci_pasaporte: '',
    email: '', codigoPais: '+593', telefono: '', empresa: '',
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
        body: JSON.stringify({ tipo: 'ticket', token, ...form, whatsapp: form.codigoPais + form.telefono, empresa: form.empresa }),
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
        <h1 className="text-2xl font-bold mb-3">¡Registro completado!</h1>
        <p className="text-white/60">Recibirás tu ticket QR por email y WhatsApp.</p>
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
          ENTRADA INHOUSE TECH 2026
        </div>
        <h1 className="text-2xl font-bold">Completa tu registro</h1>
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
        <div><label className="label">WhatsApp *</label>
          <div className="flex gap-2">
            <select className="input-field-compact" value={form.codigoPais} onChange={e => setForm(f => ({ ...f, codigoPais: e.target.value }))}>
              {PAISES.map(([c, f]) => <option key={c} value={c}>{f} {c}</option>)}
            </select>
            <input className="input-field flex-1 min-w-0" placeholder="9xxxxxxxx" required value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          </div>
        </div>
        <div><label className="label">Empresa</label>
          <input className="input-field" placeholder="Nombre de empresa u organización (opcional)" value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} /></div>
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
