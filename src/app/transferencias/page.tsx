'use client';

import { useState, useEffect } from 'react';
import { BankAccount, Transaction } from '@/types/banking';
import { apiFetch, errorMessage, jsonBody } from '@/lib/client';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function TransferenciasPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fromAccountId, setFromAccountId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState('Transferencia');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<Transaction | null>(null);

  useEffect(() => {
    async function loadAccounts() {
      try {
        setLoading(true);
        const data = await apiFetch<{
          accounts: BankAccount[];
          transactions: Transaction[];
        }>('/api/accounts');
        setAccounts(data.accounts);
        setTransactions(data.transactions);
        setFromAccountId((current) =>
          data.accounts.some((a) => a.id === current)
            ? current
            : data.accounts[0]?.id ?? ''
        );
      } catch (err) {
        setErrorMsg(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, []);

  const selectedAccount = accounts.find((a) => a.id === fromAccountId);
  const currency = selectedAccount?.currency ?? 'USD';
  const numericAmount = Number(amount);
  const exceedsBalance =
    !!selectedAccount && numericAmount > selectedAccount.balance;

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessTx(null);

    if (exceedsBalance) {
      setErrorMsg('El monto supera el saldo disponible de la cuenta seleccionada.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await apiFetch<{
        transaction: Transaction;
        accounts: BankAccount[];
      }>('/api/accounts', {
        method: 'POST',
        ...jsonBody({
          fromAccountId,
          recipient,
          amount: numericAmount,
          concept,
          category,
        }),
      });
      setAccounts(data.accounts);
      setTransactions((prev) => [data.transaction, ...prev]);
      setSuccessTx(data.transaction);
      setRecipient('');
      setAmount('');
      setConcept('');
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Ruta 2 • Consumo de API Interna (POST /api/accounts)
        </span>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Centro de Transferencias y Pagos Instantáneos
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <form
            onSubmit={handleTransfer}
            className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-white">
              Nueva Transferencia Interbancaria / UNI
            </h2>

            {errorMsg && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 text-sm text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successTx && (
              <div
                role="status"
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200"
              >
                <div className="flex items-center gap-2 font-bold text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  ¡Transferencia enviada con éxito!
                </div>
                <p className="mt-1 text-xs text-emerald-300/80">
                  Comprobante: {successTx.reference} • Destinatario:{' '}
                  {successTx.recipientOrSender} • Monto:{' '}
                  {Math.abs(successTx.amount).toFixed(2)} {successTx.currency}
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="from-account"
                className="block text-xs font-medium text-slate-300"
              >
                Cuenta de Origen
              </label>
              <select
                id="from-account"
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                disabled={loading}
                className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Disponible: ${acc.balance.toFixed(2)} {acc.currency}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="recipient"
                  className="block text-xs font-medium text-slate-300"
                >
                  Beneficiario o Cuenta Destino
                </label>
                <input
                  id="recipient"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ej. Carlos Mendoza - Banco Cuscatlán"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="amount"
                  className="block text-xs font-medium text-slate-300"
                >
                  Monto a Transferir ({currency})
                </label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="100000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="concept"
                  className="block text-xs font-medium text-slate-300"
                >
                  Concepto
                </label>
                <input
                  id="concept"
                  type="text"
                  maxLength={120}
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Ej. Pago de consultoría UI/UX"
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-xs font-medium text-slate-300"
                >
                  Categoría Contable
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Transferencia">Transferencia</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Tecnología">Tecnología</option>
                  <option value="Ahorro">Ahorro</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || loading || !fromAccountId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando con Route Handler...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Confirmar y Enviar Transferencia
                </>
              )}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h3 className="text-base font-bold text-white">
              Últimos Envíos Registrados
            </h3>
            <div className="mt-4 space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{tx.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {tx.recipientOrSender} • {tx.reference}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      tx.amount > 0 ? 'text-emerald-400' : 'text-slate-200'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : '-'}
                    {Math.abs(tx.amount).toFixed(2)} {tx.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
