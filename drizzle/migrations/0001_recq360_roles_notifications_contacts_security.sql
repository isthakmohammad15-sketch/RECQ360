-- helper functions -------------------------------------------------------
create or replace function public.my_zone(_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select zone_id from public.profiles where id = _user_id
$$;

create or replace function public.my_dept(_user_id uuid)
returns text language sql stable security definer set search_path = public as $$
  select department from public.profiles where id = _user_id
$$;

create or replace function public.is_senior(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and role in ('commissioner','deputy_commissioner','disaster_officer')
  )
$$;

create or replace function public.has_any_role(_user_id uuid, _roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = any(_roles)
  )
$$;

revoke execute on function public.my_zone(uuid), public.my_dept(uuid), public.is_senior(uuid), public.has_any_role(uuid, public.app_role[]) from public, anon;
grant execute on function public.my_zone(uuid), public.my_dept(uuid), public.is_senior(uuid), public.has_any_role(uuid, public.app_role[]) to authenticated, service_role;

create or replace function public.bootstrap_my_role()
returns public.app_role language plpgsql security definer set search_path = public as $$
declare existing public.app_role;
        assigned public.app_role;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select role into existing from public.user_roles where user_id = auth.uid() limit 1;
  if existing is not null then return existing; end if;
  if not exists (select 1 from public.user_roles) then
    assigned := 'commissioner';
  else
    assigned := 'viewer';
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), assigned)
    on conflict (user_id, role) do nothing;
  return assigned;
end;
$$;
revoke execute on function public.bootstrap_my_role() from public, anon;
grant execute on function public.bootstrap_my_role() to authenticated;

grant update, delete on public.user_roles to authenticated;
create policy "commissioner manages roles insert" on public.user_roles for insert to authenticated
  with check (public.has_role(auth.uid(),'commissioner'));
create policy "commissioner manages roles update" on public.user_roles for update to authenticated
  using (public.has_role(auth.uid(),'commissioner')) with check (public.has_role(auth.uid(),'commissioner'));
create policy "commissioner manages roles delete" on public.user_roles for delete to authenticated
  using (public.has_role(auth.uid(),'commissioner'));
create policy "senior updates profiles" on public.profiles for update to authenticated
  using (public.is_senior(auth.uid())) with check (public.is_senior(auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['zones','assets','shelters','inspections','alerts','checklist_templates','department_stats']
  loop
    execute format('drop policy if exists "editors insert %1$s" on public.%1$I', t);
    execute format('drop policy if exists "editors update %1$s" on public.%1$I', t);
  end loop;
end $$;

create policy "zones insert" on public.zones for insert to authenticated
  with check (public.is_senior(auth.uid()));
create policy "zones update" on public.zones for update to authenticated
  using (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'zone_officer') and id = public.my_zone(auth.uid())))
  with check (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'zone_officer') and id = public.my_zone(auth.uid())));

create policy "assets insert" on public.assets for insert to authenticated
  with check (public.is_senior(auth.uid()) or public.has_role(auth.uid(),'asset_manager')
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())));
create policy "assets update" on public.assets for update to authenticated
  using (public.is_senior(auth.uid()) or public.has_role(auth.uid(),'asset_manager')
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())))
  with check (public.is_senior(auth.uid()) or public.has_role(auth.uid(),'asset_manager')
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())));

create policy "shelters insert" on public.shelters for insert to authenticated
  with check (public.is_senior(auth.uid()) or public.has_role(auth.uid(),'shelter_manager')
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())));
create policy "shelters update" on public.shelters for update to authenticated
  using (public.is_senior(auth.uid()) or public.has_role(auth.uid(),'shelter_manager')
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())))
  with check (public.is_senior(auth.uid()) or public.has_role(auth.uid(),'shelter_manager')
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())));

create policy "inspections insert" on public.inspections for insert to authenticated
  with check (public.has_any_role(auth.uid(), array['field_inspector','zone_officer','dept_officer','disaster_officer','shelter_manager','asset_manager']::public.app_role[])
     and created_by = auth.uid());
create policy "inspections update own" on public.inspections for update to authenticated
  using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "alerts insert" on public.alerts for insert to authenticated
  with check (public.can_edit(auth.uid()));
create policy "alerts update" on public.alerts for update to authenticated
  using (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())))
  with check (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'zone_officer') and zone_id = public.my_zone(auth.uid())));

create policy "checklists insert" on public.checklist_templates for insert to authenticated
  with check (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'dept_officer') and department = public.my_dept(auth.uid())));
create policy "checklists update" on public.checklist_templates for update to authenticated
  using (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'dept_officer') and department = public.my_dept(auth.uid())))
  with check (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'dept_officer') and department = public.my_dept(auth.uid())));

create policy "dept stats insert" on public.department_stats for insert to authenticated
  with check (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'dept_officer') and department = public.my_dept(auth.uid())));
create policy "dept stats update" on public.department_stats for update to authenticated
  using (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'dept_officer') and department = public.my_dept(auth.uid())))
  with check (public.is_senior(auth.uid())
     or (public.has_role(auth.uid(),'dept_officer') and department = public.my_dept(auth.uid())));

