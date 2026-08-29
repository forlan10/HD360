interface HeaderProps {
  cartCount: number
  onCartClick: () => void
}

export function Header({ cartCount, onCartClick }: HeaderProps) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>🛍️</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>
            Minha Loja
          </h1>
        </div>

        <button
          onClick={onCartClick}
          style={{
            position: 'relative',
            background: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 'var(--radius)',
            fontSize: '0.95rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
        >
          🛒 Carrinho
          {cartCount > 0 && (
            <span
              style={{
                background: 'var(--color-error)',
                color: '#fff',
                borderRadius: 999,
                padding: '2px 8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                minWidth: 24,
                textAlign: 'center',
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
