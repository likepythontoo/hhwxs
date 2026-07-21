import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_works",
  title: "列出作品",
  description: "查询已审核通过、公开发表的文学作品（诗歌、小说、散文等）。",
  inputSchema: {
    genre: z.string().optional().describe("体裁，例如 诗歌 / 小说 / 散文"),
    search: z.string().optional().describe("标题或正文关键字"),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ genre, search, limit }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let q = supabase
      .from("submissions")
      .select("id, title, content, author_name, genre, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    if (genre) q = q.eq("genre", genre);
    if (search) q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    const { data, error } = await q.limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
