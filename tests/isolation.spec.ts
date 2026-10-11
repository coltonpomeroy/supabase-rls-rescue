import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import {
  admin,
  anonClient,
  clientFor,
  createNote,
  createUser,
  deleteUser,
  logIn,
  readablePageContent,
  serviceRoleKey,
  type TestUser,
} from "./helpers";

// Two users. Alice owns one private note. Every test here asks the same question from a
// different angle: can anyone who is not Alice read or change it?
let alice: TestUser;
let bob: TestUser;
let noteId: number;
const title = `Alice private ${Date.now()}`;
const body = "Payroll export password: correct-horse-battery-staple";

test.beforeAll(async () => {
  [alice, bob] = await Promise.all([createUser("alice"), createUser("bob")]);
  noteId = await createNote(alice, title, body);
});

test.afterAll(async () => {
  await Promise.all([deleteUser(alice), deleteUser(bob)]);
});

const noteById = (id: number) => admin.from("notes").select("title").eq("id", id).maybeSingle();

test.describe("in the browser", () => {
  test("Bob cannot open Alice's note by its URL", async ({ page }) => {
    await logIn(page, bob);
    await page.goto(`/notes/${noteId}`);
    const content = await readablePageContent(page);
    expect(content).not.toContain(title);
    expect(content).not.toContain(body);
    await expect(page.getByText(/not found/i)).toBeVisible();
  });

  test("a signed-out visitor cannot open Alice's note by its URL", async ({ page }) => {
    await page.goto(`/notes/${noteId}`);
    const content = await readablePageContent(page);
    expect(content).not.toContain(title);
    expect(content).not.toContain(body);
    await expect(page).toHaveURL(/\/login/);
  });

  test("Alice still sees her own note", async ({ page }) => {
    await logIn(page, alice);
    await expect(page.getByRole("link", { name: new RegExp(title) })).toBeVisible();
    await page.goto(`/notes/${noteId}`);
    await expect(page.getByLabel("Title")).toHaveValue(title);
  });
});

test.describe("straight to the API, skipping the app", () => {
  test("Bob's token cannot read Alice's note", async () => {
    const client = await clientFor(bob);
    const { data } = await client.from("notes").select("*");
    expect(data ?? []).toEqual([]);
  });

  test("Bob's token cannot edit Alice's note", async () => {
    const id = await createNote(alice, "Original title", "x");
    const client = await clientFor(bob);
    await client.from("notes").update({ title: "edited by Bob" }).eq("id", id);
    expect((await noteById(id)).data?.title).toBe("Original title");
  });

  test("Bob's token cannot delete Alice's note", async () => {
    const id = await createNote(alice, "Do not delete", "x");
    const client = await clientFor(bob);
    await client.from("notes").delete().eq("id", id);
    expect((await noteById(id)).data).not.toBeNull();
  });

  test("Bob cannot create a note in Alice's account", async () => {
    const client = await clientFor(bob);
    const planted = `Planted by Bob ${Date.now()}`;
    await client.from("notes").insert({ user_id: alice.id, title: planted, body: "x" });
    const { data } = await admin.from("notes").select("id").eq("user_id", alice.id).eq("title", planted);
    expect(data).toEqual([]);
  });

  test("the public anon key alone cannot read or write notes", async () => {
    const client = anonClient();
    const { data } = await client.from("notes").select("*");
    expect(data ?? []).toEqual([]);

    const planted = `Planted anonymously ${Date.now()}`;
    await client.from("notes").insert({ title: planted, body: "x" });
    const { data: found } = await admin.from("notes").select("id").eq("title", planted);
    await admin.from("notes").delete().eq("title", planted);
    expect(found).toEqual([]);
  });
});

test("the service-role key is not in any file the browser can download", () => {
  const staticDir = join(process.cwd(), ".next", "static");
  const files = readdirSync(staticDir, { recursive: true, encoding: "utf8" }).filter((f) => f.endsWith(".js"));
  expect(files.length).toBeGreaterThan(0);
  const leaking = files.filter((f) => readFileSync(join(staticDir, f), "utf8").includes(serviceRoleKey));
  expect(leaking).toEqual([]);
});
