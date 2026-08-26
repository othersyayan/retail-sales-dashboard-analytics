import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/client';
import { SalesListResponse } from '@/types/api';
import { ApiError } from '@/lib/api/errors';
import { buildQueryString } from '@/lib/utils/queryParams';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const params: Record<string, string | null> = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      search: searchParams.get('search'),
      category: searchParams.get('category'),
      gender: searchParams.get('gender'),
      customerId: searchParams.get('customerId'),
      transactionId: searchParams.get('transactionId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      ageMin: searchParams.get('ageMin'),
      ageMax: searchParams.get('ageMax'),
      quantityMin: searchParams.get('quantityMin'),
      quantityMax: searchParams.get('quantityMax'),
      pricePerUnitMin: searchParams.get('pricePerUnitMin'),
      pricePerUnitMax: searchParams.get('pricePerUnitMax'),
      totalAmountMin: searchParams.get('totalAmountMin'),
      totalAmountMax: searchParams.get('totalAmountMax'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    };

    const queryString = buildQueryString(params);
    const data = await serverFetch<SalesListResponse>(`/sales${queryString}`);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch sales records' }, { status: 500 });
  }
}
