'use client';

import { useState } from 'react';
import { INITIAL_CARDS } from '@/lib/mock-data';
import { BankCard } from '@/types/banking';
import { Lock, Unlock, Eye, EyeOff, Shield, Sliders } from 'lucide-react';

export default function TarjetasPage() {
  const [cards, setCards] = useState<BankCard[]>(INITIAL_CARDS);
  const [revealedCvv, setRevealedCvv] = useState<Record<string, boolean>>({});

  function toggleFreeze(cardId: string) {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, frozen: !c.frozen } : c))
    );
  }

  function toggleCvv(cardId: string) {
    setRevealedCvv((prev) => ({ ...prev, [cardId]: !prev[cardId] }));
  }

  function updateLimit(cardId: string, newLimit: number) {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, monthlyLimit: newLimit } : c
      )
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Ruta 3 • Control Interactivo de Tarjetas (useState)
        </span>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Bóveda de Tarjetas Físicas y Virtuales
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {cards.map((card) => {
          const isCvvShown = !!revealedCvv[card.id];
          const usagePct = Math.min(
            100,
            Math.round((card.currentSpent / card.monthlyLimit) * 100)
          );

          return (
            <div
              key={card.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
            >
              <div>
                {/* Representación Visual de la Tarjeta */}
                <div
                  className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition ${
                    card.frozen
                      ? 'bg-slate-800/90 opacity-75 grayscale'
                      : card.theme === 'emerald'
                      ? 'bg-gradient-to-br from-emerald-600 via-teal-800 to-slate-950'
                      : card.theme === 'indigo'
                      ? 'bg-gradient-to-br from-indigo-600 via-purple-900 to-slate-950'
                      : 'bg-gradient-to-br from-slate-700 via-slate-900 to-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">
                      {card.type} • {card.alias}
                    </span>
                    <Shield className="h-5 w-5 text-white/80" />
                  </div>

                  <p className="mt-8 font-mono text-lg tracking-widest">
                    {isCvvShown
                      ? `4532 8910 4421 ${card.last4}`
                      : card.fullNumber}
                  </p>

                  <div className="mt-6 flex items-end justify-between text-xs">
                    <div>
                      <span className="block text-[10px] uppercase text-white/60">
                        Titular
                      </span>
                      <span className="font-semibold">{card.holder}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-white/60">
                        Expira
                      </span>
                      <span className="font-semibold">{card.expiry}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-white/60">
                        CVV
                      </span>
                      <span className="font-mono font-bold">
                        {isCvvShown ? card.cvv : '•••'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Límite de Gasto */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Consumo del mes</span>
                    <span className="font-semibold text-white">
                      ${card.currentSpent.toLocaleString()} / $
                      {card.monthlyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-400 transition-all"
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>

                {/* Control deslizante de límite mensual */}
                <div className="mt-4">
                  <label className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Sliders className="h-3.5 w-3.5" />
                    Ajustar Límite Mensual: ${card.monthlyLimit.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={card.monthlyLimit}
                    onChange={(e) =>
                      updateLimit(card.id, Number(e.target.value))
                    }
                    className="mt-2 w-full accent-emerald-400"
                  />
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleFreeze(card.id)}
                  className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition ${
                    card.frozen
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {card.frozen ? (
                    <>
                      <Unlock className="h-4 w-4" />
                      Descongelar
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Congelar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => toggleCvv(card.id)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                >
                  {isCvvShown ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Ocultar CVV
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Ver Datos
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
