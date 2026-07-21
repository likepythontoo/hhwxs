import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "create_submission",
  title: "提交作品",
  description: "以当前登录用户身份向红湖文学社提交一篇作品（待管理员审核）。",
  inputSchema: {
    title: z.string().min(1).max(200).describe("作品标题"),
    content: z.string().min(1).describe("作品正文"),
    genre: z.string().min(1).describe("体裁：诗歌 / 小说 / 散文 等"),
    author_name: z.string().min(1).describe("作者署名"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ title, content, genre, author_name }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "未登录，无法投稿" }], isError: true };
    }
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("submissions")
      .insert({
        user_id: ctx.getUserId(),
        title,
        content,
        genre,
        author_name,
        status: "pending",
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `投稿成功，等待审核。作品 ID: ${data.id}` }],
      structuredContent: { submission: data },
    };
  },
});
