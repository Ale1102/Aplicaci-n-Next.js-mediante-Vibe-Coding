import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from '@/lib/mock-data';
import DashboardClient from '@/components/DashboardClient';

// Server Component principal (Ruta 1: /)
export default async function HomePage() {
  // En un Server Component podemos cargar datos directamente en el servidor
  const accounts = INITIAL_ACCOUNTS;
  const transactions = INITIAL_TRANSACTIONS;

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
          Última sincronización: Noviembre 2026
        </p>
      </div>

      <DashboardClient
        initialAccounts={accounts}
        initialTransactions={transactions}
      />
    </div>
  );
}
