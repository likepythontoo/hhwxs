
-- Add type column to journals to distinguish 期刊 vs 报刊
ALTER TABLE public.journals ADD COLUMN type TEXT NOT NULL DEFAULT '期刊';

-- Create journal_articles table to link journals with submissions
CREATE TABLE public.journal_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_id UUID NOT NULL REFERENCES public.journals(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  section_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(journal_id, submission_id)
);

ALTER TABLE public.journal_articles ENABLE ROW LEVEL SECURITY;

-- Everyone can view articles of published journals
CREATE POLICY "Published journal articles viewable by everyone"
  ON public.journal_articles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.journals WHERE id = journal_id AND is_published = true
  ));

-- Admin can manage
CREATE POLICY "Admin access can manage journal articles"
  ON public.journal_articles FOR ALL
  USING (has_admin_access(auth.uid()));

-- Ministers can manage
CREATE POLICY "Ministers can manage journal articles"
  ON public.journal_articles FOR ALL
  USING (has_role(auth.uid(), 'minister'::app_role));
