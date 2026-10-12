"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { GENERIC_ERROR, type FormState } from "@/lib/form";

const TITLE_MAX = 200;
const BODY_MAX = 20000;

/** Mirrors the check constraints on public.notes so users get a message, not a 500. */
function parseNote(formData: FormData): { title: string; body: string } | { error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!title) return { error: "Give your note a title." };
  if (title.length > TITLE_MAX) return { error: `Keep the title under ${TITLE_MAX} characters.` };
  if (body.length > BODY_MAX) return { error: `Keep the note under ${BODY_MAX.toLocaleString("en-US")} characters.` };
  return { title, body };
}

const parseId = (value: FormDataEntryValue | null) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export async function createNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const note = parseNote(formData);
  if ("error" in note) return note;

  // No user_id here: the column default fills it in from the caller's verified token,
  // and the insert policy rejects any other value.
  const { error } = await supabase.from("notes").insert(note);
  if (error) return { error: GENERIC_ERROR };

  revalidatePath("/notes");
  return { message: "Note added." };
}

export async function updateNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const id = parseId(formData.get("id"));
  const note = parseNote(formData);
  if ("error" in note) return note;
  if (!id) return { error: GENERIC_ERROR };

  // Row Level Security limits this to the caller's own rows. Asking for the row back
  // tells us whether anything was actually updated.
  const { data, error } = await supabase.from("notes").update(note).eq("id", id).select("id");
  if (error) return { error: GENERIC_ERROR };
  if (data.length === 0) return { error: "This note no longer exists." };

  revalidatePath("/notes");
  redirect("/notes");
}

export async function deleteNote(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireUser();
  const id = parseId(formData.get("id"));
  if (!id) return { error: GENERIC_ERROR };

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) return { error: GENERIC_ERROR };

  revalidatePath("/notes");
  redirect("/notes");
}
