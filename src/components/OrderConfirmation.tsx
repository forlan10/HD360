import type { Order } from '../lib/supabase'

interface OrderConfirmationProps {
  order: Order
  onClose: () => void
}

export function OrderConfirmation({ order, onClose }: OrderConfirmationProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--color-surface)',
          borderRadius: 16,
          maxWidth: 440,
          width: '100%',
          padding: 40,
          textAlign: 'center',
          animation: 'fadeIn 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-success-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 36,
          }}
        >
          ✓
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
          Pedido Confirmado!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Obrigado pela sua compra, {order.customer_name.split(' ')[0]}!
        </p>

        <div
          style={{
            background: 'var(--color-bg)',
            borderRadius: 8,
            padding: 16,
            marginBottom: 24,
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Número do pedido:</span>
            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
              #{order.id.slice(0, 8)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Status:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>Pendente</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>Total:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              R$ {Number(order.total).toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Um e-mail de confirmação foi enviado para {order.customer_email}
        </p>

        <button
          onClick={onClose}
          style={{
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '12px 32px',
            borderRadius: 'var(--radius)',
            fontWeight: 600,
            fontSize: '1rem',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          Continuar Comprando
        </button>
      </div>
    </div>
  )
}
