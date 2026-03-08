
-- Create storage bucket for submission attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', true);

-- Anyone can upload to submissions bucket
CREATE POLICY "Anyone can upload submission files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'submissions');

-- Anyone can read submission files
CREATE POLICY "Anyone can read submission files"
ON storage.objects FOR SELECT
USING (bucket_id = 'submissions');

-- Add attachment_url column
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS attachment_url text;
