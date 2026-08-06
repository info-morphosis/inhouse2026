import type { Metadata } from 'next'
import Link from 'next/link'
import EventHeader from '@/components/EventHeader'

export const metadata: Metadata = {
  title: 'Políticas de Privacidad, Cancelación y Devolución — INHOUSE Tech 2026',
}

export default function PoliticasPage() {
  return (
    <>
    <EventHeader />
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-white/40 text-sm hover:text-white mb-8 inline-block">← Volver al inicio</Link>

      <div className="card space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Políticas de Privacidad, Cancelación y Devolución</h1>
          <p className="text-white/40 text-sm">Congreso INHOUSE Tech 2026 — IV Edición</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>Política de privacidad</h2>
          <p className="text-white/70 text-sm leading-relaxed mb-3">
            DELTATRUST S.A. (organizador del Congreso INHOUSE Tech 2026) recopila los siguientes datos personales durante el proceso de compra y registro: nombres y apellidos, número de cédula o pasaporte, correo electrónico, número de WhatsApp y, opcionalmente, razón social y RUC para facturación.
          </p>
          <p className="text-white/70 text-sm leading-relaxed mb-2"><strong className="text-white">Finalidad del tratamiento de datos:</strong></p>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Emisión y entrega del ticket digital de acceso al evento.</li>
            <li>Verificación de identidad en el ingreso al recinto.</li>
            <li>Emisión de comprobantes de venta (facturas electrónicas) ante el SRI.</li>
            <li>Comunicaciones operativas relacionadas con el evento (cambios de horario, instrucciones de ingreso, etc.).</li>
          </ul>
          <p className="text-white/70 text-sm leading-relaxed mt-3">
            Los datos <strong className="text-white">no son compartidos con terceros</strong> con fines comerciales ni publicitarios. Son almacenados de forma segura y serán eliminados dentro de los 12 meses posteriores a la realización del evento, excepto la información fiscal, que se conserva por el plazo exigido por la normativa tributaria ecuatoriana.
          </p>
          <p className="text-white/70 text-sm leading-relaxed mt-2">
            El titular puede ejercer sus derechos de acceso, rectificación y eliminación de sus datos escribiendo a <strong className="text-white">tickets@morphosis.ec</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>Entradas — Política general</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Las entradas al Congreso INHOUSE Tech 2026 <strong className="text-white">no son reembolsables</strong> una vez completado el pago.</li>
            <li>En caso de cancelación total del evento por parte de los organizadores, se devolverá el <strong className="text-white">100% del valor pagado</strong> al método de pago original dentro de los 15 días hábiles siguientes al anuncio de cancelación.</li>
            <li>Si el evento se pospone, la entrada mantendrá su validez para la nueva fecha. El comprador podrá solicitar reembolso completo dentro de los 5 días hábiles posteriores al anuncio del cambio de fecha.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>Transferencia de entradas</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Se permite la transferencia de una entrada a otra persona con un mínimo de <strong className="text-white">48 horas de anticipación</strong> al evento.</li>
            <li>Para gestionar la transferencia, escribir a <strong className="text-white">tickets@morphosis.ec</strong> indicando: nombre del comprador original, código de entrada y datos completos del nuevo asistente.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>Entrega del ticket</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>El ticket digital se entrega <strong className="text-white">de forma inmediata</strong> tras la confirmación del pago, vía correo electrónico y WhatsApp.</li>
            <li>En caso de no recibir el ticket dentro de los 10 minutos posteriores al pago, escribir a <strong className="text-white">tickets@morphosis.ec</strong> o al WhatsApp <strong className="text-white">+593 98 430 9726</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>Disputas de pago</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Ante cualquier discrepancia con el cobro, el comprador debe contactar primero a Morphosis Digital antes de iniciar una disputa con su banco. El plazo para reportar discrepancias es de <strong className="text-white">72 horas</strong> después del pago.
          </p>
        </section>

        <div className="border-t border-white/10 pt-6">
          <p className="text-white/40 text-xs">Organizador: Morphosis Digital · tickets@morphosis.ec · +593 98 430 9726</p>
          <p className="text-white/30 text-xs mt-1">Última actualización: agosto 2026</p>
        </div>
      </div>
    </main>
    </>
  )
}
