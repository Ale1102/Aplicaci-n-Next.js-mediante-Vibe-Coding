import DashboardClient from '@/components/DashboardClient';
import { store } from '@/lib/store';
import { getFxRates } from '@/lib/fx';

// Los datos cambian con cada transferencia, por eso no se prerenderiza de forma estática
export const dynamic = 'force-dynamic';

// Server Component principal (Ruta 1: /)
export default async function HomePage() {
  // Se lee el mismo almacén que usan los Route Handlers: lo que transfieras
  // en /transferencias se refleja aquí al volver al panel.
  const fx = await getFxRates();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Server Component + Client Interactivity
          </span>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Panel Financiero Principal
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Datos al {new Date().toISOString().slice(0, 10)}
        </p>
      </div>

      <DashboardClient
        initialAccounts={store.accounts}
        initialTransactions={store.transactions}
        rates={fx.rates}
        ratesAreFallback={fx.fallback}
      />
    </div>
  );
}
