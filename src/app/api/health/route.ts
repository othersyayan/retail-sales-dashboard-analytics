import { NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/client';
import { HealthResponse } from '@/types/api';
import { ApiError } from '@/lib/api/errors';

export async function GET() {
  try {
    const data = await serverFetch<HealthResponse>('/health', { requiresAuth: false });
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch health status' }, { status: 500 });
  }
}
