import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { SalesTable } from '@/components/dashboard/SalesTable';
import { Pagination } from '@/components/dashboard/Pagination';
import { TransactionDetailModal } from '@/components/dashboard/TransactionDetailModal';
import { DEFAULT_FILTERS } from '@/types/filters';
import { Sale } from '@/types/sales';

describe('Dashboard Component Units', () => {
  // 1. SummaryCards Component
  it('renders loading skeletons and populated summary KPI values', () => {
    const { rerender } = render(<SummaryCards summary={null} isLoading={true} />);
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();

    rerender(
      <SummaryCards
        summary={{
          totalTransactions: 100,
          totalRevenue: 50000,
          averageOrderValue: 500,
          totalItemsSold: 250,
        }}
        isLoading={false}
      />
    );

    expect(screen.getByText('$50,000')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  // 2. FilterBar Component
  it('handles user input and triggers filter changes and reset', () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    const { rerender } = render(
      <FilterBar
        filters={DEFAULT_FILTERS}
        categories={['Beauty', 'Clothing', 'Electronics']}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
    );

    const searchInput = screen.getByPlaceholderText('Customer / ID...');
    fireEvent.change(searchInput, { target: { value: 'CUST123' } });
    expect(handleFilterChange).toHaveBeenCalledWith('search', 'CUST123');

    // Test Reset button state
    rerender(
      <FilterBar
        filters={{ ...DEFAULT_FILTERS, search: 'CUST123' }}
        categories={['Beauty', 'Clothing']}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
    );

    const resetButton = screen.getByRole('button', { name: /reset filters/i });
    expect(resetButton).not.toBeDisabled();
    fireEvent.click(resetButton);
    expect(handleReset).toHaveBeenCalled();
  });

  // 3. SalesTable Component
  it('renders empty state when no sales are returned', () => {
    render(
      <SalesTable
        sales={[]}
        isLoading={false}
        sortBy="transactionId"
        sortOrder="asc"
        onSortChange={vi.fn()}
        onRowClick={vi.fn()}
      />
    );

    expect(screen.getByText('No transactions found')).toBeInTheDocument();
  });

  it('renders sales rows, triggers sorting, and opens detail on click', () => {
    const handleSortChange = vi.fn();
    const handleRowClick = vi.fn();

    const mockSale: Sale = {
      transactionId: 42,
      date: '2023-05-15',
      customerId: 'CUST999',
      gender: 'Male',
      age: 28,
      productCategory: 'Electronics',
      quantity: 1,
      pricePerUnit: 500,
      totalAmount: 500,
    };

    render(
      <SalesTable
        sales={[mockSale]}
        isLoading={false}
        sortBy="transactionId"
        sortOrder="asc"
        onSortChange={handleSortChange}
        onRowClick={handleRowClick}
      />
    );

    expect(screen.getByText('#42')).toBeInTheDocument();
    expect(screen.getByText('CUST999')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();

    // Click row
    fireEvent.click(screen.getByText('#42'));
    expect(handleRowClick).toHaveBeenCalledWith(42);

    // Click sort header
    fireEvent.click(screen.getByText('Total'));
    expect(handleSortChange).toHaveBeenCalledWith('totalAmount');
  });

  // 4. Pagination Component
  it('handles page navigation and limit changes', () => {
    const handlePageChange = vi.fn();
    const handleLimitChange = vi.fn();

    render(
      <Pagination
        pagination={{ page: 2, limit: 10, totalItems: 50, totalPages: 5 }}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    );

    expect(screen.getByText((content, element) => {
      const hasText = (node: Element) => node.textContent === 'Showing 11 - 20 of 50 results';
      const nodeHasText = hasText(element as Element);
      const childrenDontHaveText = Array.from(element?.children || []).every(
        (child) => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(handlePageChange).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(handlePageChange).toHaveBeenCalledWith(3);
  });

  // 5. TransactionDetailModal Component
  it('renders single transaction receipt and handles close', () => {
    const handleClose = vi.fn();

    const mockSale: Sale = {
      transactionId: 101,
      date: '2023-10-10',
      customerId: 'CUST777',
      gender: 'Female',
      age: 40,
      productCategory: 'Beauty',
      quantity: 2,
      pricePerUnit: 150,
      totalAmount: 300,
    };

    render(
      <TransactionDetailModal
        sale={mockSale}
        isLoading={false}
        error={null}
        onClose={handleClose}
      />
    );

    expect(screen.getByText('Transaction Receipt')).toBeInTheDocument();
    expect(screen.getByText('ID: #101')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: 'Close' });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });
});
