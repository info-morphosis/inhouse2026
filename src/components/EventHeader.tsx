import Image from 'next/image'
import Link from 'next/link'

export default function EventHeader() {
  return (
    <nav className="w-full border-b border-white/10 px-4 py-3 sticky top-0 z-50 backdrop-blur-md"
      style={{ background: 'rgba(10,14,42,0.95)' }}>
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo-inhouse.png" alt="INHOUSE Tech" width={38} height={38}
            className="rounded-lg object-contain" />
          <div>
            <div className="font-extrabold text-sm leading-tight text-white group-hover:text-[#00ff88] transition-colors">
              INHOUSE Tech 2026
            </div>
            <div className="text-[10px] text-white/40 leading-tight">20 agosto · Tenis Club Samborondón</div>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <span>Aval académico</span>
          <span className="font-bold text-white/70 tracking-tight" style={{ fontStyle: 'italic' }}>espol®</span>
        </div>
      </div>
    </nav>
  )
}
