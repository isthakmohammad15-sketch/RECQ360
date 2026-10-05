-- RECQ360 Disaster Response Command Center
-- Migration: 20261005184500_open_rls_for_command_center.sql
-- Purpose: Allow disaster response personnel, field officers, and command operators 
-- to insert, update, and manage operational zones, assets, shelters, and alerts without RLS permission rejection.

-- 1. ZONES POLICIES
DROP POLICY IF EXISTS "zones insert" ON public.zones;
DROP POLICY IF EXISTS "zones update" ON public.zones;
DROP POLICY IF EXISTS "zones delete" ON public.zones;
DROP POLICY IF EXISTS "editors insert zones" ON public.zones;
DROP POLICY IF EXISTS "editors update zones" ON public.zones;

CREATE POLICY "zones insert" ON public.zones FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "zones update" ON public.zones FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "zones delete" ON public.zones FOR DELETE TO anon, authenticated USING (true);

-- 2. ASSETS POLICIES
DROP POLICY IF EXISTS "assets insert" ON public.assets;
DROP POLICY IF EXISTS "assets update" ON public.assets;
DROP POLICY IF EXISTS "assets delete" ON public.assets;

CREATE POLICY "assets insert" ON public.assets FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "assets update" ON public.assets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "assets delete" ON public.assets FOR DELETE TO anon, authenticated USING (true);

-- 3. SHELTERS POLICIES
DROP POLICY IF EXISTS "shelters insert" ON public.shelters;
DROP POLICY IF EXISTS "shelters update" ON public.shelters;
DROP POLICY IF EXISTS "shelters delete" ON public.shelters;

CREATE POLICY "shelters insert" ON public.shelters FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "shelters update" ON public.shelters FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "shelters delete" ON public.shelters FOR DELETE TO anon, authenticated USING (true);

-- 4. ALERTS POLICIES
DROP POLICY IF EXISTS "alerts insert" ON public.alerts;
DROP POLICY IF EXISTS "alerts update" ON public.alerts;

CREATE POLICY "alerts insert" ON public.alerts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "alerts update" ON public.alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. INSPECTIONS POLICIES
DROP POLICY IF EXISTS "inspections insert" ON public.inspections;
DROP POLICY IF EXISTS "inspections update own" ON public.inspections;

CREATE POLICY "inspections insert" ON public.inspections FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "inspections update" ON public.inspections FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 6. EMERGENCY CONTACTS & AUDIT LOGS
DROP POLICY IF EXISTS "emergency_contacts insert" ON public.emergency_contacts;
DROP POLICY IF EXISTS "emergency_contacts update" ON public.emergency_contacts;

CREATE POLICY "emergency_contacts insert" ON public.emergency_contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "emergency_contacts update" ON public.emergency_contacts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs insert" ON public.audit_logs;
CREATE POLICY "audit_logs insert" ON public.audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 7. CHECKLIST TEMPLATES
DROP POLICY IF EXISTS "checklist_templates insert" ON public.checklist_templates;
DROP POLICY IF EXISTS "checklist_templates update" ON public.checklist_templates;

CREATE POLICY "checklist_templates insert" ON public.checklist_templates FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "checklist_templates update" ON public.checklist_templates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. GRANT DML RIGHTS TO ROLES
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zones TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shelters TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inspections TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_contacts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_templates TO anon, authenticated;
