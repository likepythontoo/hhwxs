import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_members",
  title: "列出历届成员",
  description: "查询文学社历届成员档案，可按届别或姓名关键字过滤。",
  inputSchema: {
    term: z.string().optional().describe("届别，例如 2024级"),
    search: z.string().optional().describe("姓名关键字"),
    limit: z.number().int().min(1).max(100).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ term, search, limit }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let q = supabase
      .from("members")
      .select("id, name, term, role_title, bio, featured_quote, major, city, literary_tags");
    if (term) q = q.eq("term", term);
    if (search) q = q.ilike("name", `%${search}%`);
    const { data, error } = await q.limit(limit ?? 20);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
