import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TryDemoButton from "@/components/TryDemoButton";

export const metadata: Metadata = {
  title: "Huddle Notes: a Supabase security rescue (personal demo)",
  description:
    "A personal demo project. A notes app that let any user read anyone else's notes, what the review found, how it was fixed, and the tests that prove it.",
};

const REPO = "https://github.com/coltonpomeroy/supabase-rls-rescue";

const findings = [
  {
    severity: "Critical",
    title: "Anyone could read, change or delete every user's notes",
    detail:
      "The app only asked the database for “my notes”. Nothing stopped anyone from asking for everyone's, and no account was needed.",
  },
  {
    severity: "Critical",
    title: "The master database key was sent to every visitor's browser",
    detail: "That key skips every security rule and can manage user accounts. It was sitting in the site's public code.",
  },
  {
    severity: "High",
    title: "Any note opened by its web address, even when signed out",
    detail: "Note pages looked like /notes/41. Changing the number showed someone else's note, ready to edit or delete.",
  },
  {
    severity: "Medium",
    title: "The database trusted the browser to say who owned a note",
    detail: "A signed-in user could save a note into another person's account.",
  },
  {
    severity: "Medium",
    title: "Sign-up left new users stranded",
    detail: "No “check your email” message, and the confirmation link did not lead into the app.",
  },
  {
    severity: "Low",
    title: "Failures were silent",
    detail: "A wrong password changed nothing on screen, so users could not tell a typo from a broken site.",
  },
];

const severityStyle: Record<string, string> = {
  Critical: "bg-red-100 text-red-800",
  High: "bg-orange-100 text-orange-900",
  Medium: "bg-amber-100 text-amber-900",
  Low: "bg-slate-200 text-slate-800",
};

const fixes = [
  {
    title: "Access rules moved into the database",
    detail:
      "Every note has exactly one owner, and the database itself refuses anyone else. This holds even if someone skips the app and talks to the database directly.",
  },
  {
    title: "The master key stays on the server",
    detail: "It is used in one server-only file, and the build fails if browser code ever tries to import it.",
  },
  {
    title: "Sign-in is checked on the server",
    detail: "Signed-out visitors are redirected before any page loads, and a note that is not yours shows “Note not found”.",
  },
  {
    title: "Sign-up works from start to finish",
    detail: "The form says to check your email, and the confirmation link signs the user in and lands them in the app.",
  },
  {
    title: "The app says what is happening",
    detail: "Forms report errors and show progress, and pages have loading, empty and not-found states.",
  },
];

