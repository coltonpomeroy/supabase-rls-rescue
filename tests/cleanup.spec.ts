import { expect, test } from "@playwright/test";
import { Client } from "pg";
import { admin, anonClient, createUser, deleteUser, type TestUser } from "./helpers";

// Demo accounts are deleted a day after they are created, by a job scheduled inside the
// database. These tests talk to the local Postgres directly, because nothing reachable
// through the API can backdate an account or run the job.

const DB_URL = process.env.SUPABASE_DB_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

let db: Client;
let alice: TestUser;

test.beforeAll(async () => {
  db = new Client({ connectionString: DB_URL });
  await db.connect();
  alice = await createUser("alice");
});

test.afterAll(async () => {
  await deleteUser(alice);
  await db.end();
});

async function newDemoAccount() {
  const client = anonClient();
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  const { error: insertError } = await client.from("notes").insert({ title: "Demo note" });
  if (insertError) throw insertError;
  return data.user!.id;
}

const backdate = (userId: string) =>
  db.query("update auth.users set created_at = now() - interval '25 hours' where id = $1", [userId]);

const userExists = async (userId: string) =>
  (await db.query("select 1 from auth.users where id = $1", [userId])).rowCount === 1;

const noteCount = async (userId: string) =>
  (await db.query("select count(*)::int as n from public.notes where user_id = $1", [userId])).rows[0].n;

test("the cleanup removes day-old demo accounts and their notes, and nothing else", async () => {
  const stale = await newDemoAccount();
  const fresh = await newDemoAccount();
  await backdate(stale);
  await backdate(alice.id); // an old account with an email is not a demo account

  await db.query("select public.delete_stale_demo_accounts()");

  expect(await userExists(stale)).toBe(false);
  expect(await noteCount(stale)).toBe(0);
  expect(await userExists(fresh)).toBe(true);
  expect(await noteCount(fresh)).toBe(1);
  expect(await userExists(alice.id)).toBe(true);

  await admin.auth.admin.deleteUser(fresh);
});

test("the cleanup is scheduled, and cannot be run through the API", async () => {
  const { rows } = await db.query(
    "select schedule, active from cron.job where jobname = 'delete-stale-demo-accounts'",
  );
  expect(rows).toEqual([{ schedule: "17 * * * *", active: true }]);

  const demo = anonClient();
  await demo.auth.signInAnonymously().then(({ data }) => data.user!.id);
  for (const client of [anonClient(), demo, admin]) {
    const { error } = await client.rpc("delete_stale_demo_accounts", { max_age: "0 seconds" });
    expect(error).not.toBeNull();
  }
  const { data } = await demo.auth.getUser();
  expect(data.user).not.toBeNull();
  await admin.auth.admin.deleteUser(data.user!.id);
});
