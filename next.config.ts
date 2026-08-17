import type { NextConfig } from "next";

const baseHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

// CSP para todas las páginas excepto /pago.
const cspGeneral = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

// /pago carga paymentWidgets.js e iframes PCI desde oppwa.com (Datafast).
// Ambos dominios (test y prod) se incluyen para que el mismo build funcione
// en ambos ambientes.
const cspPago = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://eu-test.oppwa.com https://eu-prod.oppwa.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://eu-test.oppwa.com https://eu-prod.oppwa.com",
  "font-src 'self' data:",
  "connect-src 'self' https://eu-test.oppwa.com https://eu-prod.oppwa.com",
  "frame-src 'self' https://eu-test.oppwa.com https://eu-prod.oppwa.com",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

const nextConfig: NextConfig = {
  // Deployed at inhouse.morphosis.ec (no basePath needed)
  images: { unoptimized: true },
  // node-forge uses Node.js internals — tell Turbopack not to bundle it
  serverExternalPackages: ['node-forge'],
  async headers() {
    return [
      // Regla general primero — Next.js aplica todas las reglas que coinciden
      // en orden; /pago viene después para que su CSP sobreescriba el general.
      {
        source: '/:path*',
        headers: [
          ...baseHeaders,
          { key: 'Content-Security-Policy', value: cspGeneral },
        ],
      },
      {
        source: '/pago',
        headers: [
          ...baseHeaders,
          { key: 'Content-Security-Policy', value: cspPago },
        ],
      },
    ]
  },
};

export default nextConfig;
