import Link from "next/link";

// Shown on every screen of the deployed demo. Each entry says what that screen did in the
// unreviewed app (the `main` branch) and what it does now, so a visitor can follow the
// rescue from inside the app. Wording here avoids the app's own messages on purpose.
const STEPS = {
  list: {
    step: 1,
    title: "Whose notes are these?",
    before:
      "This page asked the database for “my notes” from your browser. The database had no rules of its own, so anyone could ask it for everyone’s notes instead, without even having an account.",
    after:
      "The database checks who is asking and returns only the rows that person owns. The page is built on the server, so the request never passes through code a visitor can change.",
    tryIt: "Add a note below, then open it.",
  },
  note: {
    step: 2,
    title: "The number in the address",
    before:
      "A note opened for anyone who knew its number, signed in or not, with working Save and Delete buttons. The numbers count up, so guessing one was easy.",
    after: "The database returns a note only to its owner. Save and Delete are checked the same way.",
    tryIt: "Change the number at the end of this page’s address to any other number and press Enter.",
  },
  missing: {
    step: 3,
    title: "A note that is not yours",
    before:
      "If this number belonged to another person’s note, you would be reading it now, and you could change or delete it.",
    after:
      "The database returned nothing, so the app gives the same answer whether the note belongs to someone else or does not exist. It cannot even confirm the number is in use.",
    tryIt: "Go back to your own notes, then open Settings.",
  },
  settings: {
    step: 4,
    title: "Deleting an account",
    before:
      "The delete button ran in your browser using the database’s master key, which was sent to every visitor. Anyone who copied that key could read every table and delete any account.",
    after:
      "The master key stays on the server. Deleting removes only the account that is signed in, and the database removes that account’s notes itself.",
    tryIt: "Delete this account when you are finished. Nothing else is affected.",
  },
  login: {
    step: 0,
    title: "Logging in",
    before: "A wrong password changed nothing on screen, so a typo looked the same as a broken site.",
    after: "The form says what went wrong and shows when it is working.",
    tryIt: "Enter any email with a wrong password to see it.",
  },
  signup: {
    step: 0,
    title: "Signing up",
    before:
      "New users were dropped on the login page with no explanation, and the link in their confirmation email did not lead into the app.",
    after: "The form tells you to look in your inbox, and the emailed link signs you in and opens your notes.",
    tryIt: "Or skip the email: the home page has a one-click demo.",
  },
} as const;

const TOTAL = 4;

export default function RescueGuide({ page }: { page: keyof typeof STEPS }) {
  const { step, title, before, after, tryIt } = STEPS[page];
  return (
    <aside aria-label="Rescue walkthrough" className="mb-8 rounded-lg border border-indigo-200 bg-indigo-50 p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-800">
        Rescue walkthrough{step > 0 && ` · step ${step} of ${TOTAL}`}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900">{title}</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-red-200 bg-white p-3">
          <dt className="font-semibold text-red-800">Before the fix</dt>
          <dd className="mt-1 text-slate-700">{before}</dd>
        </div>
        <div className="rounded-md border border-green-200 bg-white p-3">
          <dt className="font-semibold text-green-800">After the fix</dt>
          <dd className="mt-1 text-slate-700">{after}</dd>
        </div>
      </dl>
      <p className="mt-3 text-slate-800">
        <span className="font-semibold">Try it:</span> {tryIt}{" "}
        <Link href="/#story" className="font-medium text-indigo-700 underline">
          Read the full story
        </Link>
      </p>
    </aside>
  );
}
