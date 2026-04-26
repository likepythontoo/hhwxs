CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '公开文件',
  description TEXT,
  file_date TEXT,
  file_type TEXT NOT NULL DEFAULT 'other',
  file_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published documents"
ON public.documents
FOR SELECT
USING (is_public = true);

CREATE POLICY "Admin access manages documents"
ON public.documents
FOR ALL
USING (public.has_admin_access(auth.uid()))
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.quick_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  href TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'FileText',
  accent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quick_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active quick links"
ON public.quick_links
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin access manages quick links"
ON public.quick_links
FOR ALL
USING (public.has_admin_access(auth.uid()))
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE TRIGGER update_quick_links_updated_at
BEFORE UPDATE ON public.quick_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.about_content_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.about_content_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active about content"
ON public.about_content_items
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admin access manages about content"
ON public.about_content_items
FOR ALL
USING (public.has_admin_access(auth.uid()))
WITH CHECK (public.has_admin_access(auth.uid()));

CREATE INDEX idx_documents_public_order ON public.documents (is_public, sort_order, created_at DESC);
CREATE INDEX idx_quick_links_active_order ON public.quick_links (is_active, sort_order, created_at DESC);
CREATE INDEX idx_about_content_type_order ON public.about_content_items (type, is_active, sort_order);

CREATE TRIGGER update_about_content_items_updated_at
BEFORE UPDATE ON public.about_content_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.documents (name, file_name, category, description, file_date, file_type, file_url, sort_order) VALUES
('红湖文学社纳新报名表', '红湖文学社纳新报名表.docx', '纳新招募', '新社员入社申请表，包含个人信息、志愿部门、自我介绍等内容。', '2025-09', 'docx', '/files/红湖文学社纳新报名表.docx', 1),
('红湖文学社活动章程', '红湖文学社活动章程.doc', '规章制度', '社团管理细则、社员权利与义务、组织设置、会议制度等完整章程。', '2020-10', 'doc', '/files/红湖文学社活动章程.doc', 2),
('学生社团换届干部竞选报名表', '学生社团换届干部竞选报名表.docx', '换届选举', '社团干部换届竞选报名表，用于申请竞选社团各级干部职位。', '2025-06', 'docx', '/files/学生社团换届干部竞选报名表.docx', 3);

INSERT INTO public.quick_links (label, description, href, icon, accent, sort_order) VALUES
('投稿系统', '在线提交文学作品', '/submit', 'PenLine', 'from-primary/10 to-primary/5', 1),
('作品库', '浏览历届优秀作品', '/works', 'BookOpen', 'from-accent/10 to-accent/5', 2),
('社员论坛', '社员交流讨论', '/forum', 'Users', 'from-primary/10 to-accent/5', 3),
('活动报名', '参与社团活动', '/events', 'CalendarCheck', 'from-accent/10 to-primary/5', 4),
('文件中心', '文件资料下载', '/documents', 'Download', 'from-primary/5 to-accent/10', 5),
('社团章程', '规章制度查阅', '/charter', 'FileBarChart', 'from-accent/5 to-primary/10', 6);

