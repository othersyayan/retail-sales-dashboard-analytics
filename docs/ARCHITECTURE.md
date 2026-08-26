# Architecture Design Document: Retail Sales Analytics MVP

**Project:** Retail Sales Analytics MVP  
**Framework:** Next.js (App Router) + TypeScript + Vanilla CSS / CSS Modules  
**Architecture Style:** Modular, Server-Side API Proxy, SOLID-guided Component Architecture  
**Target File:** `/docs/ARCHITECTURE.md`

---

## 1. Project Structure

A clean, predictable Next.js App Router structure avoiding bloated abstractions:

```
retail-sales-dashboard-analytics/
├── .env.local                     # Environment variables (API Base URL, Secret API Key)
├── .env.example                   # Example environment variables template
├── docs/
│   ├── PRD.md                     # Product Requirements Document
│   └── ARCHITECTURE.md            # Architecture Design Document (this document)
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # Server-side API Route Handlers (Secure Proxy)
│   │   │   ├── health/route.ts    # Proxies /health
│   │   │   ├── metadata/route.ts  # Proxies /metadata
│   │   │   ├── categories/route.ts# Proxies /categories
│   │   │   ├── summary/route.ts   # Proxies /summary
│   │   │   └── sales/
│   │   │       ├── route.ts       # Proxies /sales (list, filter, paginate)
│   │   │       └── [id]/route.ts  # Proxies /sales/{transaction_id} (detail)
│   │   ├── globals.css            # Design tokens, theme variables, reset
│   │   ├── layout.tsx             # Root layout (fonts, header, container)
│   │   └── page.tsx               # Main Dashboard Page (Server/Client composition)
│   │
│   ├── components/                # Reusable UI & Feature Components
│   │   ├── common/                # Pure reusable presentational components (SOLID: SRP)
│   │   │   ├── Button/            # Button with variants
│   │   │   ├── Card/              # Surface container card
│   │   │   ├── Modal/             # Accessible dialog wrapper
│   │   │   ├── Skeleton/          # Reusable loading placeholder
│   │   │   ├── Badge/             # Status & category tag badges
│   │   │   └── ErrorState/        # Reusable error banner / retry trigger
│   │   ├── layout/
│   │   │   ├── Header.tsx         # Top bar with health status badge
│   │   │   └── Container.tsx      # Responsive content wrapper
│   │   ├── dashboard/             # Feature-specific dashboard components
│   │   │   ├── FilterBar.tsx      # Debounced search, dropdowns, date picker
│   │   │   ├── SummaryCards.tsx   # 4 KPI metric cards (Revenue, Orders, AOV, Items)
│   │   │   ├── SalesTable.tsx     # Paginated, sortable transaction data table
│   │   │   ├── Pagination.tsx     # Page switch, limit selector, item counters
│   │   │   └── TransactionDetailModal.tsx # Single transaction detail modal
│   │
│   ├── lib/                       # Core utilities and backend-facing logic
│   │   ├── api/                   # Server-side API Client (SRP & DIP)
│   │   │   ├── client.ts          # Centralized fetch wrapper injecting X-API-Key
│   │   │   └── errors.ts          # Normalized API Error classes (422, 401, 500)
│   │   └── utils/                 # Pure helper functions
│   │       ├── formatters.ts      # Currency, date, numbers formatting
│   │       └── queryParams.ts     # Query parameter serializer & sanitizer
│   │
│   ├── hooks/                     # Custom hooks for UI state & data orchestration
│   │   ├── useDashboardData.ts    # Orchestrates metadata, summary, sales & filters
│   │   ├── useDebounce.ts         # Debounce hook for instant search inputs
│   │   └── useTransactionDetail.ts# Hook for fetching single transaction by ID
│   │
│   └── types/                     # TypeScript interfaces and API schemas
│       ├── api.ts                 # Request/Response schemas matching OpenAPI spec
│       ├── sales.ts               # Core domain entities (Sale, Category, Gender)
│       └── filters.ts             # Filter, Pagination, and Sorting state types
│
├── tests/                         # Unit and integration tests
│   ├── api-proxy.test.ts          # Route handler tests
│   ├── queryParams.test.ts        # Parameter sanitizer tests
│   └── components/                # Component unit tests
├── package.json
└── tsconfig.json
```

---

## 2. End-to-End Data Flow

The architecture strictly shields client browsers from the upstream API key and backend details via Next.js Route Handlers.

