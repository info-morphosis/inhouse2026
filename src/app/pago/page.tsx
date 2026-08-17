'use client'
import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import EventHeader from '@/components/EventHeader'
import LogoBadge from '@/components/LogoBadge'

const WIDGET_BASE =
  (process.env.NEXT_PUBLIC_DATAFAST_ENV || 'test').toLowerCase().startsWith('prod')
    ? 'https://eu-prod.oppwa.com'
    : 'https://eu-test.oppwa.com'

// CSS inyectado globalmente para los campos del widget OPPWa.
// Los iframes (número/CVV) NO pueden estilizarse desde aquí; se controlan
// con iframeStyles en wpwlOptions.
const WIDGET_CSS = `
  .wpwl-form { background: transparent !important; border: none !important; padding: 0 !important; }
  .wpwl-group { margin-bottom: 14px; }
  .wpwl-label {
    display: block; font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
    color: rgba(255,255,255,0.55); margin-bottom: 6px; text-transform: uppercase;
  }
  .wpwl-control,
  .wpwl-control-expiry,
  .wpwl-control-cardHolder,
  .wpwl-control-brand {
    width: 100% !important; box-sizing: border-box;
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    border-radius: 8px !important;
    padding: 10px 14px !important;
    color: #ffffff !important;
    font-size: 15px !important;
    outline: none !important;
    transition: border-color 0.2s;
  }
  .wpwl-control:focus,
  .wpwl-control-expiry:focus,
  .wpwl-control-cardHolder:focus {
    border-color: #00ff88 !important;
  }
  .wpwl-control-cardHolder::placeholder { color: rgba(255,255,255,0.25) !important; }
  /* Iframe containers (número y CVV) */
  .wpwl-control-cardNumber,
  .wpwl-control-cvv {
    background: rgba(255,255,255,0.06) !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    border-radius: 8px !important;
    padding: 10px 14px !important;
    height: 42px !important;
  }
  .wpwl-control-cardNumber iframe,
  .wpwl-control-cvv iframe { width: 100% !important; height: 100% !important; border: none !important; }
  /* Selector de marca */
  .wpwl-control-brand {
    appearance: auto;
    background: rgba(255,255,255,0.06) !important;
    color: #fff !important;
  }
  .wpwl-control-brand option { background: #1a1f3e; color: #fff; }
  /* Ícono VISA/MASTER sobre el selector */
  .wpwl-brand-card { margin-left: 8px; }
  /* Botón */
  .wpwl-button-pay {
    width: 100%; margin-top: 8px;
    background: linear-gradient(135deg, #00ff88, #00cc6a) !important;
    color: #0a0e2a !important; font-weight: 700 !important;
    border: none !important; border-radius: 8px !important;
    padding: 13px !important; font-size: 15px !important;
    cursor: pointer; letter-spacing: 0.03em;
    transition: opacity 0.2s;
  }
  .wpwl-button-pay:hover { opacity: 0.88; }
  /* Errores de validación del widget */
  .wpwl-has-error .wpwl-control,
  .wpwl-has-error .wpwl-control-expiry,
  .wpwl-has-error .wpwl-control-cardHolder,
  .wpwl-has-error .wpwl-control-cardNumber,
  .wpwl-has-error .wpwl-control-cvv {
    border-color: #f05252 !important;
    background: rgba(240,82,82,0.08) !important;
  }
  .wpwl-hint { color: #f05252 !important; font-size: 12px; margin-top: 4px; }
`

function PagoWidget() {
  const params = useSearchParams()
  const checkoutId = params.get('checkoutId')

  useEffect(() => {
    if (!checkoutId) return

    // Inyectar estilos del widget
    const styleEl = document.createElement('style')
    styleEl.id = 'wpwl-custom-styles'
    styleEl.textContent = WIDGET_CSS
    document.head.appendChild(styleEl)

    // Config widget: texto visible en los iframes PCI (cross-origin)
    ;(window as unknown as { wpwlOptions?: unknown }).wpwlOptions = {
      style: 'plain',
      iframeStyles: {
        'card-number-placeholder': { color: 'rgba(255,255,255,0.35)', 'font-size': '15px' },
        'cvv-placeholder':         { color: 'rgba(255,255,255,0.35)', 'font-size': '15px' },
        'input': { color: '#ffffff', 'font-size': '15px', background: 'transparent' },
      },
    }

    const script = document.createElement('script')
    script.src = `${WIDGET_BASE}/v1/paymentWidgets.js?checkoutId=${checkoutId}`
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
      document.getElementById('wpwl-custom-styles')?.remove()
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

        <div className="card">
          <h1 className="text-xl font-bold mb-1">Pago seguro</h1>
          <p className="text-white/50 text-sm mb-6">Ingresa los datos de tu tarjeta. El pago es procesado por Datafast.</p>

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
