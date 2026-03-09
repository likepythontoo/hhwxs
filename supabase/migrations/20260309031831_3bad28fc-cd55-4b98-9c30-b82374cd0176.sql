
-- 1. Fix submissions bucket: restrict uploads to authenticated users
DROP POLICY IF EXISTS "Anyone can upload submission files" ON storage.objects;
CREATE POLICY "Authenticated can upload submission files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'submissions'
    AND (storage.foldername(name))[1] != '..'
  );

-- 2. Fix check-in RLS: prevent user_id injection
DROP POLICY IF EXISTS "Anyone can check in" ON public.check_ins;

CREATE POLICY "Authenticated users can check in"
  ON public.check_ins FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anonymous users can check in"
  ON public.check_ins FOR INSERT TO anon
  WITH CHECK (user_id IS NULL);

-- 3. Create RPC to validate check-in codes without exposing them publicly
CREATE OR REPLACE FUNCTION public.validate_checkin_code(p_code text)
  RETURNS TABLE(event_id uuid, event_title text)
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
AS $$
  SELECT id, title FROM events
  WHERE check_in_code = upper(trim(p_code))
    AND is_active = true
  LIMIT 1;
$$;
