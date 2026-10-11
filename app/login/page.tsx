import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { logIn } from "@/app/auth/actions";

type Props = { searchParams: Promise<{ notice?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { notice } = await searchParams;
  // Arriving from a confirmation link that could not sign the user in automatically
  // (opened in a different browser, or already used).
  const initialState =
    notice === "confirm"
      ? { message: "If you just confirmed your email, you're all set. Log in to continue." }
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
