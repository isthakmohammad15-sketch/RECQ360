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

CREATE OR REPLACE FUNCTION public.claim_selected_role(_role public.app_role)
RETURNS public.app_role
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), assigned)
    ON CONFLICT (user_id, role) DO NOTHING;
  RETURN assigned;
END; $$;