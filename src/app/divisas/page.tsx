'use client';

import { useState, useEffect } from 'react';
import { ExchangeRatesResponse } from '@/types/banking';
import { apiFetch, errorMessage } from '@/lib/client';
import { RefreshCw, ArrowRightLeft, Globe, AlertTriangle } from 'lucide-react';

export default function DivisasPage() {
  const [fxData, setFxData] = useState<ExchangeRatesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usdAmount, setUsdAmount] = useState<string>('1000');
  const [targetCurrency, setTargetCurrency] = useState<string>('EUR');

  async function fetchRates() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<ExchangeRatesResponse>('/api/fx');
      setFxData(data);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRates();
  }, []);

  const parsedUsd = parseFloat(usdAmount);
  const numericUsd = Number.isFinite(parsedUsd) && parsedUsd > 0 ? parsedUsd : 0;
  const selectedRate = fxData?.rates?.[targetCurrency] ?? 1;
  const convertedValue = numericUsd * selectedRate;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Ruta 4 • Consumo de API Externa vía Route Handler (/api/fx)
          </span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Mercado Global de Divisas & Conversor FX
          </h1>
        </div>
        <button
          type="button"
          onClick={fetchRates}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar Tasas en Vivo
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          {error}
        </div>
      )}

      {fxData?.fallback && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          No se pudo consultar el proveedor externo. Se muestran tasas de
          respaldo, que pueden no estar actualizadas.
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Calculadora Interactiva */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 lg:col-span-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <ArrowRightLeft className="h-5 w-5 text-emerald-400" />
            Calculadora de Cambio Inmediato
          </h2>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="usd-amount"
                className="block text-xs font-medium text-slate-400"
              >
                Monto en Dólares Estadounidenses (USD)
              </label>
              <input
                id="usd-amount"
                type="number"
                min="0"
                value={usdAmount}
                onChange={(e) => setUsdAmount(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-lg font-bold text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="target-currency"
                className="block text-xs font-medium text-slate-400"
              >
                Moneda de Destino
              </label>
              <select
                id="target-currency"
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none"
              >
                {fxData &&
                  Object.keys(fxData.rates).map((curr) => (
                    <option key={curr} value={curr}>
                      {curr} — Tasa: {fxData.rates[curr]}
                    </option>
                  ))}
              </select>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
              <span className="text-xs font-medium text-emerald-300">
                Monto Estimado a Recibir
              </span>
              <p className="mt-1 text-3xl font-extrabold text-white">
                {convertedValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                <span className="text-emerald-400">{targetCurrency}</span>
              </p>
              <p className="mt-2 text-[11px] text-slate-400">
                1 USD = {selectedRate} {targetCurrency} • Tasa referencial, sin comisiones
              </p>
            </div>
          </div>
        </div>

        {/* Tabla de Tasas en Tiempo Real */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Globe className="h-5 w-5 text-indigo-400" />
              Cotizaciones Oficiales respecto al USD
            </h2>
            <span className="text-right text-xs text-slate-400">
              {fxData?.source || 'Cargando fuente...'}
              {fxData && (
                <span className="block text-[10px] text-slate-500">
                  Actualizado: {fxData.updatedAt}
                </span>
              )}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {loading
              ? [1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="h-20 animate-pulse rounded-xl bg-slate-800/60"
                  />
                ))
              : fxData &&
                Object.entries(fxData.rates).map(([code, rate]) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setTargetCurrency(code)}
                    className={`rounded-xl border p-4 text-left transition ${
                      targetCurrency === code
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {code}
                      </span>
                      <span className="text-[10px] uppercase text-emerald-400">
                        Spot FX
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-lg font-bold text-slate-200">
                      {rate.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 4,
                      })}
                    </p>
                  </button>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}
