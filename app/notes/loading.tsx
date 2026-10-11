export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
      <div className="mt-6 h-44 animate-pulse rounded-lg bg-slate-200" />
      <div className="mt-8 space-y-3">
        <div className="h-20 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-20 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}
