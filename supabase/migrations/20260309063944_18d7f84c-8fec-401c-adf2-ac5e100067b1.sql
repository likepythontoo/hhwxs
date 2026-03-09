
-- Fix 1: Minister cross-department scoping for recruitment_applications
DROP POLICY IF EXISTS "Ministers can view applications" ON public.recruitment_applications;

CREATE POLICY "Ministers can view dept applications"
  ON public.recruitment_applications FOR SELECT
  TO authenticated
  USING (
    has_admin_access(auth.uid())
    OR (
      has_role(auth.uid(), 'minister'::app_role)
      AND is_department_head(auth.uid(), department_id)
    )
  );

-- Also allow ministers to update applications in their department
CREATE POLICY "Ministers can update dept applications"
  ON public.recruitment_applications FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'minister'::app_role)
    AND is_department_head(auth.uid(), department_id)
  );

-- Fix 2: Make submissions bucket private
UPDATE storage.buckets SET public = false WHERE id = 'submissions';

DROP POLICY IF EXISTS "Anyone can read submission files" ON storage.objects;

CREATE POLICY "Management can read submission files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'submissions'
    AND has_management_access(auth.uid())
  );
