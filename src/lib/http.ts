import { NextResponse } from 'next/server';
import { ApiErrorBody } from '@/types/banking';

/** Respuesta de error con formato uniforme: { error, code, details? }. */
export function jsonError(
  status: number,
  code: string,
  message: string,
  details?: Record<string, unknown>
) {
  const body: ApiErrorBody = { error: message, code, ...(details && { details }) };
  return NextResponse.json(body, { status });
}

/** Lee el JSON del request; devuelve null si el cuerpo es inválido o no es un objeto. */
export async function readJsonObject(
  request: Request
): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      return body as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Redondea a centavos evitando errores de punto flotante. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** true si el número tiene como máximo 2 decimales. */
export function hasMaxTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
}
