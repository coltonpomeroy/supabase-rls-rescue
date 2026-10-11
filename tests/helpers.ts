import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, type Page } from "@playwright/test";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The unreviewed app names this NEXT_PUBLIC_*; the fixed app keeps it server-only.
export const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY)!;

const MAILPIT_URL = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";
const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

/** Service-role client. Test setup and assertions only, never the code under test. */
export const admin = createClient(url, serviceRoleKey, noSession);

/** A client holding only the public anon key, like any visitor's browser. */
export const anonClient = () => createClient(url, anonKey, noSession);

export type TestUser = { id: string; email: string; password: string };

export function newCredentials(label: string) {
  return { email: `${label}-${randomUUID().slice(0, 8)}@example.com`, password: `pw-${randomUUID()}` };
}

/** Creates an already-confirmed user, skipping the email step. */
export async function createUser(label: string): Promise<TestUser> {
  const creds = newCredentials(label);
  const { data, error } = await admin.auth.admin.createUser({ ...creds, email_confirm: true });
  if (error) throw error;
  return { id: data.user.id, ...creds };
}

export async function deleteUser(user: TestUser) {
  await admin.from("notes").delete().eq("user_id", user.id);
  await admin.auth.admin.deleteUser(user.id);
}

/** A signed-in API client for `user`: what they can do with their own token, no UI involved. */
export async function clientFor(user: TestUser): Promise<SupabaseClient> {
  const client = anonClient();
  const { error } = await client.auth.signInWithPassword({ email: user.email, password: user.password });
  if (error) throw error;
  return client;
}

export async function createNote(owner: TestUser, title: string, body: string): Promise<number> {
  const { data, error } = await admin
    .from("notes")
    .insert({ user_id: owner.id, title, body })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function logIn(page: Page, user: Pick<TestUser, "email" | "password">) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page.getByRole("heading", { name: "Your notes" })).toBeVisible();
}

/** Everything a person could read on the page: rendered text plus form field values. */
export async function readablePageContent(page: Page): Promise<string> {
  await page.waitForLoadState("networkidle");
  return page.evaluate(() => {
    const fields = Array.from(document.querySelectorAll("input, textarea")) as HTMLInputElement[];
    return [document.body.innerText, ...fields.map((f) => f.value)].join("\n");
  });
}

/** Polls the local mail catcher for the confirmation link sent to `email`. */
export async function confirmationLinkFor(email: string): Promise<string> {
  let link: string | undefined;
  await expect
    .poll(
      async () => {
        const search = await fetch(`${MAILPIT_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`);
        const { messages } = (await search.json()) as { messages: { ID: string }[] };
        if (!messages?.length) return false;
        const message = await fetch(`${MAILPIT_URL}/api/v1/message/${messages[0].ID}`);
        const { HTML } = (await message.json()) as { HTML: string };
        link = HTML.match(/href="([^"]+)"/)?.[1].replaceAll("&amp;", "&");
        return Boolean(link);
      },
      { message: `confirmation email for ${email}`, timeout: 15_000 },
    )
    .toBe(true);
  return link!;
}
