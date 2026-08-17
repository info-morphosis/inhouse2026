'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import EventHeader from '@/components/EventHeader'
import LogoBadge from '@/components/LogoBadge'

const WIDGET_BASE =
  (process.env.NEXT_PUBLIC_DATAFAST_ENV || 'test').toLowerCase().startsWith('prod')
    ? 'https://eu-prod.oppwa.com'
    : 'https://eu-test.oppwa.com'

function PagoWidget() {
  const params = useSearchParams()
  const checkoutId = params.get('checkoutId')

  useEffect(() => {
    if (!checkoutId) return

    // Sin style:'plain' → widget usa su UI estándar de Datafast (igual al manual)
    ;(window as unknown as { wpwlOptions?: unknown }).wpwlOptions = {
      locale: 'es',
    }

    const script = document.createElement('script')
    script.src = `${WIDGET_BASE}/v1/paymentWidgets.js?checkoutId=${checkoutId}`
    script.async = true
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [checkoutId])

  if (!checkoutId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-white/60">Falta el identificador de pago. Vuelve a intentar desde el checkout.</p>
      </main>
    )
  }

  const shopperResultUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/checkout/resultado`
    : '/api/checkout/resultado'

  return (
    <>
      <EventHeader />
      <main className="min-h-screen max-w-lg mx-auto px-4 py-8">
        <LogoBadge />
        <a href="/" className="text-white/40 text-sm hover:text-white mb-6 inline-block">← Cancelar</a>

        <div className="card">
          <h1 className="text-xl font-bold mb-1">Pago seguro</h1>
          <p className="text-white/50 text-sm mb-6">
            Ingresa los datos de tu tarjeta. El pago es procesado por Datafast.
          </p>

          <form
            action={shopperResultUrl}
            className="paymentWidgets"
            data-brands="VISA MASTER DINERS"
          />
        </div>

        <p className="text-white/30 text-xs text-center mt-6">
          Tus datos de tarjeta viajan cifrados directamente a Datafast (certificación PCI DSS).
        </p>
      </main>
    </>
  )
}

export default function PagoPage() {
  return <Suspense><PagoWidget /></Suspense>
}
