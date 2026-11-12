import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { toPublicCard } from '@/lib/bank';

export async function GET() {
  return NextResponse.json({ cards: store.cards.map(toPublicCard) });
}
