'use client';

import React from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTransactionDetail } from '@/hooks/useTransactionDetail';
import { Header } from '@/components/layout/Header';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { SalesTable } from '@/components/dashboard/SalesTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { TransactionDetailModal } from '@/components/dashboard/TransactionDetailModal';

export default function DashboardPage() {
  const {
    filters,
    health,
    categories,
    summary,
    salesData,
    loading,
    error,
    actions,
  } = useDashboardData();

  const {
    selectedSale,
    isLoading: isDetailLoading,
    error: detailError,
    openTransaction,
    closeTransaction,
  } = useTransactionDetail();

  return (
    <div>
      <Header
        status={health?.status}
        datasetLoaded={health?.datasetLoaded}
        totalRecords={health?.totalRecords}
        isLoading={loading.health}
      />

      <main className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Error banner if sales/summary failed */}
        {error && (
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--accent-red-bg)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{error}</span>
            <button
              onClick={actions.refetch}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--accent-red)',
                color: 'var(--accent-red)',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. Summary Cards */}
        <SummaryCards summary={summary} isLoading={loading.summary} />

        {/* 2. Filter Controls */}
        <FilterBar
          filters={filters}
          categories={categories}
          onFilterChange={actions.updateFilter}
          onReset={actions.resetFilters}
        />

        {/* 3. Sales Records Table */}
        <SalesTable
          sales={salesData?.data || []}
          isLoading={loading.sales}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSortChange={actions.changeSort}
          onRowClick={openTransaction}
        />

        {/* 4. Pagination */}
        {salesData?.pagination && (
          <Pagination
            pagination={salesData.pagination}
            onPageChange={(page) => actions.updateFilter('page', page)}
            onLimitChange={(limit) => actions.updateFilter('limit', limit)}
          />
        )}
      </main>

      {/* 5. Transaction Detail Modal */}
      <TransactionDetailModal
        sale={selectedSale}
        isLoading={isDetailLoading}
        error={detailError}
        onClose={closeTransaction}
      />
    </div>
  );
}
