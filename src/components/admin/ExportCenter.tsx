import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";

const exportCSV = (filename: string, headers: string[], rows: string[][]) => {
  const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}_${new Date().toLocaleDateString("zh-CN")}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

const ExportCenter = () => {
  const [exporting, setExporting] = useState<string | null>(null);

  const exportMembers = async () => {
    setExporting("members");
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
    const roleLabel: Record<string, string> = { admin: "管理员", minister: "部长", member: "社员" };

    if (profiles) {
      exportCSV("社员名单", ["姓名", "学号", "学院", "角色", "加入时间"], profiles.map(p => [
        p.display_name || "", p.student_id || "", p.department || "",
        roleLabel[roleMap.get(p.user_id) || "member"] || "社员",
        new Date(p.created_at).toLocaleDateString("zh-CN"),
      ]));
    }
    setExporting(null);
  };

  const exportByRole = async (role: string, label: string) => {
    setExporting(role);
    const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", role);
    if (roles && roles.length > 0) {
      const userIds = roles.map(r => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      if (profiles) {
        exportCSV(`${label}名单`, ["姓名", "学号", "学院", "加入时间"], profiles.map(p => [
          p.display_name || "", p.student_id || "", p.department || "",
          new Date(p.created_at).toLocaleDateString("zh-CN"),
        ]));
      }
    }
    setExporting(null);
  };

  const exportAllEvents = async () => {
    setExporting("events");
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) {
      exportCSV("活动列表", ["活动名称", "类别", "日期", "地点", "人数上限", "状态"], data.map(e => [
        e.title, e.category || "", new Date(e.event_date).toLocaleDateString("zh-CN"),
        e.location || "", String(e.max_participants || "无限制"), e.is_active ? "进行中" : "已关闭",
      ]));
    }
    setExporting(null);
  };

  const exportAllRegistrations = async () => {
    setExporting("registrations");
    const { data: regs } = await supabase.from("event_registrations").select("*").order("created_at", { ascending: false });
    const { data: events } = await supabase.from("events").select("id, title");
    const eventMap = new Map(events?.map(e => [e.id, e.title]) || []);
    if (regs) {
      exportCSV("全部报名记录", ["活动", "姓名", "学号", "学院", "手机", "邮箱", "报名时间"], regs.map(r => [
        eventMap.get(r.event_id) || "", r.name, r.student_id || "", r.college || "",
        r.phone, r.email || "", new Date(r.created_at).toLocaleString("zh-CN"),
      ]));
    }
    setExporting(null);
  };

  const exportFinance = async () => {
    setExporting("finance");
    const { data } = await supabase.from("finances").select("*").order("transaction_date", { ascending: false });
    if (data) {
      exportCSV("财务记录", ["类型", "金额", "分类", "备注", "日期"], (data as { type: string; amount: number; category: string; description: string | null; transaction_date: string }[]).map(f => [
        f.type === "income" ? "收入" : "支出", String(f.amount), f.category,
        f.description || "", f.transaction_date,
      ]));
    }
    setExporting(null);
  };

  const items = [
    { key: "members", label: "全部社员名单", desc: "导出所有社员的姓名、学号、学院、角色", action: exportMembers },
    { key: "admin", label: "管理员名单", desc: "仅导出管理员", action: () => exportByRole("admin", "管理员") },
    { key: "minister", label: "部长名单", desc: "仅导出部长", action: () => exportByRole("minister", "部长") },
    { key: "member", label: "普通社员名单", desc: "仅导出普通社员", action: () => exportByRole("member", "社员") },
    { key: "events", label: "活动列表", desc: "导出所有活动的基本信息", action: exportAllEvents },
    { key: "registrations", label: "全部报名记录", desc: "导出所有活动的报名信息", action: exportAllRegistrations },
    { key: "finance", label: "财务记录", desc: "导出全部收支明细", action: exportFinance },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-base font-bold">数据导出中心</h2>
        <p className="mt-1 text-xs text-muted-foreground">一键导出各类数据为CSV文件，可用Excel打开</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(item => (
          <button
            key={item.key}
            onClick={item.action}
            disabled={exporting === item.key}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md disabled:opacity-50"
          >
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.label}</p>
              <p className="text-[11px] text-muted-foreground">{item.desc}</p>
            </div>
            <span className="text-xs text-primary">
              {exporting === item.key ? "导出中..." : "导出"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExportCenter;
