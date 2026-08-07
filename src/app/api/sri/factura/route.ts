export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { recibirEnSri, getAuthorization, BuyerInfo, DetalleItem } from '@/lib/sri'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function pad(n: number, d = 9) { return String(n).padStart(d, '0') }
function facturaNum(sec: number) {
  return `${process.env.SRI_ESTAB ?? '001'}-${process.env.SRI_PTO_EMI ?? '001'}-${pad(sec)}`
}
function facturaUrl(clave: string) {
  return `https://srienlinea.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?claveAcceso=${clave}`
}

export async function POST(req: NextRequest) {
  try {
    const key = req.headers.get('x-sri-key')
    if (key !== process.env.SRI_API_KEY) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { orderId } = await req.json()
    const { data: order, error } = await sb.from('orders').select('*').eq('id', orderId).single()
    if (error || !order) return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })

    // Ya autorizada
    if (order.factura_estado === 'autorizada') {
      return NextResponse.json({ ok: true, factura_num: order.factura_num, estado: 'autorizada', ya_existia: true })
    }

    let claveAcceso: string = order.factura_clave

    // RECEPCION — solo si no tiene clave aún
    if (!claveAcceso) {
      const { data: secRpc } = await sb.rpc('next_sri_secuencial')
      const secuencial = secRpc as number

      const tipoId = (order.ruc ? 'ruc' : order.tipo_id === 'pasaporte' ? 'pasaporte' : 'cedula') as BuyerInfo['tipoId']
      const identificacion = order.ruc || order.ci_pasaporte
      const razonSocial = order.razon_social || `${order.nombres} ${order.apellidos}`

      const input = {
        fecha: new Date(),
        comprador: { tipoId, identificacion, razonSocial, email: order.email, telefono: order.whatsapp },
        detalles: [{
          codigoPrincipal: `ENTRADA-${(order.paquete ?? 'IND').toUpperCase()}`,
          descripcion: `Entrada Congreso INHOUSE Tech 2026 IV Edicion - ${order.paquete ?? 'Individual'}`,
          cantidad: order.cantidad ?? 1,
          precioUnitario: Number(order.precio_unit ?? order.total),
        }] as DetalleItem[],
        formaPago: '19' as const,
      }

      const result = await recibirEnSri(input, secuencial)
      claveAcceso = result.claveAcceso

      const sec = Number(claveAcceso.slice(30, 39))
      await sb.from('orders').update({
        factura_clave: claveAcceso,
        factura_secuencial: sec,
        factura_estado: 'recibida',
        factura_recibida_at: new Date().toISOString(),
      }).eq('id', orderId)
    }

    // AUTORIZACION — 2 intentos rápidos (no bloquear demasiado)
    try {
      const numeroAutorizacion = await getAuthorization(claveAcceso, 2)
      const sec = Number(claveAcceso.slice(30, 39))
      const num = facturaNum(sec)
      await sb.from('orders').update({
        factura_num: num,
        factura_url: facturaUrl(claveAcceso),
        factura_secuencial: sec,
        factura_estado: 'autorizada',
        factura_autorizada_at: new Date().toISOString(),
      }).eq('id', orderId)
      return NextResponse.json({ ok: true, factura_num: num, claveAcceso, numeroAutorizacion, estado: 'autorizada' })
    } catch {
      // AUTORIZACION falló — devolver éxito parcial, se reintentará después
      return NextResponse.json({
        ok: true,
        estado: 'recibida',
        claveAcceso,
        pendiente: true,
        message: 'Comprobante recibido por SRI. Autorización pendiente — reintentar más tarde.',
      })
    }
  } catch (e: unknown) {
    const err = e as { message?: string }
    console.error('[SRI/factura]', e)
    return NextResponse.json({ error: String(e), message: err?.message }, { status: 500 })
  }
}
