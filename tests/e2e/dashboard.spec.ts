import { test, expect } from '@playwright/test';

test.describe('Retail Sales Dashboard E2E Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the local proxy endpoints so tests run predictably without relying on live keys
    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ok',
          version: '1.0.0',
          datasetLoaded: true,
          totalRecords: 1000,
        }),
      });
    });

    await page.route('**/api/metadata', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalRecords: 1000,
          availableCategories: ['Beauty', 'Clothing', 'Electronics'],
          availableGenders: ['Female', 'Male'],
          availableSortFields: ['transactionId', 'date', 'pricePerUnit', 'quantity', 'totalAmount'],
          dateRange: { start: '2023-01-01', end: '2024-01-01' },
          ageRange: { min: 18, max: 64 },
          quantityRange: { min: 1, max: 4 },
          pricePerUnitRange: { min: 25, max: 500 },
          totalAmountRange: { min: 25, max: 2000 },
        }),
      });
    });

    await page.route('**/api/categories', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: ['Beauty', 'Clothing', 'Electronics'] }),
      });
    });

    await page.route('**/api/summary*', async (route) => {
      const url = new URL(route.request().url());
      const category = url.searchParams.get('category');

      if (category === 'Beauty') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalTransactions: 300,
            totalRevenue: 150000,
            averageOrderValue: 500,
            totalItemsSold: 750,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalTransactions: 1000,
            totalRevenue: 456000,
            averageOrderValue: 456,
            totalItemsSold: 2514,
          }),
        });
      }
    });

    await page.route('**/api/sales?*', async (route) => {
      const url = new URL(route.request().url());
      const pageNum = parseInt(url.searchParams.get('page') || '1', 10);
      const category = url.searchParams.get('category');

      if (category === 'Beauty') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                transactionId: 10,
                date: '2023-11-24',
                customerId: 'CUST010',
                gender: 'Female',
                age: 29,
                productCategory: 'Beauty',
                quantity: 2,
                pricePerUnit: 100,
                totalAmount: 200,
              },
            ],
            pagination: { page: 1, limit: 10, totalItems: 1, totalPages: 1 },
            filters: { category: 'Beauty' },
          }),
        });
      } else if (pageNum === 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                transactionId: 11,
                date: '2023-04-12',
                customerId: 'CUST011',
                gender: 'Male',
                age: 45,
                productCategory: 'Electronics',
                quantity: 1,
                pricePerUnit: 800,
                totalAmount: 800,
              },
            ],
            pagination: { page: 2, limit: 10, totalItems: 20, totalPages: 2 },
            filters: { page: 2 },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                transactionId: 1,
                date: '2023-01-15',
                customerId: 'CUST001',
                gender: 'Male',
                age: 34,
                productCategory: 'Clothing',
                quantity: 3,
                pricePerUnit: 50,
                totalAmount: 150,
              },
            ],
            pagination: { page: 1, limit: 10, totalItems: 20, totalPages: 2 },
            filters: {},
          }),
        });
      }
    });

    await page.route('**/api/sales/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          transactionId: 1,
          date: '2023-01-15',
          customerId: 'CUST001',
          gender: 'Male',
          age: 34,
          productCategory: 'Clothing',
          quantity: 3,
          pricePerUnit: 50,
          totalAmount: 150,
        }),
      });
    });
  });

  test('1. Dashboard renders summary and initial sales data', async ({ page }) => {
    await page.goto('/');

    // Check KPI summary cards with exact matching
    await expect(page.getByRole('heading', { name: '$456,000' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '1,000' })).toBeVisible();

    // Check Table data
    await expect(page.getByRole('cell', { name: '#1' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'CUST001' })).toBeVisible();
  });

  test('2. Filter selection and Reset flow', async ({ page }) => {
    await page.goto('/');

    // Select Beauty Category
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('Beauty');

    // Wait for filtered KPI
    await expect(page.getByRole('heading', { name: '$150,000' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'CUST010' })).toBeVisible();

    // Click Reset
    const resetButton = page.getByRole('button', { name: /reset filters/i });
    await resetButton.click();

    // Verify back to default
    await expect(page.getByRole('heading', { name: '$456,000' })).toBeVisible();
  });

  test('3. Pagination journey', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('cell', { name: '#1' })).toBeVisible();

    // Click Next Page with exact matching
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    await nextButton.click();

    // Verify Page 2 record is shown
    await expect(page.getByRole('cell', { name: '#11' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'CUST011' })).toBeVisible();
  });

  test('4. Row inspection opens transaction receipt modal and closes', async ({ page }) => {
    await page.goto('/');

    // Click row with ID #1
    await page.getByRole('cell', { name: '#1' }).click();

    // Check modal visibility
    await expect(page.getByRole('heading', { name: 'Transaction Receipt' })).toBeVisible();
    await expect(page.getByText('ID: #1')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(page.getByRole('heading', { name: 'Transaction Receipt' })).not.toBeVisible();
  });
});
