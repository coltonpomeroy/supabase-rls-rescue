"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    supabase
      .from("notes")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          setBody(data.body);
        }
      });
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await supabase.from("notes").update({ title, body }).eq("id", id);
    router.push("/notes");
  }

  async function handleDelete() {
    await supabase.from("notes").delete().eq("id", id);
    router.push("/notes");
  }

  return (
    <div>
      <Link href="/notes" className="text-sm text-indigo-600 hover:underline">
        &larr; Back to notes
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Edit note</h1>
      <form onSubmit={handleSave} className="mt-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
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
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
            Save
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-red-300 px-4 py-2 font-medium text-red-700 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}
