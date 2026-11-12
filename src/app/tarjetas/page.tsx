'use client';

import { useCallback, useEffect, useState } from 'react';
import { PublicBankCard } from '@/types/banking';
import { apiFetch, errorMessage, jsonBody } from '@/lib/client';
import {
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Shield,
  Sliders,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function TarjetasPage() {
  const [cards, setCards] = useState<PublicBankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  // CVV obtenido bajo demanda desde /api/cards/{id}/reveal
  const [revealed, setRevealed] = useState<Record<string, string>>({});

  const loadCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<{ cards: PublicBankCard[] }>('/api/cards');
      setCards(data.cards);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  function setCardError(cardId: string, message: string | null) {
    setCardErrors((prev) => {
      const next = { ...prev };
      if (message) next[cardId] = message;
      else delete next[cardId];
      return next;
    });
  }

  async function patchCard(
    cardId: string,
    changes: { frozen?: boolean; monthlyLimit?: number }
  ) {
    setCardError(cardId, null);
    try {
      const data = await apiFetch<{ card: PublicBankCard }>(`/api/cards/${cardId}`, {
        method: 'PATCH',
        ...jsonBody(changes),
      });
      setCards((prev) => prev.map((c) => (c.id === cardId ? data.card : c)));
      return data.card;
    } catch (err) {
      setCardError(cardId, errorMessage(err));
      // Revierte el slider al valor guardado en el servidor
      await loadCards();
      return null;
    }
  }

  async function toggleFreeze(card: PublicBankCard) {
    const updated = await patchCard(card.id, { frozen: !card.frozen });
    // Al congelar se oculta el CVV que estuviera visible
    if (updated?.frozen) {
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[card.id];
        return next;
      });
    }
  }

  async function toggleCvv(cardId: string) {
    if (revealed[cardId]) {
      setRevealed((prev) => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
      return;
    }
    setCardError(cardId, null);
    try {
      const data = await apiFetch<{ cvv: string }>(`/api/cards/${cardId}/reveal`);
      setRevealed((prev) => ({ ...prev, [cardId]: data.cvv }));
    } catch (err) {
      setCardError(cardId, errorMessage(err));
    }
  }

  // Mientras se arrastra solo cambia el estado local; se guarda al soltar
  function previewLimit(cardId: string, newLimit: number) {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, monthlyLimit: newLimit } : c))
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Ruta 3 • Control de Tarjetas (API /api/cards)
        </span>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Bóveda de Tarjetas Físicas y Virtuales
        </h1>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300"
        >
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </span>
          <button
            type="button"
            onClick={loadCards}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/40 px-3 py-1.5 text-xs font-semibold hover:bg-rose-500/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {loading &&
          cards.length === 0 &&
          [1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-96 animate-pulse rounded-2xl bg-slate-800/60"
              aria-hidden="true"
            />
          ))}

        {cards.map((card) => {
          const cvv = revealed[card.id];
          const isCvvShown = !!cvv;
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
                    {card.fullNumber}
                  </p>
                  {card.frozen && (
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-amber-300">
                      Tarjeta congelada
                    </p>
                  )}

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
                        {isCvvShown ? cvv : '•••'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra de Límite de Gasto */}
                <div className="mt-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Consumo del mes</span>
                    <span className="font-semibold text-white">
                      ${card.currentSpent.toLocaleString('en-US')} / $
                      {card.monthlyLimit.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div
                    className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800"
                    role="progressbar"
                    aria-valuenow={usagePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Consumo mensual de ${card.alias}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePct >= 90 ? 'bg-rose-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>

                {/* Control deslizante de límite mensual */}
                <div className="mt-4">
                  <label
                    htmlFor={`limit-${card.id}`}
                    className="flex items-center gap-1.5 text-xs text-slate-400"
                  >
                    <Sliders className="h-3.5 w-3.5" />
                    Ajustar Límite Mensual: $
                    {card.monthlyLimit.toLocaleString('en-US')}
                  </label>
                  <input
                    id={`limit-${card.id}`}
                    type="range"
                    min="1000"
                    max="15000"
                    step="500"
                    value={card.monthlyLimit}
                    onChange={(e) => previewLimit(card.id, Number(e.target.value))}
                    onPointerUp={(e) =>
                      patchCard(card.id, {
                        monthlyLimit: Number(e.currentTarget.value),
                      })
                    }
                    onKeyUp={(e) =>
                      patchCard(card.id, {
                        monthlyLimit: Number(e.currentTarget.value),
                      })
                    }
                    className="mt-2 w-full accent-emerald-400"
                  />
                </div>

                {cardErrors[card.id] && (
                  <p
                    role="alert"
                    className="mt-3 flex items-start gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300"
                  >
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {cardErrors[card.id]}
                  </p>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toggleFreeze(card)}
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
                  disabled={card.frozen}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isCvvShown ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      Ocultar CVV
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      Ver CVV
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
