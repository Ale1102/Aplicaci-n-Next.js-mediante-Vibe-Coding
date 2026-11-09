import { NextResponse } from 'next/server';

const FALLBACK_RATES: Record<string, number> = {
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

export async function GET() {
  const apiUrl =
    process.env.NEXT_PUBLIC_FX_API_URL || 'https://open.er-api.com/v6/latest/USD';

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 300 } });
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json({
      base: data.base_code || 'USD',
      updatedAt: data.time_last_update_utc || new Date().toUTCString(),
      source: 'ExchangeRate-API (Real-Time Route Handler)',
      rates: {
        USD: 1.0,
        EUR: data.rates?.EUR ?? FALLBACK_RATES.EUR,
        GBP: data.rates?.GBP ?? FALLBACK_RATES.GBP,
        JPY: data.rates?.JPY ?? FALLBACK_RATES.JPY,
        MXN: data.rates?.MXN ?? FALLBACK_RATES.MXN,
        COP: data.rates?.COP ?? FALLBACK_RATES.COP,
        CRC: data.rates?.CRC ?? FALLBACK_RATES.CRC,
        GTQ: data.rates?.GTQ ?? FALLBACK_RATES.GTQ,
        CHF: data.rates?.CHF ?? FALLBACK_RATES.CHF,
        CAD: data.rates?.CAD ?? FALLBACK_RATES.CAD,
      },
    });
  } catch {
    // Fallback resiliente si no hay internet o el servicio externo falla
    return NextResponse.json({
      base: 'USD',
      updatedAt: new Date().toUTCString(),
      source: 'NovaBank FX Contingencia (Respaldo Local)',
      rates: FALLBACK_RATES,
    });
  }
}
