
CREATE TABLE public.member_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  note text,
  reviewer_id uuid,
  reviewer_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

ALTER TABLE public.member_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can submit claims"
  ON public.member_claims FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own claims"
  ON public.member_claims FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage claims"
  ON public.member_claims FOR ALL
  USING (has_admin_access(auth.uid()));
