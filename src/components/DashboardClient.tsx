'use client';

import { useState } from 'react';
import { BankAccount, Transaction } from '@/types/banking';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Search } from 'lucide-react';
import Link from 'next/link';

interface Props {
  initialAccounts: BankAccount[];
  initialTransactions: Transaction[];
  /** Tasas por 1 USD (ej. EUR: 0.92) para consolidar cuentas en otras monedas */
  rates: Record<string, number>;
  ratesAreFallback: boolean;
}

export default function DashboardClient({
  initialAccounts,
  initialTransactions,
  rates,
  ratesAreFallback,
}: Props) {
  const [hideBalances, setHideBalances] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');

  const filteredTx = initialTransactions.filter((tx) => {
    const matchesQuery =
      tx.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.recipientOrSender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'Todas' || tx.category === categoryFilter;
    return matchesQuery && matchesCategory;
  });

  // Convierte cada saldo a USD (rates está expresado como unidades por 1 USD)
  const toUsd = (acc: BankAccount) => acc.balance / (rates[acc.currency] || 1);

  const totalUsd = initialAccounts.reduce((sum, acc) => sum + toUsd(acc), 0);

  // Rendimiento mensual estimado = Σ (saldo en USD × APY / 12)
  const monthlyYield = initialAccounts.reduce(
    (sum, acc) => sum + (toUsd(acc) * acc.apy) / 100 / 12,
    0
  );
  const avgApy = totalUsd > 0 ? (monthlyYield * 12 * 100) / totalUsd : 0;
  const hasForeign = initialAccounts.some((a) => a.currency !== 'USD');

  return (
    <div className="space-y-8">
      {/* Banner Principal de Patrimonio */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
                Patrimonio Líquido Consolidado (USD)
              </span>
              <button
                type="button"
                onClick={() => setHideBalances(!hideBalances)}
                className="rounded-lg border border-slate-700 bg-slate-800/70 p-1.5 text-slate-300 hover:text-white"
                title="Mostrar u ocultar saldos"
                aria-label={hideBalances ? 'Mostrar saldos' : 'Ocultar saldos'}
                aria-pressed={hideBalances}
              >
                {hideBalances ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              {hideBalances
                ? '••••••••••'
                : `$${totalUsd.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}`}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Rendimiento mensual estimado:{' '}
              <span className="font-semibold text-emerald-400">
                +${monthlyYield.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </span>{' '}
              (APY promedio {avgApy.toFixed(2)}%)
            </p>
            {hasForeign && (
              <p className="mt-1 text-[11px] text-slate-500">
                Cuentas en otras monedas convertidas a USD
                {ratesAreFallback ? ' con tasas de respaldo' : ' con tasas en vivo'}.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/transferencias"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
            >
              <ArrowUpRight className="h-4 w-4" />
              Enviar Dinero
            </Link>
            <Link
              href="/divisas"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Convertir Divisas
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas de Cuentas Bancarias */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-white">Tus Cuentas Activas</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {initialAccounts.map((acc) => (
            <div
              key={acc.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-emerald-500/40"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                  {acc.type}
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {acc.apy}% APY
                </span>
              </div>
              <h3 className="mt-4 font-semibold text-slate-200">{acc.name}</h3>
              <p className="mt-2 text-2xl font-bold text-white">
                {hideBalances
                  ? '••••••••'
                  : `${acc.currency === 'EUR' ? '€' : '$'}${acc.balance.toLocaleString(
                      'en-US',
                      { minimumFractionDigits: 2 }
                    )} ${acc.currency}`}
              </p>
              <p className="mt-4 font-mono text-xs text-slate-500">
                N.º Cuenta: {acc.accountNumber}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Historial de Movimientos con Búsqueda y Filtro (Client State) */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">
              Movimientos Recientes
            </h2>
            <p className="text-xs text-slate-400">
              Filtra en tiempo real tus ingresos, pagos y transferencias
            </p>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar comercio o referencia..."
                aria-label="Buscar movimientos"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none sm:w-64"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="Filtrar por categoría"
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
            >
              <option value="Todas">Todas las categorías</option>
              <option value="Nómina">Nómina</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Restaurantes">Restaurantes</option>
              <option value="Inversión">Inversión</option>
              <option value="Ahorro">Ahorro</option>
            </select>
          </div>
        </div>

        <div className="mt-6 divide-y divide-slate-800/70">
          {filteredTx.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No se encontraron transacciones con los filtros aplicados.
            </p>
          ) : (
            filteredTx.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-4 transition hover:bg-slate-900/40 px-2 rounded-xl"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      tx.amount > 0
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tx.amount > 0 ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tx.title}</p>
                    <p className="text-xs text-slate-400">
                      {tx.recipientOrSender} • {tx.date} • Ref: {tx.reference}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-white'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: tx.currency,
                    })}
                  </p>
                  <span className="inline-block rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                    {tx.category}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
