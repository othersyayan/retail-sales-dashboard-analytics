import { NextResponse } from 'next/server';
import { serverFetch } from '@/lib/api/client';
import { MetadataResponse } from '@/types/api';
import { ApiError } from '@/lib/api/errors';

export async function GET() {
  try {
    const data = await serverFetch<MetadataResponse>('/metadata');
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message, details: error.details }, { status: error.statusCode });
    }
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
