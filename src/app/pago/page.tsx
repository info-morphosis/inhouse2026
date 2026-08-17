'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

const WIDGET_BASE =
  (process.env.NEXT_PUBLIC_DATAFAST_ENV || 'test').toLowerCase().startsWith('prod')
    ? 'https://eu-prod.oppwa.com'
    : 'https://eu-test.oppwa.com'

function PagoWidget() {
  const params = useSearchParams()
  const checkoutId = params.get('checkoutId')

  useEffect(() => {
    if (!checkoutId) return

    ;(window as unknown as { wpwlOptions?: unknown }).wpwlOptions = {
      locale: 'es',
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
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <p className="text-gray-500">Falta el identificador de pago. Vuelve a intentar desde el checkout.</p>
      </div>
    )
  }

  const shopperResultUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/api/checkout/resultado`
    : '/api/checkout/resultado'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compacto en blanco/gris */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
        <a href="/" className="flex items-center gap-2 text-gray-400 hover:text-gray-600 text-sm">
          ← Cancelar
        </a>
        <Image
          src="/logo-inhouse.png"
          alt="INHOUSE Tech 2026"
          width={100}
          height={40}
          className="object-contain"
        />
        <div className="w-16" />
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-gray-800 text-xl font-bold">Pago seguro</h1>
          <p className="text-gray-500 text-sm mt-1">
            Ingresa los datos de tu tarjeta. El pago es procesado por Datafast.
          </p>
        </div>

        {/* El widget de Datafast renderiza su propio card aquí */}
        <form
          action={shopperResultUrl}
          className="paymentWidgets"
          data-brands="VISA MASTER DINERS"
        />

        <p className="text-gray-400 text-xs text-center mt-6">
          Tus datos viajan cifrados directamente a Datafast (certificación PCI DSS).
        </p>
      </main>
    </div>
  )
}

export default function PagoPage() {
  return <Suspense><PagoWidget /></Suspense>
}
