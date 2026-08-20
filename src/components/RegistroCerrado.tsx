import EventHeader from '@/components/EventHeader'
import LogoBadge from '@/components/LogoBadge'
import EventFooter from '@/components/EventFooter'

/**
 * Estado "registro cerrado / Sold Out" para las páginas de invitación.
 * Mantiene la etiqueta de la invitación y le superpone la etiqueta AGOTADO,
 * con el botón deshabilitado. Activar por página con `const CERRADO = true`.
 */
export default function RegistroCerrado({ etiqueta, titulo }: { etiqueta: string; titulo: string }) {
  return (
    <>
      <EventHeader showWordmark={false} />
      <main className="max-w-lg mx-auto px-4 py-8">
        <LogoBadge />
        <div className="text-center mb-8">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
            <span className="inline-block bg-[#00ff88] text-[#0a0e2a] font-bold px-4 py-1 rounded-full text-sm opacity-60">
              {etiqueta}
            </span>
            <span className="inline-block bg-red-500 text-white font-bold px-4 py-1 rounded-full text-sm uppercase tracking-wider">
              Agotado · Sold Out
            </span>
          </div>
          <h1 className="text-2xl font-bold">{titulo}</h1>
          <p className="text-white/50 mt-2 text-sm">20 agosto · Tenis Club Samborondón</p>
        </div>
        <div className="card text-center py-10 space-y-5">
          <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] px-4 py-1.5 rounded-full"
            style={{ background: '#00ff88', color: '#0a0e2a' }}>
            Aforo completo
          </span>
          <h2 className="text-4xl font-extrabold uppercase tracking-tight" style={{ color: '#00ff88' }}>Agotado</h2>
          <p className="text-white/60">El registro para el Congreso INHOUSE Tech 2026 está cerrado · Sold Out</p>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            El aforo está completo. Para cualquier consulta escríbenos por WhatsApp.
          </p>
          <button type="button" disabled aria-disabled="true"
            className="btn-neon w-full text-center opacity-50 cursor-not-allowed">
            Registro cerrado
          </button>
          <div>
            <a href="https://wa.me/593984309726" target="_blank" rel="noopener noreferrer"
              className="btn-outline inline-block text-sm px-8 py-3">Contactar por WhatsApp</a>
          </div>
        </div>
      </main>
      <EventFooter />
    </>
  )
}
