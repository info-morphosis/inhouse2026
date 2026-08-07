import forge from 'node-forge'

export interface BuyerInfo {
  tipoId: 'ruc' | 'cedula' | 'pasaporte' | 'final'
  identificacion: string
  razonSocial: string
  email?: string
  telefono?: string
}

export interface DetalleItem {
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuento?: number
  codigoPrincipal?: string
}

export interface FacturaInput {
  fecha: Date
  comprador: BuyerInfo
  detalles: DetalleItem[]
  formaPago?: '01' | '16' | '19' | '20'
}

// ─── Config ───────────────────────────────────────────────────────────────────
const SRI_RUC          = '0992772107001'
const SRI_RAZON        = 'DELTATRUST S.A.'
const SRI_DIR          = 'AV LEON FEBRES CORDERO RIBADENEIRA E40 SN ALFREDO ADUM MILLENIUM TOWERS PLATINUM 1 BLOQUE 1 PISO 5 OFICINA 509-510'
const SRI_ESTAB        = '001'
const SRI_PTO_EMI      = '001'
const SRI_AMBIENTE     = () => process.env.SRI_AMBIENTE ?? '2'
const SRI_TIPO_EMISION = '1'

const RECEPCION_URL: Record<string, string> = {
  '1': 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
  '2': 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline',
}
const AUTORIZACION_URL: Record<string, string> = {
  '1': 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes',
  '2': 'https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function p(n: number | string, d = 2) { return String(n).padStart(d, '0') }
function money(n: number) { return n.toFixed(2) }
function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
function tipoIdCode(t: BuyerInfo['tipoId']) {
  return { ruc: '04', cedula: '05', pasaporte: '06', final: '07' }[t]
}

// ─── Clave de Acceso ──────────────────────────────────────────────────────────
function mod11(s: string): number {
  const fs = [2, 3, 4, 5, 6, 7]
  let sum = 0
  for (let i = s.length - 1, fi = 0; i >= 0; i--, fi++) sum += parseInt(s[i]) * fs[fi % 6]
  const r = sum % 11
  return r === 0 ? 0 : r === 1 ? 1 : 11 - r
}

export function buildClaveAcceso(fecha: Date, sec: number): string {
  const d = `${p(fecha.getDate())}${p(fecha.getMonth() + 1)}${fecha.getFullYear()}`
  const serie = `${SRI_ESTAB}${SRI_PTO_EMI}`
  const secStr = p(sec, 9)
  const cod = String(Math.floor(Math.random() * 99999998) + 1).padStart(8, '0')
  const amb = SRI_AMBIENTE()
  const base = `${d}01${SRI_RUC}${amb}${serie}${secStr}${cod}${SRI_TIPO_EMISION}`
  return `${base}${mod11(base)}`
}

// ─── XML Factura ──────────────────────────────────────────────────────────────
export function buildFacturaXml(input: FacturaInput, sec: number, clave: string): string {
  const { comprador, detalles, fecha } = input
  const total = detalles.reduce((s, d) => s + d.cantidad * d.precioUnitario - (d.descuento ?? 0), 0)
  const amb = SRI_AMBIENTE()
  const fechaStr = `${p(fecha.getDate())}/${p(fecha.getMonth() + 1)}/${fecha.getFullYear()}`

  const detallesXml = detalles.map(d => {
    const base = d.cantidad * d.precioUnitario - (d.descuento ?? 0)
    return `<detalle><codigoPrincipal>${d.codigoPrincipal ?? 'SRV-001'}</codigoPrincipal><descripcion>${esc(d.descripcion)}</descripcion><cantidad>${money(d.cantidad)}</cantidad><precioUnitario>${money(d.precioUnitario)}</precioUnitario><descuento>${money(d.descuento ?? 0)}</descuento><precioTotalSinImpuesto>${money(base)}</precioTotalSinImpuesto><impuestos><impuesto><codigo>2</codigo><codigoPorcentaje>0</codigoPorcentaje><tarifa>0</tarifa><baseImponible>${money(base)}</baseImponible><valor>0.00</valor></impuesto></impuestos></detalle>`
  }).join('')

  const infoAdicional = [
    comprador.email ? `<campoAdicional nombre="email">${esc(comprador.email)}</campoAdicional>` : '',
    comprador.telefono ? `<campoAdicional nombre="telefono">${esc(comprador.telefono)}</campoAdicional>` : '',
  ].filter(Boolean)

  const infoAdXml = infoAdicional.length ? `<infoAdicional>${infoAdicional.join('')}</infoAdicional>` : ''

  return `<factura id="comprobante" version="2.1.0"><infoTributaria><ambiente>${amb}</ambiente><tipoEmision>${SRI_TIPO_EMISION}</tipoEmision><razonSocial>${SRI_RAZON}</razonSocial><nombreComercial>${SRI_RAZON}</nombreComercial><ruc>${SRI_RUC}</ruc><claveAcceso>${clave}</claveAcceso><codDoc>01</codDoc><estab>${SRI_ESTAB}</estab><ptoEmi>${SRI_PTO_EMI}</ptoEmi><secuencial>${p(sec, 9)}</secuencial><dirMatriz>${SRI_DIR}</dirMatriz></infoTributaria><infoFactura><fechaEmision>${fechaStr}</fechaEmision><dirEstablecimiento>${SRI_DIR}</dirEstablecimiento><obligadoContabilidad>SI</obligadoContabilidad><tipoIdentificacionComprador>${tipoIdCode(comprador.tipoId)}</tipoIdentificacionComprador><razonSocialComprador>${esc(comprador.razonSocial)}</razonSocialComprador><identificacionComprador>${comprador.identificacion}</identificacionComprador><totalSinImpuestos>${money(total)}</totalSinImpuestos><totalDescuento>0.00</totalDescuento><totalConImpuestos><totalImpuesto><codigo>2</codigo><codigoPorcentaje>0</codigoPorcentaje><baseImponible>${money(total)}</baseImponible><valor>0.00</valor></totalImpuesto></totalConImpuestos><propina>0.00</propina><importeTotal>${money(total)}</importeTotal><moneda>DOLAR</moneda><pagos><pago><formaPago>${input.formaPago ?? '19'}</formaPago><total>${money(total)}</total><plazo>0</plazo><unidadTiempo>dias</unidadTiempo></pago></pagos></infoFactura><detalles>${detallesXml}</detalles>${infoAdXml}</factura>`
}

// ─── XAdES-BES Signing ────────────────────────────────────────────────────────
function sha1b64utf8(s: string): string {
  const md = forge.md.sha1.create(); md.update(s, 'utf8')
  return forge.util.encode64(md.digest().bytes())
}
function sha1b64bin(bytes: string): string {
  const md = forge.md.sha1.create(); md.update(bytes)
  return forge.util.encode64(md.digest().bytes())
}
function nowISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}-05:00`
}

export function signXml(xmlBody: string): string {
  const p12Der = forge.util.decode64(process.env.SRI_P12_BASE64!)
  const p12 = forge.pkcs12.pkcs12FromAsn1(forge.asn1.fromDer(p12Der), process.env.SRI_P12_PASSWORD!)

  let key: forge.pki.rsa.PrivateKey | null = null
  let cert: forge.pki.Certificate | null = null

  for (const sc of p12.safeContents) {
    for (const bag of sc.safeBags) {
      if (bag.type === forge.pki.oids.certBag && bag.cert) cert = bag.cert
      if ((bag.type === forge.pki.oids.pkcs8ShroudedKeyBag || bag.type === forge.pki.oids.keyBag) && bag.key)
        key = bag.key as forge.pki.rsa.PrivateKey
    }
  }
  if (!cert || !key) throw new Error('No se pudo extraer clave/cert del P12')

  const certDer = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).bytes()
  const certB64 = forge.util.encode64(certDer)
  const certDigest = sha1b64bin(certDer)
  const issuer = cert.issuer.attributes.map(a => `${a.shortName}=${a.value}`).reverse().join(', ')
  const serial = BigInt('0x' + cert.serialNumber).toString(10)

  const docDigest = sha1b64utf8(xmlBody)

  // Canonical SignedProperties (ds namespace promoted to root)
  const sp = `<xades:SignedProperties xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Id="Signature-SignedProperties"><xades:SignedSignatureProperties><xades:SigningTime>${nowISO()}</xades:SigningTime><xades:SigningCertificate><xades:Cert><xades:CertDigest><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod><ds:DigestValue>${certDigest}</ds:DigestValue></xades:CertDigest><xades:IssuerSerial><ds:X509IssuerName>${esc(issuer)}</ds:X509IssuerName><ds:X509SerialNumber>${serial}</ds:X509SerialNumber></xades:IssuerSerial></xades:Cert></xades:SigningCertificate></xades:SignedSignatureProperties></xades:SignedProperties>`

  const spDigest = sha1b64utf8(sp)

  // Canonical SignedInfo
  const si = `<ds:SignedInfo xmlns:ds="http://www.w3.org/2000/09/xmldsig#"><ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></ds:CanonicalizationMethod><ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></ds:SignatureMethod><ds:Reference Id="comprobante-ref" URI="#comprobante"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod><ds:DigestValue>${docDigest}</ds:DigestValue></ds:Reference><ds:Reference Id="xades-ref" URI="#Signature-SignedProperties"><ds:Transforms><ds:Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></ds:Transform></ds:Transforms><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod><ds:DigestValue>${spDigest}</ds:DigestValue></ds:Reference></ds:SignedInfo>`

  const md = forge.md.sha1.create(); md.update(si, 'utf8')
  const sigVal = forge.util.encode64(key.sign(md))

  const sig = `<ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="Signature">${si}<ds:SignatureValue Id="SignatureValue">${sigVal}</ds:SignatureValue><ds:KeyInfo Id="Certificate1"><ds:X509Data><ds:X509Certificate>${certB64}</ds:X509Certificate></ds:X509Data></ds:KeyInfo><ds:Object><xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#Signature">${sp}</xades:QualifyingProperties></ds:Object></ds:Signature>`

  return `<?xml version="1.0" encoding="UTF-8"?>${xmlBody.replace('</factura>', `${sig}</factura>`)}`
}

