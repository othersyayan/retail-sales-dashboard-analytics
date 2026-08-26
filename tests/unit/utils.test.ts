import { describe, it, expect } from 'vitest';
import { buildQueryString } from '@/lib/utils/queryParams';
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils/formatters';

describe('queryParams utility', () => {
  it('should build query string with valid parameters', () => {
    const params = { page: 1, limit: 10, search: 'Beauty' };
    expect(buildQueryString(params)).toBe('?page=1&limit=10&search=Beauty');
  });

  it('should strip empty strings, undefined, null, and NaN', () => {
    const params = {
      search: '',
      category: null,
      gender: undefined,
      page: 2,
      priceMin: NaN,
    };
    expect(buildQueryString(params)).toBe('?page=2');
  });

  it('should return empty string when no valid parameters exist', () => {
    const params = { search: '', category: null, age: undefined };
    expect(buildQueryString(params)).toBe('');
  });
});

describe('formatters utility', () => {
  it('formats currency into USD string', () => {
    expect(formatCurrency(1500)).toBe('$1,500');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('formats numbers with comma separators', () => {
    expect(formatNumber(125000)).toBe('125,000');
    expect(formatNumber(42)).toBe('42');
  });

  it('formats ISO date strings cleanly', () => {
    expect(formatDate('2023-11-24')).toBe('Nov 24, 2023');
    expect(formatDate('')).toBe('-');
  });
});
