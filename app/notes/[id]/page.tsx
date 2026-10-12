import Link from "next/link";
import { notFound } from "next/navigation";
import RescueGuide from "@/components/RescueGuide";
import EditNoteForm from "@/components/EditNoteForm";
import { requireUser } from "@/lib/auth";
import type { Note } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function NotePage({ params }: Props) {
  const { id } = await params;
  if (!/^\d{1,15}$/.test(id)) notFound();

  const { supabase } = await requireUser();
  const { data: note, error } = await supabase
    .from("notes")
    .select("id, title, body")
    .eq("id", Number(id))
    .maybeSingle<Pick<Note, "id" | "title" | "body">>();
  if (error) throw new Error("Could not load note");

  // Someone else's note and a note that does not exist look identical here: Row Level
  // Security returns no row for either, so the page cannot confirm that an id is in use.
  if (!note) notFound();

  return (
    <div>
      <RescueGuide page="note" />
      <Link href="/notes" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to notes
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit note</h1>
      <EditNoteForm note={note} />
    </div>
  );
}
