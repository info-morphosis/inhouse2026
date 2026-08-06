'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now()
      if (diff <= 0) return setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return timeLeft
}

const PAQUETES = [
  { id: 'individual', label: 'Entrada Individual', cantidad: 1, precio: 120, desc: 'por persona', nota: 'Disponible hasta 24h antes del evento' },
  { id: 'pack5', label: 'Pack 5 Entradas', cantidad: 5, precio: 100, total: 500, ahorras: 100, desc: 'por persona · total $500', popular: true },
  { id: 'pack10', label: 'Pack 10 Entradas', cantidad: 10, precio: 80, total: 800, ahorras: 400, desc: 'por persona · total $800' },
]

const SPEAKERS = [
  {
    nombre: 'Sofía Londoño Giraldo',
    pais: '🇨🇴',
    cargo: 'Gerente General, ElConserje Marketing de Opinión',
    tema: '"Empresas que ya usan IA: Historias que inspiran acción"',
    foto: '/speakers/slide7_img0.jpg',
  },
  {
    nombre: 'Mar Pujadas',
    pais: '🇪🇸',
    cargo: 'Co-founder & CEO, Omniloy',
    tema: '"IA que multiplica la capacidad hospitalaria"',
    foto: '/speakers/slide8_img0.jpg',
  },
  {
    nombre: 'Andrés Seminario & Luis Ignacio Hanna',
    pais: '🇪🇨',
    cargo: 'Conductores, Podcast "Racionalmente Irracional"',
    tema: '"2 episodios grabados en vivo con invitados especiales"',
    foto: '/speakers/slide9_img0.jpg',
  },
  {
    nombre: 'Óscar Rodríguez Lemus',
    pais: '🇨🇴',
    cargo: 'CEO, BhiPRO — Business Happiness Index Program',
    tema: '"Felicidad en el mundo laboral"',
    foto: '/speakers/slide11_img0.jpg',
  },
]

const AGENDA = [
  { hora: '15:15–15:30', tema: 'Palabras de Bienvenida', speaker: 'Dra. Cecilia Paredes — Rectora ESPOL', badge: 'ESPOL', networking: false },
  { hora: '15:30–16:30', tema: 'Empresas que ya usan IA: Historias que inspiran acción', speaker: 'Sofía Londoño', networking: false },
  { hora: '16:30–17:30', tema: 'Omniloy: IA que multiplica la capacidad hospitalaria', speaker: 'Mar Pujadas', networking: false },
  { hora: '17:30–18:30', tema: 'Podcast Racionalmente Irracional — 2 episodios en vivo', speaker: 'Andrés Seminario + Luis Ignacio Hanna', networking: false },
  { hora: '18:30–19:30', tema: 'Felicidad en el mundo laboral', speaker: 'Óscar Rodríguez Lemus', networking: false },
  { hora: '19:30', tema: 'NETWORKING', speaker: '', networking: true },
]

const FEATURES = [
  'Acceso completo al congreso',
  '4 conferencias magistrales',
  'Podcast en vivo "Racionalmente Irracional"',
  'Networking post-evento',
  'Certificado de participación digital',
]

