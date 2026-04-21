
CREATE TABLE public.member_registration_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  term TEXT NOT NULL,
  role_title TEXT,
  major TEXT,
  city TEXT,
  bio TEXT,
  memoir TEXT NOT NULL,
  contact TEXT NOT NULL,
  evidence_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id UUID,
  reviewer_note TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.member_registration_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can submit own registration request"
ON public.member_registration_requests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own registration requests"
ON public.member_registration_requests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin can manage registration requests"
ON public.member_registration_requests
FOR ALL
USING (has_admin_access(auth.uid()));

CREATE INDEX idx_member_registration_requests_status ON public.member_registration_requests(status);
CREATE INDEX idx_member_registration_requests_user_id ON public.member_registration_requests(user_id);
