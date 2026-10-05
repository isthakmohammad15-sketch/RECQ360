REVOKE EXECUTE ON FUNCTION public.claim_selected_role(public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_selected_role(public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM public, anon;