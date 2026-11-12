import { NextResponse } from 'next/server';
import { revealCard } from '@/lib/bank';
import { jsonError } from '@/lib/http';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = revealCard(id);
  if (!result.ok) {
    return jsonError(result.status, result.code, result.message, result.details);
  }
  // Datos sensibles: nunca cachear
  return NextResponse.json(result.data, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
