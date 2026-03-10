
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  page text DEFAULT '/'
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a visit
CREATE POLICY "Anyone can record visit" ON public.site_visits FOR INSERT TO public WITH CHECK (true);

-- Anyone can read visit count
CREATE POLICY "Anyone can read visits" ON public.site_visits FOR SELECT TO public USING (true);
