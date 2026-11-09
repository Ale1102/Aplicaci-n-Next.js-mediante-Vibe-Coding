'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error capturado por App Router Error Boundary:', error);
  }, [error]);

  return (
    <div className="mx-auto my-12 max-w-lg rounded-2xl border border-rose-500/30 bg-slate-900/90 p-8 text-center shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-400">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-white">
        Interrupción Temporal en el Módulo Financiero
      </h2>
      <p className="mt-2 text-sm text-slate-400">
        {error.message ||
          'Ocurrió un error inesperado al sincronizar tus datos bancarios.'}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
      >
        <RotateCcw className="h-4 w-4" />
        Reintentar conexión segura
      </button>
    </div>
  );
}
