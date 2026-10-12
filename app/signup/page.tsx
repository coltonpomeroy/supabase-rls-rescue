import Link from "next/link";
import RescueGuide from "@/components/RescueGuide";
import AuthForm from "@/components/AuthForm";
import { signUp } from "@/app/auth/actions";

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm">
      <RescueGuide page="signup" />
      <h1 className="text-2xl font-bold">Create your account</h1>
      <AuthForm
        action={signUp}
        submitLabel="Sign up"
        pendingLabel="Creating account…"
        passwordAutoComplete="new-password"
        passwordHint="At least 8 characters."
      />
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
