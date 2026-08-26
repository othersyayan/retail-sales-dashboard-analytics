import React from 'react';
import { DashboardFilterState } from '@/types/filters';
import { Card } from '@/components/common/Card';

interface FilterBarProps {
  filters: DashboardFilterState;
  categories: string[];
  onFilterChange: <K extends keyof DashboardFilterState>(
    key: K,
    value: DashboardFilterState[K]
  ) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  categories,
  onFilterChange,
  onReset,
}) => {
  const inputStyle: React.CSSProperties = {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-primary)',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    marginBottom: '0.25rem',
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.gender) ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <Card style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
        }}
      >
        {/* Search */}
        <div>
          <label style={labelStyle}>Search</label>
          <input
            type="text"
            placeholder="Customer / ID..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category</label>
          <select
            value={filters.category}
            onChange={(e) => onFilterChange('category', e.target.value)}
            style={inputStyle}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Gender */}
        <div>
          <label style={labelStyle}>Gender</label>
          <select
            value={filters.gender}
            onChange={(e) => onFilterChange('gender', e.target.value as DashboardFilterState['gender'])}
            style={inputStyle}
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label style={labelStyle}>Date From</label>
          <input
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(e) => onFilterChange('dateFrom', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Date To */}
        <div>
          <label style={labelStyle}>Date To</label>
          <input
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(e) => onFilterChange('dateTo', e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Reset Action */}
        <div>
          <button
            onClick={onReset}
            disabled={!hasActiveFilters}
            style={{
              width: '100%',
              padding: '0.55rem 1rem',
              backgroundColor: hasActiveFilters ? 'transparent' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${hasActiveFilters ? 'var(--accent-red)' : 'var(--border-color)'}`,
              color: hasActiveFilters ? 'var(--accent-red)' : 'var(--text-muted)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: hasActiveFilters ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </Card>
  );
};
