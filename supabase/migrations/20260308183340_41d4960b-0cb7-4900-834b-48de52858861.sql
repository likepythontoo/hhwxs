
-- Helper functions (not referencing new tables)
CREATE OR REPLACE FUNCTION public.has_admin_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'president')) $$;

CREATE OR REPLACE FUNCTION public.has_management_access(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin', 'president', 'minister')) $$;

-- Departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments viewable by everyone" ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admin access manages departments" ON public.departments FOR ALL USING (public.has_admin_access(auth.uid()));

-- Department members table
CREATE TABLE public.department_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  is_head BOOLEAN DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, department_id)
);
ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dept members viewable by authenticated" ON public.department_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin access manages dept members" ON public.department_members FOR ALL USING (public.has_admin_access(auth.uid()));

-- Now create function that references department_members
CREATE OR REPLACE FUNCTION public.is_department_head(_user_id uuid, _department_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.department_members WHERE user_id = _user_id AND department_id = _department_id AND is_head = true) $$;

CREATE POLICY "Dept heads can manage own dept" ON public.department_members FOR ALL USING (public.is_department_head(auth.uid(), department_id));

-- Check-ins table
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  student_id TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Management can view check ins" ON public.check_ins FOR SELECT USING (public.has_management_access(auth.uid()));
CREATE POLICY "Authenticated can check in" ON public.check_ins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin access manages check ins" ON public.check_ins FOR ALL USING (public.has_admin_access(auth.uid()));

-- Alter events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS scope TEXT DEFAULT 'public';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS check_in_code TEXT;

-- Alter recruitment_applications
ALTER TABLE public.recruitment_applications ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- Update RLS policies to include president
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Management can insert events" ON public.events FOR INSERT WITH CHECK (public.has_management_access(auth.uid()));
CREATE POLICY "Management can update events" ON public.events FOR UPDATE USING (public.has_management_access(auth.uid()));
CREATE POLICY "Admin access can delete events" ON public.events FOR DELETE USING (public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can read registrations" ON public.event_registrations;
CREATE POLICY "Management can read registrations" ON public.event_registrations FOR SELECT USING (public.has_management_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage news" ON public.news;
CREATE POLICY "Admin access can manage news" ON public.news FOR ALL USING (public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage submissions" ON public.submissions;
CREATE POLICY "Admin access can manage submissions" ON public.submissions FOR ALL USING (public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage finances" ON public.finances;
CREATE POLICY "Admin access can manage finances" ON public.finances FOR ALL USING (public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admin access can manage roles" ON public.user_roles FOR ALL USING (public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage settings" ON public.site_settings;
CREATE POLICY "Admin access can manage settings" ON public.site_settings FOR ALL USING (public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin access can view audit logs" ON public.audit_logs FOR SELECT USING (public.has_admin_access(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage applications" ON public.recruitment_applications;
CREATE POLICY "Admin access can manage applications" ON public.recruitment_applications FOR ALL USING (public.has_admin_access(auth.uid()));

-- Default departments
INSERT INTO public.departments (name, description) VALUES
  ('编辑部', '负责社刊编辑、文稿审核'),
  ('宣传部', '负责宣传推广、新媒体运营'),
  ('活动部', '负责活动策划与执行'),
  ('秘书部', '负责日常事务、会议记录');
