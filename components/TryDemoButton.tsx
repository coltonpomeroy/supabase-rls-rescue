import { tryDemo } from "@/app/auth/actions";
import SubmitButton from "@/components/SubmitButton";

/** One click into the app with a throwaway account. No email, no password. */
export default function TryDemoButton({ className }: { className: string }) {
  return (
    <form action={tryDemo}>
      <SubmitButton pendingText="Starting demo…" className={className}>
        Try the demo
      </SubmitButton>
    </form>
  );
}
