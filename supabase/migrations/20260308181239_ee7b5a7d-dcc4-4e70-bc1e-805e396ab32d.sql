
-- 招新申请表
CREATE TABLE public.recruitment_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  student_id TEXT,
  college TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  self_intro TEXT,
  literary_works TEXT,
  preferred_department TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recruitment_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit application" ON public.recruitment_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage applications" ON public.recruitment_applications FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Ministers can view applications" ON public.recruitment_applications FOR SELECT USING (public.has_role(auth.uid(), 'minister'));

CREATE TRIGGER update_recruitment_updated_at BEFORE UPDATE ON public.recruitment_applications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 操作日志表
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can insert logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 论坛帖子表
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  author_name TEXT NOT NULL,
  category TEXT DEFAULT '自由讨论',
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view posts" ON public.forum_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create posts" ON public.forum_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own posts" ON public.forum_posts FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage posts" ON public.forum_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Ministers can manage posts" ON public.forum_posts FOR ALL USING (public.has_role(auth.uid(), 'minister'));

CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 论坛评论表
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view comments" ON public.forum_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create comments" ON public.forum_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Admins can manage comments" ON public.forum_comments FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for forum
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;
