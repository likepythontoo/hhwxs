
-- Allow anyone (including non-authenticated) to insert check-ins
DROP POLICY IF EXISTS "Authenticated can check in" ON public.check_ins;
CREATE POLICY "Anyone can check in"
  ON public.check_ins FOR INSERT
  WITH CHECK (true);
