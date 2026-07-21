import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "list_events",
  title: "列出活动",
  description: "获取文学社活动列表。可选按 upcoming / past 过滤。",
  inputSchema: {
    filter: z.enum(["upcoming", "past", "all"]).optional().describe("时间过滤，默认 all"),
    limit: z.number().int().min(1).max(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ filter, limit }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let q = supabase.from("events").select("id, title, description, event_date, location, category");
    const now = new Date().toISOString();
    if (filter === "upcoming") q = q.gte("event_date", now).order("event_date", { ascending: true });
    else if (filter === "past") q = q.lt("event_date", now).order("event_date", { ascending: false });
    else q = q.order("event_date", { ascending: false });
    const { data, error } = await q.limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
