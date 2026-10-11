"use client";

import { useActionState } from "react";
import FormAlert from "@/components/FormAlert";
import SubmitButton from "@/components/SubmitButton";
import type { FormState } from "@/lib/form";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
  passwordHint?: string;
  initialState?: FormState;
};

export default function AuthForm({
  action,
  submitLabel,
  pendingLabel,
  passwordAutoComplete,
  passwordHint,
  initialState = null,
}: Props) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <FormAlert state={state} />
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state?.email}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={passwordAutoComplete}
          required
          aria-describedby={passwordHint ? "password-hint" : undefined}
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2"
        />
        {passwordHint && (
          <p id="password-hint" className="mt-1 text-sm text-slate-600">
            {passwordHint}
          </p>
        )}
      </div>
      <SubmitButton
        pendingText={pendingLabel}
        className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
