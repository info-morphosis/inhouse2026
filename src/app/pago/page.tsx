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

    // style:'plain' → widget sin card propio; el CSS de globals.css aplica
    // la apariencia de la Figura 23 de la guía Datafast (sección 5.6 / 5.7).
    ;(window as unknown as { wpwlOptions?: unknown }).wpwlOptions = {
      style: 'plain',
      locale: 'es',
      iframeStyles: {
        'card-number':             { color: '#111827', 'font-size': '15px' },
        'card-number-placeholder': { color: '#9ca3af', 'font-size': '15px' },
        'cvv':                     { color: '#111827', 'font-size': '15px' },
        'cvv-placeholder':         { color: '#9ca3af', 'font-size': '15px' },
      },
      onBeforeSubmitCard: function () {
        const holder = document.querySelector('.wpwl-control-cardHolder') as HTMLInputElement | null
        if (holder && holder.value.trim() === '') {
          holder.style.border = '2px solid #e02424'
          holder.style.background = '#fff5f5'
          return false
        }
        return true
      },
    }

    const script = document.createElement('script')
    script.src = `${WIDGET_BASE}/v1/paymentWidgets.js?checkoutId=${checkoutId}`
    script.async = true
    document.body.appendChild(script)

    // Requerido por Datafast (guía pág. 11)
    const dfScript = document.createElement('script')
    dfScript.type = 'text/javascript'
    dfScript.src = 'https://www.datafast.com.ec/js/dfAdditionalValidations1.js'
    document.body.appendChild(dfScript)

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
      if (document.body.contains(dfScript)) document.body.removeChild(dfScript)
    }
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

        {/* Card blanco para el widget — coincide con el fondo blanco de la Figura 23 */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h1 className="text-gray-800 text-xl font-bold mb-1">Pago seguro</h1>
          <p className="text-gray-500 text-sm mb-5">
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
