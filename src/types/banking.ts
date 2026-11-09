export type TransactionType = 'ingreso' | 'egreso' | 'transferencia';

export type TransactionCategory =
  | 'Nómina'
  | 'Transferencia'
  | 'Tecnología'
  | 'Restaurantes'
  | 'Servicios'
  | 'Inversión'
  | 'Ahorro';

export interface Transaction {
  id: string;
  title: string;
  recipientOrSender: string;
  amount: number;
  currency: string;
  date: string;
  type: TransactionType;
  category: TransactionCategory;
  status: 'Completado' | 'En Proceso' | 'Rechazado';
  reference: string;
}

export interface BankAccount {
  id: string;
  name: string;
  accountNumber: string;
  iban: string;
  balance: number;
  currency: 'USD' | 'EUR';
  type: 'Cuenta Corriente' | 'Cuenta de Ahorro Alto Rendimiento' | 'Bóveda de Inversión';
  apy: number;
}

export interface BankCard {
  id: string;
  alias: string;
  holder: string;
  last4: string;
  fullNumber: string;
  expiry: string;
  cvv: string;
  network: 'Visa Infinite' | 'Mastercard Black';
  type: 'Física' | 'Virtual';
  frozen: boolean;
  monthlyLimit: number;
  currentSpent: number;
  theme: 'emerald' | 'indigo' | 'obsidian';
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  apy: number;
  iconName: string;
}

export interface ExchangeRatesResponse {
  base: string;
  updatedAt: string;
  source: string;
  rates: Record<string, number>;
}