const EVENT_DATE = new Date('2026-08-20T15:00:00-05:00')

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-xl flex items-center justify-center font-extrabold text-4xl md:text-5xl w-20 md:w-24 h-20 md:h-24"
        style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88', fontVariantNumeric: 'tabular-nums' }}
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs uppercase tracking-widest text-white/40 font-semibold">{label}</span>
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const countdown = useCountdown(EVENT_DATE)

  return (
    <div className="min-h-screen" style={{ background: '#0a0e2a' }}>
      {/* NAV */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/10" style={{ background: 'rgba(10, 14, 42, 0.85)' }}>
        <div className="flex justify-between items-center max-w-7xl mx-auto px-5 lg:px-16 py-4">
          <span className="font-extrabold text-lg tracking-tight text-white">INHOUSE Tech 2026</span>
          <div className="hidden md:flex items-center gap-8">
            {['#speakers', '#agenda', '#entradas'].map((href) => (
              <a key={href} href={href} className="text-sm font-semibold uppercase tracking-widest text-white/50 hover:text-[#00ff88] transition-colors">
                {href.slice(1)}
              </a>
            ))}
          </div>
          <a href="#entradas" className="btn-neon text-sm px-5 py-2">Comprar entrada</a>
        </div>
      </nav>

      <main className="pt-24">
        {/* HERO */}
        <section className="relative flex flex-col items-center justify-center text-center px-4 pt-20 pb-24">
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,255,136,0.10) 0%, transparent 60%)' }} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: '#00ff88', color: '#0a0e2a' }}>IT</div>
              <span className="text-white/50 text-xs tracking-[0.2em] uppercase">IV Edición · Experiencia IA</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-4 text-white">
              Conecta.<br />
              <span style={{ color: '#00ff88' }}>Transforma.</span><br />
              Inspira.
            </h1>
            <p className="text-xl text-white/60 mb-8 font-light">20 de agosto 2026 · 15H00 · Tenis Club Samborondón</p>

            {/* COUNTDOWN */}
            <div className="mb-10">
              <p className="text-xs uppercase tracking-[0.25em] text-white/40 mb-4">El evento comienza en</p>
              <div className="flex items-start justify-center gap-3 md:gap-4">
                <CountdownBlock value={countdown.days} label="Días" />
                <span className="text-3xl font-extrabold mt-6" style={{ color: '#00ff88' }}>:</span>
                <CountdownBlock value={countdown.hours} label="Horas" />
                <span className="text-3xl font-extrabold mt-6" style={{ color: '#00ff88' }}>:</span>
                <CountdownBlock value={countdown.minutes} label="Min" />
                <span className="text-3xl font-extrabold mt-6" style={{ color: '#00ff88' }}>:</span>
                <CountdownBlock value={countdown.seconds} label="Seg" />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm">
              <span className="px-4 py-1.5 rounded-full border border-white/20 text-white/60">🎓 Aval ESPOL</span>
              <span className="px-4 py-1.5 rounded-full border border-white/20 text-white/60">👥 400 participantes</span>
              <span className="px-4 py-1.5 rounded-full border border-white/20 text-white/60">🌎 3 países</span>
            </div>
            <div className="flex gap-4 flex-wrap justify-center">
              <a href="#entradas" className="btn-neon text-base px-8 py-3">Comprar entrada</a>
              <a href="#agenda" className="btn-outline text-base px-8 py-3">Ver agenda</a>
            </div>
          </div>
        </section>

        {/* SPEAKERS */}
        <section id="speakers" className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <div className="relative inline-block">
              <h2 className="text-4xl font-extrabold text-white uppercase tracking-tight">SPEAKERS</h2>
              <div className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 12px rgba(0,255,136,0.6)' }} />
            </div>
            <p className="text-white/50 mt-5 text-base">Líderes globales de tecnología, innovación y bienestar</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SPEAKERS.map((s) => (
              <div key={s.nombre} className="speaker-card">
                <div className="relative w-28 h-28 rounded-full mb-5 neon-border overflow-hidden shrink-0">
                  <Image src={s.foto} alt={s.nombre} fill className="object-cover" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{s.nombre} {s.pais}</h3>
                <p className="text-sm mb-3" style={{ color: '#b5c4ff' }}>{s.cargo}</p>
                <p className="text-sm font-semibold" style={{ color: '#00ff88' }}>{s.tema}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AGENDA */}
        <section id="agenda" className="max-w-3xl mx-auto px-4 py-20">
          <div className="mb-12">
            <div className="relative inline-block mb-2">
              <h2 className="text-4xl font-extrabold text-white uppercase tracking-tight">AGENDA</h2>
              <div className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 12px rgba(0,255,136,0.6)' }} />
            </div>
            <p className="text-white/50 mt-4">20 de agosto 2026 · Tenis Club Samborondón, Guayaquil</p>
          </div>

          <div className="relative pl-10">
            {/* Vertical neon line */}
            <div className="absolute left-[9px] top-0 bottom-0 w-[2px] rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 8px rgba(0,255,136,0.5)' }} />

            <div className="space-y-6">
              {AGENDA.map((item, i) => (
                <div key={item.hora} className="relative">
                  {/* Dot */}
                  <div className="timeline-dot absolute -left-[31px] top-6" />

                  <div className={`rounded-xl p-5 glass-panel transition-colors hover:border-[#00ff88]/40 ${
                    item.networking
                      ? 'border-2 border-[#00ff88]'
                      : i % 2 === 0 ? '' : 'bg-white/[0.02]'
                  }`} style={item.networking ? { boxShadow: '0 0 20px rgba(0,255,136,0.2)' } : {}}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                      <span className="font-bold text-sm w-32 shrink-0" style={{ color: '#00ff88' }}>{item.hora}</span>
                      <div>
                        {item.networking ? (
                          <span className="inline-block font-extrabold uppercase tracking-widest px-4 py-1 rounded text-sm" style={{ background: '#00ff88', color: '#0a0e2a' }}>
                            NETWORKING
                          </span>
                        ) : (
                          <>
                            <p className="font-bold text-white text-base leading-snug">{item.tema}</p>
                            {item.speaker && (
                              <p className="text-sm mt-0.5" style={{ color: '#b5c4ff' }}>
                                {item.speaker}
                                {item.badge && (
                                  <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                                    {item.badge}
                                  </span>
                                )}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ENTRADAS */}
        <section id="entradas" className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <div className="relative inline-block mb-2">
              <h2 className="text-4xl font-extrabold text-white uppercase tracking-tight">ENTRADAS</h2>
              <div className="absolute -bottom-2 left-0 right-0 h-[3px] rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 12px rgba(0,255,136,0.6)' }} />
            </div>
            <p className="text-white/50 mt-5">20 de agosto 2026 · Tenis Club Samborondón · Guayaquil</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {PAQUETES.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className="relative text-left flex flex-col rounded-xl p-6 transition-all duration-200 cursor-pointer glass-panel"
                style={
                  selected === p.id
                    ? { border: '1px solid #00ff88', boxShadow: '0 0 30px rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.05)' }
                    : p.popular
                    ? { border: '1px solid #00ff88', boxShadow: '0 0 20px rgba(0,255,136,0.2)' }
                    : { border: '1px solid rgba(0,255,136,0.2)' }
                }
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ background: '#00ff88', color: '#0a0e2a' }}>
                    MÁS POPULAR
                  </span>
                )}
                {'ahorras' in p && (
                  <span className="self-start text-xs font-bold px-2 py-0.5 rounded mb-3" style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                    AHORRAS ${p.ahorras}
                  </span>
                )}
                <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">{p.label}</p>
                <p className="text-5xl font-extrabold my-2" style={{ color: p.popular ? '#00ff88' : 'white' }}>
                  ${p.precio}
                </p>
                <p className="text-sm mb-5" style={{ color: '#b5c4ff' }}>{p.desc}</p>
                <ul className="space-y-1.5 mb-6 flex-1">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/70">
                      <span className="mt-0.5 shrink-0" style={{ color: '#00ff88' }}>✓</span>
                      {f}
                    </li>
                  ))}
                  {p.cantidad > 1 && (
                    <li className="flex items-start gap-2 text-sm text-white/70">
                      <span className="mt-0.5 shrink-0" style={{ color: '#00ff88' }}>✓</span>
                      Link de registro por cada entrada adicional
                    </li>
                  )}
                </ul>
                {'nota' in p && p.nota && (
                  <p className="text-xs text-white/35 mt-auto">{p.nota}</p>
                )}
              </button>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => selected && router.push(`/checkout?paquete=${selected}`)}
              disabled={!selected}
              className="btn-neon text-base px-12 py-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {selected ? `Comprar ${PAQUETES.find(p => p.id === selected)?.label} →` : 'Selecciona una entrada'}
            </button>
            <p className="text-white/30 text-xs mt-4">Los precios no incluyen IVA · Factura emitida a nombre del comprador</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12 mt-8" style={{ background: '#050814' }}>
        <div className="max-w-7xl mx-auto px-5 lg:px-16 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-sm">
          <p>© 2026 INHOUSE Tech IV Edición · Organizado por Morphosis</p>
          <p>¿Auspiciante o invitado ESPOL? Usa el link personalizado que te enviaron.</p>
        </div>
      </footer>
    </div>
  )
}
