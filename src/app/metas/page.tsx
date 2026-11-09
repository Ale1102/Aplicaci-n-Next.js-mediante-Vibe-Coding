'use client';

import { useState } from 'react';
import { INITIAL_GOALS } from '@/lib/mock-data';
import { SavingsGoal } from '@/types/banking';
import { PiggyBank, PlusCircle, TrendingUp } from 'lucide-react';

export default function MetasPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(INITIAL_GOALS);
  const [contribution, setContribution] = useState<Record<string, string>>({});

  function handleDeposit(goalId: string) {
    const raw = contribution[goalId];
    const amount = parseFloat(raw || '0');
    if (amount <= 0) return;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              currentAmount: Math.min(g.targetAmount, g.currentAmount + amount),
            }
          : g
      )
    );
    setContribution((prev) => ({ ...prev, [goalId]: '' }));
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Ruta 5 • Bóvedas Programables de Ahorro
        </span>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Metas de Ahorro con Rendimiento Compuesto
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {goals.map((goal) => {
          const pct = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
          );

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
                      ${goal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-slate-400">
                      Meta: ${goal.targetAmount.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <label className="block text-xs text-slate-400">
                  Abonar a esta bóveda (USD)
                </label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    min="10"
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
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-emerald-400"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Abonar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
