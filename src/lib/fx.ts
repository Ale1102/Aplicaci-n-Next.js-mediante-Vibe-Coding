import { ExchangeRatesResponse } from '@/types/banking';

const DEFAULT_FX_URL = 'https://open.er-api.com/v6/latest/USD';
const FX_TIMEOUT_MS = 4000;

export const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'MXN',
  'COP',
  'CRC',
  'GTQ',
  'CHF',
  'CAD',
] as const;

export const FALLBACK_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.924,
  GBP: 0.789,
  JPY: 153.4,
  MXN: 20.15,
  COP: 4380.0,
  CRC: 512.5,
  GTQ: 7.73,
  CHF: 0.882,
  CAD: 1.389,
};

function fallbackResponse(): ExchangeRatesResponse {
  return {
    base: 'USD',
    updatedAt: new Date().toUTCString(),
    source: 'NovaBank FX Contingencia (Respaldo Local)',
    fallback: true,
    rates: { ...FALLBACK_RATES },
  };
}

/**
 * Obtiene tasas de cambio respecto al USD. Se usa tanto en /api/fx como en el
 * dashboard (Server Component). Si la API externa falla o tarda más de 4 s,
 * devuelve tasas locales marcadas con fallback = true.
 *
 * La URL se lee de FX_API_URL (solo servidor). Se mantiene compatibilidad con
 * NEXT_PUBLIC_FX_API_URL por si ya la tenías en tu .env.local.
 */
export async function getFxRates(): Promise<ExchangeRatesResponse> {
  const apiUrl =
    process.env.FX_API_URL || process.env.NEXT_PUBLIC_FX_API_URL || DEFAULT_FX_URL;

  try {
    const res = await fetch(apiUrl, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(FX_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: unknown = await res.json();
    const parsed = data as {
      base_code?: string;
      time_last_update_utc?: string;
      rates?: Record<string, number>;
    };
    if (!parsed.rates || typeof parsed.rates !== 'object') {
      throw new Error('Respuesta de FX sin tasas');
    }

    const rates: Record<string, number> = {};
    for (const code of SUPPORTED_CURRENCIES) {
      const value = parsed.rates[code];
      rates[code] =
        code === 'USD'
          ? 1
          : typeof value === 'number' && value > 0
            ? value
            : FALLBACK_RATES[code];
    }

    return {
      base: parsed.base_code || 'USD',
      updatedAt: parsed.time_last_update_utc || new Date().toUTCString(),
      source: 'ExchangeRate-API (Real-Time Route Handler)',
      fallback: false,
      rates,
    };
  } catch {
    return fallbackResponse();
  }
}
