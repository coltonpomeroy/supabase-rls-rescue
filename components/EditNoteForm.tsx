"use client";

import { useActionState } from "react";
import { deleteNote, updateNote } from "@/app/notes/actions";
import FormAlert from "@/components/FormAlert";
import SubmitButton from "@/components/SubmitButton";
import type { Note } from "@/lib/types";

export default function EditNoteForm({ note }: { note: Pick<Note, "id" | "title" | "body"> }) {
  const [saveState, saveAction] = useActionState(updateNote, null);
  const [deleteState, deleteAction] = useActionState(deleteNote, null);

  return (
    <div className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <FormAlert state={saveState ?? deleteState} />
      <form id="edit-note" action={saveAction} className="space-y-3">
        <input type="hidden" name="id" value={note.id} />
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            maxLength={200}
            defaultValue={note.title}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium">
            Note
          </label>
          <textarea
            id="body"
            name="body"
            rows={8}
            maxLength={20000}
            defaultValue={note.body}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
      </form>
      <div className="flex gap-3">
        <button
          type="submit"
          form="edit-note"
          className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        >
          Save
        </button>
        <form action={deleteAction}>
          <input type="hidden" name="id" value={note.id} />
          <SubmitButton
            pendingText="Deleting…"
            className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
