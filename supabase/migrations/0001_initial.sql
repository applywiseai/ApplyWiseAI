create extension if not exists "pgcrypto";

create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null default 'USER' check (role in ('ADMIN','USER')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text default '',
  location text default '',
  linkedin text default '',
  portfolio text default '',
  target_roles text default '',
  target_locations text default '',
  target_industries text default '',
  skills text default '',
  summary text default '',
  master_resume_file_url text,
  master_resume_filename text,
  master_resume_text text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_profile_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  profile_id uuid not null references public.client_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, profile_id)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.client_profiles(id) on delete restrict,
  created_by uuid not null references public.app_users(id) on delete restrict,
  url text not null,
  company text default '',
  job_title text default '',
  location text default '',
  salary text default '',
  employment_type text default '',
  description text default '',
  responsibilities jsonb not null default '[]'::jsonb,
  requirements jsonb not null default '[]'::jsonb,
  skills jsonb not null default '[]'::jsonb,
  preferred_skills jsonb not null default '[]'::jsonb,
  experience_requirements jsonb not null default '[]'::jsonb,
  raw_text text default '',
  status text not null default 'Draft' check (status in ('Draft','Job Extracted','Resume Ready','Applied','Interview','Rejected','Offer','Withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generated_resumes (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  profile_id uuid not null references public.client_profiles(id) on delete restrict,
  created_by uuid not null references public.app_users(id) on delete restrict,
  file_path text not null,
  filename text not null,
  version integer not null,
  ai_resume_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(application_id, version)
);

create index if not exists idx_assignments_user on public.user_profile_assignments(user_id);
create index if not exists idx_assignments_profile on public.user_profile_assignments(profile_id);
create index if not exists idx_apps_created_by on public.applications(created_by);
create index if not exists idx_apps_profile on public.applications(profile_id);
create index if not exists idx_apps_status on public.applications(status);
create index if not exists idx_resumes_application on public.generated_resumes(application_id);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.app_users where id=auth.uid() and role='ADMIN' and is_active=true);
$$;

create or replace function public.has_profile_access(p_profile uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.is_admin() or exists(
    select 1 from public.user_profile_assignments a
    join public.app_users u on u.id=a.user_id
    where a.user_id=auth.uid() and a.profile_id=p_profile and u.is_active=true
  );
$$;

alter table public.app_users enable row level security;
alter table public.client_profiles enable row level security;
alter table public.user_profile_assignments enable row level security;
alter table public.applications enable row level security;
alter table public.generated_resumes enable row level security;

create policy app_users_select on public.app_users for select using (id=auth.uid() or public.is_admin());
create policy app_users_admin_write on public.app_users for all using (public.is_admin()) with check (public.is_admin());

create policy profiles_select on public.client_profiles for select using (public.has_profile_access(id));
create policy profiles_admin_write on public.client_profiles for all using (public.is_admin()) with check (public.is_admin());

create policy assignments_select on public.user_profile_assignments for select using (user_id=auth.uid() or public.is_admin());
create policy assignments_admin_write on public.user_profile_assignments for all using (public.is_admin()) with check (public.is_admin());

create policy applications_select on public.applications for select using (public.is_admin() or created_by=auth.uid() or public.has_profile_access(profile_id));
create policy applications_insert on public.applications for insert with check (created_by=auth.uid() and public.has_profile_access(profile_id));
create policy applications_admin_update on public.applications for update using (public.is_admin()) with check (public.is_admin());
create policy applications_admin_delete on public.applications for delete using (public.is_admin());

create policy resumes_select on public.generated_resumes for select using (public.is_admin() or created_by=auth.uid() or public.has_profile_access(profile_id));
create policy resumes_admin_write on public.generated_resumes for all using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id,name,public) values ('master-resumes','master-resumes',false) on conflict (id) do nothing;
insert into storage.buckets (id,name,public) values ('generated-resumes','generated-resumes',false) on conflict (id) do nothing;

-- Storage is intentionally private. Application routes use the service role only after
-- authorization checks and issue five-minute signed URLs.
-- Optional direct-browser policies can be added later if direct Storage APIs are needed.
