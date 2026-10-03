-- Sahyadri Student Portal schema for Supabase (Postgres)
-- Run in the SQL editor, then set DATABASE_URL to the pooled connection string.

create table if not exists users (
  id bigint generated always as identity primary key,
  email text unique not null,
  password_hash text not null,
  role text not null default 'student',
  name text not null,
  usn text unique,
  photo_url text,
  course text,
  department text,
  year int,
  semester int,
  section text,
  interests text,
  created_at timestamptz default now()
);

create table if not exists subjects (
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

create table if not exists attendance_records (
  id bigint generated always as identity primary key,
  student_id bigint references users(id) on delete cascade,
  subject_id bigint references subjects(id) on delete cascade,
  total_classes int default 0,
  classes_attended int default 0,
  target_percentage float default 85,
  unique (student_id, subject_id)
);

create table if not exists timetable_slots (
  id bigint generated always as identity primary key,
  subject_id bigint references subjects(id) on delete cascade,
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

create table if not exists attendance_logs (
  id bigint generated always as identity primary key,
  student_id bigint references users(id) on delete cascade,
  slot_id bigint references timetable_slots(id) on delete cascade,
  status text default 'not_marked',
  marked_at timestamptz default now()
);

alter table users enable row level security;
alter table attendance_records enable row level security;
-- API uses the service role / database password; keep RLS policies tight for direct client access.
