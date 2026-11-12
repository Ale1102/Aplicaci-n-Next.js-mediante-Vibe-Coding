import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { executeTransfer } from '@/lib/bank';
import { jsonError, readJsonObject } from '@/lib/http';

export async function GET() {
  return NextResponse.json({
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'NovaBank Digital',
    accounts: store.accounts,
    transactions: store.transactions,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const body = await readJsonObject(request);
  if (!body) {
    return jsonError(400, 'INVALID_JSON', 'El cuerpo debe ser un objeto JSON válido.');
  }

  const result = executeTransfer(body);
  if (!result.ok) {
    return jsonError(result.status, result.code, result.message, result.details);
  }

  return NextResponse.json(
    {
      message: 'Transferencia procesada exitosamente',
      transaction: result.data.transaction,
      accounts: result.data.accounts,
    },
    { status: 201 }
  );
}
