// Integración Datafast DataWeb (COPYandPAY / oppwa).
// Flujo: 1) crear checkout server-to-server → checkoutId
//        2) widget paymentWidgets.js en el navegador (PCI)
//        3) obtener estado con resourcePath tras el redirect.
// Guía v3.2.2 — parámetros de la Fase 2 (obligatorios).

const ENV = (process.env.DATAFAST_ENV || 'test').toLowerCase()
const IS_PROD = ENV === 'prod' || ENV === 'production'

export const DATAFAST_BASE = IS_PROD
  ? 'https://eu-prod.oppwa.com'
  : 'https://eu-test.oppwa.com'

export const DATAFAST_WIDGET_JS = `${DATAFAST_BASE}/v1/paymentWidgets.js`

// MID/TID de PRUEBA fijos de la guía; en producción los reemplaza Datafast.
const MID = process.env.DATAFAST_MID || '1000000406'
const TID = process.env.DATAFAST_TID || 'PD100406'

function entityId(): string {
  const v = process.env.DATAFAST_ENTITY_ID
  if (!v) throw new Error('DATAFAST_ENTITY_ID no configurado')
  return v
}

function authHeader(): string {
  const t = process.env.DATAFAST_BEARER_TOKEN
  if (!t) throw new Error('DATAFAST_BEARER_TOKEN no configurado')
  return `Bearer ${t}`
}

function money(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2)
}

// Datafast exige AlfNum sin caracteres especiales problemáticos (& rompe el XML).
function clean(s: string, max: number): string {
  return (s || '').replace(/&/g, 'y').replace(/[^\w\sáéíóúñÁÉÍÓÚÑ.,#-]/g, '').trim().slice(0, max)
}

export interface DatafastCheckoutInput {
  amount: number            // total a cobrar
  merchantCustomerId: string // cédula del comprador (<=16)
  merchantTransactionId: string // único por intento (8-255)
  givenName: string
  surname: string
  email: string
  identificationDocId: string // cédula, exactamente 10 dígitos
  phone: string             // +593XXXXXXXXX
  ip: string
  address: string           // billing + shipping
  item: { name: string; description: string; price: number; quantity: number }
}

export interface CheckoutResult {
  ok: boolean
  checkoutId?: string
  code?: string
  raw: unknown
}

export async function createCheckout(input: DatafastCheckoutInput): Promise<CheckoutResult> {
  // Fase 1 (guía Tabla 2): parámetros MÍNIMOS, sin MID/TID ni customParameters.
  // Datafast rechaza en el simulador si se envían los SHOPPER_* de Fase 2 sobre
  // la entidad de prueba de Fase 1. Se activa con DATAFAST_FASE1=true.
  const FASE1 = (process.env.DATAFAST_FASE1 || '').toLowerCase() === 'true'
  if (FASE1) {
    const p: Record<string, string> = {
      entityId: entityId(),
      amount: money(input.amount),
      currency: 'USD',
      paymentType: 'DB',
    }
    if (!IS_PROD) p['testMode'] = 'EXTERNAL'
    const r = await fetch(`${DATAFAST_BASE}/v1/checkouts`, {
      method: 'POST',
      headers: { Authorization: authHeader(), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(p).toString(),
    })
    const rawF1 = await r.json().catch(() => ({}))
    const codeF1: string | undefined = rawF1?.result?.code
    return { ok: codeF1 === '000.200.100' && !!rawF1?.id, checkoutId: rawF1?.id, code: codeF1, raw: rawF1 }
  }

  const params: Record<string, string> = {
    entityId: entityId(),
    amount: money(input.amount),
    currency: 'USD',
    paymentType: 'DB',
    'customer.givenName': clean(input.givenName, 48),
    'customer.surname': clean(input.surname, 48),
    'customer.email': input.email.slice(0, 128),
    'customer.ip': (input.ip || '0.0.0.0').slice(0, 255),
    'customer.merchantCustomerId': input.merchantCustomerId.slice(0, 16),
    'customer.identificationDocType': 'IDCARD',
    'customer.identificationDocId': input.identificationDocId.slice(0, 10),
    'customer.phone': input.phone.slice(0, 25),
    merchantTransactionId: input.merchantTransactionId.slice(0, 255),
    'billing.street1': clean(input.address, 100),
    'billing.country': 'EC',
    'shipping.street1': clean(input.address, 100),
    'shipping.country': 'EC',
    'cart.items[0].name': clean(input.item.name, 255),
    'cart.items[0].description': clean(input.item.description, 255),
    'cart.items[0].price': money(input.item.price),
    'cart.items[0].quantity': String(input.item.quantity),
    // Impuestos — evento educativo IVA 0%: toda la base es 0%.
    'customParameters[SHOPPER_VAL_BASE0]': money(input.amount),
    'customParameters[SHOPPER_VAL_BASEIMP]': '0.00',
    'customParameters[SHOPPER_VAL_IVA]': '0.00',
    'customParameters[SHOPPER_MID]': MID,
    'customParameters[SHOPPER_TID]': TID,
    'customParameters[SHOPPER_ECI]': '0103910',
    'customParameters[SHOPPER_PSERV]': '17913101',
    'customParameters[SHOPPER_VERSIONDF]': '2',
    'risk.parameters[USER_DATA2]': 'MORPHOSIS',
  }

  // testMode solo en pruebas; en producción DEBE eliminarse por completo.
  if (!IS_PROD) params['testMode'] = 'EXTERNAL'

  const res = await fetch(`${DATAFAST_BASE}/v1/checkouts`, {
    method: 'POST',
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params).toString(),
  })

  const raw = await res.json().catch(() => ({}))
  const code: string | undefined = raw?.result?.code
  // 000.200.100 = checkout creado correctamente.
  const ok = code === '000.200.100' && !!raw?.id
  return { ok, checkoutId: raw?.id, code, raw }
}

export interface StatusResult {
  ok: boolean         // transacción aprobada
  code?: string
  description?: string
  paymentId?: string  // id de la transacción (para anulaciones)
  raw: unknown
}

export async function getStatus(resourcePath: string): Promise<StatusResult> {
  const url = `${DATAFAST_BASE}${resourcePath}?entityId=${entityId()}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: authHeader() },
  })
  const raw = await res.json().catch(() => ({}))
  const code: string | undefined = raw?.result?.code
  return {
    ok: isSuccessful(code),
    code,
    description: raw?.result?.description,
    paymentId: raw?.id,
    raw,
  }
}

// Regex estándar ACI para códigos de resultado exitosos (incluye test 000.100.1XX
// y producción 000.000.000). Los que empiezan por 800/900 son rechazos.
export function isSuccessful(code?: string): boolean {
  if (!code) return false
  return /^(000\.000\.|000\.100\.1|000\.[36]00\.100)/.test(code)
}

// Estados "pendientes" (async/OTP) que no son ni aprobado ni rechazado definitivo.
export function isPending(code?: string): boolean {
  if (!code) return false
  return /^(000\.200|800\.400\.5|100\.400\.500)/.test(code)
}
