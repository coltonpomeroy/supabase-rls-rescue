"use client";

export default function NotesError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6">
      <h1 className="text-lg font-semibold text-red-900">We couldn&apos;t load your notes</h1>
      <p className="mt-1 text-sm text-red-800">Nothing was lost. Check your connection and try again.</p>
      <button
        onClick={reset}
        className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}
