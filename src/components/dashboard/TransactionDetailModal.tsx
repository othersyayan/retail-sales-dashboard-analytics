import React from 'react';
import { Sale } from '@/types/sales';
import { Skeleton } from '@/components/common/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface TransactionDetailModalProps {
  sale: Sale | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  sale,
  isLoading,
  error,
  onClose,
}) => {
  if (!sale && !isLoading && !error) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Transaction Receipt</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {sale ? `ID: #${sale.transactionId}` : 'Loading details...'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Skeleton height="2rem" />
              <Skeleton height="1.5rem" />
              <Skeleton height="1.5rem" />
              <Skeleton height="3rem" />
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--accent-red)' }}>
              <p>Failed to load transaction details.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{error}</p>
            </div>
          ) : sale ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Top Meta */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Date</span>
                  <strong style={{ fontSize: '0.9rem' }}>{formatDate(sale.date)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Category</span>
                  <strong style={{ fontSize: '0.9rem' }}>{sale.productCategory}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Customer ID</span>
                  <strong style={{ fontSize: '0.9rem' }}>{sale.customerId}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Demographics</span>
                  <strong style={{ fontSize: '0.9rem' }}>{sale.gender}, {sale.age} yrs</strong>
                </div>
              </div>

              {/* Order breakdown */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Unit Price:</span>
                  <span>{formatCurrency(sale.pricePerUnit)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Quantity:</span>
                  <span>× {sale.quantity}</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px dashed var(--border-color)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>Total Paid:</span>
                  <span style={{ fontWeight: 700, fontSize: '1.35rem', color: 'var(--accent-green)' }}>
                    {formatCurrency(sale.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
