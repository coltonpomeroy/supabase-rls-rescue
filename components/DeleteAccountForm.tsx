"use client";

import { useActionState } from "react";
import { deleteAccount } from "@/app/settings/actions";
import FormAlert from "@/components/FormAlert";
import SubmitButton from "@/components/SubmitButton";

export default function DeleteAccountForm() {
  const [state, formAction] = useActionState(deleteAccount, null);

  return (
    <form action={formAction} className="mt-3 space-y-3">
      <FormAlert state={state} />
      <SubmitButton
        pendingText="Deleting account…"
        className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      >
        Delete my account
      </SubmitButton>
    </form>
  );
}
