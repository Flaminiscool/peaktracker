-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.dashboard_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.dashboard_state enable row level security;

-- Each person can only see and change their own row.
create policy "own row select" on public.dashboard_state
  for select using (auth.uid() = user_id);
create policy "own row insert" on public.dashboard_state
  for insert with check (auth.uid() = user_id);
create policy "own row update" on public.dashboard_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lets your other device update live.
alter publication supabase_realtime add table public.dashboard_state;
