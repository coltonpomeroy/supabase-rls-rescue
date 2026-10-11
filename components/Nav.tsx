"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Nav() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          Huddle Notes
        </Link>
        {email ? (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/notes" className="text-slate-700 hover:text-slate-900">
              Notes
            </Link>
            <Link href="/settings" className="text-slate-700 hover:text-slate-900">
              Settings
            </Link>
            <span className="hidden text-slate-500 sm:inline">{email}</span>
            <button onClick={logout} className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/login" className="text-slate-700 hover:text-slate-900">
              Log in
            </Link>
            <Link href="/signup" className="rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700">
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
