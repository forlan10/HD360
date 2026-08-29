import type { CartItem } from '../lib/supabase'

interface CartProps {
  items: CartItem[]
  total: number
  onUpdateQuantity: (productName: string, delta: number) => void
  onRemove: (productName: string) => void
  onCheckout: () => void
}

export function Cart({ items, total, onUpdateQuantity, onRemove, onCheckout }: CartProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        width: '100%',
        maxWidth: 420,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        borderLeft: '1px solid var(--color-border)',
        borderRadius: '16px 0 0 0',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 50,
        padding: 20,
        animation: 'slideIn 0.3s ease',
      }}
    >
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>
        🛒 Seu Carrinho ({items.length} {items.length === 1 ? 'item' : 'itens'})
      </h3>

      <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 16 }}>
        {items.map(item => (
          <div
            key={item.product_name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: '1px solid var(--color-border)',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.product_name}
              </p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                R$ {item.unit_price.toFixed(2).replace('.', ',')} cada
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => onUpdateQuantity(item.product_name, -1)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'var(--color-border)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                −
              </button>
              <span style={{ fontWeight: 600, minWidth: 24, textAlign: 'center' }}>
                {item.quantity}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.product_name, 1)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'var(--color-primary)',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                +
              </button>
              <button
                onClick={() => onRemove(item.product_name)}
                style={{
                  background: 'none',
                  color: 'var(--color-error)',
                  fontSize: '1.1rem',
                  padding: '4px 8px',
                }}
                title="Remover"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
          paddingTop: 12,
          borderTop: '2px solid var(--color-border)',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>Total:</span>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-primary)' }}>
          R$ {total.toFixed(2).replace('.', ',')}
        </span>
      </div>

      <button
        onClick={onCheckout}
        style={{
          width: '100%',
          background: 'var(--color-primary)',
          color: '#fff',
          padding: '14px',
          borderRadius: 'var(--radius)',
          fontSize: '1.05rem',
          fontWeight: 700,
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
      >
        Finalizar Pedido
      </button>
    </div>
  )
}
