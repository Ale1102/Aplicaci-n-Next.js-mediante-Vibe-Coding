import {
  BankAccount,
  BankCard,
  SavingsGoal,
  Transaction,
} from '@/types/banking';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CARDS,
  INITIAL_GOALS,
  INITIAL_TRANSACTIONS,
} from '@/lib/mock-data';

interface Store {
  accounts: BankAccount[];
  transactions: Transaction[];
  cards: BankCard[];
  goals: SavingsGoal[];
}

function createStore(): Store {
  return {
    accounts: structuredClone(INITIAL_ACCOUNTS),
    transactions: structuredClone(INITIAL_TRANSACTIONS),
    cards: structuredClone(INITIAL_CARDS),
    goals: structuredClone(INITIAL_GOALS),
  };
}

/**
 * Almacén en memoria compartido por Route Handlers y Server Components.
 * Se guarda en globalThis para sobrevivir al hot-reload en desarrollo.
 *
 * LIMITACIÓN: los datos se pierden al reiniciar el servidor y no se comparten
 * entre instancias serverless. Para producción debe reemplazarse por una base
 * de datos (ver sección "Hacia producción" del README).
 */
const globalForStore = globalThis as unknown as { __novabankStore?: Store };

export const store: Store = (globalForStore.__novabankStore ??= createStore());

/** Restaura los datos de demostración (útil para pruebas). */
export function resetStore(): void {
  const fresh = createStore();
  store.accounts = fresh.accounts;
  store.transactions = fresh.transactions;
  store.cards = fresh.cards;
  store.goals = fresh.goals;
}
