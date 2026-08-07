export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { getAuthorization } from '@/lib/sri'
import { supabase as sb } from '@/lib/supabase'

function pad(n: number, d = 9) { return String(n).padStart(d, '0') }

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get('x-sri-key')
    if (key !== process.env.SRI_API_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { orderId } = await req.json()
    const { data: order, error } = await sb.from('orders').select('id, factura_clave, factura_estado, factura_num').eq('id', orderId).single()
    if (error || !order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    if (order.factura_estado === 'autorizada') {
      return NextResponse.json({ ok: true, factura_num: order.factura_num, estado: 'autorizada', ya_existia: true })
    }

    if (!order.factura_clave) {
      return NextResponse.json({ error: 'Sin clave de acceso — primero emitir factura' }, { status: 400 })
    }

    const clave = order.factura_clave
    const numeroAutorizacion = await getAuthorization(clave, 6)

    const sec = Number(clave.slice(30, 39))
    const num = `${process.env.SRI_ESTAB ?? '001'}-${process.env.SRI_PTO_EMI ?? '001'}-${pad(sec)}`
    const url = `https://srienlinea.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?claveAcceso=${clave}`

    await sb.from('orders').update({
      factura_num: num,
      factura_url: url,
      factura_secuencial: sec,
      factura_estado: 'autorizada',
      factura_autorizada_at: new Date().toISOString(),
    }).eq('id', orderId)

    return NextResponse.json({ ok: true, factura_num: num, claveAcceso: clave, numeroAutorizacion, estado: 'autorizada' })
  } catch (e: unknown) {
    const err = e as { message?: string }
    console.error('[SRI/autorizar]', e)
    return NextResponse.json({ error: String(e), message: err?.message }, { status: 500 })
  }
}
