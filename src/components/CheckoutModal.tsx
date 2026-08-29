import { useState } from 'react'

interface CheckoutModalProps {
  total: number
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (formData: {
    customer_name: string
    customer_email: string
    customer_phone: string
    shipping_address: string
  }) => void
}

export function CheckoutModal({ total, submitting, error, onClose, onSubmit }: CheckoutModalProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  function validate(): boolean {
    const errors: Record<string, string> = {}
    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Informe seu nome'
    }
    if (!formData.customer_email.trim()) {
      errors.customer_email = 'Informe seu e-mail'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      errors.customer_email = 'E-mail inválido'
    }
    if (!formData.shipping_address.trim()) {
      errors.shipping_address = 'Informe o endereço de entrega'
    }
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
    }
  }

  function updateField(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: `1px solid ${validationErrors[Object.keys(validationErrors)[0] ?? ''] ? 'var(--color-error)' : 'var(--color-border)'}`,
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s ease',
  }

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
          maxWidth: 480,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 32,
          animation: 'fadeIn 0.25s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Finalizar Pedido</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', fontSize: '1.5rem', color: 'var(--color-text-muted)', padding: 4 }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            background: 'var(--color-primary-light)',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--color-primary-hover)' }}>Total do Pedido</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary-hover)' }}>
            R$ {total.toFixed(2).replace('.', ',')}
          </span>
        </div>

        {error && (
          <div
            style={{
              background: 'var(--color-error-bg)',
              border: '1px solid var(--color-error)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <p style={{ color: 'var(--color-error)', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4 }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
              Nome completo *
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={e => updateField('customer_name', e.target.value)}
              placeholder="Seu nome"
              style={inputStyle}
            />
            {validationErrors.customer_name && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: 4 }}>
                {validationErrors.customer_name}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
              E-mail *
            </label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={e => updateField('customer_email', e.target.value)}
              placeholder="seu@email.com"
              style={inputStyle}
            />
            {validationErrors.customer_email && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: 4 }}>
                {validationErrors.customer_email}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
              Telefone (opcional)
            </label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={e => updateField('customer_phone', e.target.value)}
              placeholder="(11) 99999-9999"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: '0.9rem' }}>
              Endereço de entrega *
            </label>
            <textarea
              value={formData.shipping_address}
              onChange={e => updateField('shipping_address', e.target.value)}
              placeholder="Rua, número, bairro, cidade, CEP"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
            {validationErrors.shipping_address && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.8rem', marginTop: 4 }}>
                {validationErrors.shipping_address}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: submitting ? 'var(--color-text-muted)' : 'var(--color-primary)',
              color: '#fff',
              padding: '14px',
              borderRadius: 'var(--radius)',
              fontSize: '1.05rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              opacity: submitting ? 0.7 : 1,
            }}
            onMouseEnter={e => {
              if (!submitting) e.currentTarget.style.background = 'var(--color-primary-hover)'
            }}
            onMouseLeave={e => {
              if (!submitting) e.currentTarget.style.background = 'var(--color-primary)'
            }}
          >
            {submitting ? (
              <>
                <span style={{ animation: 'pulse 1s infinite', display: 'inline-block' }}>●</span>
                Processando...
              </>
            ) : (
              'Confirmar Pedido'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
