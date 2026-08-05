import { NextRequest, NextResponse } from 'next/server'
import { supabase, PAQUETES, type Paquete } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombres, apellidos, tipo_id, ci_pasaporte, email, whatsapp,
            razon_social, ruc, direccion, paquete: paqueteId } = body

    if (!nombres || !apellidos || !tipo_id || !ci_pasaporte || !email || !whatsapp || !paqueteId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const paquete = PAQUETES[paqueteId as Paquete]
    if (!paquete) return NextResponse.json({ error: 'Paquete inválido' }, { status: 400 })

    const subtotal = paquete.cantidad * paquete.precio
    const iva = 0 // pendiente confirmar con contador
    const total = subtotal + iva

    // Crear orden en Supabase
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        nombres, apellidos, tipo_id, ci_pasaporte, email, whatsapp,
        razon_social: razon_social || null,
        ruc: ruc || null,
        direccion: direccion || null,
        paquete: paqueteId,
        cantidad: paquete.cantidad,
        precio_unit: paquete.precio,
        subtotal,
        iva,
        total,
        estado: 'pending',
      })
      .select()
      .single()

    if (orderErr) throw orderErr

    // TODO: Crear checkout en Datafast cuando tengamos credenciales
    // const dfCheckout = await createDatafastCheckout({ orderId: order.id, total, email })
    // return NextResponse.json({ checkoutUrl: dfCheckout.url })

    // Por ahora: modo test — simular pago exitoso y crear tickets
    await createTickets(order.id, paquete.cantidad)

    return NextResponse.json({ orderId: order.id })
  } catch (err: unknown) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function createTickets(orderId: string, cantidad: number) {
  // Obtener número de orden (correlativo)
  const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const orderNum = String(count || 1).padStart(4, '0')

  const tickets = Array.from({ length: cantidad }, (_, i) => ({
    order_id: orderId,
    codigo: `INHOUSE2026-C-${orderNum}-${String(i + 1).padStart(2, '0')}`,
    numero: i + 1,
  }))

  await supabase.from('tickets').insert(tickets)
}