```
+------------------------------------------------------------------------------------+
|                                CLIENT BROWSER                                      |
|                                                                                    |
|  [FilterBar] ---> (URL Params / Local State) ---> [useDashboardData]               |
|                                                          |                         |
|  [SummaryCards] <--- (State: data, loading, error) <-----+                         |
|  [SalesTable]   <--- (State: data, pagination)     <-----+                         |
|                                                          |                         |
+----------------------------------------------------------|-------------------------+
                                                           | HTTP fetch('/api/...')
                                                           v
+------------------------------------------------------------------------------------+
|                         NEXT.JS SERVER (Route Handlers)                            |
|                                                                                    |
|  /api/summary?search=...    /api/sales?page=1...    /api/metadata                  |
|          |                           |                     |                       |
|          +---------------------------+---------------------+                       |
|                                      |                                             |
|                             [lib/api/client.ts]                                    |
|                      - Injects `X-API-Key: process.env.API_KEY`                    |
|                      - Sanitizes & validates parameters                            |
|                      - Normalizes 422 / 500 error responses                        |
+--------------------------------------|---------------------------------------------+
                                       | HTTPS + X-API-Key
                                       v
+------------------------------------------------------------------------------------+
|                         UPSTREAM RETAIL SALES REST API                             |
|          (/health, /metadata, /categories, /summary, /sales, /sales/{id})          |
+------------------------------------------------------------------------------------+
```

### Flow Breakdown:
1. **Bootstrap:** The client calls `/api/metadata` and `/api/health` on initial load.
2. **Filter Interactions:** User updates search or selects a category. The `useDashboardData` hook triggers debounced requests to `/api/summary` and `/api/sales`.
3. **Server Proxy:** Next.js Route Handlers extract query parameters, validate them, attach the private `process.env.RETAIL_API_KEY` header, and forward the request to the upstream API.
4. **Response Delivery:** Normalized data is returned to the client hook to populate KPI cards and table rows without exposing upstream credentials.
5. **Drill-down:** Clicking a table row triggers `/api/sales/{id}` to populate the `TransactionDetailModal`.

---

## 3. Server-Side API Route Design (Proxy Handlers)

All upstream calls originate exclusively from the server inside `src/app/api/*`.

### 3.1 Route Matrix

| Next.js Route | Method | Upstream Target | Query / Path Parameters |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | `${API_BASE_URL}/health` | None |
| `/api/metadata` | `GET` | `${API_BASE_URL}/metadata` | None |
| `/api/categories`| `GET` | `${API_BASE_URL}/categories`| None |
| `/api/summary` | `GET` | `${API_BASE_URL}/summary` | `search`, `category`, `gender`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder` |
| `/api/sales` | `GET` | `${API_BASE_URL}/sales` | `page`, `limit`, `search`, `category`, `gender`, `customerId`, `transactionId`, `dateFrom`, `dateTo`, `ageMin/Max`, `quantityMin/Max`, `pricePerUnitMin/Max`, `totalAmountMin/Max`, `sortBy`, `sortOrder` |
| `/api/sales/[id]`| `GET` | `${API_BASE_URL}/sales/{id}`| Path: `id` (integer) |

### 3.2 Server-Side Client Implementation Pattern (`lib/api/client.ts`)
- Utilizes `fetch` with standard timeouts and headers.
- Extracts `process.env.RETAIL_API_BASE_URL` and `process.env.RETAIL_API_KEY`.
- Handles upstream error response envelopes (e.g., converting 422 `HTTPValidationError` into clean readable JSON for client display).

---

## 4. TypeScript Type Definitions

Core types directly align with the OpenAPI 3.1.0 specification:

```typescript
// === DOMAIN TYPES (src/types/sales.ts) ===

export type Gender = 'Male' | 'Female';

export interface Sale {
  transactionId: number;
  date: string;              // ISO format: YYYY-MM-DD
  customerId: string;
  gender: Gender;
  age: number;
  productCategory: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
}

// === API RESPONSE TYPES (src/types/api.ts) ===

export interface HealthResponse {
  status: string;
  version: string;
  datasetLoaded: boolean;
  totalRecords: number;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface MetadataResponse {
  totalRecords: number;
  availableSortFields: string[];
  availableGenders: Gender[];
  availableCategories: string[];
  dateRange: DateRange;
  ageRange: NumericRange;
  quantityRange: NumericRange;
  pricePerUnitRange: NumericRange;
  totalAmountRange: NumericRange;
}

export interface CategoriesResponse {
  data: string[];
}

export interface SummaryResponse {
  totalTransactions: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalItemsSold: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface SalesListResponse {
  data: Sale[];
  pagination: PaginationMeta;
  filters: SalesFilterParams;
}

export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  details?: Array<{ loc: (string | number)[]; msg: string; type: string }>;
}

// === FILTER & STATE TYPES (src/types/filters.ts) ===

export type SortOrder = 'asc' | 'desc';

export interface SalesFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  gender?: Gender | '';
  customerId?: string;
  transactionId?: number;
  dateFrom?: string;
  dateTo?: string;
  ageMin?: number;
  ageMax?: number;
  quantityMin?: number;
  quantityMax?: number;
  pricePerUnitMin?: number;
  pricePerUnitMax?: number;
  totalAmountMin?: number;
  totalAmountMax?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}
