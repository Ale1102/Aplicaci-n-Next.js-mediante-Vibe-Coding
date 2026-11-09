import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from '@/lib/mock-data';
import { Transaction } from '@/types/banking';

// Estado en memoria del servidor para demostración de Route Handlers
let serverAccounts = [...INITIAL_ACCOUNTS];
let serverTransactions = [...INITIAL_TRANSACTIONS];

export async function GET() {
  return NextResponse.json({
    bankName: process.env.NEXT_PUBLIC_BANK_NAME || 'NovaBank Digital',
    accounts: serverAccounts,
    transactions: serverTransactions,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromAccountId, recipient, amount, category, concept } = body;

    const numericAmount = Number(amount);
    if (!recipient || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Datos de transferencia inválidos. Verifica el destinatario y el monto.' },
        { status: 400 }
      );
    }

    const accountIndex = serverAccounts.findIndex((a) => a.id === fromAccountId);
    if (accountIndex === -1) {
      return NextResponse.json({ error: 'Cuenta de origen no encontrada.' }, { status: 404 });
    }

    if (serverAccounts[accountIndex].balance < numericAmount) {
      return NextResponse.json(
        { error: 'Fondos insuficientes en la cuenta seleccionada.' },
        { status: 422 }
      );
    }

    serverAccounts[accountIndex].balance = Number(
      (serverAccounts[accountIndex].balance - numericAmount).toFixed(2)
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      title: concept || `Transferencia a ${recipient}`,
      recipientOrSender: recipient,
      amount: -numericAmount,
      currency: serverAccounts[accountIndex].currency,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      type: 'transferencia',
      category: category || 'Transferencia',
      status: 'Completado',
      reference: `NV-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    serverTransactions = [newTx, ...serverTransactions];

    return NextResponse.json({
      message: 'Transferencia procesada exitosamente',
      transaction: newTx,
      accounts: serverAccounts,
    });
  } catch {
    return NextResponse.json(
      { error: 'Error interno al procesar la transacción en el servidor.' },
      { status: 500 }
    );
  }
}