INSERT INTO public.about_content_items (type, title, subtitle, body, meta, icon, sort_order) VALUES
('stat', '成立年份', '2003', NULL, '{}'::jsonb, 'Building2', 1),
('stat', '下设部门', '5个', NULL, '{}'::jsonb, 'Users', 2),
('stat', '核心社刊', '《红湖》', NULL, '{}'::jsonb, 'BookOpen', 3),
('stat', '品牌活动', '红湖杯', NULL, '{}'::jsonb, 'Trophy', 4),
('timeline', '创立与奠基', '2003 - 2010', '2003｜红湖文学社在河北科技学院（保定校区）正式挂牌成立，社名取自校园内「红湖」，寓意热血、纯净与深邃
2004｜社刊《红湖》正式创刊，确立了「笔耕不辍」的社魂
2004｜确立以诗歌、散文交流为主的学术型社团方向，在保定高校文学圈初露锋芒', '{}'::jsonb, NULL, 10),
('timeline', '繁荣与跨校交流', '2011 - 2016', '2011｜学校升格为全日制民办普通本科院校，社团随之发展壮大
2012｜举办「红湖十载」十周年系列纪念活动
2013｜与河北大学、华北电力大学等高校文学社团开展联谊和联合征文
2014｜开通官方微博和微信公众号，文学作品发布向移动端延伸
2015｜「红湖杯」校园征文大赛成为校内品牌活动，影响力扩展至全校
2016｜获评校级「十佳最具影响力校园媒体」', '{}'::jsonb, NULL, 11),
('timeline', '改革与品牌升级', '2017 - 2020', '2017｜2017届管理团队组建，社长孙浩然带领社团改革
2018｜社员在省级比赛中多次获奖，获全国大学生诗歌竞赛「优秀社团奖」
2019｜推行「声文结合」，举办大型诗歌朗诵会，与校广播站深度合作；获河北省大学生校园文学大赛「优秀组织奖」
2020｜疫情主题征文《红湖战疫录》获校团委专项表彰', '{}'::jsonb, NULL, 12),
('timeline', '搬迁唐山与新篇章', '2021 - 至今', '2021｜随学校整体搬迁至唐山曹妃甸校区，社团重新招新，获评「文化建设先锋社团」
2022｜《红湖》创刊20周年，获「优秀校园期刊奖」；公众号获评校级「年度优秀校园新媒体」
2023｜中华全国学生联合会、河北共青团等单位授予「2022年度河北省高校''活力社团''—思想政治类第三名」等荣誉称号；被河北共青团公众号通篇报道。
2024｜社员在「燕赵杯」全国文学征文大赛中获一等奖
2025｜获评校级最高荣誉「五星级学生社团」；组织架构优化，设立国学部与网宣部', '{}'::jsonb, NULL, 13),
('award', '年度「五星级学生社团」', '2025', '河北科技学院团委', '{"level":"校级最高荣誉"}'::jsonb, NULL, 20),
('award', '「燕赵杯」全国文学征文大赛一等奖', '2024', '燕赵杯组委会', '{"level":"国家级"}'::jsonb, NULL, 21),
('award', '「2022年度河北省高校''活力社团''—思想政治类第三名」', '2023', '中华全国学生联合会、河北共青团', '{"level":"省级"}'::jsonb, NULL, 22),
('award', '《红湖》创刊20周年优秀校园期刊奖', '2022', '校园文学杂志社', '{"level":"行业荣誉"}'::jsonb, NULL, 23),
('award', '年度优秀校园新媒体', '2022', '河北科技学院', '{"level":"校级"}'::jsonb, NULL, 24),
('feature', '核心社刊', NULL, '《红湖》— 每年定期出刊，社团文学创作的核心阵地', '{}'::jsonb, 'BookOpen', 30),
('feature', '品牌活动', NULL, '「红湖杯」征文大赛 — 跨学院参与的校内文学品牌赛事', '{}'::jsonb, 'Trophy', 31),
('feature', '暖冬朗诵会', NULL, '年度诗歌朗诵盛会，声文结合，传递文字之美', '{}'::jsonb, 'Mic', 32),
('feature', '社团精神', NULL, '坚持原创，拒绝平庸，用文字记录青春', '{}'::jsonb, 'Star', 33);

INSERT INTO public.site_settings (key, value) VALUES
('contact_address', '河北省唐山市曹妃甸区河北科技学院'),
('president_email', '1330760849@qq.com'),
('advisor_name', '某某某'),
('advisor_phone', '000-0000-0000'),
('publication_honghu_desc', '社团核心出版物，每年定期出刊，汇集社员优秀文学作品'),
('publication_moxiang_desc', '社团文艺副刊，聚焦校园文化与文学评论')
ON CONFLICT (key) DO NOTHING;