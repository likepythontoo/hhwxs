import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Crown, Shield, UserCheck, Star, ChevronDown, Search, Download } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface Member {
  user_id: string;
  display_name: string | null;
  student_id: string | null;
  department: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
  dept_names?: string[];
}

const roleConfig: Record<AppRole, { icon: typeof Crown; label: string; color: string; bg: string }> = {
  admin: { icon: Crown, label: "管理员", color: "text-primary", bg: "bg-primary/10" },
  president: { icon: Star, label: "社长", color: "text-amber-700", bg: "bg-amber-50" },
  minister: { icon: Shield, label: "部长", color: "text-amber-600", bg: "bg-amber-50" },
  member: { icon: UserCheck, label: "社员", color: "text-blue-600", bg: "bg-blue-50" },
};

interface Props {
  currentUserRole?: AppRole;
  currentUserDeptId?: string;
}

const MemberManagement = ({ currentUserRole, currentUserDeptId }: Props) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<AppRole | "all">("all");

  const isAdminAccess = currentUserRole === "admin" || currentUserRole === "president";

  const fetchMembers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, student_id, department, avatar_url, created_at");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    const { data: deptMembers } = await supabase.from("department_members" as any).select("user_id, department_id") as any;
    const { data: depts } = await supabase.from("departments" as any).select("id, name") as any;

    if (profiles && roles) {
      const roleMap = new Map(roles.map(r => [r.user_id, r.role]));
      const deptMap = new Map<string, string>((depts || []).map((d: any) => [String(d.id), String(d.name)]));
      const userDeptMap = new Map<string, string[]>();
      (deptMembers || []).forEach((dm: any) => {
        const uid = String(dm.user_id);
        const names = userDeptMap.get(uid) || [];
        names.push(deptMap.get(String(dm.department_id)) || "");
        userDeptMap.set(uid, names);
      });

      let merged: Member[] = profiles.map(p => ({
        ...p,
        role: (roleMap.get(p.user_id) || "member") as AppRole,
        dept_names: userDeptMap.get(p.user_id) || [],
      }));

      // Ministers only see their department members
      if (!isAdminAccess && currentUserDeptId) {
        const deptUserIds = new Set((deptMembers || []).filter((dm: any) => dm.department_id === currentUserDeptId).map((dm: any) => dm.user_id));
        merged = merged.filter(m => deptUserIds.has(m.user_id));
      }

      merged.sort((a, b) => {
        const order: Record<AppRole, number> = { admin: 0, president: 1, minister: 2, member: 3 };
        return order[a.role] - order[b.role];
      });
      setMembers(merged);
    }
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const changeRole = async (userId: string, newRole: AppRole) => {
    if (!isAdminAccess) return;
    setChangingRole(userId);
    const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", userId);
    if (existing && existing.length > 0) {
      await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
    } else {
      await supabase.from("user_roles").insert({ user_id: userId, role: newRole });
    }
    setChangingRole(null);
    fetchMembers();
  };

  const exportMembers = () => {
    if (members.length === 0) return;
    const headers = ["姓名", "学号", "学院", "角色", "部门", "加入时间"];
    const rows = members.map(m => [
      m.display_name || "", m.student_id || "", m.department || "",
      roleConfig[m.role].label, (m.dept_names || []).join("/") || "-",
      new Date(m.created_at).toLocaleDateString("zh-CN"),
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `成员名单.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = members.filter(m => {
    const matchSearch = !search || m.display_name?.toLowerCase().includes(search.toLowerCase()) || m.student_id?.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === "all" || m.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return <div className="flex justify-center py-20"><p className="text-muted-foreground animate-pulse">加载中...</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="搜索姓名、学号..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs focus:border-primary focus:outline-none" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {(["all", "admin", "president", "minister", "member"] as const).map((r) => (
              <button key={r} onClick={() => setFilterRole(r)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${filterRole === r ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {r === "all" ? "全部" : roleConfig[r].label}
              </button>
            ))}
          </div>
          <button onClick={exportMembers} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-secondary">
            <Download className="h-3.5 w-3.5" /> 导出
          </button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">共 {filtered.length} 人</p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => {
          const config = roleConfig[m.role];
          const Icon = config.icon;
          return (
            <div key={m.user_id} className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-serif text-sm font-bold text-muted-foreground">
                    {(m.display_name || "?")[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{m.display_name || "未设置"}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${config.bg} ${config.color}`}>
                        <Icon className="h-2.5 w-2.5" /> {config.label}
                      </span>
                      {(m.dept_names || []).map(d => (
                        <span key={d} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {isAdminAccess && (
                  <div className="relative">
                    <select value={m.role} onChange={(e) => changeRole(m.user_id, e.target.value as AppRole)} disabled={changingRole === m.user_id} className="appearance-none rounded-md border border-border bg-secondary/50 py-1 pl-2 pr-6 text-[11px] focus:border-primary focus:outline-none disabled:opacity-50">
                      <option value="admin">管理员</option>
                      <option value="president">社长</option>
                      <option value="minister">部长</option>
                      <option value="member">社员</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                {m.student_id && <p>学号：{m.student_id}</p>}
                {m.department && <p>学院：{m.department}</p>}
                <p>加入时间：{new Date(m.created_at).toLocaleDateString("zh-CN")}</p>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">没有找到匹配的成员</p>}
    </div>
  );
};

export default MemberManagement;
