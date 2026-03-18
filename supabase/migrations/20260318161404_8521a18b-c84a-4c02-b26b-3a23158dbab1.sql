
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS major text,
  ADD COLUMN IF NOT EXISTS introduction text,
  ADD COLUMN IF NOT EXISTS literary_tags text[],
  ADD COLUMN IF NOT EXISTS memoir text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS is_claimed boolean DEFAULT false;

-- Minister can manage members
CREATE POLICY "Ministers can manage members"
ON public.members
FOR ALL
TO public
USING (has_role(auth.uid(), 'minister'::app_role));
