import type { NextConfig } from "next";

// Cabeceras de seguridad — reducen hallazgos del escaneo de vulnerabilidades
// de Datafast (Anexo H). NOTA: NO se agrega Content-Security-Policy todavía
// porque el widget de Datafast (oppwa.com / datafast.com.ec) carga scripts e
// iframes de terceros; una CSP mal calibrada rompería el pago. Se añadirá y
// probará contra el widget real cuando tengamos credenciales Fase 2.
const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
]

const nextConfig: NextConfig = {
  // Deployed at inhouse.morphosis.ec (no basePath needed)
  images: { unoptimized: true },
  // node-forge uses Node.js internals — tell Turbopack not to bundle it
  serverExternalPackages: ['node-forge'],
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
    ]
  },
};

export default nextConfig;
