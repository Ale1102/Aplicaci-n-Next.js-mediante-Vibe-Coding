import { ApiErrorBody } from '@/types/banking';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

/** fetch tipado para los endpoints internos: lanza ApiClientError con el mensaje de la API. */
export async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiClientError('No se pudo conectar con el servidor.', 0, 'NETWORK');
  }

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = data as Partial<ApiErrorBody> | null;
    throw new ApiClientError(
      err?.error ?? `Error inesperado (HTTP ${res.status}).`,
      res.status,
      err?.code
    );
  }
  return data as T;
}

export function jsonBody(body: unknown): RequestInit {
  return {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Error desconocido.';
}
