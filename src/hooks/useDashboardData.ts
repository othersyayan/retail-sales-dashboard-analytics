import { useCallback, useEffect, useState } from 'react';
import {
  CategoriesResponse,
  HealthResponse,
  MetadataResponse,
  SalesListResponse,
  SummaryResponse,
} from '@/types/api';
import { DashboardFilterState, DEFAULT_FILTERS } from '@/types/filters';
import { useDebounce } from './useDebounce';
import { buildQueryString } from '@/lib/utils/queryParams';

export function useDashboardData() {
  const [filters, setFilters] = useState<DashboardFilterState>(DEFAULT_FILTERS);
  const debouncedSearch = useDebounce(filters.search, 350);

  // Data states
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [metadata, setMetadata] = useState<MetadataResponse | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [salesData, setSalesData] = useState<SalesListResponse | null>(null);

  // Loading states
  const [isHealthLoading, setIsHealthLoading] = useState(true);
  const [isMetaLoading, setIsMetaLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isSalesLoading, setIsSalesLoading] = useState(true);

  // Errors
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Health
  const fetchHealth = useCallback(async () => {
    try {
      setIsHealthLoading(true);
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('Health check failed');
      const data = (await res.json()) as HealthResponse;
      setHealth(data);
    } catch (err) {
      console.error('Health fetch error:', err);
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  // 2. Fetch Metadata & Categories
  const fetchInitialMetadata = useCallback(async () => {
    try {
      setIsMetaLoading(true);
      const [metaRes, catRes] = await Promise.all([
        fetch('/api/metadata'),
        fetch('/api/categories'),
      ]);

      if (metaRes.ok) {
        const metaData = (await metaRes.json()) as MetadataResponse;
        setMetadata(metaData);
      }
      if (catRes.ok) {
        const catData = (await catRes.json()) as CategoriesResponse;
        setCategories(catData.data || []);
      }
    } catch (err) {
      console.error('Metadata fetch error:', err);
    } finally {
      setIsMetaLoading(false);
    }
  }, []);

  // 3. Fetch Summary (filtered)
  const fetchSummary = useCallback((signal?: AbortSignal) => {
    setIsSummaryLoading(true);
    const summaryParams = {
      search: debouncedSearch,
      category: filters.category,
      gender: filters.gender,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    };

    const queryString = buildQueryString(summaryParams);
    return fetch(`/api/summary${queryString}`, { signal })
      .then(async (res) => {
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to fetch summary');
        }
        return res.json() as Promise<SummaryResponse>;
      })
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Summary fetch error:', err);
        }
      })
      .finally(() => {
        setIsSummaryLoading(false);
      });
  }, [debouncedSearch, filters.category, filters.gender, filters.dateFrom, filters.dateTo]);

  // 4. Fetch Sales List (filtered & paginated)
  const fetchSales = useCallback((signal?: AbortSignal) => {
    setIsSalesLoading(true);
    setError(null);

    const salesParams = {
      page: filters.page,
      limit: filters.limit,
      search: debouncedSearch,
      category: filters.category,
      gender: filters.gender,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    const queryString = buildQueryString(salesParams);
    return fetch(`/api/sales${queryString}`, { signal })
      .then(async (res) => {
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to fetch sales');
        }
        return res.json() as Promise<SalesListResponse>;
      })
      .then((data) => {
        setSalesData(data);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      })
      .finally(() => {
        setIsSalesLoading(false);
      });
  }, [
    debouncedSearch,
    filters.page,
    filters.limit,
    filters.category,
    filters.gender,
    filters.dateFrom,
    filters.dateTo,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // Initial load
  useEffect(() => {
    fetchHealth();
    fetchInitialMetadata();
  }, [fetchHealth, fetchInitialMetadata]);

  // Refetch summary with abort controller
  useEffect(() => {
    const controller = new AbortController();
    fetchSummary(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchSummary]);

  // Refetch sales with abort controller
  useEffect(() => {
    const controller = new AbortController();
    fetchSales(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchSales]);

  // Action handlers
  const updateFilter = <K extends keyof DashboardFilterState>(
    key: K,
    value: DashboardFilterState[K]
  ) => {
    setFilters((prev) => {
      // If changing filters other than page, reset to page 1
      const resetPage = key !== 'page';
      return {
        ...prev,
        [key]: value,
        ...(resetPage ? { page: 1 } : {}),
      };
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const changeSort = (field: string) => {
    setFilters((prev) => {
      if (prev.sortBy === field) {
        return {
          ...prev,
          sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
          page: 1,
        };
      }
      return {
        ...prev,
        sortBy: field,
        sortOrder: 'asc',
        page: 1,
      };
    });
  };

  return {
    filters,
    health,
    metadata,
    categories,
    summary,
    salesData,
    loading: {
      health: isHealthLoading,
      metadata: isMetaLoading,
      summary: isSummaryLoading,
      sales: isSalesLoading,
    },
    error,
    actions: {
      updateFilter,
      resetFilters,
      changeSort,
      refetch: () => {
        fetchSummary();
        fetchSales();
      },
    },
  };
}
