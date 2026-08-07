import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Server-side only — uses service_role key, never exposed to browser
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export type Paquete = 'individual' | 'pack5' | 'pack10'
export type TipoId = 'cedula' | 'pasaporte'
export type OrderEstado = 'pending' | 'paid' | 'failed' | 'refunded'

export const PAQUETES = {
  individual: { label: 'Individual',  cantidad: 1,  precio: 120 },
  pack5:      { label: 'Pack 5',      cantidad: 5,  precio: 100 },
  pack10:     { label: 'Pack 10',     cantidad: 10, precio: 80  },
} as const
