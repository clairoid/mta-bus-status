-- MTA Bus Status — Supabase schema
-- Run this once in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent).

-- 1. Profiles: one row per auth user — identity + saved Home/Work places.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  home jsonb,          -- { label, lat, lon }
  work jsonb,          -- { label, lat, lon }
  updated_at timestamptz default now()
);

-- 2. User state: one row per user holding all synced app data as JSON —
--    favorites, tracked routes, saved views, recent trips, trip history,
--    notification prefs, accessibility prefs, text size, theme, heatmap.
create table if not exists public.user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 3. Row-Level Security: each user can only read/write their own rows.
--    This is what makes the public anon key safe to ship in the client.
alter table public.profiles enable row level security;
alter table public.user_state enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "user_state_select_own" on public.user_state;
drop policy if exists "user_state_insert_own" on public.user_state;
drop policy if exists "user_state_update_own" on public.user_state;
create policy "user_state_select_own" on public.user_state for select using (auth.uid() = user_id);
create policy "user_state_insert_own" on public.user_state for insert with check (auth.uid() = user_id);
create policy "user_state_update_own" on public.user_state for update using (auth.uid() = user_id);

-- 4. Auto-provision a profile + empty state row when a user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
    values (new.id, split_part(new.email, '@', 1))
    on conflict (id) do nothing;
  insert into public.user_state (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
