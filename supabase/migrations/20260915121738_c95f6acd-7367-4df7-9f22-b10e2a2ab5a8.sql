-- ============ member_photos ============
CREATE TABLE public.member_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  taken_on DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_by UUID,
  reviewer_id UUID,
  reviewer_note TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_photos TO authenticated;
GRANT ALL ON public.member_photos TO service_role;
ALTER TABLE public.member_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved photos are public" ON public.member_photos
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners and managers read own photos" ON public.member_photos
  FOR SELECT TO authenticated USING (
    submitted_by = auth.uid()
    OR public.has_management_access(auth.uid())
    OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
  );
CREATE POLICY "Users submit photos as pending" ON public.member_photos
  FOR INSERT TO authenticated WITH CHECK (
    submitted_by = auth.uid() AND (status = 'pending' OR public.has_management_access(auth.uid()))
  );
CREATE POLICY "Owners edit pending photos" ON public.member_photos
  FOR UPDATE TO authenticated USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');
CREATE POLICY "Managers manage photos" ON public.member_photos
  FOR UPDATE TO authenticated USING (public.has_management_access(auth.uid()))
  WITH CHECK (public.has_management_access(auth.uid()));
CREATE POLICY "Owners or admins delete photos" ON public.member_photos
  FOR DELETE TO authenticated USING (
    (submitted_by = auth.uid() AND status = 'pending') OR public.has_admin_access(auth.uid())
  );
CREATE TRIGGER update_member_photos_updated_at BEFORE UPDATE ON public.member_photos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ member_timeline ============
CREATE TABLE public.member_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  happened_on DATE,
  year_label TEXT,
  kind TEXT NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_by UUID,
  reviewer_id UUID,
  reviewer_note TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_timeline TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_timeline TO authenticated;
GRANT ALL ON public.member_timeline TO service_role;
ALTER TABLE public.member_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved timeline is public" ON public.member_timeline
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners and managers read own timeline" ON public.member_timeline
  FOR SELECT TO authenticated USING (
    submitted_by = auth.uid()
    OR public.has_management_access(auth.uid())
    OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
  );
CREATE POLICY "Users submit timeline as pending" ON public.member_timeline
  FOR INSERT TO authenticated WITH CHECK (
    submitted_by = auth.uid() AND (status = 'pending' OR public.has_management_access(auth.uid()))
  );
CREATE POLICY "Owners edit pending timeline" ON public.member_timeline
  FOR UPDATE TO authenticated USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');
CREATE POLICY "Managers manage timeline" ON public.member_timeline
  FOR UPDATE TO authenticated USING (public.has_management_access(auth.uid()))
  WITH CHECK (public.has_management_access(auth.uid()));
CREATE POLICY "Owners or admins delete timeline" ON public.member_timeline
  FOR DELETE TO authenticated USING (
    (submitted_by = auth.uid() AND status = 'pending') OR public.has_admin_access(auth.uid())
  );
CREATE TRIGGER update_member_timeline_updated_at BEFORE UPDATE ON public.member_timeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ member_honors ============
CREATE TABLE public.member_honors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  year INTEGER,
  title TEXT NOT NULL,
  issuer TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_by UUID,
  reviewer_id UUID,
  reviewer_note TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_honors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_honors TO authenticated;
GRANT ALL ON public.member_honors TO service_role;
ALTER TABLE public.member_honors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved honors are public" ON public.member_honors
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Owners and managers read own honors" ON public.member_honors
  FOR SELECT TO authenticated USING (
    submitted_by = auth.uid()
    OR public.has_management_access(auth.uid())
    OR EXISTS (SELECT 1 FROM public.members m WHERE m.id = member_id AND m.user_id = auth.uid())
  );
CREATE POLICY "Users submit honors as pending" ON public.member_honors
  FOR INSERT TO authenticated WITH CHECK (
    submitted_by = auth.uid() AND (status = 'pending' OR public.has_management_access(auth.uid()))
  );
CREATE POLICY "Owners edit pending honors" ON public.member_honors
  FOR UPDATE TO authenticated USING (submitted_by = auth.uid() AND status = 'pending')
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending');
CREATE POLICY "Managers manage honors" ON public.member_honors
  FOR UPDATE TO authenticated USING (public.has_management_access(auth.uid()))
  WITH CHECK (public.has_management_access(auth.uid()));
CREATE POLICY "Owners or admins delete honors" ON public.member_honors
  FOR DELETE TO authenticated USING (
    (submitted_by = auth.uid() AND status = 'pending') OR public.has_admin_access(auth.uid())
  );
