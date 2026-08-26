/**
 * Sanitizes an object of parameters:
 * - Strips empty strings (""), undefined, null, and NaN values
 * - Returns clean URLSearchParams string
 */
export function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (typeof value === 'number' && isNaN(value)) {
      continue;
    }
    searchParams.append(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
