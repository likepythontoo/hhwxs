import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const exportCSV = (filename: string, headers: string[], rows: string[][]) => {
  const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}_${new Date().toLocaleDateString("zh-CN")}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

const roleLabels: Record<string, string> = { admin: "管理员", president: "社长", minister: "部长", member: "社员" };

const ExportCenter = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    supabase.from("departments" as any).select("id, name").then(({ data }: any) => setDepartments(data || []));
  }, []);

  const exportMembers = async () => {
    setExporting("members");
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: deptMembers } = await supabase.from("department_members" as any).select("user_id, department_id") as any;
    const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
    const deptMap = new Map(departments.map(d => [d.id, d.name]));
    const userDeptMap = new Map<string, string[]>();
    (deptMembers || []).forEach((dm: any) => {
      const names = userDeptMap.get(dm.user_id) || [];
      names.push(deptMap.get(dm.department_id) || "");
      userDeptMap.set(dm.user_id, names);
    });
    if (profiles) {
      exportCSV("社员名单", ["姓名", "学号", "学院", "角色", "部门", "加入时间"], profiles.map(p => [
        p.display_name || "", p.student_id || "", p.department || "",
        roleLabels[roleMap.get(p.user_id) || "member"] || "社员",
        (userDeptMap.get(p.user_id) || []).join("/") || "-",
        new Date(p.created_at).toLocaleDateString("zh-CN"),
      ]));
    }
    setExporting(null);
  };

  const exportByRole = async (role: AppRole, label: string) => {
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

  const exportByDepartment = async (deptId: string, deptName: string) => {
    setExporting(`dept-${deptId}`);
    const { data: deptMembers } = await supabase.from("department_members" as any).select("user_id").eq("department_id", deptId) as any;
    if (deptMembers && deptMembers.length > 0) {
      const userIds = deptMembers.map((m: any) => m.user_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", userIds);
      if (profiles) {
        exportCSV(`${deptName}名单`, ["姓名", "学号", "学院", "加入时间"], profiles.map(p => [
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
      exportCSV("活动列表", ["活动名称", "范围", "类别", "日期", "地点", "状态"], (data as any[]).map(e => [
        e.title, e.scope === "internal" ? "社内" : "全校", e.category || "",
        new Date(e.event_date).toLocaleDateString("zh-CN"), e.location || "",
        e.is_active ? "进行中" : "已关闭",
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
      exportCSV("财务记录", ["类型", "金额", "分类", "备注", "日期"], (data as any[]).map(f => [
        f.type === "income" ? "收入" : "支出", String(f.amount), f.category, f.description || "", f.transaction_date,
      ]));
    }
    setExporting(null);
  };

  const exportRecruitment = async () => {
    setExporting("recruitment");
    const { data } = await supabase.from("recruitment_applications").select("*").order("created_at", { ascending: false });
    const deptMap = new Map(departments.map(d => [d.id, d.name]));
    if (data) {
      exportCSV("招新申请", ["姓名", "学号", "学院", "手机", "意向部门", "状态", "时间"], (data as any[]).map(r => [
        r.name, r.student_id || "", r.college || "", r.phone,
        deptMap.get(r.department_id) || r.preferred_department || "",
        r.status === "approved" ? "通过" : r.status === "rejected" ? "拒绝" : "待审",
        new Date(r.created_at).toLocaleString("zh-CN"),
      ]));
    }
    setExporting(null);
  };

  const items = [
    { key: "members", label: "全部社员名单", desc: "含角色、部门信息", action: exportMembers },
    { key: "president", label: "社长名单", desc: "仅导出社长", action: () => exportByRole("president", "社长") },
    { key: "minister", label: "部长名单", desc: "仅导出部长", action: () => exportByRole("minister", "部长") },
    { key: "member", label: "普通社员名单", desc: "仅导出普通社员", action: () => exportByRole("member", "社员") },
    ...departments.map(d => ({
      key: `dept-${d.id}`, label: `${d.name}名单`, desc: `导出${d.name}全部成员`,
      action: () => exportByDepartment(d.id, d.name),
    })),
    { key: "events", label: "活动列表", desc: "所有活动信息", action: exportAllEvents },
    { key: "registrations", label: "全部报名记录", desc: "所有活动报名", action: exportAllRegistrations },
    { key: "finance", label: "财务记录", desc: "全部收支明细", action: exportFinance },
    { key: "recruitment", label: "招新申请", desc: "所有招新申请表", action: exportRecruitment },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-base font-bold">数据导出中心</h2>
        <p className="mt-1 text-xs text-muted-foreground">一键导出各类数据为CSV文件</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <button key={item.key} onClick={item.action} disabled={exporting === item.key}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-shadow hover:shadow-md disabled:opacity-50">
            <div className="rounded-lg bg-primary/10 p-2"><Download className="h-4 w-4 text-primary" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExportCenter;
