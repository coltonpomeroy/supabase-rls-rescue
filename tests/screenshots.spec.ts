import { expect, test } from "@playwright/test";
import { createNote, createUser, deleteUser, logIn, type TestUser } from "./helpers";

// Not a test: captures the before/after images in docs/screenshots.
//   SCREENSHOTS=before pnpm test:e2e screenshots   (on main)
//   SCREENSHOTS=after  pnpm test:e2e screenshots   (on the fix branch)
const label = process.env.SCREENSHOTS;
test.skip(!label, "set SCREENSHOTS=before|after to capture");
test.use({ viewport: { width: 1000, height: 750 } });

const shot = (name: string) => `docs/screenshots/${label}-${name}.png`;

let alice: TestUser;
let bob: TestUser;
let noteId: number;

test.beforeAll(async () => {
  alice = { ...(await createUser("alice")) };
  bob = { ...(await createUser("bob")) };
  noteId = await createNote(
    alice,
    "Q4 payroll export",
    "Login for the payroll export is in the shared vault under Finance.\nDo not forward this note.",
  );
});

test.afterAll(async () => {
  await Promise.all([deleteUser(alice), deleteUser(bob)]);
});

test("Bob opens Alice's note by URL", async ({ page }) => {
  await logIn(page, bob);
  await page.goto(`/notes/${noteId}`);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: shot("bob-opens-alice-note") });
});

test("wrong password", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(alice.email);
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForLoadState("networkidle");
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  await page.screenshot({ path: shot("wrong-password") });
});
