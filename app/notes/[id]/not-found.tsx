import Link from "next/link";

export default function NoteNotFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-xl font-semibold">Note not found</h1>
      <p className="mt-2 text-slate-600">It may have been deleted, or the link may be wrong.</p>
      <Link href="/notes" className="mt-4 inline-block text-indigo-600 hover:underline">
        Back to your notes
      </Link>
    </div>
  );
}
