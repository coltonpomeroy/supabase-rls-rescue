"use client";

import { useActionState, useEffect, useRef } from "react";
import { createNote } from "@/app/notes/actions";
import FormAlert from "@/components/FormAlert";
import SubmitButton from "@/components/SubmitButton";

export default function NewNoteForm() {
  const [state, formAction] = useActionState(createNote, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <FormAlert state={state} />
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
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
          rows={3}
          maxLength={20000}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
        />
      </div>
      <SubmitButton
        pendingText="Adding…"
        className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
      >
        Add note
      </SubmitButton>
    </form>
  );
}
