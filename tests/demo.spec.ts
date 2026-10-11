import { expect, test } from "@playwright/test";
import { admin, anonClient, createNote, createUser, deleteUser, type TestUser } from "./helpers";

// "Try the demo" signs a visitor in with a throwaway account (Supabase anonymous sign-in).
// These tests check that a demo visitor is isolated exactly like any other user.

async function startDemo(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Try the demo" }).click();
  await expect(page.getByRole("heading", { name: "Your notes" })).toBeVisible();
}

test("a visitor can try the demo without an email", async ({ page }) => {
  await startDemo(page);
  await expect(page.getByText("Demo account")).toBeVisible();
  await expect(page.getByText(/no notes yet/i)).toBeVisible();

  await page.getByLabel("Title").fill("Demo note");
  await page.getByLabel("Note").fill("Written without signing up.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByRole("link", { name: /Demo note/ })).toBeVisible();
});

test("two demo visitors cannot see each other's notes", async ({ browser }) => {
  const first = await (await browser.newContext()).newPage();
  const second = await (await browser.newContext()).newPage();
  const title = `First visitor ${Date.now()}`;

  await startDemo(first);
  await first.getByLabel("Title").fill(title);
  await first.getByRole("button", { name: "Add note" }).click();
  await expect(first.getByRole("link", { name: new RegExp(title) })).toBeVisible();
  const { data } = await admin.from("notes").select("id").eq("title", title).single();

  await startDemo(second);
  await expect(second.getByText(/no notes yet/i)).toBeVisible();
  await second.goto(`/notes/${data!.id}`);
  await expect(second.getByText(/not found/i)).toBeVisible();
});

test.describe("straight to the API", () => {
  let alice: TestUser;
  let noteId: number;
  test.beforeAll(async () => {
    alice = await createUser("alice");
    noteId = await createNote(alice, "Alice private", "Not for demo visitors.");
  });
  test.afterAll(() => deleteUser(alice));

  test("a demo account's token cannot read or change a real user's note", async () => {
    const client = anonClient();
    const { data: session, error } = await client.auth.signInAnonymously();
    expect(error).toBeNull();

    const { data: visible } = await client.from("notes").select("*");
    expect(visible ?? []).toEqual([]);

    await client.from("notes").update({ title: "edited by demo" }).eq("id", noteId);
    await client.from("notes").delete().eq("id", noteId);
    const { data: note } = await admin.from("notes").select("title").eq("id", noteId).maybeSingle();
    expect(note?.title).toBe("Alice private");

    await admin.auth.admin.deleteUser(session.user!.id);
  });
});