// ─── SRI SOAP (via n8n proxy on VPS — Vercel IPs blocked by SRI) ─────────────
const N8N_PROXY = 'https://n8n.morphosis.ec/webhook/sri-soap-proxy'

async function soap(url: string, body: string): Promise<string> {
  const env = `<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${body}</soap:Body></soap:Envelope>`
  const res = await fetch(N8N_PROXY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ soapUrl: url, soapEnvelope: env }),
    signal: AbortSignal.timeout(35000),
  })
  if (!res.ok) throw new Error(`Proxy HTTP ${res.status}`)
  const text = await res.text()
  if (!text) throw new Error('Proxy: respuesta vacía (sin body)')
  let json: { responseText?: string; proxyError?: string }
  try { json = JSON.parse(text) } catch { throw new Error(`Proxy JSON parse error. Body(200): "${text.slice(0, 300)}"`) }
  if (json.proxyError) throw new Error(`Proxy error: ${json.proxyError}`)
  if (!json.responseText) throw new Error('Proxy: responseText vacío')
  return json.responseText
}

export async function sendToSri(signedXml: string): Promise<void> {
  const b64 = Buffer.from(signedXml, 'utf8').toString('base64')
  const resp = await soap(
    RECEPCION_URL[SRI_AMBIENTE()],
    `<ec:validarComprobante xmlns:ec="http://ec.gob.sri.ws.recepcion"><xml>${b64}</xml></ec:validarComprobante>`
  )
  if (resp.includes('<estado>DEVUELTA</estado>')) {
    const msgs = [...resp.matchAll(/<mensaje>(.*?)<\/mensaje>/g)].map(m => m[1]).join('; ')
    throw new Error(`SRI DEVUELTA: ${msgs}`)
  }
}

