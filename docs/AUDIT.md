# Security and auth audit: Huddle Notes

**Scope:** the app on the `main` branch (Next.js 15 + Supabase), exactly as generated.
**Method:** read the code, then reproduce every issue against a local Supabase stack with two
test accounts ("Alice" and "Bob"). Nothing is listed here that was not reproduced.
**Result:** 6 findings (2 critical, 1 high, 2 medium, 1 low). All are fixed on the
`fix/auth-and-rls` branch.

Each finding names the automated test that reproduces it. Run `pnpm test:e2e` on `main` to
watch them fail (11 of 15 tests fail), and on the fix branch to watch them pass (15 of 15).

| #   | Severity | Finding                                                         |
| --- | -------- | --------------------------------------------------------------- |
| 1   | Critical | Anyone can read, change or delete every user's notes            |
| 2   | Critical | The master database key is shipped to every visitor's browser   |
| 3   | High     | Any note opens by its URL, even when signed out                 |
| 4   | Medium   | The database trusts the browser to say who owns a note          |
| 5   | Medium   | Sign-up leaves new users stranded                               |
| 6   | Low      | Failures are silent                                             |

---

## 1. Anyone can read, change or delete every user's notes (Critical)

**In plain English:** the app only _asks_ the database for "my notes". Nothing stops anyone
from asking for everyone's. The public key that every visitor's browser already has is enough;
no account is needed.

**Cause:** `notes` was created without Row Level Security, and Supabase grants full access on
new tables to its `anon` and `authenticated` roles. The only filter is a `.eq("user_id", ...)`
in the page's own JavaScript (`app/notes/page.tsx`), which an attacker simply does not send.

**Reproduced:**

```bash
# No login. Only the public anon key from the site's JavaScript.
curl "$SUPABASE_URL/rest/v1/notes?select=*" -H "apikey: $ANON_KEY"
# -> every note in the table, all users
```

```text
postgres=# select relrowsecurity from pg_class where relname = 'notes';   -- f
postgres=# \dp notes        -- anon=arwdDxtm, authenticated=arwdDxtm
```

Signed in as Bob, the same API read Alice's note, renamed it to "edited by Bob", and deleted it.

**Tests:** `Bob's token cannot read / edit / delete Alice's note`, `the public anon key alone
cannot read or write notes`.

**Fix:** Row Level Security on `notes` with one owner-only policy per operation, all
privileges revoked from `anon`, and `authenticated` trimmed to the four row operations.
See `supabase/migrations/20261011000000_secure_notes.sql`.

## 2. The master database key is shipped to every visitor's browser (Critical)

**In plain English:** Supabase gives you two keys. One is public. The other (the
"service role" key) skips every security rule and can manage user accounts. This app sends
the second one to every visitor.

**Cause:** `lib/supabase.ts` builds an admin client from
`NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`. Next.js copies any `NEXT_PUBLIC_` variable into the
JavaScript it serves. It is there so the Settings page can delete an account from the browser.

**Reproduced:** after `pnpm build`, the key is present in 6 files under `.next/static`.
Pulled out with `grep` and used from `curl`, it listed every user's account record through
the admin API (`GET /auth/v1/admin/users`). The same key can delete any account and reads
every table regardless of Row Level Security, so fixing finding 1 alone would not be enough.

**Test:** `the service-role key is not in any file the browser can download`.

**Fix:** the key is renamed `SUPABASE_SERVICE_ROLE_KEY` (no public prefix) and used in one
server-only module (`lib/supabase/admin.ts`, guarded by the `server-only` package so a client
import fails the build). Account deletion is a Server Action that deletes the id from the
verified session and nothing else.

**Also required on a live project: rotate the key.** Once a key has been public it has to be
treated as stolen. Moving it does not un-leak it.

## 3. Any note opens by its URL, even when signed out (High)

**In plain English:** note pages look like `/notes/41`. Change the number and you are
reading someone else's note. You do not need to be logged in.

