interface Product {
  id: number
  name: string
  price: number
  description: string
  emoji: string
}

interface ProductGridProps {
  products: Product[]
  onAddToCart: (product: Product) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>
          Nossos Produtos
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem' }}>
          Selecione os itens que deseja comprar e finalize seu pedido
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 24,
        }}
      >
        {products.map(product => (
          <div
            key={product.id}
            style={{
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
              e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              style={{
                background: 'var(--color-primary-light)',
                height: 160,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 64,
              }}
            >
              {product.emoji}
            </div>
            <div style={{ padding: 20 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: 4 }}>
                {product.name}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                {product.description}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                <button
                  onClick={() => onAddToCart(product)}
                  style={{
                    background: 'var(--color-primary)',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primary-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primary)')}
                >
                  + Adicionar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
