import type { Metadata } from 'next'
import Link from 'next/link'
import EventHeader from '@/components/EventHeader'

export const metadata: Metadata = {
  title: 'Términos y Condiciones — INHOUSE Tech 2026',
}

export default function TerminosPage() {
  return (
    <>
    <EventHeader />
    <main className="min-h-screen max-w-2xl mx-auto px-4 py-12">
      <Link href="/" className="text-white/40 text-sm hover:text-white mb-8 inline-block">← Volver al inicio</Link>

      <div className="card space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Términos y Condiciones</h1>
          <p className="text-white/40 text-sm">Congreso INHOUSE Tech 2026 — IV Edición</p>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>1. Del evento</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>El Congreso INHOUSE Tech 2026 (IV Edición) se realizará el <strong className="text-white">20 de agosto de 2026</strong> en el <strong className="text-white">Tenis Club Samborondón</strong>, Ecuador.</li>
            <li>El evento es organizado por <strong className="text-white">Morphosis Digital</strong>, con aval académico de la ESPOL.</li>
            <li>Los organizadores se reservan el derecho de modificar la agenda, los expositores o los horarios por causas de fuerza mayor, notificando oportunamente a los asistentes.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>2. Compra de entradas</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>La compra de entradas se realiza en línea a través de este sitio, con pago procesado por <strong className="text-white">Datafast</strong> (certificación PCI DSS). Morphosis Digital no almacena datos de tarjetas.</li>
            <li>El precio de cada entrada se muestra en dólares de los Estados Unidos de América (USD) e incluye los impuestos aplicables. El evento, por su carácter educativo, está gravado con <strong className="text-white">IVA 0%</strong>.</li>
            <li>La compra se confirma únicamente cuando el pago es aprobado por la entidad financiera. Ante un rechazo, no se genera ningún cobro.</li>
            <li>Tras la confirmación del pago, el comprador recibe por correo electrónico los enlaces para registrar a el/los asistente(s). El ticket con código QR se emite al completar cada registro.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>3. Ingreso al evento</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Solo podrá ingresar la persona previamente registrada. En la garita se valida el <strong className="text-white">código QR</strong> y la <strong className="text-white">cédula de identidad</strong> del asistente.</li>
            <li>Cada código QR es <strong className="text-white">único e intransferible</strong> y permite un solo ingreso.</li>
            <li>La transferencia de una entrada a otra persona se rige por lo indicado en las{' '}
              <Link href="/politicas" className="underline" style={{ color: '#00ff88' }}>Políticas de Cancelación y Devolución</Link>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>4. Facturación</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>Se emite factura electrónica según la normativa del SRI del Ecuador, con los datos proporcionados por el comprador al momento de la compra.</li>
            <li>Es responsabilidad del comprador ingresar datos de facturación correctos. Las correcciones deben solicitarse a <strong className="text-white">tickets@morphosis.ec</strong>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>5. Conducta y responsabilidad</h2>
          <ul className="text-white/70 space-y-2 text-sm leading-relaxed list-disc list-inside">
            <li>El asistente se compromete a mantener una conducta respetuosa. Los organizadores pueden negar o retirar el acceso ante conductas que afecten el desarrollo del evento, sin derecho a reembolso.</li>
            <li>Durante el evento pueden tomarse fotografías y videos con fines de difusión; al asistir, el participante autoriza su uso salvo indicación expresa en contrario a los organizadores.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3" style={{ color: '#00ff88' }}>6. Protección de datos y devoluciones</h2>
          <p className="text-white/70 text-sm leading-relaxed">
            El tratamiento de datos personales se rige por nuestra{' '}
            <Link href="/privacidad" className="underline" style={{ color: '#00ff88' }}>Política de Protección de Datos Personales</Link>{' '}
            y las cancelaciones y devoluciones por las{' '}
            <Link href="/politicas" className="underline" style={{ color: '#00ff88' }}>Políticas de Cancelación y Devolución</Link>.
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