create policy "audit insert own" on public.audit_logs for insert to authenticated
  with check (user_id = auth.uid() or user_id is null);

-- notifications ------------------------------------------------------------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  severity text not null default 'info',
  link_tab text,
  target_role public.app_role,
  target_user uuid,
  created_by uuid,
  created_at timestamptz not null default now()
);
grant select, insert on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications visible" on public.notifications for select to authenticated
  using (
    (target_user is null and target_role is null)
    or target_user = auth.uid()
    or (target_role is not null and public.has_role(auth.uid(), target_role))
  );
create policy "notifications insert" on public.notifications for insert to authenticated
  with check (public.can_edit(auth.uid()));

create table public.notification_reads (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null,
  read_at timestamptz not null default now(),
  primary key (notification_id, user_id)
);
grant select, insert, delete on public.notification_reads to authenticated;
grant all on public.notification_reads to service_role;
alter table public.notification_reads enable row level security;
create policy "own reads select" on public.notification_reads for select to authenticated using (user_id = auth.uid());
create policy "own reads insert" on public.notification_reads for insert to authenticated with check (user_id = auth.uid());
create policy "own reads delete" on public.notification_reads for delete to authenticated using (user_id = auth.uid());

alter publication supabase_realtime add table public.notifications;
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.notification_reads;
alter table public.notification_reads replica identity full;
alter publication supabase_realtime add table public.profiles;
alter table public.profiles replica identity full;
alter publication supabase_realtime add table public.user_roles;
alter table public.user_roles replica identity full;

-- profile fields, emergency contacts, role claiming --------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS selected_role public.app_role,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS first_login_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_login_at timestamptz;

CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text,
  department text,
  zone_id text,
  zone_name text,
  phone text NOT NULL,
  alt_phone text,
  email text,
  availability text NOT NULL DEFAULT '24x7',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO authenticated;
GRANT SELECT ON public.emergency_contacts TO anon;
GRANT ALL ON public.emergency_contacts TO service_role;

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read emergency_contacts" ON public.emergency_contacts
  FOR SELECT USING (true);

CREATE POLICY "contacts insert" ON public.emergency_contacts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_senior(auth.uid())
    OR (public.has_role(auth.uid(), 'zone_officer') AND zone_id = public.my_zone(auth.uid())));

CREATE POLICY "contacts update" ON public.emergency_contacts
  FOR UPDATE TO authenticated
  USING (public.is_senior(auth.uid())
    OR (public.has_role(auth.uid(), 'zone_officer') AND zone_id = public.my_zone(auth.uid())))
  WITH CHECK (public.is_senior(auth.uid())
    OR (public.has_role(auth.uid(), 'zone_officer') AND zone_id = public.my_zone(auth.uid())));

CREATE POLICY "contacts delete" ON public.emergency_contacts
  FOR DELETE TO authenticated
  USING (public.is_senior(auth.uid()));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS emergency_contacts_touch ON public.emergency_contacts;
CREATE TRIGGER emergency_contacts_touch BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_contacts;

-- security hardening ---------------------------------------------------------
DO $fix$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'alerts','assets','checklist_templates','department_stats',
    'emergency_contacts','inspections','shelters','zones'
  ]
  LOOP
    EXECUTE format('drop policy if exists "public read %1$s" on public.%1$I', t);
    EXECUTE format(
      'create policy "authenticated read %1$s" on public.%1$I for select to authenticated using (true)', t);
  END LOOP;
END $fix$;

DROP POLICY IF EXISTS "public read audit_logs" ON public.audit_logs;
CREATE POLICY "seniors read audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_senior(auth.uid()) OR public.has_role(auth.uid(), 'commissioner'));

DROP POLICY IF EXISTS "profiles readable by authenticated" ON public.profiles;
CREATE POLICY "profiles scoped read" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_senior(auth.uid()));

CREATE OR REPLACE FUNCTION public.claim_selected_role(_role public.app_role)
RETURNS public.app_role
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $fn$
DECLARE existing public.app_role;
        assigned public.app_role;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  SELECT role INTO existing FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
  IF existing IS NOT NULL THEN RETURN existing; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles) THEN
    assigned := 'commissioner';
  ELSE
    assigned := COALESCE(_role, 'viewer');
    IF assigned IN ('commissioner', 'deputy_commissioner') THEN
      assigned := 'viewer';
    END IF;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), assigned)
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN assigned;
END; $fn$;

DO $fix2$
DECLARE f text;
BEGIN
  FOREACH f IN ARRAY ARRAY[
    'has_role(uuid,public.app_role)',
    'can_edit(uuid)',
    'my_zone(uuid)',
    'my_dept(uuid)',
    'is_senior(uuid)',
    'has_any_role(uuid,public.app_role[])',
    'bootstrap_my_role()',
    'claim_selected_role(public.app_role)',
    'touch_updated_at()'
  ]
  LOOP
    EXECUTE format('revoke execute on function public.%s from anon, public', f);
    EXECUTE format('grant execute on function public.%s to authenticated, service_role', f);
  END LOOP;
END $fix2$;