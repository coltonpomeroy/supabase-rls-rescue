"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Note } from "@/lib/types";

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  async function loadNotes() {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.push("/login");
      return;
    }
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false });
    setNotes(data || []);
  }

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("notes").insert({
      title,
      body,
      user_id: userData.user?.id,
    });
    setTitle("");
    setBody("");
    loadNotes();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Your notes</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="body" className="block text-sm font-medium">
            Note
          </label>
          <textarea
            id="body"
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
          Add note
        </button>
      </form>

      <ul className="mt-8 space-y-3">
        {notes.map((note) => (
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
    </div>
  );
}