CREATE TRIGGER update_member_honors_updated_at BEFORE UPDATE ON public.member_honors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ member_messages ============
CREATE TABLE public.member_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_member_id UUID REFERENCES public.members(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id UUID,
  reviewer_note TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_messages TO authenticated;
GRANT ALL ON public.member_messages TO service_role;
ALTER TABLE public.member_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved messages are public" ON public.member_messages
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors and managers read messages" ON public.member_messages
  FOR SELECT TO authenticated USING (
    author_id = auth.uid() OR public.has_management_access(auth.uid())
  );
CREATE POLICY "Users submit messages as pending" ON public.member_messages
  FOR INSERT TO authenticated WITH CHECK (
    author_id = auth.uid() AND (status = 'pending' OR public.has_management_access(auth.uid()))
  );
CREATE POLICY "Managers manage messages" ON public.member_messages
  FOR UPDATE TO authenticated USING (public.has_management_access(auth.uid()))
  WITH CHECK (public.has_management_access(auth.uid()));
CREATE POLICY "Authors or admins delete messages" ON public.member_messages
  FOR DELETE TO authenticated USING (
    (author_id = auth.uid() AND status = 'pending') OR public.has_admin_access(auth.uid())
  );
CREATE TRIGGER update_member_messages_updated_at BEFORE UPDATE ON public.member_messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- like counter, safe for any visitor on approved messages
CREATE OR REPLACE FUNCTION public.like_member_message(p_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.member_messages
  SET like_count = like_count + 1
  WHERE id = p_id AND status = 'approved'
  RETURNING like_count;
$$;

-- ============ alumni_lookups ============
CREATE TABLE public.alumni_lookups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  term TEXT,
  target_name TEXT NOT NULL,
  content TEXT NOT NULL,
  contact TEXT,
  is_resolved BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id UUID,
  reviewer_note TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alumni_lookups TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumni_lookups TO authenticated;
GRANT ALL ON public.alumni_lookups TO service_role;
ALTER TABLE public.alumni_lookups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved lookups are public" ON public.alumni_lookups
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Authors and managers read lookups" ON public.alumni_lookups
  FOR SELECT TO authenticated USING (
    author_id = auth.uid() OR public.has_management_access(auth.uid())
  );
CREATE POLICY "Users submit lookups as pending" ON public.alumni_lookups
  FOR INSERT TO authenticated WITH CHECK (
    author_id = auth.uid() AND (status = 'pending' OR public.has_management_access(auth.uid()))
  );
CREATE POLICY "Managers manage lookups" ON public.alumni_lookups
  FOR UPDATE TO authenticated USING (public.has_management_access(auth.uid()))
  WITH CHECK (public.has_management_access(auth.uid()));
CREATE POLICY "Authors or admins delete lookups" ON public.alumni_lookups
  FOR DELETE TO authenticated USING (
    author_id = auth.uid() OR public.has_admin_access(auth.uid())
  );
CREATE TRIGGER update_alumni_lookups_updated_at BEFORE UPDATE ON public.alumni_lookups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ alumni_gatherings ============
CREATE TABLE public.alumni_gatherings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  term TEXT,
  gather_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  description TEXT,
  cover_url TEXT,
  contact TEXT,
  max_participants INTEGER,
  organizer_id UUID,
  organizer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id UUID,
  reviewer_note TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alumni_gatherings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumni_gatherings TO authenticated;
GRANT ALL ON public.alumni_gatherings TO service_role;
ALTER TABLE public.alumni_gatherings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved gatherings are public" ON public.alumni_gatherings
  FOR SELECT USING (status = 'approved');
CREATE POLICY "Organizers and managers read gatherings" ON public.alumni_gatherings
  FOR SELECT TO authenticated USING (
    organizer_id = auth.uid() OR public.has_management_access(auth.uid())
  );
CREATE POLICY "Users submit gatherings as pending" ON public.alumni_gatherings
  FOR INSERT TO authenticated WITH CHECK (
    organizer_id = auth.uid() AND (status = 'pending' OR public.has_management_access(auth.uid()))
  );
CREATE POLICY "Managers manage gatherings" ON public.alumni_gatherings
  FOR UPDATE TO authenticated USING (public.has_management_access(auth.uid()))
  WITH CHECK (public.has_management_access(auth.uid()));
CREATE POLICY "Admins delete gatherings" ON public.alumni_gatherings
  FOR DELETE TO authenticated USING (
    (organizer_id = auth.uid() AND status = 'pending') OR public.has_admin_access(auth.uid())
  );
CREATE TRIGGER update_alumni_gatherings_updated_at BEFORE UPDATE ON public.alumni_gatherings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ alumni_gathering_signups ============
CREATE TABLE public.alumni_gathering_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gathering_id UUID NOT NULL REFERENCES public.alumni_gatherings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  term TEXT,
  contact TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (gathering_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alumni_gathering_signups TO authenticated;
GRANT ALL ON public.alumni_gathering_signups TO service_role;
ALTER TABLE public.alumni_gathering_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own signups visible" ON public.alumni_gathering_signups
  FOR SELECT TO authenticated USING (
    user_id = auth.uid() OR public.has_management_access(auth.uid())
  );
CREATE POLICY "Users sign up for themselves" ON public.alumni_gathering_signups
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own signup" ON public.alumni_gathering_signups
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users cancel own signup" ON public.alumni_gathering_signups
  FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_admin_access(auth.uid()));

-- public aggregate signup count
CREATE OR REPLACE FUNCTION public.gathering_signup_counts()
RETURNS TABLE(gathering_id uuid, signup_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.gathering_id, count(*)::bigint
  FROM public.alumni_gathering_signups s
  JOIN public.alumni_gatherings g ON g.id = s.gathering_id AND g.status = 'approved'
  GROUP BY s.gathering_id;
$$;

CREATE INDEX idx_member_photos_member ON public.member_photos(member_id);
CREATE INDEX idx_member_timeline_member ON public.member_timeline(member_id);
CREATE INDEX idx_member_honors_member ON public.member_honors(member_id);
CREATE INDEX idx_member_messages_target ON public.member_messages(target_member_id);
CREATE INDEX idx_gathering_signups_gathering ON public.alumni_gathering_signups(gathering_id);
