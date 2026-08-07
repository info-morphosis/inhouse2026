import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

function getLogoBase64(file: string): string {
  try {
    const buf = fs.readFileSync(path.join(process.cwd(), 'public', file))
    return `data:image/png;base64,${buf.toString('base64')}`
  } catch { return '' }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const nombre = searchParams.get('nombre') || 'Asistente'
  const codigo = searchParams.get('codigo') || 'INHOUSE2026'
  const badge = searchParams.get('badge') || 'ENTRADA'

  // Generate QR locally as a data URL — no external fetch, always available.
  let qrDataUrl = ''
  try {
    qrDataUrl = await QRCode.toDataURL(codigo, {
      margin: 1,
      width: 220,
      color: { dark: '#0a0e2a', light: '#ffffff' },
    })
  } catch {
    qrDataUrl = ''
  }

  const logoBase64 = getLogoBase64('logo-inhouse.png')
  const espolBase64 = getLogoBase64('logo-espol.png')

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
        <div style={{ width: 10, background: '#00ff88', display: 'flex', flexShrink: 0 }} />

        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'row', padding: '32px 28px', gap: 28 }}>

          {/* LEFT — branding + attendee info */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>

            {/* Logo row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              {logoBase64 ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoBase64} width={48} height={48} alt="INHOUSE" style={{ borderRadius: 10, objectFit: 'contain' }} />
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: '#00ff88', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#0a0e2a', fontWeight: 900, fontSize: 16,
                }}>IT</div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 22, lineHeight: 1 }}>INHOUSE Tech</span>
                <span style={{ color: '#00ff88', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', display: 'flex' }}>IV Edicion · 2026</span>
              </div>
              {/* ESPOL logo */}
              {espolBase64 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginLeft: 'auto', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: 14 }}>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, display: 'flex', marginBottom: 4 }}>aval académico</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={espolBase64} width={90} height={28} alt="ESPOL" style={{ objectFit: 'contain' }} />
                </div>
              )}
            </div>

            {/* Event subtitle */}
            <div style={{ color: '#b5c4ff', fontSize: 12, marginBottom: 10, display: 'flex' }}>
              Experiencia IA 2026 · Congreso de transformacion digital
            </div>

            {/* Separator */}
            <div style={{ height: 1, background: 'rgba(0,255,136,0.25)', marginBottom: 14, display: 'flex' }} />

            {/* Attendee name */}
            <div style={{ color: 'white', fontSize: 32, fontWeight: 900, lineHeight: 1.1, marginBottom: 12, display: 'flex' }}>
              {nombre}
            </div>

            {/* Badge pill */}
            <div style={{ display: 'flex' }}>
              <div style={{
                background: '#00ff88', color: '#0a0e2a',
                padding: '5px 20px', borderRadius: 99,
                fontSize: 13, fontWeight: 800, letterSpacing: 1,
                display: 'flex',
              }}>
                {badge}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10 }}>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, display: 'flex' }}>
                Presenta tu cedula en la garita de ingreso al Tenis Club.
              </div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, display: 'flex' }}>
                El codigo QR en el salon de eventos.
              </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1, display: 'flex' }} />

            {/* Event details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ color: '#aaa', fontSize: 12, display: 'flex' }}>
                20 DE AGOSTO DE 2026  ·  15H00
              </div>
              <div style={{ color: '#aaa', fontSize: 12, display: 'flex' }}>
                TENIS CLUB SAMBORONDON, GUAYAQUIL
              </div>
            </div>

            {/* Code */}
            <div style={{
              color: '#00ff88', fontSize: 11,
              letterSpacing: 2, marginTop: 10,
              fontWeight: 700, textTransform: 'uppercase',
              display: 'flex',
            }}>
              {codigo}
            </div>
          </div>

          {/* Vertical perforated divider (Stitch style) */}
          <div style={{ width: 0, borderLeft: '2px dashed #00ff88', opacity: 0.55, flexShrink: 0, alignSelf: 'stretch', display: 'flex' }} />

          {/* RIGHT — QR code */}
          <div style={{
            width: 220, display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 14, flexShrink: 0,
          }}>
            <div style={{ background: 'white', padding: 12, borderRadius: 14, display: 'flex', boxShadow: '0 0 24px rgba(0,255,136,0.45)' }}>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} width={176} height={176} alt="QR" />
              ) : (
                <div style={{ width: 176, height: 176, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 12 }}>
                  {codigo}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Neon right border */}
        <div style={{ width: 10, background: '#00ff88', display: 'flex', flexShrink: 0 }} />
      </div>
    ),
    { width: 900, height: 400 }
  )
}
