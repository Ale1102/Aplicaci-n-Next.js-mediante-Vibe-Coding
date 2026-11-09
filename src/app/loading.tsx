export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse" aria-live="polite" aria-busy="true">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-64 rounded-xl bg-slate-800/80" />
        <div className="h-10 w-40 rounded-xl bg-slate-800/80" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-40 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6"
          >
            <div className="h-4 w-32 rounded bg-slate-800" />
            <div className="mt-4 h-8 w-44 rounded bg-slate-800" />
            <div className="mt-6 h-3 w-28 rounded bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-slate-800/80 bg-slate-900/50 p-6" />
    </div>
  );
}
