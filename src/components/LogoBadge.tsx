import Image from 'next/image'

export default function LogoBadge() {
  return (
    <div className="flex items-center justify-center gap-8 py-5 mb-6"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Image src="/logo-inhouse.png" alt="INHOUSE Tech" width={120} height={48}
        className="object-contain" style={{ maxHeight: 48 }} />
      <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.15)' }} />
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[9px] text-white/35 uppercase tracking-[0.2em]">Con aval académico</span>
        <Image src="/logo-espol.png" alt="ESPOL" width={100} height={31}
          className="object-contain opacity-80" />
      </div>
    </div>
  )
}
