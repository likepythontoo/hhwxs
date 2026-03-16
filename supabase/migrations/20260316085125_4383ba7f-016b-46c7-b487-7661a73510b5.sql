
-- Create members table
CREATE TABLE public.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  term text NOT NULL,
  role_title text,
  bio text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members viewable by everyone" ON public.members
  FOR SELECT TO public USING (true);

CREATE POLICY "Admin can manage members" ON public.members
  FOR ALL TO public USING (has_admin_access(auth.uid()));

CREATE POLICY "Users can update own member record" ON public.members
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create member_works junction table
CREATE TABLE public.member_works (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(member_id, submission_id)
);

ALTER TABLE public.member_works ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member works viewable by everyone" ON public.member_works
  FOR SELECT TO public USING (true);

CREATE POLICY "Admin can manage member works" ON public.member_works
  FOR ALL TO public USING (has_admin_access(auth.uid()));
