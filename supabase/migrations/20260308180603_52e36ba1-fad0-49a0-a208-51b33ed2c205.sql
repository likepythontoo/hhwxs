
-- 新闻/公告表
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT '公告',
  cover_url TEXT,
  is_published BOOLEAN DEFAULT false,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 作品投稿表
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  genre TEXT DEFAULT '诗歌',
  author_name TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 财务记录表
CREATE TABLE public.finances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 系统设置表
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- RLS for news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News viewable by everyone" ON public.news FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage news" ON public.news FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Ministers can manage news" ON public.news FOR ALL USING (public.has_role(auth.uid(), 'minister'));

-- RLS for submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert submissions" ON public.submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Admins can manage submissions" ON public.submissions FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Ministers can manage submissions" ON public.submissions FOR ALL USING (public.has_role(auth.uid(), 'minister'));
CREATE POLICY "Approved submissions are public" ON public.submissions FOR SELECT USING (status = 'approved');

-- RLS for finances
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage finances" ON public.finances FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Ministers can view finances" ON public.finances FOR SELECT USING (public.has_role(auth.uid(), 'minister'));

-- RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', '红湖文学社'),
  ('site_description', '河北科技学院红湖文学社官方网站'),
  ('contact_email', ''),
  ('contact_phone', ''),
  ('wechat_id', ''),
  ('founding_year', '2020'),
  ('recruitment_open', 'true');

-- Updated_at triggers
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
