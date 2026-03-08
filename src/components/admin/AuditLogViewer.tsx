import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  user_name: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  target_name: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const actionLabels: Record<string, { label: string; emoji: string }> = {
  create: { label: "创建", emoji: "🆕" },
  update: { label: "更新", emoji: "✏️" },
  delete: { label: "删除", emoji: "🗑️" },
  approve: { label: "审批通过", emoji: "✅" },
  reject: { label: "审批拒绝", emoji: "❌" },
  login: { label: "登录", emoji: "🔑" },
  logout: { label: "退出", emoji: "🚪" },
  role_change: { label: "角色变更", emoji: "👑" },
  publish: { label: "发布", emoji: "📢" },
  export: { label: "导出", emoji: "📥" },
};

const targetLabels: Record<string, string> = {
  event: "活动",
  news: "新闻",
  submission: "投稿",
  member: "成员",
  finance: "财务",
  recruitment: "招新",
  settings: "设置",
  forum: "论坛",
};

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const fetchLogs = async () => {
    let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(200);
    if (filterType !== "all") q = q.eq("target_type", filterType);
    const { data } = await q;
    setLogs((data as AuditLog[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [filterType]);

  const filtered = logs.filter(l =>
    !search || l.user_name?.includes(search) || l.target_name?.includes(search) || l.action.includes(search)
  );

  if (loading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-serif text-base font-bold">操作日志</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="搜索用户/操作..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-card py-1.5 pl-9 pr-3 text-xs focus:border-primary focus:outline-none" />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs focus:border-primary focus:outline-none">
            <option value="all">全部类型</option>
            {Object.entries(targetLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        {filtered.map((log) => {
          const actionInfo = actionLabels[log.action] || { label: log.action, emoji: "📋" };
          return (
            <div key={log.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition hover:bg-secondary/50">
              <span className="text-base">{actionInfo.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs">
                  <span className="font-medium">{log.user_name || "系统"}</span>
                  <span className="text-muted-foreground"> {actionInfo.label}了</span>
                  <span className="text-muted-foreground"> {targetLabels[log.target_type] || log.target_type}</span>
                  {log.target_name && <span className="font-medium"> 「{log.target_name}」</span>}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {new Date(log.created_at).toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">📋</p>
            <p className="text-sm text-muted-foreground">暂无操作日志</p>
            <p className="mt-1 text-xs text-muted-foreground">管理操作会自动记录在这里</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
