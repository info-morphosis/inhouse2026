import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { codigo, pin } = await req.json()

    if (!pin || pin !== process.env.GARITA_PIN) {
      return NextResponse.json({ error: 'PIN inválido' }, { status: 401 })
    }

    if (!codigo) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })

    // Buscar en vista unificada
    const { data, error } = await supabase
      .from('garita_lookup')
      .select('*')
      .eq('codigo', codigo)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Código no encontrado' }, { status: 404 })
    }

    if (data.usado) {
      return NextResponse.json({ ...data, error: null }, { status: 200 })
    }

    // Marcar como usado — actualizar tabla correcta según origen
    const ahora = new Date().toISOString()
    if (data.origen === 'compra') {
      await supabase.from('tickets')
        .update({ usado: true, usado_at: ahora, validado_por: 'garita' })
        .eq('codigo', codigo)
    } else {
      await supabase.from('invitados')
        .update({ usado: true, usado_at: ahora, validado_por: 'garita' })
        .eq('codigo', codigo)
    }

    return NextResponse.json({ ...data, usado: false })
  } catch (err) {
    console.error('[garita]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
