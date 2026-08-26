import { useCallback, useState } from 'react';
import { Sale } from '@/types/sales';

export function useTransactionDetail() {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openTransaction = useCallback(async (transactionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sales/${transactionId}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to fetch transaction detail');
      }
      const data = (await res.json()) as Sale;
      setSelectedSale(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const closeTransaction = useCallback(() => {
    setSelectedSale(null);
    setError(null);
  }, []);

  return {
    selectedSale,
    isLoading,
    error,
    openTransaction,
    closeTransaction,
  };
}
