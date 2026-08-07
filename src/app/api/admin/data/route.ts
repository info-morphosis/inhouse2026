import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { pin, view } = await req.json()
    if (!pin || pin !== process.env.ADMIN_PIN) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (view === 'stats') {
      const [
        { count: ordersTotal },
        { count: ordersPagados },
        { data: recaudadoData },
        { count: ticketsEmitidos },
        { count: ticketsRegistrados },
        { count: ticketsUsados },
        { count: invitadosTotal },
        { count: invitadosUsados },
        { data: campañas },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('estado', 'paid'),
        supabase.from('orders').select('total').eq('estado', 'paid'),
        supabase.from('tickets').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('asistente_registrado', true),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('usado', true),
        supabase.from('invitados').select('*', { count: 'exact', head: true }),
        supabase.from('invitados').select('*', { count: 'exact', head: true }).eq('usado', true),
        supabase.from('registration_campaigns').select('*').order('created_at'),
      ])

      const recaudado = (recaudadoData ?? []).reduce((s, r) => s + Number(r.total ?? 0), 0)

      return NextResponse.json({
        orders: { total: ordersTotal ?? 0, pagados: ordersPagados ?? 0, recaudado },
        tickets: { emitidos: ticketsEmitidos ?? 0, registrados: ticketsRegistrados ?? 0, usados: ticketsUsados ?? 0 },
        invitados: { total: invitadosTotal ?? 0, usados: invitadosUsados ?? 0 },
        campañas: campañas ?? [],
      })
    }

    if (view === 'tickets') {
      const { data } = await supabase
        .from('tickets')
        .select(`
          codigo, numero, tipo,
          asistente_nombres, asistente_apellidos, asistente_ci, asistente_email, asistente_whatsapp,
          asistente_registrado, registrado_at, usado, usado_at,
          orders(nombres, apellidos, email, paquete, total, estado, created_at)
        `)
        .order('created_at', { ascending: false })
      return NextResponse.json({ data: data ?? [] })
    }

    if (view === 'invitados') {
      const { data } = await supabase
        .from('invitados')
        .select(`
          codigo, nombres, apellidos, ci_pasaporte, email, whatsapp, badge_tipo,
          usado, usado_at, created_at,
          registration_campaigns(nombre, tipo, slug)
        `)
        .order('created_at', { ascending: false })
      return NextResponse.json({ data: data ?? [] })
    }

    if (view === 'ingresados') {
      const { data: t } = await supabase
        .from('tickets')
        .select('codigo, asistente_nombres, asistente_apellidos, asistente_ci, badge_tipo:tipo, usado_at')
        .eq('usado', true)
        .order('usado_at', { ascending: false })

      const { data: i } = await supabase
        .from('invitados')
        .select('codigo, nombres, apellidos, ci_pasaporte, badge_tipo, usado_at')
        .eq('usado', true)
        .order('usado_at', { ascending: false })

      const tickets = (t ?? []).map(r => ({
        codigo: r.codigo,
        nombres: r.asistente_nombres,
        apellidos: r.asistente_apellidos,
        ci: r.asistente_ci,
        badge: r.badge_tipo,
        usado_at: r.usado_at,
        origen: 'ticket',
      }))
      const invs = (i ?? []).map(r => ({
        codigo: r.codigo,
        nombres: r.nombres,
        apellidos: r.apellidos,
        ci: r.ci_pasaporte,
        badge: r.badge_tipo,
        usado_at: r.usado_at,
        origen: 'invitado',
      }))
      const data = [...tickets, ...invs].sort((a, b) =>
        new Date(b.usado_at ?? 0).getTime() - new Date(a.usado_at ?? 0).getTime()
      )
      return NextResponse.json({ data })
    }

    if (view === 'facturas') {
      const { data } = await supabase
        .from('orders')
        .select('id, nombres, apellidos, email, paquete, total, factura_estado, factura_num, factura_clave, factura_url, created_at')
        .not('estado', 'eq', 'pending')
        .order('created_at', { ascending: false })
      return NextResponse.json({ data: data ?? [] })
    }

    return NextResponse.json({ error: 'Vista no encontrada' }, { status: 400 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
