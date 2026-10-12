import Link from "next/link";
import { logOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-900">
          Huddle Notes
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/notes" className="text-slate-700 hover:text-slate-900">
              Notes
            </Link>
            <Link href="/settings" className="text-slate-700 hover:text-slate-900">
              Settings
            </Link>
            <span className="hidden text-slate-500 sm:inline">{user.is_anonymous ? "Demo account" : user.email}</span>
            <form action={logOut}>
              <button type="submit" className="rounded-md border border-slate-300 px-3 py-1 hover:bg-slate-50">
                Log out
              </button>
            </form>
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
