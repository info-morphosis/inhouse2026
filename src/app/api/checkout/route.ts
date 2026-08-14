import { NextRequest, NextResponse } from 'next/server'
import { supabase, PAQUETES, type Paquete } from '@/lib/supabase'
import { createCheckout } from '@/lib/datafast'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nombres, apellidos, tipo_id, ci_pasaporte, email, whatsapp,
            razon_social, ruc, direccion, paquete: paqueteId } = body

    if (!nombres || !apellidos || !tipo_id || !ci_pasaporte || !email || !whatsapp || !direccion || !paqueteId) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    // Datafast exige cédula de exactamente 10 dígitos (identificationDocId).
    const cedula = String(ci_pasaporte).replace(/\D/g, '')
    if (cedula.length !== 10) {
      return NextResponse.json({ error: 'La cédula debe tener 10 dígitos' }, { status: 400 })
    }

    const paquete = PAQUETES[paqueteId as Paquete]
    if (!paquete) return NextResponse.json({ error: 'Paquete inválido' }, { status: 400 })

    const subtotal = paquete.cantidad * paquete.precio
    const iva = 0 // evento educativo — IVA 0%
    let total = subtotal + iva

    // DEV ONLY: la tarjeta de prueba de Datafast tiene cupo <= $50. Con
    // DEV_TEST_TOTAL forzamos un monto pequeño para poder ver aprobaciones en
    // el ambiente de desarrollo. En producción esta variable NO se setea.
    const devTestTotal = process.env.DEV_TEST_TOTAL
    if (devTestTotal) total = Number(devTestTotal)

    // 1) Crear orden en Supabase (estado pending; los tickets se crean al aprobar el pago)
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        nombres, apellidos, tipo_id, ci_pasaporte: cedula, email, whatsapp,
        razon_social: razon_social || null,
        ruc: ruc || null,
        direccion,
        paquete: paqueteId,
        cantidad: paquete.cantidad,
        precio_unit: paquete.precio,
        subtotal, iva, total,
        estado: 'pending',
      })
      .select()
      .single()

    if (orderErr) throw orderErr

    // 2) Crear checkout en Datafast → checkoutId para el widget
    const merchantTransactionId = `IH-${String(order.id).replace(/-/g, '').slice(0, 12)}-${Date.now()}`
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || '0.0.0.0'

    const checkout = await createCheckout({
      amount: total,
      merchantCustomerId: cedula,
      merchantTransactionId,
      givenName: nombres,
      surname: apellidos,
      email,
      identificationDocId: cedula,
      phone: whatsapp,
      ip,
      address: direccion,
      item: devTestTotal
        ? { name: 'Prueba INHOUSE Tech 2026', description: 'Transaccion de prueba', price: total, quantity: 1 }
        : {
            name: `Entrada ${paquete.label} - INHOUSE Tech 2026`,
            description: 'Entrada Congreso INHOUSE Tech 2026',
            price: paquete.precio,
            quantity: paquete.cantidad,
          },
    })

    if (!checkout.ok || !checkout.checkoutId) {
      console.error('[checkout] Datafast rechazó la creación:', checkout.code, checkout.raw)
      await supabase.from('orders').update({ estado: 'failed', result_code: checkout.code || null }).eq('id', order.id)
      return NextResponse.json({ error: 'No se pudo iniciar el pago. Intenta nuevamente.' }, { status: 502 })
    }

    await supabase.from('orders').update({
      merchant_transaction_id: merchantTransactionId,
      checkout_id: checkout.checkoutId,
    }).eq('id', order.id)

    return NextResponse.json({ orderId: order.id, checkoutId: checkout.checkoutId })
  } catch (err: unknown) {
    console.error('[checkout]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
