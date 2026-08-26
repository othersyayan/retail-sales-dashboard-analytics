import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/client';
import { SummaryResponse } from '@/types/api';
import { ApiError } from '@/lib/api/errors';
import { buildQueryString } from '@/lib/utils/queryParams';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Summary endpoint only accepts specific query parameters according to OpenAPI spec
    const params = {
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      gender: searchParams.get('gender'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    };

    const queryString = buildQueryString(params);
    const data = await serverFetch<SummaryResponse>(`/summary${queryString}`);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 });
  }
}
