create or replace function public.tmp_seed_import(payload jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.zones select * from jsonb_populate_recordset(null::public.zones, coalesce(payload->'zones','[]'::jsonb)) on conflict (id) do nothing;
  insert into public.assets select * from jsonb_populate_recordset(null::public.assets, coalesce(payload->'assets','[]'::jsonb)) on conflict (id) do nothing;
  insert into public.shelters select * from jsonb_populate_recordset(null::public.shelters, coalesce(payload->'shelters','[]'::jsonb)) on conflict (id) do nothing;
  insert into public.checklist_templates select * from jsonb_populate_recordset(null::public.checklist_templates, coalesce(payload->'checklist_templates','[]'::jsonb)) on conflict (id) do nothing;
  insert into public.department_stats select * from jsonb_populate_recordset(null::public.department_stats, coalesce(payload->'department_stats','[]'::jsonb)) on conflict (department) do nothing;
  insert into public.inspections (zone_id, zone_name, officer_name, department, gps_coordinates, photo_url, remarks, status, item_checked)
    select zone_id, zone_name, officer_name, department, gps_coordinates, photo_url, remarks, status, item_checked
    from jsonb_populate_recordset(null::public.inspections, coalesce(payload->'inspections','[]'::jsonb));
  insert into public.alerts (title, description, zone_id, zone_name, severity, resolved, department, action_taken, resolved_at)
    select title, description, zone_id, zone_name, severity, resolved, department, action_taken, resolved_at
    from jsonb_populate_recordset(null::public.alerts, coalesce(payload->'alerts','[]'::jsonb));
  insert into public.audit_logs (user_name, role, action, details, type)
    select user_name, role, action, details, type
    from jsonb_populate_recordset(null::public.audit_logs, coalesce(payload->'audit_logs','[]'::jsonb));
  return 'ok';
end;
$$;

grant execute on function public.tmp_seed_import(jsonb) to anon, authenticated, service_role;