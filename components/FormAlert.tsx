import type { FormState } from "@/lib/form";

/** Announces a form's error or confirmation to sighted and screen-reader users alike. */
export default function FormAlert({ state }: { state: FormState }) {
  if (state?.error) {
    return (
      <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {state.error}
      </p>
    );
  }
  if (state?.message) {
    return (
      <p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
        {state.message}
      </p>
    );
  }
  return null;
}
