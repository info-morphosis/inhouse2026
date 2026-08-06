'use client'
import { useState, use } from 'react'

export default function RegistroAuspiciantePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const [form, setForm] = useState({
    nombres: '', apellidos: '', tipo_id: 'cedula', ci_pasaporte: '',
    email: '', codigoPais: '+593', telefono: '',
  })
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'auspiciante', slug, ...form, whatsapp: form.codigoPais + form.telefono }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error')
      setDone(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-3">¡Registro completado!</h1>
        <p className="text-white/60">Tu ticket QR llegará por email y WhatsApp.</p>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="inline-block bg-[#00ff88] text-[#0a0e2a] font-bold px-4 py-1 rounded-full text-sm mb-4">
          REGISTRO DE TICKETS
        </div>
        <h1 className="text-2xl font-bold">Registro de tickets</h1>
        <p className="text-white/50 mt-2 text-sm">INHOUSE Tech 2026 · 20 agosto</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
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
          <label className="label">Email *</label>
          <input className="input-field" type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className="label">WhatsApp *</label>
          <div className="flex gap-2">
            <select className="input-field w-28 shrink-0" value={form.codigoPais}
              onChange={e => setForm(f => ({ ...f, codigoPais: e.target.value }))}>
              <option value="+593">🇪🇨 +593</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+34">🇪🇸 +34</option>
              <option value="+57">🇨🇴 +57</option>
              <option value="+51">🇵🇪 +51</option>
              <option value="+52">🇲🇽 +52</option>
              <option value="+54">🇦🇷 +54</option>
              <option value="+56">🇨🇱 +56</option>
              <option value="+507">🇵🇦 +507</option>
            </select>
            <input className="input-field flex-1" placeholder="9xxxxxxxx" required
              value={form.telefono}
              onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn-neon w-full text-center disabled:opacity-50">
          {loading ? 'Registrando…' : 'Confirmar registro'}
        </button>
      </form>
    </main>
  )
}
