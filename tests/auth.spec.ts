import { expect, test } from "@playwright/test";
import { admin, confirmationLinkFor, createUser, deleteUser, logIn, newCredentials, type TestUser } from "./helpers";

test.describe("sign-up", () => {
  const creds = newCredentials("signup");

  test.afterAll(async () => {
    const { data } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const user = data.users.find((u) => u.email === creds.email);
    if (user) await admin.auth.admin.deleteUser(user.id);
  });

  test("a new user can sign up, confirm by email, and land in the app signed in", async ({ page, baseURL }) => {
    await page.goto("/signup");
    await page.getByLabel("Email").fill(creds.email);
    await page.getByLabel("Password").fill(creds.password);
    await page.getByRole("button", { name: "Sign up" }).click();

    // The app has to tell the user what happens next.
    await expect(page.getByText(/check your email/i)).toBeVisible();

    const link = await confirmationLinkFor(creds.email);
    await page.goto(link);

    // The link must come back to the origin the user signed up on, signed in.
    await expect(page).toHaveURL(`${baseURL}/notes`);
    await expect(page.getByRole("heading", { name: "Your notes" })).toBeVisible();
  });
});

test.describe("login", () => {
  let user: TestUser;
  test.beforeAll(async () => {
    user = await createUser("login");
  });
  test.afterAll(() => deleteUser(user));

  test("a user can log in and log out", async ({ page }) => {
    await logIn(page, user);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/notes");
    await expect(page).toHaveURL(/\/login/);
  });

  test("a user with no notes is told so", async ({ page }) => {
    await logIn(page, user);
    await expect(page.getByText(/no notes yet/i)).toBeVisible();
  });

  test("a wrong password shows an error", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /invalid|incorrect|wrong/i })).toBeVisible();
  });
});

test.describe("account deletion", () => {
  test("deleting an account removes the user and their notes", async ({ page }) => {
    const user = await createUser("delete");
    await logIn(page, user);
    await page.getByLabel("Title").fill("Soon to be gone");
    await page.getByLabel("Note").fill("This note should be deleted with the account.");
    await page.getByRole("button", { name: "Add note" }).click();
    await expect(page.getByRole("link", { name: /Soon to be gone/ })).toBeVisible();

    await page.goto("/settings");
    await expect(page.getByRole("main").getByText(user.email)).toBeVisible();
    await page.getByRole("button", { name: "Delete my account" }).click();
    await expect(page).toHaveURL((url) => url.pathname === "/" || url.pathname === "/login");

    const { data } = await admin.auth.admin.getUserById(user.id);
    expect(data.user).toBeNull();
    const { data: notes } = await admin.from("notes").select("id").eq("user_id", user.id);
    expect(notes).toEqual([]);
  });
});
