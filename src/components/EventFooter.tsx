import Link from 'next/link'

export default function EventFooter() {
  return (
    <footer className="border-t border-white/10 mt-16 py-8 px-4 text-center"
      style={{ background: '#050814' }}>
      <p className="text-white/35 text-xs mb-3">
        Soporte — consultas sobre tu entrada
      </p>
      <div className="flex justify-center gap-6 text-sm mb-4">
        <a href="mailto:tickets@morphosis.ec"
          className="text-white/50 hover:text-white transition-colors">
          tickets@morphosis.ec
        </a>
        <a href="https://wa.me/593984309726" target="_blank" rel="noopener noreferrer"
          className="hover:text-[#00ff88] transition-colors" style={{ color: '#00ff88' }}>
          WhatsApp +593 98 430 9726
        </a>
      </div>
      <p className="text-white/20 text-xs">
        Morphosis Digital ·{' '}
        <Link href="/politicas" className="hover:text-white/50 transition-colors underline">
          Políticas de cancelación
        </Link>
        {' '}· © 2026 INHOUSE Tech IV Edición
      </p>
    </footer>
  )
}
