"use client";

import { useFormStatus } from "react-dom";

type Props = { children: React.ReactNode; pendingText: string; className?: string };

/** Submit button that disables itself and says what is happening while the form is sent. */
export default function SubmitButton({ children, pendingText, className }: Props) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? pendingText : children}
    </button>
  );
}