export async function getAuthorization(clave: string, maxRetries = 6): Promise<string> {
  const url = AUTORIZACION_URL[SRI_AMBIENTE()]
  const body = `<ec:autorizacionComprobante xmlns:ec="http://ec.gob.sri.ws.autorizacion"><claveAccesoComprobante>${clave}</claveAccesoComprobante></ec:autorizacionComprobante>`
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, i === 0 ? 3000 : 2500))
    try {
      const resp = await soap(url, body)
      if (resp.includes('<estado>AUTORIZADO</estado>')) {
        const m = resp.match(/<numeroAutorizacion>(.*?)<\/numeroAutorizacion>/)
        if (m) return m[1]
      }
      if (resp.includes('<estado>NO AUTORIZADO</estado>')) throw new Error('SRI: NO AUTORIZADO')
    } catch (e: unknown) {
      const msg = (e as { message?: string }).message ?? String(e)
      if (msg.includes('NO AUTORIZADO')) throw e
      if (i === maxRetries - 1) throw new Error(`SRI: timeout autorización (último error: ${msg})`)
    }
  }
  throw new Error('SRI: timeout autorización')
}

// ─── Recepción solamente (para flujo asíncrono) ───────────────────────────────
export async function recibirEnSri(input: FacturaInput, secuencial: number) {
  const clave = buildClaveAcceso(input.fecha, secuencial)
  const xmlBody = buildFacturaXml(input, secuencial, clave)
  const signedXml = signXml(xmlBody)
  await sendToSri(signedXml)
  return { claveAcceso: clave }
}

// ─── Main (flujo síncrono completo) ──────────────────────────────────────────
export async function emitirFactura(input: FacturaInput, secuencial: number) {
  const clave = buildClaveAcceso(input.fecha, secuencial)
  const xmlBody = buildFacturaXml(input, secuencial, clave)
  const signedXml = signXml(xmlBody)
  await sendToSri(signedXml)
  const numeroAutorizacion = await getAuthorization(clave)
  return { claveAcceso: clave, numeroAutorizacion }
}
