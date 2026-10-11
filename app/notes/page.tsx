import Link from "next/link";
import NewNoteForm from "@/components/NewNoteForm";
import { requireUser } from "@/lib/auth";
import type { Note } from "@/lib/types";

export default async function NotesPage() {
  const { supabase } = await requireUser();

  // No user filter needed: Row Level Security returns only the caller's rows.
  const { data, error } = await supabase
    .from("notes")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false })
    .returns<Pick<Note, "id" | "title" | "body" | "created_at">[]>();
  // Handled by app/notes/error.tsx.
  if (error) throw new Error("Could not load notes");

  return (
    <div>
      <h1 className="text-2xl font-bold">Your notes</h1>
      <NewNoteForm />

      {data.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-600">
          No notes yet. Add your first one above.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {data.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-indigo-300"
              >
                <h2 className="font-semibold">{note.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{note.body}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
