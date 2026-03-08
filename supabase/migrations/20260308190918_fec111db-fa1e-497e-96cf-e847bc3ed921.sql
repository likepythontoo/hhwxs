
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS college text;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS major text;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS class_name text;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS student_id text;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS phone text;
