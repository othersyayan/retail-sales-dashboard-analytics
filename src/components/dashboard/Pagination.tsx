import React from 'react';
import { PaginationMeta } from '@/types/api';

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const { page, limit, totalItems, totalPages } = pagination;

  const buttonStyle: React.CSSProperties = {
    padding: '0.4rem 0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.15s ease',
  };

  const disabledButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  const startRecord = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, totalItems);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginTop: '1.25rem',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span>
          Showing <strong>{startRecord}</strong> - <strong>{endRecord}</strong> of{' '}
          <strong>{totalItems.toLocaleString()}</strong> results
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginLeft: '1rem' }}>
          <span style={{ fontSize: '0.8rem' }}>Per page:</span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              fontSize: '0.8rem',
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          style={page <= 1 ? disabledButtonStyle : buttonStyle}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Previous
        </button>

        <span style={{ padding: '0 0.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>
          Page {page} of {Math.max(1, totalPages)}
        </span>

        <button
          style={page >= totalPages ? disabledButtonStyle : buttonStyle}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};