const deliverables = [
  { label: "Audit", href: `${REPO}/blob/main/docs/AUDIT.md`, detail: "Each issue with how it was reproduced, how serious it is, and what it means in plain English." },
  { label: "Fix, as one pull request", href: `${REPO}/pull/1`, detail: "Every change in one place to review, in small commits that each explain why." },
  { label: "One-page fix report", href: `${REPO}/blob/main/docs/fix-report.pdf`, detail: "Written for the owner, not the developer: what was wrong, what changed, what to do next." },
  { label: "Automated tests", href: `${REPO}/actions`, detail: "They run on every change against a real database, so the problems cannot quietly come back." },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-14">
      <h2 id={id} className="text-2xl font-bold tracking-tight">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <p className="rounded-md border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950">
        <strong>Personal demo project.</strong> Not client work. Huddle Notes is a made-up app, the client in this story is
        hypothetical, and all data is sample data.
      </p>

      <header className="mt-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">Supabase security rescue</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          This notes app let any user read anyone else&apos;s notes. Here is how it was fixed.
        </h1>
        <p className="mt-4 text-lg text-slate-700">
          You are looking at the fixed version. Below is what was wrong, what changed, and the tests that prove it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <TryDemoButton className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700" />
          <a
            href={`${REPO}/pull/1`}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 font-medium hover:bg-slate-50"
          >
            See the fix on GitHub
          </a>
        </div>
        <p className="mt-3 text-sm text-slate-600">The demo needs no email. You get a private, temporary account.</p>
      </header>

      <Section id="situation" title="The situation">
        <p className="mt-4 text-slate-700">
          A founder has a small notes app, Huddle Notes, built quickly with an AI coding assistant on Next.js and
          Supabase. People can sign up, log in, write private notes and delete their account. It works in every demo.
          Before inviting real users, the founder asks for a security review.
        </p>
        <p className="mt-3 text-slate-700">
          The app in this project was made the same way: generated from a features-only brief and committed with no
          security review, so it has the problems these apps usually have.
        </p>
      </Section>

      <Section id="findings" title="What the review found">
        <p className="mt-4 text-slate-700">
          Six issues, each one reproduced with two test accounts (&ldquo;Alice&rdquo; and &ldquo;Bob&rdquo;) before it
          was written down.
        </p>
        <ol className="mt-6 space-y-3">
          {findings.map((finding) => (
            <li key={finding.title} className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`rounded px-2 py-0.5 text-xs font-semibold ${severityStyle[finding.severity]}`}>
                  {finding.severity}
                </span>
                <h3 className="font-semibold">{finding.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-700">{finding.detail}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="before-after" title="Before and after">
        <p className="mt-4 text-slate-700">
          Bob is signed in to his own account and changes the number in the address bar to the number of Alice&apos;s
          note.
        </p>
        <div className="mt-6 space-y-8">
          <figure>
            <Image
              src="/case-study/before-bob-opens-alice-note.png"
              alt="Before the fix: Bob's browser shows Alice's private note about a payroll export in an edit form, with working Save and Delete buttons."
              width={1000}
              height={750}
              className="rounded-lg border border-slate-300"
            />
            <figcaption className="mt-2 text-sm text-slate-700">
              <strong className="text-red-800">Before.</strong> Bob sees Alice&apos;s note and can edit or delete it.
            </figcaption>
          </figure>
          <figure>
            <Image
              src="/case-study/after-bob-opens-alice-note.png"
              alt="After the fix: the same address shows Bob a 'Note not found' message."
              width={1000}
              height={750}
              className="rounded-lg border border-slate-300"
            />
            <figcaption className="mt-2 text-sm text-slate-700">
              <strong className="text-green-800">After.</strong> The database returns nothing, so Bob sees &ldquo;Note
              not found&rdquo;.
            </figcaption>
          </figure>
        </div>
      </Section>

      <Section id="fix" title="What changed">
        <ul className="mt-6 space-y-4">
          {fixes.map((fix) => (
            <li key={fix.title} className="border-l-4 border-indigo-600 pl-4">
              <h3 className="font-semibold">{fix.title}</h3>
              <p className="mt-1 text-sm text-slate-700">{fix.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="proof" title="Proof that it is fixed">
        <p className="mt-4 text-slate-700">
          The same 15 automated tests were run against the original app and the fixed app. Several of them skip the app
          and attack the database directly with Bob&apos;s own login, the way an attacker would.
        </p>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <dt className="text-sm font-medium text-slate-700">Original app</dt>
            <dd className="mt-1 text-3xl font-bold text-red-800">4 of 15 pass</dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5">
            <dt className="text-sm font-medium text-slate-700">Fixed app</dt>
            <dd className="mt-1 text-3xl font-bold text-green-800">15 of 15 pass</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-slate-700">
          The four that passed before are the ones that check the app still works for its own users. They still pass.{" "}
          <a href={`${REPO}#results`} className="font-medium text-indigo-700 underline">
            See all 15 results
          </a>
          .
        </p>
      </Section>

      <Section id="deliverables" title="What the client receives">
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {deliverables.map((item) => (
            <li key={item.label} className="rounded-lg border border-slate-200 bg-white p-4">
              <a href={item.href} className="font-semibold text-indigo-700 underline">
                {item.label}
              </a>
              <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="try" title="Check it yourself">
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-700">
          <li>Start the demo and add a note.</li>
          <li>Open the note. Its address ends in a number, like /notes/41.</li>
          <li>Change the number to any other. You get &ldquo;Note not found&rdquo;, never someone else&apos;s note.</li>
        </ol>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <TryDemoButton className="rounded-md bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700" />
          <Link href="/signup" className="rounded-md border border-slate-300 bg-white px-5 py-2.5 font-medium hover:bg-slate-50">
            Sign up with an email
          </Link>
        </div>
        <p className="mt-3 text-sm text-slate-600">Demo accounts and their notes are deleted after a day.</p>
      </Section>
    </div>
  );
}
