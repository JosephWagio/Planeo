-- Planeo database schema
-- Run this once in the Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  boards jsonb not null default '[]'::jsonb,
  active_board_id text not null default '',
  notifications jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can read their own workspace" on public.workspaces;
create policy "Users can read their own workspace"
on public.workspaces for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own workspace" on public.workspaces;
create policy "Users can create their own workspace"
on public.workspaces for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own workspace" on public.workspaces;
create policy "Users can update their own workspace"
on public.workspaces for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own workspace" on public.workspaces;
create policy "Users can delete their own workspace"
on public.workspaces for delete
to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute procedure public.set_updated_at();
