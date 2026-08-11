import Image from 'next/image'
import Link from 'next/link'

export default function EventHeader({ showWordmark = true }: { showWordmark?: boolean }) {
  return (
    <nav className="w-full border-b border-white/10 px-4 py-3 sticky top-0 z-50 backdrop-blur-md"
      style={{ background: 'rgba(10,14,42,0.95)' }}>
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image src="/logo-inhouse.png" alt="INHOUSE Tech" width={130} height={80}
            className="object-contain" style={{ maxHeight: 80 }} />
          <div className="flex flex-col gap-1">
            {showWordmark && (
              <div className="font-extrabold text-base leading-tight text-white group-hover:text-[#00ff88] transition-colors">
                INHOUSE Tech 2026
              </div>
            )}
            <Image src="/logo-espol.png" alt="ESPOL" width={110} height={34}
              className="object-contain opacity-70" />
          </div>
        </Link>
        <Link href="/" className="text-white/30 text-xs hover:text-white transition-colors">
          ← Inicio
        </Link>
      </div>
    </nav>
  )
}
