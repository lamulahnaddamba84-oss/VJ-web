
-- Grant execute on has_role so RLS policies calling it work for regular users
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;

-- Tighten Series admin-manage policy to authenticated role (was 'public')
DROP POLICY IF EXISTS "Admins manage series" ON public.series;
CREATE POLICY "Admins manage series" ON public.series
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Tighten Downloads admin view + user own-manage to authenticated role
DROP POLICY IF EXISTS "Admins view downloads" ON public.downloads;
DROP POLICY IF EXISTS "Users manage own downloads" ON public.downloads;
CREATE POLICY "Admins view downloads" ON public.downloads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Users manage own downloads" ON public.downloads
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
