
-- Allow anyone to submit (no login required)
DROP POLICY IF EXISTS "Users can insert submissions" ON public.submissions;
CREATE POLICY "Anyone can submit"
  ON public.submissions FOR INSERT
  WITH CHECK (true);

-- All authenticated users can view all submissions (not just own)
DROP POLICY IF EXISTS "Users can view own submissions" ON public.submissions;
CREATE POLICY "Authenticated can view submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() IS NOT NULL OR status = 'approved');

-- Add image_url column for non-text works (calligraphy, photography, etc.)
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS image_url text;

-- Add recommend_count for member recommendations
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS recommend_count integer DEFAULT 0;
