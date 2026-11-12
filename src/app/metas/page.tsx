'use client';

import { useCallback, useEffect, useState } from 'react';
import { BankAccount, SavingsGoal } from '@/types/banking';
import { apiFetch, errorMessage, jsonBody } from '@/lib/client';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  PlusCircle,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

export default function MetasPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [contribution, setContribution] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyGoalId, setBusyGoalId] = useState<string | null>(null);
  const [goalMessages, setGoalMessages] = useState<
    Record<string, { type: 'ok' | 'error'; text: string }>
  >({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const [g, a] = await Promise.all([
        apiFetch<{ goals: SavingsGoal[] }>('/api/goals'),
        apiFetch<{ accounts: BankAccount[] }>('/api/accounts'),
      ]);
      setGoals(g.goals);
      // Las metas se abonan desde cuentas en USD
      const usd = a.accounts.filter((acc) => acc.currency === 'USD');
      setAccounts(usd);
      setFromAccountId((current) => current || usd[0]?.id || '');
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function setMessage(goalId: string, msg: { type: 'ok' | 'error'; text: string } | null) {
    setGoalMessages((prev) => {
      const next = { ...prev };
      if (msg) next[goalId] = msg;
      else delete next[goalId];
      return next;
    });
  }

  async function handleDeposit(goalId: string) {
    const amount = Number(contribution[goalId]);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage(goalId, { type: 'error', text: 'Ingresa un monto mayor a 0.' });
      return;
    }

    setBusyGoalId(goalId);
    setMessage(goalId, null);
    try {
      const data = await apiFetch<{
        goal: SavingsGoal;
        accounts: BankAccount[];
        transaction: { reference: string };
      }>(`/api/goals/${goalId}/deposit`, {
        method: 'POST',
        ...jsonBody({ fromAccountId, amount }),
      });
      setGoals((prev) => prev.map((g) => (g.id === goalId ? data.goal : g)));
      setAccounts(data.accounts.filter((acc) => acc.currency === 'USD'));
      setContribution((prev) => ({ ...prev, [goalId]: '' }));
      setMessage(goalId, {
        type: 'ok',
        text: `Abono registrado. Ref: ${data.transaction.reference}`,
      });
    } catch (err) {
      setMessage(goalId, { type: 'error', text: errorMessage(err) });
    } finally {
      setBusyGoalId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Ruta 5 • Bóvedas de Ahorro (API /api/goals)
          </span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Metas de Ahorro con Rendimiento Compuesto
          </h1>
        </div>

        <div>
          <label
            htmlFor="from-account"
            className="block text-xs font-medium text-slate-400"
          >
            Abonar desde
          </label>
          <select
            id="from-account"
            value={fromAccountId}
            onChange={(e) => setFromAccountId(e.target.value)}
            disabled={loading || accounts.length === 0}
            className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none sm:w-80"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} — ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {loading &&
          goals.length === 0 &&
          [1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 animate-pulse rounded-2xl bg-slate-800/60"
              aria-hidden="true"
            />
          ))}

        {goals.map((goal) => {
          const pct = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );
          const completed = goal.currentAmount >= goal.targetAmount;
          const msg = goalMessages[goal.id];
          const busy = busyGoalId === goal.id;

          return (
            <div
              key={goal.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    {goal.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {goal.apy}% APY
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-bold text-white">
                  {goal.title}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Fecha objetivo: {goal.deadline}
                </p>

                <div className="mt-5">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-white">
                      ${goal.currentAmount.toLocaleString('en-US')}
                    </span>
                    <span className="text-slate-400">
                      Meta: ${goal.targetAmount.toLocaleString('en-US')} ({pct}%)
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Progreso de ${goal.title}`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800/80 pt-4">
                {completed ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    ¡Meta completada!
                  </p>
                ) : (
                  <>
                    <label
                      htmlFor={`deposit-${goal.id}`}
                      className="block text-xs text-slate-400"
                    >
                      Abonar a esta bóveda (USD)
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id={`deposit-${goal.id}`}
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Ej. 250"
                        value={contribution[goal.id] || ''}
                        onChange={(e) =>
                          setContribution((prev) => ({
                            ...prev,
                            [goal.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeposit(goal.id)}
                        disabled={busy || !fromAccountId}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                      >
                        {busy ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <PlusCircle className="h-4 w-4" />
                        )}
                        Abonar
                      </button>
                    </div>
                  </>
                )}

                {msg && (
                  <p
                    role={msg.type === 'error' ? 'alert' : 'status'}
                    className={`mt-3 rounded-lg border p-2.5 text-xs ${
                      msg.type === 'error'
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-300'
                        : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    }`}
                  >
                    {msg.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
