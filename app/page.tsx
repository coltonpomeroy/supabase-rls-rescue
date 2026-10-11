import Link from "next/link";
import TryDemoButton from "@/components/TryDemoButton";

export default function Home() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Huddle Notes</h1>
      <p className="mx-auto mt-4 max-w-md text-lg text-slate-600">
        A simple place to keep your notes. Sign up and start writing in seconds.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <TryDemoButton className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700" />
        <Link href="/signup" className="rounded-md border border-slate-300 bg-white px-5 py-2.5 font-medium hover:bg-slate-50">
          Sign up
        </Link>
        <Link href="/login" className="rounded-md border border-slate-300 bg-white px-5 py-2.5 font-medium hover:bg-slate-50">
          Log in
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-600">The demo needs no email. You get a private, temporary account.</p>
    </div>
  );
}
