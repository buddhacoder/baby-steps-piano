-- Milestone 4: Auth + Profile + Badges
-- Run this in the Supabase SQL Editor after creating your project.

-- 1. Profiles (auto-created on first sign-in)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. User progress (replaces localStorage for signed-in users)
create table if not exists public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{}',
  coach_threads jsonb not null default '[]',
  lesson_stack jsonb not null default '[]',
  updated_at timestamptz default now()
);

-- 3. Badges
create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz default now(),
  unique(user_id, badge_id)
);

-- 4. Row-Level Security
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.badges enable row level security;

create policy "Users manage own profile"
  on public.profiles for all using (auth.uid() = id);

create policy "Users manage own progress"
  on public.user_progress for all using (auth.uid() = user_id);

create policy "Users manage own badges"
  on public.badges for all using (auth.uid() = user_id);
