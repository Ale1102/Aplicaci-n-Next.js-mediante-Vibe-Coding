import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto my-12 max-w-lg rounded-2xl border border-slate-800 bg-slate-900/80 p-8 text-center shadow-2xl">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
        <SearchX className="h-7 w-7" />
      </div>
      <h1 className="mt-4 text-xl font-bold text-white">Página no encontrada</h1>
      <p className="mt-2 text-sm text-slate-400">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
      >
        Volver al panel
      </Link>
    </div>
  );
}
