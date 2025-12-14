-- Supabase schema for EduPlatform (RU/UZ)
-- Run this in Supabase SQL Editor

-- 1) Core domain tables
create table if not exists public.faculties (
  id bigserial primary key,
  name text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.subjects (
  id bigserial primary key,
  name text not null,
  faculty_id bigint not null references public.faculties(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.questions (
  id bigserial primary key,
  subject_id bigint not null references public.subjects(id) on delete cascade,
  question_text text not null,
  correct_answer text not null,
  answer2 text not null,
  answer3 text not null,
  answer4 text not null,
  explanation text,
  created_at timestamptz default now()
);

create table if not exists public.test_results (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id bigint not null references public.subjects(id) on delete cascade,
  mode text not null default 'training' check (mode in ('training','exam')),
  timestamp timestamptz default now(),
  score double precision not null,
  correct_count int not null,
  total_time int not null
);

create table if not exists public.user_question_history (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id bigint not null references public.questions(id) on delete cascade,
  timestamp timestamptz default now()
);

-- 2) Profiles (roles, basic user info)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'user' check (role in ('admin','manager','user')),
  name text,
  created_at timestamptz default now()
);

-- 3) Auto create profile on new user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4) Helper to check admin/manager
create or replace function public.is_admin_manager()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin','manager')
  );
$$;

-- 5) Enable RLS and policies
alter table public.faculties enable row level security;
alter table public.subjects enable row level security;
alter table public.questions enable row level security;
alter table public.test_results enable row level security;
alter table public.user_question_history enable row level security;
alter table public.profiles enable row level security;

-- Read for everyone
drop policy if exists "faculties_read_all" on public.faculties;
create policy "faculties_read_all" on public.faculties for select using (true);

drop policy if exists "subjects_read_all" on public.subjects;
create policy "subjects_read_all" on public.subjects for select using (true);

drop policy if exists "questions_read_all" on public.questions;
create policy "questions_read_all" on public.questions for select using (true);

-- Admin/manager can manage content
drop policy if exists "faculties_admin_manage" on public.faculties;
create policy "faculties_admin_manage" on public.faculties for all using (public.is_admin_manager()) with check (public.is_admin_manager());

drop policy if exists "subjects_admin_manage" on public.subjects;
create policy "subjects_admin_manage" on public.subjects for all using (public.is_admin_manager()) with check (public.is_admin_manager());

drop policy if exists "questions_admin_manage" on public.questions;
create policy "questions_admin_manage" on public.questions for all using (public.is_admin_manager()) with check (public.is_admin_manager());

-- Test results and history
drop policy if exists "test_results_own" on public.test_results;
create policy "test_results_own" on public.test_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "test_results_admin" on public.test_results;
create policy "test_results_admin" on public.test_results for select using (public.is_admin_manager());

drop policy if exists "history_own" on public.user_question_history;
create policy "history_own" on public.user_question_history for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "history_admin" on public.user_question_history;
create policy "history_admin" on public.user_question_history for select using (public.is_admin_manager());

-- Profiles
drop policy if exists "profiles_read_own" on public.profiles;
create policy "profiles_read_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_read_admin" on public.profiles;
create policy "profiles_read_admin" on public.profiles for select using (public.is_admin_manager());

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles for insert with check (public.is_admin_manager());

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update" on public.profiles for update using (public.is_admin_manager());

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles for delete using (public.is_admin_manager());
