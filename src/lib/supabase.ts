import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type Paquete = 'individual' | 'pack5' | 'pack10'
export type TipoId = 'cedula' | 'pasaporte'
export type OrderEstado = 'pending' | 'paid' | 'failed' | 'refunded'

export const PAQUETES = {
  individual: { label: 'Individual',  cantidad: 1,  precio: 120 },
  pack5:      { label: 'Pack 5',      cantidad: 5,  precio: 100 },
  pack10:     { label: 'Pack 10',     cantidad: 10, precio: 80  },
} as const

// Lazy singleton — defers createClient until first API call so Next.js build
// can evaluate the module without the env vars being present yet.
let _client: SupabaseClient | undefined

function getInstance(): SupabaseClient {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
  }
  return _client
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getInstance()
    const val = (client as unknown as Record<string | symbol, unknown>)[prop]
    return typeof val === 'function' ? (val as (...a: unknown[]) => unknown).bind(client) : val
  },
})
