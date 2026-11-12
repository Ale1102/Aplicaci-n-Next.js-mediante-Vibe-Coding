import { randomInt, randomUUID } from 'node:crypto';
import {
  BankAccount,
  BankCard,
  PublicBankCard,
  SavingsGoal,
  Transaction,
  TransactionCategory,
} from '@/types/banking';
import { store } from '@/lib/store';
import { hasMaxTwoDecimals, roundMoney } from '@/lib/http';

export type Failure = {
  ok: false;
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
export type Success<T> = { ok: true; data: T };
export type Result<T> = Success<T> | Failure;

const fail = (
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
): Failure => ({ ok: false, status, code, message, details });

export const TRANSFER_CATEGORIES: TransactionCategory[] = [
  'Transferencia',
  'Servicios',
  'Tecnología',
  'Ahorro',
];

export const MAX_TRANSFER_AMOUNT = 100_000;
export const CARD_LIMIT_MIN = 1000;
export const CARD_LIMIT_MAX = 15000;

export function toPublicCard(card: BankCard): PublicBankCard {
  // Se descarta el CVV: solo se entrega mediante /api/cards/{id}/reveal
  const { cvv, ...rest } = card;
  void cvv;
  return rest;
}

function nowStamp(): string {
  return new Date().toISOString().slice(0, 16).replace('T', ' ');
}

function newReference(): string {
  let ref: string;
  do {
    ref = `NV-${randomInt(100000, 1000000)}`;
  } while (store.transactions.some((t) => t.reference === ref));
  return ref;
}

/** Valida un monto positivo con máximo 2 decimales. */
function validateAmount(raw: unknown, max: number): Result<number> {
  const amount = typeof raw === 'string' ? Number(raw) : raw;
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return fail(400, 'INVALID_AMOUNT', 'El monto debe ser un número mayor a 0.');
  }
  if (!hasMaxTwoDecimals(amount)) {
    return fail(400, 'INVALID_AMOUNT', 'El monto admite como máximo 2 decimales.');
  }
  if (amount > max) {
    return fail(
      422,
      'AMOUNT_LIMIT_EXCEEDED',
      `El monto máximo por operación es ${max.toLocaleString('en-US')}.`,
      { max }
    );
  }
  return { ok: true, data: roundMoney(amount) };
}

function findAccount(id: unknown): BankAccount | undefined {
  return typeof id === 'string' ? store.accounts.find((a) => a.id === id) : undefined;
}

export interface TransferInput {
  fromAccountId?: unknown;
  recipient?: unknown;
  amount?: unknown;
  concept?: unknown;
  category?: unknown;
}

export function executeTransfer(
  input: TransferInput
): Result<{ transaction: Transaction; accounts: BankAccount[] }> {
  const recipient =
    typeof input.recipient === 'string' ? input.recipient.trim() : '';
  if (recipient.length < 2 || recipient.length > 80) {
    return fail(
      400,
      'INVALID_RECIPIENT',
      'El beneficiario debe tener entre 2 y 80 caracteres.'
    );
  }

  const concept =
    typeof input.concept === 'string' ? input.concept.trim() : '';
  if (concept.length > 120) {
    return fail(400, 'INVALID_CONCEPT', 'El concepto admite hasta 120 caracteres.');
  }

  const category = (input.category ?? 'Transferencia') as TransactionCategory;
  if (!TRANSFER_CATEGORIES.includes(category)) {
    return fail(
      400,
      'INVALID_CATEGORY',
      `Categoría inválida. Valores permitidos: ${TRANSFER_CATEGORIES.join(', ')}.`
    );
  }

  const amountResult = validateAmount(input.amount, MAX_TRANSFER_AMOUNT);
  if (!amountResult.ok) return amountResult;
  const amount = amountResult.data;

  const account = findAccount(input.fromAccountId);
  if (!account) {
    return fail(404, 'ACCOUNT_NOT_FOUND', 'Cuenta de origen no encontrada.');
  }
  if (account.balance < amount) {
    return fail(
      422,
      'INSUFFICIENT_FUNDS',
      'Fondos insuficientes en la cuenta seleccionada.',
      { available: account.balance, requested: amount }
    );
  }

  account.balance = roundMoney(account.balance - amount);

  const transaction: Transaction = {
    id: `tx-${randomUUID().slice(0, 8)}`,
    title: concept || `Transferencia a ${recipient}`,
    recipientOrSender: recipient,
    amount: -amount,
    currency: account.currency,
    date: nowStamp(),
    type: 'transferencia',
    category,
    status: 'Completado',
    reference: newReference(),
  };
  store.transactions = [transaction, ...store.transactions];

  return { ok: true, data: { transaction, accounts: store.accounts } };
}

