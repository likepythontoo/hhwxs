import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_my_profile",
  title: "获取我的个人资料",
  description: "获取当前登录用户在红湖文学社的个人资料、角色以及关联的成员档案。",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "未登录" }], isError: true };
    }
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const uid = ctx.getUserId();
    const [profile, roles, member] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("members").select("*").eq("user_id", uid).maybeSingle(),
    ]);
    const result = {
      email: ctx.getUserEmail(),
      user_id: uid,
      profile: profile.data,
      roles: (roles.data ?? []).map((r: { role: string }) => r.role),
      member: member.data,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
