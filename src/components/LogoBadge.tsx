import Image from 'next/image'

export default function LogoBadge() {
  return (
    <div className="flex items-center justify-center gap-6 py-5 mb-6"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <Image src="/logo-inhouse.png" alt="INHOUSE Tech" width={110} height={44}
        className="object-contain" style={{ maxHeight: 44 }} />
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.15)' }} />
      <div className="text-center">
        <div className="text-[9px] text-white/35 uppercase tracking-[0.2em] mb-0.5">Con aval académico</div>
        <div className="font-extrabold text-lg lowercase tracking-tight text-white" style={{ fontStyle: 'italic' }}>
          espol<span className="text-sm align-super">®</span>
        </div>
      </div>
    </div>
  )
}
