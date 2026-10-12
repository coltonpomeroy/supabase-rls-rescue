-- Lock down public.notes: every row has exactly one owner, and only that owner can
-- read or change it. Enforced in Postgres, so it holds no matter which client asks.

-- 1. Rows nobody can be shown. Until now user_id was nullable and came from the browser,
--    so some rows may have no owner or point at a deleted account. Set them aside rather
--    than delete them; this table gets RLS with no policies, so only the service role
--    can see it.
create table public.notes_orphaned as
  select n.* from public.notes n
  where n.user_id is null
     or not exists (select 1 from auth.users u where u.id = n.user_id);

alter table public.notes_orphaned enable row level security;
revoke all on public.notes_orphaned from anon, authenticated;

delete from public.notes n
  where n.user_id is null
     or not exists (select 1 from auth.users u where u.id = n.user_id);

-- 2. Ownership is decided by the database, not the client. The default fills in the
--    caller's id from their verified token, and the foreign key removes a user's notes
--    when their account is deleted.
update public.notes set title = 'Untitled' where title is null or btrim(title) = '';
update public.notes set body = '' where body is null;

alter table public.notes
  alter column user_id set default auth.uid(),
  alter column user_id set not null,
  alter column title set not null,
  alter column body set not null,
  alter column body set default '',
  alter column created_at set not null,
  add constraint notes_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade,
  add constraint notes_title_length check (char_length(btrim(title)) between 1 and 200),
  add constraint notes_body_length check (char_length(body) <= 20000);

-- The policies below filter on user_id for every query.
create index notes_user_id_created_at_idx on public.notes (user_id, created_at desc);

-- 3. Privileges. Supabase grants everything on new public tables to anon and
--    authenticated. Signed-out visitors need nothing here; signed-in users need the four
--    row operations and no more (no truncate, references or trigger).
revoke all on public.notes from anon, authenticated;
grant select, insert, update, delete on public.notes to authenticated;

-- 4. Row Level Security. One policy per operation so each is easy to read and to change.
--    `(select auth.uid())` is evaluated once per statement instead of once per row.
alter table public.notes enable row level security;

create policy "Users read their own notes"
  on public.notes for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users create notes for themselves"
  on public.notes for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- `using` picks which rows may be updated; `with check` stops a row being handed to
-- another user by changing user_id.
create policy "Users update their own notes"
  on public.notes for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users delete their own notes"
  on public.notes for delete to authenticated
  using ((select auth.uid()) = user_id);
