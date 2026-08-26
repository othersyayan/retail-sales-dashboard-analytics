import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/client';
import { Sale } from '@/types/sales';
import { ApiError } from '@/lib/api/errors';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const transactionId = parseInt(id, 10);

    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }

    const data = await serverFetch<Sale>(`/sales/${transactionId}`);
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch transaction detail' }, { status: 500 });
  }
}
