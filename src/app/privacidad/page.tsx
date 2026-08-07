import type { Metadata } from 'next'
import Link from 'next/link'
import EventHeader from '@/components/EventHeader'

export const metadata: Metadata = {
  title: 'Política de Protección de Datos Personales — INHOUSE Tech 2026',
}

export default function PrivacidadPage() {
  return (
    <>
    <EventHeader />
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-white/40 text-sm hover:text-white mb-8 inline-block">← Volver al inicio</Link>

      <div className="card space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Política de Protección de Datos Personales</h1>
          <p className="text-white/40 text-sm">Congreso INHOUSE Tech 2026 — IV Edición</p>
          <p className="text-white/30 text-xs mt-1">En cumplimiento de la Ley Orgánica de Protección de Datos Personales (LOPDP) del Ecuador</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>1. Responsable del tratamiento</h2>
          <ul className="text-white/70 text-sm space-y-1 leading-relaxed">
            <li><strong className="text-white">Razón social:</strong> DELTATRUST S.A.</li>
            <li><strong className="text-white">RUC:</strong> 0992772107001</li>
            <li><strong className="text-white">Correo de contacto:</strong> tickets@morphosis.ec</li>
            <li><strong className="text-white">WhatsApp:</strong> +593 98 430 9726</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>2. Datos personales que recopilamos</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-2">
            Durante el proceso de compra y registro recopilamos los siguientes datos:
          </p>
          <ul className="text-white/70 space-y-1 text-sm leading-relaxed list-disc list-inside">
            <li>Nombres y apellidos</li>
            <li>Número de cédula de identidad o pasaporte</li>
            <li>Correo electrónico</li>
            <li>Número de WhatsApp</li>
            <li>Razón social y RUC (únicamente si solicita factura con datos empresariales)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>3. Finalidad del tratamiento</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-2">
            Sus datos son tratados exclusivamente para los siguientes fines:
          </p>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Emisión y entrega del ticket digital de acceso al evento.</li>
            <li>Verificación de identidad en el control de ingreso al recinto.</li>
            <li>Emisión de comprobantes electrónicos de venta (facturas) ante el Servicio de Rentas Internas (SRI).</li>
            <li>Comunicaciones operativas relacionadas exclusivamente con el evento (instrucciones de acceso, cambios de horario u otras novedades logísticas).</li>
            <li>Procesamiento del pago a través de la pasarela Datafast.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>4. Base legal del tratamiento</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            El tratamiento de sus datos personales se realiza sobre la base del <strong className="text-white">consentimiento expreso del titular</strong>, conforme al artículo 7, literal a) de la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP), otorgado al aceptar la presente política antes de completar su compra.
          </p>
          <p className="text-white/70 text-sm leading-relaxed mt-2">
            Adicionalmente, el tratamiento con fines de facturación se sustenta en el cumplimiento de una obligación legal tributaria.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>5. Destinatarios de los datos</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Sus datos <strong className="text-white">no son vendidos ni cedidos</strong> a terceros con fines comerciales o publicitarios. Únicamente son accedidos por:
          </p>
          <ul className="text-white/70 space-y-1 text-sm leading-relaxed list-disc list-inside mt-2">
            <li><strong className="text-white">Datafast</strong> — pasarela de pago, para procesar la transacción.</li>
            <li><strong className="text-white">SRI</strong> — para la emisión y validación de comprobantes electrónicos, según lo exige la normativa tributaria ecuatoriana.</li>
            <li>Personal operativo del evento, exclusivamente para la verificación de acceso al recinto.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>6. Plazo de conservación</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Los datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades descritas y serán eliminados en un plazo máximo de <strong className="text-white">12 meses</strong> tras la realización del evento. Los datos fiscales (facturación) se conservan durante el plazo mínimo exigido por la normativa tributaria ecuatoriana (7 años).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>7. Derechos del titular</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-2">
            De conformidad con la LOPDP, usted tiene derecho a:
          </p>
          <ul className="text-white/70 space-y-1 text-sm leading-relaxed list-disc list-inside">
            <li><strong className="text-white">Acceso</strong> — conocer qué datos suyos están siendo tratados.</li>
            <li><strong className="text-white">Rectificación</strong> — corregir datos inexactos o incompletos.</li>
            <li><strong className="text-white">Eliminación (supresión)</strong> — solicitar la eliminación de sus datos cuando no sean necesarios para la finalidad para la que fueron recabados.</li>
            <li><strong className="text-white">Oposición</strong> — oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
            <li><strong className="text-white">Portabilidad</strong> — recibir sus datos en un formato estructurado y de uso común.</li>
            <li><strong className="text-white">Revocación del consentimiento</strong> — retirar su consentimiento en cualquier momento, sin que ello afecte la licitud del tratamiento previo.</li>
          </ul>
          <p className="text-white/70 text-sm leading-relaxed mt-3">
            Para ejercer cualquiera de estos derechos, puede escribir a <strong className="text-white">tickets@morphosis.ec</strong> indicando su nombre completo y número de cédula. Le responderemos en un plazo máximo de 15 días hábiles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>8. Autoridad de control</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, puede presentar una reclamación ante la <strong className="text-white">Superintendencia de Protección de Datos Personales</strong>, autoridad de control designada por la LOPDP en el Ecuador.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>9. Transferencias internacionales</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Sus datos son almacenados en servidores seguros. En el procesamiento del pago, Datafast puede operar infraestructura fuera del Ecuador; dicho proveedor cumple con estándares internacionales de seguridad (PCI-DSS). No se realizan otras transferencias internacionales de datos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>10. Modificaciones a esta política</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Nos reservamos el derecho de actualizar esta política para adaptarla a cambios normativos o de operación. Cualquier modificación será publicada en esta misma página con la fecha de actualización.
          </p>
        </section>

        <div className="border-t border-white/10 pt-6">
          <p className="text-white/40 text-xs">DELTATRUST S.A. · RUC 0992772107001 · tickets@morphosis.ec · +593 98 430 9726</p>
          <p className="text-white/30 text-xs mt-1">Última actualización: agosto 2026</p>
        </div>
      </div>
    </main>
    </>
  )
}
