create table notes (
  id bigint generated always as identity primary key,
  user_id uuid,
  title text,
  body text,
  created_at timestamptz default now()
);
