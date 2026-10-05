create type public.app_role as enum (
  'commissioner','deputy_commissioner','disaster_officer','zone_officer',
  'dept_officer','field_inspector','shelter_manager','asset_manager','volunteer','viewer'
);

create table public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  avatar_url text,
  title text,
  department text,
  zone_id text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles readable by authenticated" on public.profiles for select to authenticated using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select, insert on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create or replace function public.can_edit(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role in ('commissioner','deputy_commissioner','disaster_officer','zone_officer',
                   'dept_officer','field_inspector','shelter_manager','asset_manager')
  )
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'commissioner'));
create policy "claim own role" on public.user_roles for insert to authenticated with check (auth.uid() = user_id);

create table public.zones (
  id text primary key,
  number int not null,
  name text not null,
  readiness_score int not null default 0,
  status text not null default 'pending',
  pending_task_count int not null default 0,
  officer_name text, officer_contact text, officer_role text,
  lat double precision, lng double precision,
  population_at_risk int, shelter_count int, asset_count int,
  dept_breakdown jsonb not null default '{}'::jsonb,
  extra jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.assets (
  id text primary key,
  qr_id text, name text not null, type text not null,
  zone_id text references public.zones(id) on delete cascade,
  zone_name text, status text not null default 'pending-check',
  last_inspection_date text, operator text, location text,
  lat double precision, lng double precision,
  maintenance_history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.shelters (
  id text primary key,
  name text not null,
  zone_id text references public.zones(id) on delete cascade,
  zone_name text, capacity int, current_occupancy int, address text,
  lat double precision, lng double precision,
  contact_person text, contact_phone text,
  status text not null default 'preparing',
  amenities jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  zone_id text, zone_name text, officer_name text, department text,
  gps_coordinates text, photo_url text, remarks text,
  status text not null default 'pending', item_checked text,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null, description text,
  zone_id text, zone_name text,
  severity text not null default 'info',
  resolved boolean not null default false,
  department text, action_taken text, resolved_at text,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid, user_name text, role text,
  action text not null, details text, type text not null default 'auth',
  created_at timestamptz not null default now()
);

create table public.checklist_templates (
  id text primary key,
  department text not null, title text not null, frequency text,
  mandatory_photo boolean not null default false,
  active boolean not null default true
);

create table public.department_stats (
  department text primary key,
  completion_rate int not null default 0,
  ready_items int not null default 0,
  total_items int not null default 0
);

do $$
declare t text;
begin
  foreach t in array array['zones','assets','shelters','inspections','alerts','audit_logs','checklist_templates','department_stats']
  loop
    execute format('grant select on public.%I to anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "public read %1$s" on public.%1$I for select using (true)', t);
    execute format('create policy "editors insert %1$s" on public.%1$I for insert to authenticated with check (public.can_edit(auth.uid()))', t);
    execute format('create policy "editors update %1$s" on public.%1$I for update to authenticated using (public.can_edit(auth.uid())) with check (public.can_edit(auth.uid()))', t);
    execute format('create policy "admins delete %1$s" on public.%1$I for delete to authenticated using (public.has_role(auth.uid(),''commissioner''))', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
    execute format('alter table public.%I replica identity full', t);
  end loop;
end $$;