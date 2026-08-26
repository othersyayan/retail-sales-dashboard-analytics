import { ApiError } from './errors';

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Centralized server-side fetch wrapper for upstream Retail Sales API.
 * Injects X-API-Key header and normalizes errors.
 */
export async function serverFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

  const baseUrl = process.env.RETAIL_API_BASE_URL || 'https://public.hijrahfood.id';
  const apiKey = process.env.RETAIL_API_KEY || '';

  if (requiresAuth && !apiKey) {
    throw new ApiError(
      'Server configuration error: RETAIL_API_KEY is not configured in environment.',
      500
    );
  }

  const url = `${baseUrl.replace(/\/$/, '')}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth && apiKey) {
    requestHeaders['X-API-Key'] = apiKey;
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
      cache: 'no-store', // ensures live proxy data
    });

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      const errorMessage =
        (typeof errorBody === 'object' && errorBody !== null && 'detail' in errorBody)
          ? JSON.stringify((errorBody as { detail: unknown }).detail)
          : `Upstream API returned status ${response.status}`;

      throw new ApiError(errorMessage, response.status, errorBody);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown upstream connection error',
      500
    );
  }
}
