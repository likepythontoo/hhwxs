import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_news",
  title: "获取新闻详情",
  description: "根据 ID 获取一条新闻的完整正文与元数据。",
  inputSchema: { id: z.string().uuid().describe("新闻 ID (UUID)") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ id }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "未找到该新闻" }], isError: true };
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }], structuredContent: { news: data } };
  },
});
