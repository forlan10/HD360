import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
})

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: string
  status: string
  total: number
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_name: string
  unit_price: number
  quantity: number
  subtotal: number
}

export interface CartItem {
  product_name: string
  unit_price: number
  quantity: number
}
