-- ========================================================
-- SAHYADRI STUDENT PORTAL - COMPLETE SUPABASE DATABASE SCHEMA
-- Copy & Run this entire script in Supabase SQL Editor
-- ========================================================

-- Optional: Drop existing tables if re-initialising schema
drop table if exists public.attendance_logs cascade;
drop table if exists public.timetable_slots cascade;
drop table if exists public.attendance_records cascade;
drop table if exists public.subjects cascade;
drop table if exists public.profiles cascade;

-- 1. PROFILES TABLE (Linked to Supabase Auth auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  usn text unique,
  course text default 'B.E.',
  department text default 'Information Science & Engineering',
  year integer default 1,
  semester integer default 1,
  section text default 'A',
  interests text[],
  avatar_url text,
  role text default 'student' check (role in ('student', 'faculty', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Automatic updated_at timestamp update function & trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.update_updated_at_column();

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- RLS Policies for profiles table
drop policy if exists "Anyone can read profiles" on public.profiles;
create policy "Anyone can read profiles"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid()::text = id::text);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid()::text = id::text)
  with check (auth.uid()::text = id::text);

-- 2. SUBJECTS TABLE
create table public.subjects (
  id bigint generated always as identity primary key,
  code text not null,
  name text not null,
  faculty text not null,
  credits int default 3,
  course text not null,
  department text not null,
  year int not null,
  semester int not null,
  section text default 'A'
);

alter table public.subjects enable row level security;

drop policy if exists "Anyone can read subjects" on public.subjects;
create policy "Anyone can read subjects"
  on public.subjects for select
  using (true);

-- 3. ATTENDANCE RECORDS TABLE
create table public.attendance_records (
  id bigint generated always as identity primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  subject_id bigint references public.subjects(id) on delete cascade,
  total_classes int default 0,
  classes_attended int default 0,
  target_percentage float default 85,
  unique (student_id, subject_id)
);

alter table public.attendance_records enable row level security;

drop policy if exists "Students can view own attendance" on public.attendance_records;
create policy "Students can view own attendance"
  on public.attendance_records for select
  using (auth.uid()::text = student_id::text);

drop policy if exists "Students can insert own attendance" on public.attendance_records;
create policy "Students can insert own attendance"
  on public.attendance_records for insert
  with check (auth.uid()::text = student_id::text);

drop policy if exists "Students can update own attendance" on public.attendance_records;
create policy "Students can update own attendance"
  on public.attendance_records for update
  using (auth.uid()::text = student_id::text);

-- 4. TIMETABLE SLOTS TABLE
create table public.timetable_slots (
  id bigint generated always as identity primary key,
  subject_id bigint references public.subjects(id) on delete cascade,
  day_of_week int not null,
  start_time time not null,
  end_time time not null,
  classroom text not null,
  week_start date,
  course text not null,
  department text not null,
  year int not null,
  semester int not null,
  section text not null
);

alter table public.timetable_slots enable row level security;

drop policy if exists "Anyone can view timetable slots" on public.timetable_slots;
create policy "Anyone can view timetable slots"
  on public.timetable_slots for select
  using (true);

-- 5. ATTENDANCE LOGS TABLE
create table public.attendance_logs (
  id bigint generated always as identity primary key,
  student_id uuid references public.profiles(id) on delete cascade,
  slot_id bigint references public.timetable_slots(id) on delete cascade,
  status text default 'not_marked',
  marked_at timestamptz default now()
);

alter table public.attendance_logs enable row level security;

drop policy if exists "Students can view own logs" on public.attendance_logs;
create policy "Students can view own logs"
  on public.attendance_logs for select
  using (auth.uid()::text = student_id::text);

drop policy if exists "Students can manage own logs" on public.attendance_logs;
create policy "Students can manage own logs"
  on public.attendance_logs for all
  using (auth.uid()::text = student_id::text);
