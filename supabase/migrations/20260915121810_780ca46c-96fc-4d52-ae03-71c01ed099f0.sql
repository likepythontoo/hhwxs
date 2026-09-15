REVOKE EXECUTE ON FUNCTION public.like_member_message(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.like_member_message(uuid) TO authenticated;