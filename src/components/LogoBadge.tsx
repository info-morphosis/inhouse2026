import Image from 'next/image'

export default function LogoBadge() {
  return (
    <div className="flex items-center justify-center gap-10 py-7 mb-6"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Image src="/logo-inhouse.png" alt="INHOUSE Tech" width={190} height={76}
        className="object-contain" style={{ maxHeight: 76 }} />
      <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.15)' }} />
      <div className="flex flex-col items-center gap-1.5">
        <span className="text-[10px] text-white/35 uppercase tracking-[0.2em]">Con aval académico</span>
        <Image src="/logo-espol.png" alt="ESPOL" width={150} height={47}
          className="object-contain opacity-80" />
      </div>
    </div>
  )
}
