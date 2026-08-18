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
      labels: {
        cvv: 'CVV',
        cardHolder: 'Nombre (igual que en la tarjeta)',
      },
      iframeStyles: {
        'card-number':             { color: '#111827', 'font-size': '15px' },
        'card-number-placeholder': { color: '#9ca3af', 'font-size': '15px' },
        'cvv':                     { color: '#111827', 'font-size': '15px' },
        'cvv-placeholder':         { color: '#9ca3af', 'font-size': '15px' },
      },
      onReady: function () {
        // Sello oficial "Powered by Datafast" antes del botón Pagar (Figura 23).
        // Idempotente: no duplica si onReady se dispara en más de un render.
        const form = document.querySelector('.wpwl-form')
        const btn = form?.querySelector('.wpwl-button-pay')
        if (form && btn && !form.querySelector('.datafast-verified')) {
          const img = document.createElement('img')
          img.src = 'https://www.datafast.com.ec/images/verified.png'
          img.alt = 'Powered by Datafast'
          img.className = 'datafast-verified'
          btn.insertAdjacentElement('beforebegin', img)
        }
      },
      onBeforeSubmitCard: function () {
        // Validación oficial Datafast (guía Fig. 21): bloquear pago si el nombre
        // del titular está vacío → evita rechazo del banco (100.100.400/402).
        const holder = document.querySelector('.wpwl-control-cardHolder') as HTMLInputElement | null
        if (holder && holder.value.trim() === '') {
          holder.classList.add('wpwl-has-error')
          const form = holder.closest('.wpwl-form')
          if (form && !form.querySelector('.wpwl-hint-cardHolderError')) {
            const hint = document.createElement('div')
            hint.className = 'wpwl-hint wpwl-hint-cardHolderError'
            hint.textContent = 'Ingresa el nombre igual que aparece en la tarjeta'
            holder.insertAdjacentElement('afterend', hint)
          }
          const btn = document.querySelector('.wpwl-button-pay')
          if (btn) {
            btn.classList.add('wpwl-button-error')
            btn.setAttribute('disabled', 'disabled')
          }
          return false
        }
        return true
      },
    }

    // Al escribir el nombre, limpiar el error y re-habilitar el botón Pagar
    // (evita que el botón quede deshabilitado tras un intento con nombre vacío).
    const w = window as unknown as { __dfCardHolderBound?: boolean }
    if (!w.__dfCardHolderBound) {
      w.__dfCardHolderBound = true
      document.addEventListener('input', (e) => {
        const t = e.target as HTMLInputElement | null
        if (t && t.classList?.contains('wpwl-control-cardHolder') && t.value.trim() !== '') {
          t.classList.remove('wpwl-has-error')
          document.querySelector('.wpwl-hint-cardHolderError')?.remove()
          const btn = document.querySelector('.wpwl-button-pay')
          btn?.classList.remove('wpwl-button-error')
          btn?.removeAttribute('disabled')
        }
      })
    }

    const WIDGET_ID = 'df-payment-widget'
    // Guarda contra doble carga (React Strict Mode en dev / re-render): un solo <script>.
    if (!document.getElementById(WIDGET_ID)) {
      const script = document.createElement('script')
      script.id = WIDGET_ID
      script.src = `${WIDGET_BASE}/v1/paymentWidgets.js?checkoutId=${checkoutId}`
      script.async = true
      document.body.appendChild(script)
    }

    // NOTA: la guía (pág. 11) indica cargar
    // https://www.datafast.com.ec/js/dfAdditionalValidations1.js
    // pero esa URL responde 404 (archivo inexistente en el servidor de Datafast,
    // verificado 2026-08-17 con curl + UA de navegador). Los pagos se aprueban sin
    // él, así que se omite para no generar un error de red en consola. Reactivar
    // solo si Datafast confirma la URL vigente.

    return () => {
      document.getElementById(WIDGET_ID)?.remove()
      delete (window as unknown as { wpwlOptions?: unknown }).wpwlOptions
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
