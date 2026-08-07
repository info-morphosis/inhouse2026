export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'

const N8N_PROXY = 'https://n8n.morphosis.ec/webhook/sri-soap-proxy'

export async function GET(req: NextRequest) {
  const key = req.headers.get('x-sri-key')
  if (key !== process.env.SRI_API_KEY) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const testEnvelope = '<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ec:validarComprobante xmlns:ec="http://ec.gob.sri.ws.recepcion"><xml>dGVzdA==</xml></ec:validarComprobante></soap:Body></soap:Envelope>'

  try {
    const res = await fetch(N8N_PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        soapUrl: 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
        soapEnvelope: testEnvelope,
      }),
      signal: AbortSignal.timeout(40000),
    })
    const text = await res.text()
    return NextResponse.json({
      proxyStatus: res.status,
      proxyOk: res.ok,
      bodyLength: text.length,
      bodyPreview: text.slice(0, 500),
    })
  } catch (e: unknown) {
    const err = e as { message?: string; cause?: unknown }
    return NextResponse.json({
      error: String(e),
      message: err?.message,
      cause: String(err?.cause ?? ''),
    }, { status: 500 })
  }
}
