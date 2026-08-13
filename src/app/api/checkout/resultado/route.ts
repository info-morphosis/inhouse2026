export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getStatus } from '@/lib/datafast'

// Datafast redirige aquí (GET) tras presionar Pagar, con ?resourcePath=...&id=...
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin
  const resourcePath = req.nextUrl.searchParams.get('resourcePath')

  const redir = (path: string) => NextResponse.redirect(`${origin}${path}`)

  if (!resourcePath) return redir(`/confirmacion?estado=error`)

  // La orden se resuelve por el checkoutId embebido en el resourcePath:
  // /v1/checkouts/{checkoutId}/payment
  const checkoutId = resourcePath.match(/checkouts\/([^/]+)\/payment/)?.[1]
  if (!checkoutId) return redir(`/confirmacion?estado=error`)

  const { data: orderByCk } = await supabase
    .from('orders').select('id').eq('checkout_id', checkoutId).single()
  const orderId = orderByCk?.id as string | undefined
  if (!orderId) return redir(`/confirmacion?estado=error`)

  try {
    const status = await getStatus(resourcePath)

    // Guardar resultado en la orden (aprobada o rechazada, para auditoría)
    await supabase.from('orders').update({
      result_code: status.code || null,
      payment_id: status.paymentId || null,
    }).eq('id', orderId)

    if (!status.ok) {
      await supabase.from('orders').update({ estado: 'failed' }).eq('id', orderId)
      return redir(`/confirmacion?order=${orderId}&estado=rechazado&code=${status.code || ''}`)
    }

    // ── Pago aprobado ──
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single()
    if (!order) return redir(`/confirmacion?order=${orderId}&estado=error`)

    // Idempotencia: si ya está pagada, no re-crear tickets ni re-enviar
    if (order.estado === 'paid') {
      return redir(`/confirmacion?order=${orderId}&estado=ok`)
    }

    await supabase.from('orders').update({
      estado: 'paid',
      pagado_at: new Date().toISOString(),
    }).eq('id', orderId)

    const tickets = await createTickets(orderId, order.cantidad)

    // 1 entrada: el comprador ES el asistente → registrar automáticamente con sus
    // datos y generar el ticket con QR directo (reutiliza /api/registro para que el
    // flujo de QR/n8n sea idéntico al de un registro manual).
    // 5 o 10 entradas: se envían los enlaces para registrar a cada asistente.
    let regMode: 'auto' | 'links' = 'links'
    if (order.cantidad === 1) {
      regMode = 'auto'
      await fetch(`${origin}/api/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'ticket',
          token: tickets[0].registro_token,
          nombres: order.nombres,
          apellidos: order.apellidos,
          tipo_id: order.tipo_id,
          ci_pasaporte: order.ci_pasaporte,
          email: order.email,
          whatsapp: order.whatsapp,
          empresa: order.razon_social || null,
        }),
      }).catch(e => console.error('[resultado] auto-registro:', e))
    } else {
      await enviarLinksRegistro(origin, order, tickets).catch(e => console.error('[resultado] email:', e))
    }

    // Facturación SRI (RECEPCION; AUTORIZACION en batch) — no bloquea al usuario
    fetch(`${origin}/api/sri/factura`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-sri-key': process.env.SRI_API_KEY || '' },
      body: JSON.stringify({ orderId }),
    }).catch(e => console.error('[resultado] sri:', e))

    return redir(`/confirmacion?order=${orderId}&estado=ok&reg=${regMode}`)
  } catch (err) {
    console.error('[resultado]', err)
    return redir(`/confirmacion?order=${orderId}&estado=error`)
  }
}

async function createTickets(orderId: string, cantidad: number) {
  // Número de orden correlativo (MAX del segmento medio del código, evita colisiones por borrados)
  const { data: maxRow } = await supabase
    .from('tickets')
    .select('codigo')
    .like('codigo', 'INHOUSE2026-C-%')
    .order('codigo', { ascending: false })
    .limit(1)
  const lastNum = maxRow?.[0]?.codigo
    ? parseInt(String(maxRow[0].codigo).split('-')[2] || '0', 10)
    : 0
  const orderNum = String(lastNum + 1).padStart(4, '0')

  const rows = Array.from({ length: cantidad }, (_, i) => ({
    order_id: orderId,
    codigo: `INHOUSE2026-C-${orderNum}-${String(i + 1).padStart(2, '0')}`,
    numero: i + 1,
    registro_token: crypto.randomUUID(),
  }))

  const { data, error } = await supabase.from('tickets').insert(rows).select()
  if (error) throw error
  return data as Array<{ registro_token: string; codigo: string; numero: number }>
}

async function enviarLinksRegistro(
  origin: string,
  order: { nombres: string; email: string; cantidad: number },
  tickets: Array<{ registro_token: string; numero: number }>,
) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) { console.warn('[resultado] RESEND_API_KEY no configurado'); return }

  const links = tickets
    .sort((a, b) => a.numero - b.numero)
    .map(t => `${origin}/registro/ticket/${t.registro_token}`)

  const linksHtml = links.map((l, i) =>
    `<p style="margin:8px 0"><strong>Entrada ${i + 1}:</strong><br>
      <a href="${l}" style="color:#00b36b;word-break:break-all">${l}</a></p>`).join('')

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <h2 style="color:#0a0e2a">¡Pago confirmado! 🎉</h2>
      <p>Hola ${order.nombres}, gracias por tu compra para el <strong>Congreso INHOUSE Tech 2026</strong>.</p>
      <p>Registra a ${order.cantidad > 1 ? `los ${order.cantidad} asistentes` : 'tu asistente'} con
         ${order.cantidad > 1 ? 'estos enlaces' : 'este enlace'} para recibir
         ${order.cantidad > 1 ? 'las entradas con código QR' : 'la entrada con código QR'}:</p>
      ${linksHtml}
      <p style="color:#666;font-size:13px;margin-top:24px">Solo ingresa quien esté registrado. Presenta tu cédula en la garita del Tenis Club Samborondón.</p>
    </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'INHOUSE Tech 2026 <tickets@morphosis.ec>',
      to: order.email,
      subject: `Registra tu${order.cantidad > 1 ? 's' : ''} entrada${order.cantidad > 1 ? 's' : ''} — INHOUSE Tech 2026`,
      html,
    }),
  })
  if (!res.ok) console.error('[resultado] Resend error:', await res.text())
}
