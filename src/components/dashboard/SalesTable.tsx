import React from 'react';
import { Sale } from '@/types/sales';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

interface SalesTableProps {
  sales: Sale[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (field: string) => void;
  onRowClick: (transactionId: number) => void;
}

export const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  isLoading,
  sortBy,
  sortOrder,
  onSortChange,
  onRowClick,
}) => {
  const columns = [
    { key: 'transactionId', label: 'ID', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'customerId', label: 'Customer', sortable: false },
    { key: 'gender', label: 'Gender', sortable: false },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'productCategory', label: 'Category', sortable: false },
    { key: 'quantity', label: 'Qty', sortable: true },
    { key: 'pricePerUnit', label: 'Unit Price', sortable: true },
    { key: 'totalAmount', label: 'Total', sortable: true },
  ];

  const getCategoryBadgeStyle = (cat: string): React.CSSProperties => {
    switch (cat.toLowerCase()) {
      case 'beauty':
        return { backgroundColor: 'var(--accent-purple-bg)', color: 'var(--accent-purple)' };
      case 'clothing':
        return { backgroundColor: 'var(--accent-amber-bg)', color: 'var(--accent-amber)' };
      case 'electronics':
        return { backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' };
      default:
        return { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' };
    }
  };

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)', borderBottom: '1px solid var(--border-color)' }}>
              {columns.map((col) => {
                const isSorted = sortBy === col.key;
                return (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && onSortChange(col.key)}
                    style={{
                      padding: '0.85rem 1rem',
                      fontWeight: 600,
                      color: isSorted ? 'var(--primary)' : 'var(--text-secondary)',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      {col.label}
                      {col.sortable && (
                        <span style={{ fontSize: '0.75rem', opacity: isSorted ? 1 : 0.3 }}>
                          {isSorted ? (sortOrder === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: '1rem' }}>
                      <Skeleton height="1.25rem" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sales.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length} style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🔍</div>
                  <p style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>No transactions found</p>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Try adjusting your filters or search criteria.</p>
                </td>
              </tr>
            ) : (
              // Data rows
              sales.map((sale) => (
                <tr
                  key={sale.transactionId}
                  onClick={() => onRowClick(sale.transactionId)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    #{sale.transactionId}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(sale.date)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{sale.customerId}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{sale.gender}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{sale.age}</td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        ...getCategoryBadgeStyle(sale.productCategory),
                      }}
                    >
                      {sale.productCategory}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>{sale.quantity}</td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {formatCurrency(sale.pricePerUnit)}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--accent-green)' }}>
                    {formatCurrency(sale.totalAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
