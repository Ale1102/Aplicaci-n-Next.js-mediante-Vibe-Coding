import { NextResponse } from 'next/server';
import { getFxRates } from '@/lib/fx';

export async function GET() {
  return NextResponse.json(await getFxRates());
}
