# Product Requirements Document (PRD): Retail Sales Analytics MVP

**Document Version:** 1.0.0  
**Target Release:** MVP  
**Status:** Approved for Implementation Planning  
**API Specification Source:** OpenAPI 3.1.0 (`Retail Sales Public API`)

---

## 1. Executive Summary & Objectives

The goal of this project is to build a high-performance, robust, and intuitive **Retail Sales Analytics MVP**. The application consumes the read-only **Retail Sales Public API** to deliver actionable retail sales insights, comprehensive transaction exploration, and aggregated business metrics.

### Key Objectives
- **Functionality:** Deliver complete KPI visibility, dynamic multi-dimensional filtering, paginated sales records exploration, and transaction drill-downs.
- **Maintainability:** Modular architecture with clean separation of concerns (API layer, state management/caching, presentation, and data transforms).
- **API Integration Rigor:** Resilient HTTP client with header authentication, request debouncing, structured 422/500 validation error handling, and parameter normalization.
- **UX Clarity:** Instant feedback, zero-data/empty states, intuitive filter controls bound by dataset metadata, and loading skeletons.

---

## 2. Comprehensive OpenAPI Specification Analysis

### 2.1 Available Endpoints

| Endpoint | Method | Security | Summary / Description | Key Input Parameters | Key Response Schema |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | Service status & dataset load check | None | `HealthResponse` (`status`, `version`, `datasetLoaded`, `totalRecords`) |
| `/metadata` | `GET` | `X-API-Key` | Dataset boundaries & valid domain values | None | `MetadataResponse` (ranges, sort fields, genders, categories) |
| `/categories` | `GET` | `X-API-Key` | Available product categories list | None | `CategoriesResponse` (`data: string[]`) |
| `/summary` | `GET` | `X-API-Key` | Filtered sales metric aggregations | `search`, `category`, `gender`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder` | `SummaryResponse` (`totalTransactions`, `totalRevenue`, `averageOrderValue`, `totalItemsSold`) |
| `/sales` | `GET` | `X-API-Key` | Paginated & filtered list of sales records | Pagination (`page`, `limit`), Filters (`search`, `category`, `gender`, `customerId`, `transactionId`, `dateFrom`, `dateTo`, `ageMin/Max`, `quantityMin/Max`, `pricePerUnitMin/Max`, `totalAmountMin/Max`), Sorting (`sortBy`, `sortOrder`) | `SalesListResponse` (`data: Sale[]`, `pagination: PaginationMeta`, `filters: SalesFilters`) |
| `/sales/{transaction_id}` | `GET` | `X-API-Key` | Single transaction detail lookup | Path param `transaction_id: integer` | `Sale` |

---

### 2.2 Data Model Analysis

#### Primary Entity: `Sale`
```typescript
interface Sale {
  transactionId: number;        // integer (Unique identifier)
  date: string;                 // ISO date (YYYY-MM-DD)
  customerId: string;           // string (e.g., "CUST001")
  gender: 'Male' | 'Female';     // string enum regex ^(Male|Female)$
  age: number;                  // integer (e.g., 18 - 64)
  productCategory: string;      // string (e.g., "Beauty", "Clothing", "Electronics")
  quantity: number;             // integer (e.g., 1 - 4)
  pricePerUnit: number;         // float/number (e.g., 25 - 500)
  totalAmount: number;          // float/number (calculated: quantity * pricePerUnit)
}
```

#### Metadata & Range Entities
- **`DateRange`**: `{ start: string, end: string }`
- **`NumericRange`**: `{ min: number, max: number }`
- **`MetadataResponse`**:
  - `totalRecords`: integer
  - `availableSortFields`: `["age", "date", "pricePerUnit", "quantity", "totalAmount", "transactionId"]`
  - `availableGenders`: `["Female", "Male"]`
  - `availableCategories`: `string[]`
  - `dateRange`, `ageRange`, `quantityRange`, `pricePerUnitRange`, `totalAmountRange`

---

### 2.3 Pagination Capabilities
- Query Parameters: `page` (integer, min: 1, default: 1), `limit` (integer or null, e.g., 10, 25, 50).
- Response Metadata (`PaginationMeta`):
  - `page`: current page
  - `limit`: items per page
  - `totalItems`: total matching items
  - `totalPages`: total pages calculated by the server

---

### 2.4 Filtering & Sorting Capabilities
- **Text Search:** `search` (max 50 chars, case-insensitive substring on customer/product).
- **Exact Matches / Enums:** `gender` (`^(Male|Female)$`), `category` (string), `customerId` (string), `transactionId` (integer).
- **Range Queries:**
  - Date: `dateFrom`, `dateTo` (`YYYY-MM-DD`)
  - Age: `ageMin`, `ageMax` (integer >= 0)
  - Quantity: `quantityMin`, `quantityMax` (integer >= 0)
  - Price Per Unit: `pricePerUnitMin`, `pricePerUnitMax` (number >= 0)
  - Total Amount: `totalAmountMin`, `totalAmountMax` (number >= 0)
- **Sorting:**
  - `sortBy`: string enum matching `availableSortFields` (`transactionId` default)
  - `sortOrder`: string enum matching `^(asc|desc)$` (`asc` default)

---

### 2.5 Summary & Aggregation Capabilities
The `/summary` endpoint provides real-time server-side aggregations for the active filter set:
- `totalTransactions` (count)
- `totalRevenue` (sum of total amounts)
- `averageOrderValue` (revenue / transactions)
- `totalItemsSold` (sum of quantities)

*Note:* `/summary` supports a subset of query parameters (`search`, `category`, `gender`, `dateFrom`, `dateTo`, `sortBy`, `sortOrder`). Granular numeric range parameters (`ageMin`, etc.) are exclusive to `/sales`.

---

### 2.6 Metadata Capabilities
The `/metadata` endpoint delivers dynamic operational boundaries:
- Min and Max boundaries for numeric sliders/inputs (prevents invalid query inputs).
- Dynamic list of categories & genders (drives dropdown selections).
- Valid sortable fields list (guarantees schema-compliant sort dropdowns/headers).

---

### 2.7 Authentication & Security Requirements
- **Scheme:** API Key Authentication via Header.
- **Header Name:** `X-API-Key`.
- **Target Endpoints:** `/metadata`, `/categories`, `/summary`, `/sales`, `/sales/{transaction_id}`.
- **Public Endpoints:** `/health` (unauthenticated).

---

### 2.8 Potential API Integration Edge Cases & Mitigations

1. **Validation Errors (HTTP 422 `HTTPValidationError`):**
   - *Risk:* Passing empty strings (`""`) instead of `null`/omitted for numeric/enum query params triggers 422.
   - *Mitigation:* Clean query parameter serializer that strips empty strings, undefined, and NaN before sending requests.
2. **Filter Parameter Mismatch Between Summary & Sales:**
   - *Risk:* `/summary` does not accept age/quantity/price ranges.
   - *Mitigation:* Apply summary-supported filters globally while providing visual clarity in the UI when granular range filters only affect the transaction table, or compute client-side deltas when needed.
3. **Invalid Date/Numeric Boundaries:**
   - *Risk:* `dateFrom` > `dateTo` or `min` > `max` causing server rejection or 0 results.
   - *Mitigation:* Client-side schema validation (clamping inputs to values fetched from `/metadata`).
4. **Pagination Race Conditions & Rapid Input:**
   - *Risk:* Rapid typing in `search` or changing pages quickly leads to out-of-order responses.
   - *Mitigation:* `AbortController` cancellation for in-flight requests + 300ms debounce on text inputs.
5. **Missing or Invalid API Key (HTTP 401/403):**
   - *Risk:* App failure on startup if key is absent or revoked.
   - *Mitigation:* API key configuration UI with test-connection check and friendly modal/prompt if missing.
6. **Backend Dataset Not Loaded (`HealthResponse.datasetLoaded == false`):**
   - *Risk:* API returns 200 on `/health` but empty data on other endpoints.
   - *Mitigation:* Pre-flight health check with a service maintenance notice if `datasetLoaded` is false.

---

## 3. Proposed MVP Architecture & Scope

To demonstrate strong software engineering fundamentals, the MVP is designed as a modular, responsive Single Page Application (SPA).

```
+-----------------------------------------------------------------------------+
|                                 Header Bar                                  |
|  [Logo & App Title]                [Health Status: OK]  [API Key Settings]  |
+-----------------------------------------------------------------------------+
|                                Filter Bar                                   |
| [Search...] [Category v] [Gender v] [Date Range Picker] [Reset] [Export CSV]|
+-----------------------------------------------------------------------------+
|                            KPI Summary Cards                                |
| [Total Revenue: $456K]  [Orders: 1,000]  [Avg Order: $456]  [Items: 2,514]  |
+-----------------------------------------------------------------------------+
|  Analytics Chart Overview          |  Transactions Table                    |
|  - Revenue by Category (Bar/Donut) |  - Sortable Columns                    |
|  - Sales Trend (Date timeline)     |  - Row Click -> Transaction Detail Modal|
|                                    |  - Server-side Pagination Controls     |
+-----------------------------------------------------------------------------+
```

### 3.1 Core Features Included in MVP
1. **System Health & Configuration:**
   - Pre-flight `/health` verification indicator (Status, Version, Dataset loaded state).
   - Dynamic API key injection with persistent local storage option.
2. **Dataset-Driven Filter Control System:**
   - Filter bar powered by `/metadata` and `/categories`.
   - Debounced search, category dropdown, gender selector, and date range filters.
   - One-click "Reset Filters" with URL query param synchronization.
3. **Executive Summary KPI Cards:**
   - Cards displaying `Total Revenue`, `Total Transactions`, `Average Order Value (AOV)`, and `Total Items Sold` from `/summary`.
   - Skeleton loading states and transition animations.
4. **Interactive Data Visualization:**
   - Category revenue distribution chart (interactive breakdown).
   - Sales volume timeline chart (aggregated by transaction dates).
5. **Server-Paginated Sales Records Explorer:**
   - Data table with sorting headers bound to `availableSortFields`.
   - Configurable page size (10, 25, 50) and page navigation.
6. **Transaction Detail Modal / Drawer:**
   - Quick-view drawer fetching single transaction via `/sales/{transaction_id}` with customer info, item details, and breakdown.

---

## 4. Software Engineering Fundamentals & Non-Functional Requirements

### 4.1 Layered Architecture
- **API Client Layer:** Centralized `ApiClient` with error interceptors, query normalization, and TypeScript type safety.
- **State Management:** Reactive store / custom hooks with state synchronization between filters, pagination, and API calls.
- **Component Design System:** Reusable, accessible UI components (StatCard, FilterDropdown, DataTable, Modal, Skeleton).

### 4.2 Error Handling & Resilience
- Graceful degradation: Fallback views for network errors, 401 unauthorized, and empty query results.
- Robust parameter sanitizer preventing 422 Validation Errors.

### 4.3 Performance & UX Polish
- Debounced search inputs (300ms).
- Query request caching and deduplication.
- Responsive layout supporting Desktop, Tablet, and Mobile viewports.
- Keyboard accessible navigation and ARIA labels.

---

## 5. Implementation Milestones

- **Phase 1: Setup & API Client Integration**
  - Environment config, API client implementation, `/health` & `/metadata` bootstrappers.
- **Phase 2: Global Filters & KPI Summary**
  - Metadata-driven filter bar, `/summary` integration, and KPI card widgets.
- **Phase 3: Paginated Data Table & Sorting**
  - `/sales` table with column sort triggers, pagination toolbar, and row selection.
- **Phase 4: Transaction Detail & Visualizations**
  - `/sales/{transaction_id}` drawer and summary charts.
- **Phase 5: UX Polish & Edge Case Testing**
  - Error toasts, empty state graphics, and responsive styling.
