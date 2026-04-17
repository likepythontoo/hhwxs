-- 1. Leadership terms table
CREATE TABLE public.leadership_terms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  year TEXT NOT NULL UNIQUE,
  president TEXT NOT NULL,
  vice_presidents TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leadership_terms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leadership terms viewable by everyone"
  ON public.leadership_terms FOR SELECT USING (true);

CREATE POLICY "Admin access manages leadership terms"
  ON public.leadership_terms FOR ALL USING (has_admin_access(auth.uid()));

CREATE TRIGGER update_leadership_terms_updated_at
  BEFORE UPDATE ON public.leadership_terms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Leadership departments table
CREATE TABLE public.leadership_departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  term_id UUID NOT NULL REFERENCES public.leadership_terms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  members TEXT[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leadership_departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leadership depts viewable by everyone"
  ON public.leadership_departments FOR SELECT USING (true);

CREATE POLICY "Admin access manages leadership depts"
  ON public.leadership_departments FOR ALL USING (has_admin_access(auth.uid()));

CREATE INDEX idx_leadership_departments_term ON public.leadership_departments(term_id);

-- 3. Hero slides table
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  link_url TEXT,
  link_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hero slides viewable by everyone"
  ON public.hero_slides FOR SELECT USING (true);

CREATE POLICY "Admin access manages hero slides"
  ON public.hero_slides FOR ALL USING (has_admin_access(auth.uid()));

CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON public.hero_slides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Site-assets storage bucket (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Site assets publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

CREATE POLICY "Admin can upload site assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'site-assets' AND has_admin_access(auth.uid()));

CREATE POLICY "Admin can update site assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'site-assets' AND has_admin_access(auth.uid()));

CREATE POLICY "Admin can delete site assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'site-assets' AND has_admin_access(auth.uid()));

-- 5. Seed leadership data
INSERT INTO public.leadership_terms (year, president, vice_presidents, sort_order) VALUES
  ('2025届', '黄博文', ARRAY['付高鹏','王斯侬'], 1),
  ('2024届', '崔晨莹', ARRAY['马哲'], 2),
  ('2023届', '宋镓铖', ARRAY['赵艺凇','张文清'], 3),
  ('2022届', '胡宝文', ARRAY['黄家驹'], 4),
  ('2021届', '韩雨轩', ARRAY['杜毅飞','白燕飞'], 5),
  ('2020届', '霍娅洁', ARRAY['丁稳'], 6),
  ('2019届', '韩月瑶', ARRAY['李双蕊','程鑫阳'], 7),
  ('2018届', '刘翰林', ARRAY['商航'], 8),
  ('2017届', '孙浩然', ARRAY[]::TEXT[], 9);

-- 6. Seed leadership departments
INSERT INTO public.leadership_departments (term_id, title, members, sort_order)
SELECT t.id, d.title, d.members, d.sort_order FROM (VALUES
  ('2025届','办公室部长',ARRAY['左亚峥'],1),
  ('2025届','编辑部部长',ARRAY['夏天'],2),
  ('2024届','组织部部长',ARRAY['赵梓菁','夏向花'],1),
  ('2024届','办公室部长',ARRAY['赵鱼帆','胡梦瑾'],2),
  ('2024届','网宣部部长',ARRAY['薛博鑫','赵国群'],3),
  ('2024届','话剧部部长',ARRAY['庞悦欣','张盛凯'],4),
  ('2024届','编辑部部长',ARRAY['魏梦德'],5),
  ('2023届','组织部部长',ARRAY['马圣奇','崔馨颐','邸佳蕊'],1),
  ('2023届','办公室部长',ARRAY['张家畅','邢睿譞','彭姣宁'],2),
  ('2023届','网宣部部长',ARRAY['王雨桐','于海雅','闫秋旭'],3),
  ('2023届','话剧部部长',ARRAY['李妍','龙海静','刘岚竹'],4),
  ('2023届','编辑部部长',ARRAY['张家豪','李佳潞'],5),
  ('2022届','组织部部长',ARRAY['王琦','杜轩'],1),
  ('2022届','办公室部长',ARRAY['马境蔓','李秀云'],2),
  ('2022届','网宣部部长',ARRAY['刘嘉颖','刘静'],3),
  ('2022届','话剧部部长',ARRAY['袁鑫','张孟雨'],4),
  ('2022届','编辑部部长',ARRAY['刘佳鑫','刘馨'],5),
  ('2021届','组织部部长',ARRAY['董俊豪','曹旭彤'],1),
  ('2021届','办公室部长',ARRAY['路秋爽','雷泽玉'],2),
  ('2021届','网宣部部长',ARRAY['杨晨','沈伟华'],3),
  ('2021届','话剧部部长',ARRAY['周树坤'],4),
  ('2021届','编辑部部长',ARRAY['王天玉'],5),
  ('2020届','组织部部长',ARRAY['赵文琪','郝丽鑫'],1),
  ('2020届','办公室部长',ARRAY['苏紫云','王子平'],2),
  ('2020届','网宣部部长',ARRAY['张子璇','王茹霞'],3),
  ('2020届','话剧部部长',ARRAY['王莹'],4),
  ('2020届','编辑部部长',ARRAY['张佳宇'],5),
  ('2019届','组织部部长',ARRAY['宋博涵'],1),
  ('2019届','办公室部长',ARRAY['张玉笑','孙路伟'],2),
  ('2019届','网宣部部长',ARRAY['谢薇'],3),
  ('2019届','话剧部部长',ARRAY['张紫苑','陈春姝'],4),
  ('2019届','编辑部部长',ARRAY['王一可'],5),
  ('2018届','组织部部长',ARRAY['孟兆香','南大龙'],1),
  ('2018届','办公室部长',ARRAY['刘宏炎','张帆'],2),
  ('2018届','网宣部部长',ARRAY['李雪','宫欣怡'],3),
  ('2018届','话剧部部长',ARRAY['柴颖'],4),
  ('2018届','编辑部部长',ARRAY['张义昕'],5),
  ('2017届','办公室部长',ARRAY['沈威','李晨'],1),
  ('2017届','话剧部部长',ARRAY['刘雅晴','李金铵'],2),
  ('2017届','编辑部部长',ARRAY['康雅倩','李钰'],3),
  ('2017届','外联部部长',ARRAY['高凡'],4),
  ('2017届','网络部部长',ARRAY['张立起','伊创业'],5)
) AS d(year, title, members, sort_order)
JOIN public.leadership_terms t ON t.year = d.year;

-- 7. Seed extended site_settings
INSERT INTO public.site_settings (key, value) VALUES
  ('footer_address', '河北科技学院（曹妃甸校区）'),
  ('footer_address_detail', '河北省唐山市曹妃甸区曹妃甸新城行知路36号'),
  ('footer_amap_url', 'https://uri.amap.com/marker?position=118.460007,39.232719&name=河北科技学院曹妃甸校区&src=红湖文学社'),
  ('social_douyin', '红湖文学社'),
  ('social_bilibili', '红湖文学社'),
  ('social_weibo', ''),
  ('copyright_text', '© 2026 红湖文学社 Red Lake Literature Society. All rights reserved.'),
  ('hero_autoplay_interval', '6'),
  ('about_intro', '河北科技学院红湖文学社成立于2003年，社名取自校园内「红湖」，寓意热血、纯净与深邃。社团致力于繁荣校园文学创作，培养文学新人，传承中华优秀文化。')
ON CONFLICT (key) DO NOTHING;