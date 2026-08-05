import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { tipo, token, slug, nombres, apellidos, tipo_id, ci_pasaporte, email, whatsapp } = body

    if (!nombres || !apellidos || !tipo_id || !ci_pasaporte || !email || !whatsapp) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    if (tipo === 'ticket') {
      // Registro de asistente para ticket comprado
      const { data: ticket, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('registro_token', token)
        .single()

      if (error || !ticket) return NextResponse.json({ error: 'Token inválido' }, { status: 404 })
      if (ticket.asistente_registrado) return NextResponse.json({ error: 'Este ticket ya fue registrado' }, { status: 409 })

      const { error: upErr } = await supabase.from('tickets').update({
        asistente_nombres: nombres,
        asistente_apellidos: apellidos,
        asistente_tipo_id: tipo_id,
        asistente_ci: ci_pasaporte,
        asistente_email: email,
        asistente_whatsapp: whatsapp,
        asistente_registrado: true,
        registrado_at: new Date().toISOString(),
      }).eq('id', ticket.id)

      if (upErr) throw upErr

      // Disparar n8n para generar QR y enviar ticket
      await notifyN8n('registro_ticket', { ticketId: ticket.id, ticket: { ...ticket, nombres, apellidos, email, whatsapp } })

      return NextResponse.json({ ok: true })

    } else if (tipo === 'auspiciante' || tipo === 'campana') {
      // Registro de invitado por campaña
      const { data: campaign, error: cErr } = await supabase
        .from('registration_campaigns')
        .select('*')
        .eq('slug', slug)
        .eq('activo', true)
        .single()

      if (cErr || !campaign) return NextResponse.json({ error: 'Enlace no válido o inactivo' }, { status: 404 })
      if (campaign.registrados >= campaign.limite) {
        return NextResponse.json({ error: 'Este enlace ha alcanzado su límite de registros' }, { status: 409 })
      }

      // Obtener número correlativo para invitados
      const { count } = await supabase.from('invitados').select('*', { count: 'exact', head: true })
      const num = String((count || 0) + 1).padStart(4, '0')

      const badgeMap: Record<string, string> = {
        auspiciante: 'AUSPICIANTE',
        vip_espol: 'VIP ESPOL',
        morphosis: 'CORTESÍA MORPHOSIS',
      }

      const { data: invitado, error: insErr } = await supabase.from('invitados').insert({
        campaign_id: campaign.id,
        nombres, apellidos, tipo_id, ci_pasaporte, email, whatsapp,
        codigo: `INHOUSE2026-I-${num}`,
        badge_tipo: badgeMap[campaign.tipo] || 'INVITADO',
      }).select().single()

      if (insErr) throw insErr

      await notifyN8n('registro_invitado', { invitadoId: invitado.id, invitado })

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Tipo de registro inválido' }, { status: 400 })

  } catch (err) {
    console.error('[registro]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

async function notifyN8n(event: string, payload: object) {
  const url = process.env.N8N_WEBHOOK_REGISTRO
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, ...payload }),
    })
  } catch {
    // Non-fatal: n8n notification failure shouldn't block the user
  }
}
