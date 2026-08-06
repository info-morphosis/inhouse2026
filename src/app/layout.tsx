import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'INHOUSE Tech 2026 — IV Edición | Experiencia IA 2026',
  description: 'Conecta. Transforma. Inspira. 20 de agosto 2026 · Tenis Club Samborondón · Aval ESPOL',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={poppins.variable}>
      <body className="font-[family-name:var(--font-poppins)] bg-[#0a0e2a] text-white antialiased">
        {children}
        <footer className="border-t border-white/10 mt-16 py-8 px-4 text-center">
          <p className="text-white/40 text-xs mb-2">
            Soporte y atención al cliente — disponible para consultas sobre tus entradas
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="mailto:tickets@morphosis.ec"
              className="text-white/60 hover:text-white transition-colors">
              tickets@morphosis.ec
            </a>
            <a href="https://wa.me/593984309726" target="_blank" rel="noopener noreferrer"
              className="hover:text-white transition-colors" style={{ color: '#00ff88' }}>
              WhatsApp +593 98 430 9726
            </a>
          </div>
          <p className="text-white/20 text-xs mt-4">
            Morphosis Digital · <a href="/politicas" className="hover:text-white/50 transition-colors">Políticas de cancelación</a>
          </p>
        </footer>
      </body>
    </html>
  )
}