export function depositToGoal(
  goalId: string,
  input: { amount?: unknown; fromAccountId?: unknown }
): Result<{ goal: SavingsGoal; transaction: Transaction; accounts: BankAccount[] }> {
  const goal = store.goals.find((g) => g.id === goalId);
  if (!goal) return fail(404, 'GOAL_NOT_FOUND', 'Meta de ahorro no encontrada.');

  const amountResult = validateAmount(input.amount, MAX_TRANSFER_AMOUNT);
  if (!amountResult.ok) return amountResult;
  const amount = amountResult.data;

  const account = findAccount(input.fromAccountId);
  if (!account) {
    return fail(404, 'ACCOUNT_NOT_FOUND', 'Cuenta de origen no encontrada.');
  }
  if (account.currency !== 'USD') {
    return fail(
      422,
      'CURRENCY_MISMATCH',
      'Las metas de ahorro se abonan desde cuentas en USD.'
    );
  }

  const remaining = roundMoney(goal.targetAmount - goal.currentAmount);
  if (remaining <= 0) {
    return fail(422, 'GOAL_COMPLETED', 'Esta meta ya alcanzó su objetivo.');
  }
  if (amount > remaining) {
    return fail(
      422,
      'GOAL_EXCEEDS_TARGET',
      `El abono supera lo que falta para la meta (${remaining.toFixed(2)} USD).`,
      { remaining }
    );
  }
  if (account.balance < amount) {
    return fail(
      422,
      'INSUFFICIENT_FUNDS',
      'Fondos insuficientes en la cuenta seleccionada.',
      { available: account.balance, requested: amount }
    );
  }

  account.balance = roundMoney(account.balance - amount);
  goal.currentAmount = roundMoney(goal.currentAmount + amount);

  const transaction: Transaction = {
    id: `tx-${randomUUID().slice(0, 8)}`,
    title: `Abono a meta: ${goal.title}`,
    recipientOrSender: 'Bóveda Meta de Ahorro',
    amount: -amount,
    currency: 'USD',
    date: nowStamp(),
    type: 'transferencia',
    category: 'Ahorro',
    status: 'Completado',
    reference: newReference(),
  };
  store.transactions = [transaction, ...store.transactions];

  return { ok: true, data: { goal, transaction, accounts: store.accounts } };
}

export function updateCard(
  cardId: string,
  input: { frozen?: unknown; monthlyLimit?: unknown }
): Result<PublicBankCard> {
  const card = store.cards.find((c) => c.id === cardId);
  if (!card) return fail(404, 'CARD_NOT_FOUND', 'Tarjeta no encontrada.');

  if (input.frozen === undefined && input.monthlyLimit === undefined) {
    return fail(
      400,
      'EMPTY_UPDATE',
      'Envía al menos uno de los campos: frozen, monthlyLimit.'
    );
  }
  if (input.frozen !== undefined && typeof input.frozen !== 'boolean') {
    return fail(400, 'INVALID_FROZEN', 'El campo frozen debe ser booleano.');
  }

  let newLimit: number | undefined;
  if (input.monthlyLimit !== undefined) {
    const limit = input.monthlyLimit;
    if (
      typeof limit !== 'number' ||
      !Number.isInteger(limit) ||
      limit < CARD_LIMIT_MIN ||
      limit > CARD_LIMIT_MAX
    ) {
      return fail(
        400,
        'INVALID_LIMIT',
        `El límite debe ser un entero entre ${CARD_LIMIT_MIN} y ${CARD_LIMIT_MAX}.`
      );
    }
    if (limit < card.currentSpent) {
      return fail(
        422,
        'LIMIT_BELOW_SPENT',
        'El límite no puede ser menor al consumo actual del mes.',
        { currentSpent: card.currentSpent }
      );
    }
    newLimit = limit;
  }

  if (typeof input.frozen === 'boolean') card.frozen = input.frozen;
  if (newLimit !== undefined) card.monthlyLimit = newLimit;

  return { ok: true, data: toPublicCard(card) };
}

export function revealCard(cardId: string): Result<{ id: string; cvv: string }> {
  const card = store.cards.find((c) => c.id === cardId);
  if (!card) return fail(404, 'CARD_NOT_FOUND', 'Tarjeta no encontrada.');
  if (card.frozen) {
    return fail(
      403,
      'CARD_FROZEN',
      'La tarjeta está congelada. Descongélala para ver sus datos.'
    );
  }
  return { ok: true, data: { id: card.id, cvv: card.cvv } };
}
