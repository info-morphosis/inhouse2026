import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json()
    if (!pin || pin !== process.env.GARITA_PIN) {
      return NextResponse.json({ error: 'PIN inválido' }, { status: 401 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
