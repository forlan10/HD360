import { useState, useMemo } from 'react'
import { supabase, type CartItem, type Order } from './lib/supabase'
import { Header } from './components/Header'
import { ProductGrid } from './components/ProductGrid'
import { Cart } from './components/Cart'
import { CheckoutModal } from './components/CheckoutModal'
import { OrderConfirmation } from './components/OrderConfirmation'

interface Product {
  id: number
  name: string
  price: number
  description: string
  emoji: string
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Camiseta Premium', price: 79.9, description: 'Algodão pima, gola careca', emoji: '👕' },
  { id: 2, name: 'Tênis Esportivo', price: 299.9, description: 'Amortecamento premium', emoji: '👟' },
  { id: 3, name: 'Mochila Urbana', price: 189.9, description: 'À prova d\'água, 20L', emoji: '🎒' },
  { id: 4, name: 'Relógio Clássico', price: 459.9, description: 'Aço inoxidável', emoji: '⌚' },
  { id: 5, name: 'Fone Bluetooth', price: 249.9, description: 'Cancelamento de ruído', emoji: '🎧' },
  { id: 6, name: 'Garrafa Térmica', price: 89.9, description: 'Mantém temperatura 12h', emoji: '🍶' },
]

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null)

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [cart],
  )

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  )

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(i => i.product_name === product.name)
      if (existing) {
        return prev.map(i =>
          i.product_name === product.name ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { product_name: product.name, unit_price: product.price, quantity: 1 }]
    })
  }

  function updateQuantity(productName: string, delta: number) {
    setCart(prev => {
      const updated = prev
        .map(i =>
          i.product_name === productName
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i,
        )
        .filter(i => i.quantity > 0)
      return updated
    })
  }

  function removeFromCart(productName: string) {
    setCart(prev => prev.filter(i => i.product_name !== productName))
  }

  async function handleCheckout(formData: {
    customer_name: string
    customer_email: string
    customer_phone: string
    shipping_address: string
  }) {
    setError(null)
    setSubmitting(true)

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customer_name,
          customer_email: formData.customer_email,
          customer_phone: formData.customer_phone || null,
          shipping_address: formData.shipping_address,
          total: cartTotal,
          status: 'pending',
        })
        .select()
        .single()

      if (orderError) {
        throw new Error(translateError(orderError))
      }

      if (!orderData) {
        throw new Error('Não foi possível criar o pedido. Tente novamente.')
      }

      const orderItems = cart.map(item => ({
        order_id: orderData.id,
        product_name: item.product_name,
        unit_price: item.unit_price,
        quantity: item.quantity,
        subtotal: item.unit_price * item.quantity,
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        throw new Error(translateError(itemsError))
      }

      setCompletedOrder(orderData as Order)
      setCart([])
      setCheckoutOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocorreu um erro inesperado ao finalizar o pedido.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  function translateError(err: { code?: string; message: string }): string {
    if (err.code === '42501' || err.message.includes('row-level security') || err.message.includes('policy')) {
      return 'Erro de permissão: o sistema não autorizou esta operação. Nossa equipe foi notificada. Tente novamente em instantes.'
    }
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('network')) {
      return 'Falha de conexão: não foi possível contatar o servidor. Verifique sua internet e tente novamente.'
    }
    if (err.code === '23505') {
      return 'Este pedido já foi registrado. Atualize a página e tente novamente.'
    }
    return `Erro ao finalizar pedido: ${err.message}`
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      <Header cartCount={cartCount} onCartClick={() => setCheckoutOpen(true)} />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        <ProductGrid products={PRODUCTS} onAddToCart={addToCart} />
      </main>

      {cart.length > 0 && (
        <Cart
          items={cart}
          total={cartTotal}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          total={cartTotal}
          submitting={submitting}
          error={error}
          onClose={() => {
            setCheckoutOpen(false)
            setError(null)
          }}
          onSubmit={handleCheckout}
        />
      )}

      {completedOrder && (
        <OrderConfirmation
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </div>
  )
}
