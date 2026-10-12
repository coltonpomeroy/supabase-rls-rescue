-- "Try the demo" creates a throwaway account (Supabase anonymous sign-in) on every click.
-- Nothing removed them, so they and their notes piled up. This deletes demo accounts a day
-- after they were created, on a schedule that runs inside the database.

-- Only ever touches anonymous accounts: a user who signed up with an email is never a
-- candidate, however old. Deleting the auth.users row also removes the user's notes,
-- through the ON DELETE CASCADE foreign key on public.notes.user_id.
create function public.delete_stale_demo_accounts(max_age interval default interval '24 hours')
returns integer
language sql
security definer
set search_path = ''
as $$
  with deleted as (
    delete from auth.users
    where is_anonymous is true
      and created_at < now() - max_age
    returning id
  )
  select count(*)::integer from deleted;
$$;

-- The function runs with its owner's rights, so nobody may call it through the API.
-- Postgres grants execute to everyone by default; take that away.
revoke all on function public.delete_stale_demo_accounts(interval) from public, anon, authenticated, service_role;

create extension if not exists pg_cron with schema pg_catalog;

-- Hourly, so an account lives between 24 and 25 hours.
select cron.schedule(
  'delete-stale-demo-accounts',
  '17 * * * *',
  $$select public.delete_stale_demo_accounts()$$
);
