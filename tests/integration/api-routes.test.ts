import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET as getMetadata } from '@/app/api/metadata/route';
import { GET as getSummary } from '@/app/api/summary/route';
import { GET as getSales } from '@/app/api/sales/route';
import { NextRequest } from 'next/server';

describe('API Route Handlers Integration Tests', () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.RETAIL_API_KEY;

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.RETAIL_API_KEY = 'test_mock_api_key';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.RETAIL_API_KEY = originalApiKey;
  });

  it('GET /api/metadata proxies upstream metadata response', async () => {
    const mockMetadata = {
      totalRecords: 1000,
      availableCategories: ['Beauty', 'Clothing', 'Electronics'],
      availableGenders: ['Female', 'Male'],
      availableSortFields: ['transactionId', 'date'],
      dateRange: { start: '2023-01-01', end: '2024-01-01' },
      ageRange: { min: 18, max: 64 },
      quantityRange: { min: 1, max: 4 },
      pricePerUnitRange: { min: 25, max: 500 },
      totalAmountRange: { min: 25, max: 2000 },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockMetadata,
    });

    const response = await getMetadata();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.totalRecords).toBe(1000);
    expect(json.availableCategories).toContain('Beauty');
  });

  it('GET /api/summary sanitizes queries and forwards to upstream', async () => {
    const mockSummary = {
      totalTransactions: 50,
      totalRevenue: 25000,
      averageOrderValue: 500,
      totalItemsSold: 120,
    };

    let requestedUrl = '';
    global.fetch = vi.fn().mockImplementation((url) => {
      requestedUrl = url;
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => mockSummary,
      });
    });

    const req = new NextRequest('http://localhost:3000/api/summary?category=Beauty&search=&gender=Female');
    const response = await getSummary(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.totalRevenue).toBe(25000);
    expect(requestedUrl).toContain('category=Beauty');
    expect(requestedUrl).toContain('gender=Female');
    expect(requestedUrl).not.toContain('search='); // empty string stripped
  });

  it('GET /api/sales proxies paginated list and handles 422 errors gracefully', async () => {
    // 1. Success case
    const mockSales = {
      data: [
        {
          transactionId: 1,
          date: '2023-11-24',
          customerId: 'CUST001',
          gender: 'Male',
          age: 34,
          productCategory: 'Beauty',
          quantity: 3,
          pricePerUnit: 50,
          totalAmount: 150,
        },
      ],
      pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
      filters: { sortBy: 'transactionId', sortOrder: 'asc' },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockSales,
    });

    const req = new NextRequest('http://localhost:3000/api/sales?page=1&limit=10');
    const response = await getSales(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.length).toBe(1);
    expect(json.data[0].transactionId).toBe(1);

    // 2. Error handling case (upstream 422)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({ detail: [{ loc: ['query', 'gender'], msg: 'Invalid gender', type: 'value_error' }] }),
    });

    const errorReq = new NextRequest('http://localhost:3000/api/sales?gender=Invalid');
    const errorResponse = await getSales(errorReq);
    expect(errorResponse.status).toBe(422);
  });
});
