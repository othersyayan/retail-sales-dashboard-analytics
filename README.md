# Hijrahfood Technical Assessment

## Overview

A high-performance, responsive Retail Sales Analytics MVP built to consume and visualize data from the read-only Retail Sales Public API. The application provides real-time sales KPI visibility, dynamic multi-dimensional filtering, server-paginated transaction exploration, and single-transaction receipt drill-downs.

## Features

- **Live Service Health & Dataset Status**: Pre-flight verification of API connectivity, dataset loaded status, and total record counts.
- **Executive KPI Summary Cards**: Real-time sales metrics displaying Total Revenue, Total Transactions, Average Order Value (AOV), and Total Items Sold with skeleton loading states.
- **Dynamic Multi-Dimensional Filters**: Debounced text search, category dropdowns, gender selector, and date range filters with client-side boundary clamping (`dateFrom` / `dateTo`).
- **Server-Paginated & Sortable Data Table**: Fast transaction list supporting customizable page limits (10, 25, 50 per page) and bi-directional column sorting.
- **Single Transaction Receipt Inspection**: Interactive detail modal displaying customer demographics, item breakdown, and total order payment upon clicking a row (supports keyboard `Escape` dismissal).
- **Graceful Error & Empty State Handling**: User-friendly banners with retry triggers for network/server errors and dedicated zero-data states with one-click filter resets.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI & Styling**: React 19, Vanilla CSS & CSS Modules (Design tokens, glassmorphism, responsive layout)
- **Unit & Integration Testing**: Vitest, React Testing Library, jsdom
- **End-to-End Testing**: Playwright (Chromium)

## Architecture

The project follows a modular, SOLID-guided architecture:

- **Server-Side API Proxy**: Browser clients never communicate directly with the upstream API or handle secrets. All requests are routed through Next.js Route Handlers (`src/app/api/*`).
- **Separation of Concerns (SRP)**: Distinct layers for API client communication (`src/lib/api`), parameter sanitization (`src/lib/utils`), data orchestration hooks (`src/hooks`), and pure presentational components (`src/components`).
- **Resilient Request Orchestration**: Features debounced search inputs and in-flight request cancellation (`AbortController`) to eliminate race conditions and stale UI states.

## API Integration

The application communicates with the upstream REST API entirely on the server side:

- **Security & Key Isolation**: The secret `X-API-Key` is injected inside the centralized `serverFetch` client on the server; the key is never exposed to browser client bundles.
- **Parameter Normalization**: Uses a custom `buildQueryString` utility to strip empty strings (`""`), `null`, `undefined`, and `NaN` values before dispatching upstream, preventing HTTP 422 `HTTPValidationError` responses.
- **Endpoints Proxied**:
  - `GET /health` ➔ Service status and dataset load verification.
  - `GET /metadata` ➔ Dataset boundaries (ranges, available categories, genders, sort fields).
  - `GET /categories` ➔ Unique product categories.
  - `GET /summary` ➔ Aggregated KPI metrics for current filter scope.
  - `GET /sales` ➔ Paginated, filtered, and sorted transaction records.
  - `GET /sales/{transaction_id}` ➔ Single transaction detail lookup.

## AI-Assisted Development

AI tools were leveraged systematically throughout the software development lifecycle:

- **API Spec & Edge Case Analysis**: Analyzed the OpenAPI 3.1.0 specification to map schema types, parameter constraints, and potential edge cases (such as 422 errors on empty string inputs).
- **PRD & Architecture Design**: Formulated structured documentation (`docs/PRD.md` and `docs/ARCHITECTURE.md`) before writing application code.
- **Incremental Implementation**: Implemented the server proxy, types, custom hooks, and UI components in targeted, test-verifiable steps.
- **Code Review & Quality Assurance**: Identified and mitigated concurrency race conditions with `AbortController`, enforced date picker boundary clamps, and generated complete unit, integration, and E2E test suites.

## Testing

A pragmatic testing strategy covering critical behaviors:

- **Unit Tests**:
  - `queryParams`: Parameter sanitization and empty string stripping.
  - `formatters`: Currency (USD), number commas, and ISO date formatting.
  - Components: Loading skeletons, filter interactions, empty states, pagination buttons, sorting headers, and receipt modal rendering.
- **Integration Tests**: Next.js route handlers (`/api/metadata`, `/api/summary`, `/api/sales`) with mock responses and error code propagation.
- **Playwright E2E Tests**: Full user journeys covering initial dashboard render, filter selection & one-click reset, multi-page pagination, and row-click receipt modal inspection.

## Running Locally

### 1. Prerequisites

- Node.js 18+ (tested on Node v22)
- npm 9+

### 2. Installation

```bash
# Clone the repository and navigate to the folder
cd retail-sales-dashboard-analytics

# Install dependencies
npm install
```

### 3. Setup Environment Variables

Create a `.env.local` file in the project root (see template below):

```bash
cp .env.example .env.local
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests

```bash
# Run unit & integration tests (Vitest)
npm run test

# Run end-to-end tests (Playwright)
npm run test:e2e

# Run production build and type checking
npm run build
```

## Environment Variables

| Variable              | Required | Description                                                     | Example                        |
| :-------------------- | :------- | :-------------------------------------------------------------- | :----------------------------- |
| `RETAIL_API_BASE_URL` | Yes      | Base URL of the upstream Retail Sales REST API                  | `https://public.hijrahfood.id` |
| `RETAIL_API_KEY`      | Yes      | Secret API Key for authentication (sent via `X-API-Key` header) | `your_api_secret`              |
