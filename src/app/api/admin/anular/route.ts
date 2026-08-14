import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { DATAFAST_BASE } from '@/lib/datafast'

export async function POST(req: NextRequest) {
  try {
    const { pin, orderId } = await req.json()
    if (!pin || pin !== process.env.ADMIN_PIN)
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { data: order } = await supabase
      .from('orders')
      .select('id, payment_id, total, estado, nombres, apellidos')
      .eq('id', orderId)
      .single()

    if (!order)
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 })
    if (order.estado !== 'paid')
      return NextResponse.json({ error: `La orden está en estado "${order.estado}", solo se anulan órdenes pagadas` }, { status: 400 })
    if (!order.payment_id)
      return NextResponse.json({ error: 'Sin payment_id — el pago no fue procesado por Datafast' }, { status: 400 })

    const mid = process.env.DATAFAST_MID || '1000000505'
    const tid = process.env.DATAFAST_TID || 'PD100406'
    const isProd = (process.env.DATAFAST_ENV || 'test').toLowerCase() === 'prod'

    const params = new URLSearchParams({
      entityId: process.env.DATAFAST_ENTITY_ID!,
      paymentType: 'RF',
      amount: String(Number(order.total).toFixed(2)),
      currency: 'USD',
      merchantTransactionId: `ANUL-${orderId.slice(0, 8)}-${Date.now()}`,
      'customParameters[SHOPPER_MID]': mid,
      'customParameters[SHOPPER_TID]': tid,
    })
    if (!isProd) params.append('testMode', 'EXTERNAL')

    const rfRes = await fetch(`${DATAFAST_BASE}/v1/payments/${order.payment_id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DATAFAST_BEARER_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })

    const rfData = await rfRes.json()
    const rfCode: string = rfData.result?.code ?? ''
    const isOk = rfCode.startsWith('000.')

    if (isOk) {
      await supabase.from('orders').update({
        estado: 'anulada',
        anulada_at: new Date().toISOString(),
        anulacion_code: rfCode,
        anulacion_ref: rfData.resultDetails?.ReferenceNbr ?? null,
      }).eq('id', orderId)
    }

    return NextResponse.json({
      ok: isOk,
      code: rfCode,
      description: rfData.result?.description ?? '',
      refNbr: rfData.resultDetails?.ReferenceNbr ?? null,
    })
  } catch (e) {
    console.error('[anular]', e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