**Cause:** `app/notes/[id]/page.tsx` loads a note by id only, with no ownership check and no
sign-in check, and ids are sequential. `/notes` and `/settings` do redirect signed-out
visitors, but only from JavaScript running in the browser after the page has loaded.

**Reproduced:** signed in as Bob, opening Alice's note URL shows her title and text in an
editable form with working Save and Delete buttons
([screenshot](screenshots/before-bob-opens-alice-note.png)). The same URL in a fresh,
signed-out browser shows the note too.

**Tests:** `Bob cannot open Alice's note by its URL`, `a signed-out visitor cannot open
Alice's note by its URL`.

**Fix:** finding 1's policies mean the database returns no row, so the page shows "Note not
found" ([screenshot](screenshots/after-bob-opens-alice-note.png)), the same as for an id that
does not exist. Pages are now rendered on the server, and `middleware.ts` redirects signed-out
visitors to `/login` before any page code runs.

## 4. The database trusts the browser to say who owns a note (Medium)

**In plain English:** when you save a note, your browser tells the database whose note it is.
A browser can lie.

**Cause:** the insert sends `user_id` from the client. The column is nullable, has no default,
and has no foreign key to the users table. Deleting an account relies on the browser deleting
that user's notes first, as a separate step.

**Reproduced:** with Bob's token, inserted a note with `user_id` set to Alice's id; it was
saved as hers. With no login at all, inserted a note with no owner.

**Test:** `Bob cannot create a note in Alice's account`.

**Fix:** `user_id` defaults to `auth.uid()` (the caller's verified id), is `NOT NULL`, and
references `auth.users` with `ON DELETE CASCADE`. The insert policy rejects any other value,
and the app no longer sends the column. Rows that already had no valid owner are moved to a
locked `notes_orphaned` table rather than deleted.

## 5. Sign-up leaves new users stranded (Medium)

**In plain English:** a new user fills in the form and is dropped on the login page with no
explanation. If they find the confirmation email, its link does not take them into the app,
and on a deployed site it can point at `localhost`.

**Cause:** `app/signup/page.tsx` ignores the result of `signUp` and navigates to `/notes`,
which bounces to `/login` because the email is not confirmed yet. Nothing tells the user to
check their inbox. The app has no route to receive the confirmation link and does not say
where it should return to.

**Reproduced:**

- Signed up in the browser: landed on `/login` with no message.
- Opened the emailed link: landed on the marketing home page, not the notes page.
- Signed up from a non-localhost origin with Supabase's default Site URL: the emailed link
  carried `redirect_to=http://localhost:3000`.

**Test:** `a new user can sign up, confirm by email, and land in the app signed in`.

**Fix:** the form says "Check your email." The email template links to the app's own
`/auth/confirm` route, which verifies the one-time token on the server, sets the session
cookie, and redirects to `/notes`. This needs the project's Site URL set to the real domain
(see the deploy checklist in the README).

## 6. Failures are silent (Low)

**In plain English:** when something goes wrong, the screen does nothing, so users cannot tell
a wrong password from a broken site.

**Cause:** every Supabase call discards the `error` it returns, and no page has a loading,
empty or error state.

**Reproduced:** a wrong password leaves the login form unchanged
([screenshot](screenshots/before-wrong-password.png)). A new account's notes page shows a
form and blank space. Opening a note id that does not exist shows an empty "Edit note" form.

**Tests:** `a wrong password shows an error`, `a user with no notes is told so`.

**Fix:** forms report errors and show a pending state while submitting
([screenshot](screenshots/after-wrong-password.png)); the notes pages have loading, empty,
error and not-found states.

---

## Checked and left alone

- **Passwords** are handled by Supabase Auth; the app never stores or logs them.
- **Injection:** all queries go through the Supabase query builder, and note text is rendered
  by React with no `dangerouslySetInnerHTML`.

## Not covered by this audit

Rate limiting and abuse controls, password reset (the app has none), multi-factor auth,
dependency vulnerabilities, and hosting configuration.
