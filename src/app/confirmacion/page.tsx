'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function ConfirmacionContent() {
  const params = useSearchParams()
  const orderId = params.get('order')

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center py-10">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold mb-3">¡Pago confirmado!</h1>
        <p className="text-white/60 mb-6">
          Recibirás un email y WhatsApp con tu(s) ticket(s) en los próximos minutos.
        </p>
        <div className="bg-white/5 rounded-xl p-4 mb-6 text-left">
          <p className="text-white/40 text-xs mb-1">Número de orden</p>
          <p className="font-mono text-sm break-all">{orderId || '—'}</p>
        </div>
        <p className="text-white/40 text-sm">
          Si no recibes tu ticket en 10 minutos, escríbenos por WhatsApp.
        </p>
        <a href="/" className="btn-outline mt-6 inline-block">Volver al inicio</a>
      </div>
    </main>
  )
}

export default function ConfirmacionPage() {
  return <Suspense><ConfirmacionContent /></Suspense>
}
