import React from 'react';

interface HeaderProps {
  status?: string;
  datasetLoaded?: boolean;
  totalRecords?: number;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status = 'connecting',
  datasetLoaded = false,
  totalRecords = 0,
  isLoading = false,
}) => {
  const isOnline = status === 'ok' && datasetLoaded;

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'rgba(17, 24, 39, 0.7)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '1rem 0',
      }}
    >
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '1rem',
              color: '#fff',
            }}
          >
            R
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
              Retail Sales Analytics
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live Public API Dashboard
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.8rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: isOnline ? 'var(--accent-green-bg)' : 'var(--accent-amber-bg)',
              color: isOnline ? 'var(--accent-green)' : 'var(--accent-amber)',
              border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isOnline ? 'var(--accent-green)' : 'var(--accent-amber)',
                boxShadow: isOnline ? '0 0 8px var(--accent-green)' : 'none',
              }}
            />
            {isLoading
              ? 'Checking status...'
              : isOnline
              ? `API Online (${totalRecords.toLocaleString()} records)`
              : 'Degraded / No Data'}
          </div>
        </div>
      </div>
    </header>
  );
};
