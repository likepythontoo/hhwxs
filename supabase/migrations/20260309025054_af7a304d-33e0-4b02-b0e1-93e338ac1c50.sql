
-- Create journals table
CREATE TABLE public.journals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  issue_number TEXT,
  year INTEGER NOT NULL,
  month INTEGER,
  description TEXT,
  cover_url TEXT,
  pdf_url TEXT,
  table_of_contents TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;

-- Published journals are viewable by everyone
CREATE POLICY "Published journals viewable by everyone"
  ON public.journals FOR SELECT
  USING (is_published = true);

-- Admin can manage journals
CREATE POLICY "Admin access can manage journals"
  ON public.journals FOR ALL
  USING (has_admin_access(auth.uid()));

-- Ministers can manage journals
CREATE POLICY "Ministers can manage journals"
  ON public.journals FOR ALL
  USING (has_role(auth.uid(), 'minister'::app_role));

-- Create storage bucket for journals
INSERT INTO storage.buckets (id, name, public)
VALUES ('journals', 'journals', true);

-- Storage policies: anyone can view
CREATE POLICY "Anyone can view journal files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'journals');

-- Admin/ministers can upload
CREATE POLICY "Management can upload journal files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'journals' AND has_management_access(auth.uid()));

-- Admin can delete journal files
CREATE POLICY "Admin can delete journal files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'journals' AND has_admin_access(auth.uid()));