```

---

## 5. Component Responsibilities & SOLID Application

Components adhere to clean SOLID design principles for high maintainability:

| Component | Responsibility (SRP) | SOLID Principles & Reusability |
| :--- | :--- | :--- |
| **`Header`** | Displays branding, connection status, and API metadata badge. | **SRP**: Only concerns top-level status presentation. |
| **`FilterBar`** | Collects user inputs for search, categories, genders, dates. | **DIP**: Receives metadata choices as props; fires `onFilterChange` callback. |
| **`SummaryCards`**| Renders the 4 core business KPIs with animated values. | **OCP / SRP**: Composes generic `<Card>` and `<Skeleton>` components; extensible for new KPIs. |
| **`SalesTable`** | Renders tabular transactions, sort indicators, and row actions. | **SRP**: Focuses strictly on table layout and sort headers; delegates row clicking to modal trigger. |
| **`Pagination`** | Controls current page navigation and page-size selector. | **Reusability**: Standalone pagination widget decoupled from sales domain logic. |
| **`TransactionDetailModal`** | Displays structured receipt-style breakdown for a single `Sale`. | **SRP**: Focused entirely on single-entity inspection. |
| **`ErrorState` & `Skeleton`**| Generic empty/error banners and loading skeletons. | **Reusability**: Shared across summary, table, and modal states. |

---

## 6. State Management Approach

To avoid unnecessary complexities, external state libraries (e.g., Redux, Zustand) are avoided in favor of **React Native State + URL Query Synchronization**:

### Why this approach?
1. **URL as Single Source of Truth for Filters:** Preserves bookmarking, sharing, and browser back/forward navigation.
2. **Predictable Local State:** Co-located in a custom hook (`useDashboardData.ts`).
3. **No Stale Sync Issues:** Changes to filter triggers state refresh via standard `useEffect` or `useCallback` request hooks.

```typescript
// useDashboardData Hook Structure
export function useDashboardData(initialFilters?: SalesFilterParams) {
  const [filters, setFilters] = useState<SalesFilterParams>(initialFilters);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [salesData, setSalesData] = useState<SalesListResponse | null>(null);
  
  const [isMetadataLoading, setIsMetadataLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handlers for updateFilter, resetFilters, setPage, setSort
  return {
    filters,
    metadata,
    summary,
    salesData,
    loading: { metadata: isMetadataLoading, summary: isSummaryLoading, sales: isSalesLoading },
    error,
    actions: { updateFilter, resetFilters, changePage, changeSort }
  };
}
```

---

## 7. Handling UI States

1. **Loading State:**
   - Skeleton shimmer placeholders for KPI summary cards during initial or filter re-fetching.
   - Table body opacity transition with skeleton row placeholders.
2. **Empty State:**
   - Dedicated zero-data card when filtered queries return `totalItems === 0` with a one-click "Clear All Filters" button.
3. **Error State:**
   - Dismissible warning alerts with retry triggers if the proxy or backend returns 422, 500, or network drops.
4. **Validation Protection:**
   - Parameter sanitizer removes empty strings (`""`), `null`, and `NaN` before firing proxy requests to avoid 422 Unprocessable Entity responses.

---

## 8. Testing Approach

A pragmatic, multi-layered testing strategy:

1. **Unit Tests (Jest / Vitest):**
   - **`queryParams.ts`**: Verify query serialization, stripping of empty strings, and handling of undefined/null fields.
   - **`formatters.ts`**: Test currency, date string parsing, and number precision.
2. **API Route Integration Tests:**
   - Test Next.js Route Handlers with mocked upstream fetch calls (testing 200 OK, 422 Validation Error handling, 500 fallback, and header forwarding).
3. **Component & Interaction Tests (React Testing Library):**
   - Verify `FilterBar` dispatches debounced filter updates.
   - Verify `SalesTable` triggers sort column changes and opens `TransactionDetailModal` on row click.
   - Verify `SummaryCards` correctly displays loading skeletons and formatted numbers.
