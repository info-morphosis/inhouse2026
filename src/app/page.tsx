'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PAQUETES = [
  { id: 'individual', label: 'Entrada Individual', cantidad: 1, precio: 120, desc: '1 acceso al evento' },
  { id: 'pack5', label: 'Pack Empresarial 5', cantidad: 5, precio: 100, total: 500, desc: '5 accesos — $100 c/u', popular: true },
  { id: 'pack10', label: 'Pack Corporativo 10', cantidad: 10, precio: 80, total: 800, desc: '10 accesos — $80 c/u' },
]

const AGENDA = [
  { hora: '15:15', tema: 'Palabras de Bienvenida', speaker: 'Dra. Cecilia Paredes — Rectora ESPOL' },
  { hora: '15:30', tema: 'Empresas que ya usan IA: Historias que inspiran acción', speaker: 'Sofía Londoño' },
  { hora: '16:30', tema: 'Omniloy: IA que multiplica la capacidad hospitalaria', speaker: 'Mar Pujadas' },
  { hora: '17:30', tema: 'Podcast Racionalmente Irracional', speaker: 'Andrés Seminario + Luis Ignacio Hanna' },
  { hora: '18:30', tema: 'Felicidad en el mundo laboral', speaker: 'Óscar Rodríguez Lemus' },
  { hora: '19:30', tema: 'NETWORKING', speaker: '' },
]

export default function LandingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,255,136,0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#00ff88] flex items-center justify-center">
            <span className="text-[#0a0e2a] font-bold">IT</span>
          </div>
          <span className="text-white/60 text-sm tracking-widest uppercase">INHOUSE Tech · IV Edición</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4">
          Experiencia<br />
          <span style={{ color: '#00ff88' }}>IA 2026</span>
        </h1>
        <p className="text-xl text-white/70 mb-6 font-light">Conecta. Transforma. Inspira.</p>
        <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-white/60">
          <span>📅 20 agosto 2026 · 15H00</span>
          <span>📍 Tenis Club Samborondón</span>
          <span>🎓 Aval ESPOL</span>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          <a href="#entradas" className="btn-neon">Comprar entrada</a>
          <a href="#agenda" className="btn-outline">Ver agenda</a>
        </div>
      </section>

      {/* SPEAKERS */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Speakers <span style={{ color: '#00ff88' }}>internacionales</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { nombre: 'Sofía Londoño', pais: '🇨🇴', cargo: 'Gerente General, ElConserje', tema: 'IA en empresas reales' },
            { nombre: 'Mar Pujadas', pais: '🇪🇸', cargo: 'Co-founder & CEO, Omniloy', tema: 'IA en hospitales' },
            { nombre: 'Óscar Rodríguez', pais: '🇨🇴', cargo: 'CEO BhiPRO', tema: 'Felicidad laboral' },
          ].map((s) => (
            <div key={s.nombre} className="card text-center">
              <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-3 flex items-center justify-center text-3xl">{s.pais}</div>
              <p className="font-bold text-lg">{s.nombre}</p>
              <p className="text-white/50 text-sm mb-2">{s.cargo}</p>
              <p className="text-sm font-medium" style={{ color: '#00ff88' }}>{s.tema}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AGENDA */}
      <section id="agenda" className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Agenda del <span style={{ color: '#00ff88' }}>evento</span></h2>
        <div className="space-y-3">
          {AGENDA.map((item) => (
            <div key={item.hora} className="card flex gap-4 items-start">
              <span className="font-mono font-bold min-w-[52px]" style={{ color: '#00ff88' }}>{item.hora}</span>
              <div>
                <p className="font-semibold">{item.tema}</p>
                {item.speaker && <p className="text-white/50 text-sm mt-0.5">{item.speaker}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ENTRADAS */}
      <section id="entradas" className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-3">Elige tu <span style={{ color: '#00ff88' }}>entrada</span></h2>
        <p className="text-center text-white/50 mb-10 text-sm">Cierre de ventas: 19 de agosto 2026</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {PAQUETES.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`card text-left relative cursor-pointer transition-all duration-200 ${
                selected === p.id ? 'border-[#00ff88] bg-[#00ff88]/10' : 'hover:border-white/30'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00ff88] text-[#0a0e2a] text-xs font-bold px-3 py-1 rounded-full">
                  MÁS POPULAR
                </span>
              )}
              <p className="font-bold text-lg mb-1">{p.label}</p>
              <p className="text-white/50 text-sm mb-4">{p.desc}</p>
              <p className="text-4xl font-extrabold" style={{ color: '#00ff88' }}>
                ${p.precio}
                <span className="text-base font-normal text-white/40"> /entrada</span>
              </p>
              {'total' in p && <p className="text-white/50 text-sm mt-1">Total ${p.total}</p>}
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => selected && router.push(`/checkout?paquete=${selected}`)}
            disabled={!selected}
            className="btn-neon text-lg px-12 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Comprar ahora →
          </button>
        </div>
      </section>

      <footer className="text-center py-10 text-white/30 text-sm border-t border-white/10">
        <p>INHOUSE Tech 2026 · Organizado por Morphosis</p>
        <p className="mt-1">¿Auspiciante o invitado ESPOL? Usa el link que te enviaron.</p>
      </footer>
    </main>
  )
}
