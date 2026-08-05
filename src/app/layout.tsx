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
      </body>
    </html>
  )
}
