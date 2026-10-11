import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { logIn } from "@/app/auth/actions";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const initialState =
    error === "confirmation"
      ? { error: "That confirmation link is invalid or has expired. Log in, or sign up again to get a new one." }
      : null;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-2xl font-bold">Log in</h1>
      <AuthForm
        action={logIn}
        submitLabel="Log in"
        pendingLabel="Logging in…"
        passwordAutoComplete="current-password"
        initialState={initialState}
      />
      <p className="mt-4 text-sm text-slate-600">
        No account?{" "}
        <Link href="/signup" className="text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
