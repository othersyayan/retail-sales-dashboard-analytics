import React from 'react';
import { SummaryResponse } from '@/types/api';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

interface SummaryCardsProps {
  summary: SummaryResponse | null;
  isLoading: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, isLoading }) => {
  const cards = [
    {
      label: 'Total Revenue',
      value: summary ? formatCurrency(summary.totalRevenue) : '$0',
      color: 'var(--accent-green)',
      bgColor: 'var(--accent-green-bg)',
      icon: '$',
    },
    {
      label: 'Total Transactions',
      value: summary ? formatNumber(summary.totalTransactions) : '0',
      color: 'var(--primary)',
      bgColor: 'var(--primary-glow)',
      icon: '#',
    },
    {
      label: 'Average Order Value',
      value: summary ? formatCurrency(summary.averageOrderValue) : '$0',
      color: 'var(--accent-purple)',
      bgColor: 'var(--accent-purple-bg)',
      icon: 'Ø',
    },
    {
      label: 'Total Items Sold',
      value: summary ? formatNumber(summary.totalItemsSold) : '0',
      color: 'var(--accent-amber)',
      bgColor: 'var(--accent-amber-bg)',
      icon: 'Σ',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem',
        margin: '1.5rem 0',
      }}
    >
      {cards.map((card, idx) => (
        <Card key={idx}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                {card.label}
              </p>
              {isLoading ? (
                <Skeleton width="120px" height="2rem" style={{ marginTop: '0.25rem' }} />
              ) : (
                <h3 style={{ fontSize: '1.65rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {card.value}
                </h3>
              )}
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: card.bgColor,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
