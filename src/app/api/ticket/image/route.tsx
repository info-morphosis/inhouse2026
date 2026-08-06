import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const nombre = searchParams.get('nombre') || 'Asistente'
  const codigo = searchParams.get('codigo') || 'INHOUSE2026'
  const badge = searchParams.get('badge') || 'ENTRADA'
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(codigo)}&size=220x220&margin=6&color=0a0e2a`

  // Pre-fetch QR as base64 so it renders in edge ImageResponse
  let qrDataUrl = ''
  try {
    const buf = await fetch(qrUrl).then(r => r.arrayBuffer())
    const bytes = new Uint8Array(buf)
    let binary = ''
    const chunk = 8192
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
    }
    qrDataUrl = `data:image/png;base64,${btoa(binary)}`
  } catch {
    qrDataUrl = ''
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: 900,
          height: 400,
          background: '#0a0e2a',
          display: 'flex',
          flexDirection: 'row',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Neon left border */}
        <div style={{ width: 10, background: '#00ff88', flexShrink: 0 }} />

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', padding: '32px 28px', gap: 28 }}>

          {/* LEFT — branding + attendee info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: '#00ff88', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#0a0e2a', fontWeight: 900, fontSize: 16,
              }}>
                IT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>INHOUSE Tech</span>
                <span style={{ color: '#00ff88', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase' }}>IV Edición · 2026</span>
              </div>
            </div>

            {/* Event subtitle */}
            <div style={{ color: '#b5c4ff', fontSize: 12, marginBottom: 10 }}>
              Experiencia IA 2026 · Con aval académico ESPOL
            </div>

            {/* Separator */}
            <div style={{ height: 1, background: 'rgba(0,255,136,0.25)', marginBottom: 14 }} />

            {/* Attendee name */}
            <div style={{ color: 'white', fontSize: 32, fontWeight: 900, lineHeight: 1.1, marginBottom: 10 }}>
              {nombre}
            </div>

            {/* Badge pill */}
            <div style={{ display: 'flex', marginBottom: 'auto' }}>
              <div style={{
                background: '#00ff88', color: '#0a0e2a',
                padding: '5px 20px', borderRadius: 99,
                fontSize: 13, fontWeight: 800, letterSpacing: 1,
              }}>
                {badge}
              </div>
            </div>

            <div style={{ flex: 1 }} />

            {/* Event details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ color: '#999', fontSize: 12 }}>
                📅  20 DE AGOSTO DE 2026  ·  15H00
              </div>
              <div style={{ color: '#999', fontSize: 12 }}>
                📍  TENIS CLUB SAMBORONDÓN, GUAYAQUIL
              </div>
            </div>

            {/* Code */}
            <div style={{
              color: '#00ff88', fontSize: 11,
              letterSpacing: 2, marginTop: 10,
              fontWeight: 700, textTransform: 'uppercase',
            }}>
              {codigo}
            </div>
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, background: 'rgba(0,255,136,0.2)', flexShrink: 0, alignSelf: 'stretch' }} />

          {/* RIGHT — QR code */}
          <div style={{
            width: 210, display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 12, flexShrink: 0,
          }}>
            <div style={{ background: 'white', padding: 10, borderRadius: 12 }}>
              {qrDataUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={qrDataUrl} width={180} height={180} alt="QR" />
                : <div style={{ width: 180, height: 180, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>QR</div>
              }
            </div>
            <div style={{ color: '#666', fontSize: 10, textAlign: 'center' }}>
              Presenta en garita con tu cédula
            </div>
          </div>
        </div>

        {/* Neon right border */}
        <div style={{ width: 10, background: '#00ff88', flexShrink: 0 }} />
      </div>
    ),
    { width: 900, height: 400 }
  )
}
