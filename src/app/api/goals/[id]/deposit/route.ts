import { NextRequest, NextResponse } from 'next/server';
import { depositToGoal } from '@/lib/bank';
import { jsonError, readJsonObject } from '@/lib/http';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await readJsonObject(request);
  if (!body) {
    return jsonError(400, 'INVALID_JSON', 'El cuerpo debe ser un objeto JSON válido.');
  }

  const result = depositToGoal(id, body);
  if (!result.ok) {
    return jsonError(result.status, result.code, result.message, result.details);
  }
  return NextResponse.json(
    { message: 'Abono registrado exitosamente', ...result.data },
    { status: 201 }
  );
}
