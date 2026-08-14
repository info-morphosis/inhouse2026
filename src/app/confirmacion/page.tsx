'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ConfirmacionContent() {
  const params = useSearchParams()
  const orderId = params.get('order')
  const estado = params.get('estado') || 'ok'
  const reg = params.get('reg') // 'auto' = 1 entrada (ticket directo) · 'links' = packs

  if (estado === 'rechazado' || estado === 'error') {
    const rechazado = estado === 'rechazado'
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center py-10">
          <div className="text-6xl mb-4">{rechazado ? '❌' : '⚠️'}</div>
          <h1 className="text-3xl font-bold mb-3">
            {rechazado ? 'Pago no aprobado' : 'Algo salió mal'}
          </h1>
          <p className="text-white/60 mb-6">
            {rechazado
              ? 'Tu banco rechazó la transacción. No se realizó ningún cobro. Puedes intentar con otra tarjeta.'
              : 'No pudimos confirmar el estado de tu pago. Si se realizó un cobro, escríbenos por WhatsApp y lo verificamos.'}
          </p>
          <a href="/#entradas" className="btn-neon inline-block">Intentar de nuevo</a>
          <br />
          <a href="/" className="btn-outline mt-3 inline-block">Volver al inicio</a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-3">¡Pago confirmado!</h1>
        {reg === 'auto' ? (
          <p className="text-white/60 mb-6">
            Te enviamos <strong className="text-white">tu entrada con código QR</strong> al correo.
            Preséntala junto con tu cédula en la garita del Tenis Club Samborondón.
          </p>
        ) : (
          <p className="text-white/60 mb-6">
            Te enviamos un correo con{' '}
            <strong className="text-white">los enlaces para registrar tus entradas</strong>.
            Al registrarlas recibirás el ticket con código QR.
          </p>
        )}
        <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
          <p className="text-white/40 text-xs mb-1">Número de orden</p>
          <p className="font-mono text-sm break-all">{orderId || '—'}</p>
        </div>
        <p className="text-white/40 text-sm">
          Si no recibes el correo en 10 minutos, revisa spam o escríbenos por WhatsApp.
        </p>
        <a href="/" className="btn-outline mt-6 inline-block">Volver al inicio</a>
      </div>
    </main>
  )
}

export default function ConfirmacionPage() {
  return <Suspense><ConfirmacionContent /></Suspense>
}
