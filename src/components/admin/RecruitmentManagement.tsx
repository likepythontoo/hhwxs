import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Eye, Download, Search } from "lucide-react";

interface Application {
  id: string;
  name: string;
  student_id: string | null;
  college: string | null;
  phone: string;
  email: string | null;
  self_intro: string | null;
  literary_works: string | null;
  preferred_department: string | null;
  department_id: string | null;
  status: string | null;
  reviewer_notes: string | null;
  created_at: string;
}

interface Dept {
  id: string;
  name: string;
}

interface Props {
  currentUserRole?: string;
  currentUserDeptId?: string;
}

const RecruitmentManagement = ({ currentUserRole, currentUserDeptId }: Props) => {
  const [items, setItems] = useState<Application[]>([]);
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [viewing, setViewing] = useState<Application | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [search, setSearch] = useState("");

  const isAdminAccess = currentUserRole === "admin" || currentUserRole === "president";

  const fetchApps = async () => {
    let q = supabase.from("recruitment_applications").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    let apps = (data as Application[]) || [];

    // Ministers only see their department applications
    if (!isAdminAccess && currentUserDeptId) {
      apps = apps.filter(a => a.department_id === currentUserDeptId);
    }

    setItems(apps);
  };

  const fetchDepts = async () => {
    const { data } = await supabase.from("departments" as any).select("id, name") as any;
    setDepartments(data || []);
  };

  useEffect(() => { fetchApps(); fetchDepts(); }, [filter]);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    const update: Record<string, unknown> = { status };
    if (notes !== undefined) update.reviewer_notes = notes;
    await supabase.from("recruitment_applications").update(update).eq("id", id);
    setViewing(null);
    fetchApps();
  };

  const exportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["姓名", "学号", "学院", "手机", "邮箱", "意向部门", "状态", "申请时间"];
    const rows = filtered.map(r => [
      r.name, r.student_id || "", r.college || "", r.phone, r.email || "",
      r.preferred_department || getDeptName(r.department_id) || "", 
      r.status === "approved" ? "通过" : r.status === "rejected" ? "拒绝" : "待审",
      new Date(r.created_at).toLocaleString("zh-CN"),
    ]);
    const csv = "\uFEFF" + [headers, ...rows].map(row => row.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `招新申请.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const getDeptName = (id: string | null) => departments.find(d => d.id === id)?.name || "";

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "待审核", color: "bg-amber-50 text-amber-700" },
    approved: { label: "已通过", color: "bg-green-50 text-green-700" },
    rejected: { label: "已拒绝", color: "bg-red-50 text-red-600" },
  };

  const filtered = items.filter(i => {
    const matchSearch = !search || i.name.includes(search) || i.student_id?.includes(search) || i.college?.includes(search);
    const matchDept = filterDept === "all" || i.department_id === filterDept;
    return matchSearch && matchDept;
  });

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {[{ key: "all", label: "全部" }, { key: "pending", label: "待审核" }, { key: "approved", label: "已通过" }, { key: "rejected", label: "已拒绝" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{f.label}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {isAdminAccess && departments.length > 0 && (
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border border-border bg-card px-2 py-1.5 text-xs focus:border-primary focus:outline-none">
              <option value="all">全部部门</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="搜索..." value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-border bg-card py-1.5 pl-9 pr-3 text-xs focus:border-primary focus:outline-none" />
          </div>
          <button onClick={exportCSV} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs transition hover:bg-secondary">
            <Download className="h-3.5 w-3.5" /> 导出
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">共 {filtered.length} 份申请</p>

      <div className="space-y-3">
        {filtered.map((item) => {
          const sc = statusConfig[item.status || "pending"];
          const deptName = getDeptName(item.department_id) || item.preferred_department;
          return (
            <div key={item.id} className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.color}`}>{sc.label}</span>
                    {deptName && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent-foreground">{deptName}</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.student_id && `${item.student_id} · `}{item.college && `${item.college} · `}{item.phone}</p>
                </div>
                <div className="ml-3 flex gap-1 opacity-60 group-hover:opacity-100">
                  <button onClick={() => { setViewing(item); setReviewNotes(item.reviewer_notes || ""); }} className="rounded-lg p-2 transition hover:bg-secondary"><Eye className="h-4 w-4" /></button>
                  {item.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(item.id, "approved")} className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"><Check className="h-4 w-4" /></button>
                      <button onClick={() => updateStatus(item.id, "rejected")} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"><X className="h-4 w-4" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无招新申请</p>}
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setViewing(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[viewing.status || "pending"].color}`}>{statusConfig[viewing.status || "pending"].label}</span>
              <span className="text-[10px] text-muted-foreground">{new Date(viewing.created_at).toLocaleString("zh-CN")}</span>
            </div>
            <h3 className="font-serif text-lg font-bold">{viewing.name}</h3>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <p><span className="text-muted-foreground">学号：</span>{viewing.student_id || "-"}</p>
              <p><span className="text-muted-foreground">学院：</span>{viewing.college || "-"}</p>
              <p><span className="text-muted-foreground">手机：</span>{viewing.phone}</p>
              <p><span className="text-muted-foreground">邮箱：</span>{viewing.email || "-"}</p>
              <p className="col-span-2"><span className="text-muted-foreground">意向部门：</span>{getDeptName(viewing.department_id) || viewing.preferred_department || "-"}</p>
            </div>
            {viewing.self_intro && (
              <div className="mt-4"><p className="mb-1 text-xs font-medium text-muted-foreground">自我介绍</p><div className="rounded-lg bg-secondary/50 p-3 text-sm">{viewing.self_intro}</div></div>
            )}
            {viewing.literary_works && (
              <div className="mt-3"><p className="mb-1 text-xs font-medium text-muted-foreground">文学作品/经历</p><div className="whitespace-pre-wrap rounded-lg bg-secondary/50 p-3 text-sm">{viewing.literary_works}</div></div>
            )}
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">审核备注</label>
              <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" rows={2} />
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setViewing(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground">关闭</button>
              <button onClick={() => updateStatus(viewing.id, "rejected", reviewNotes)} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">拒绝</button>
              <button onClick={() => updateStatus(viewing.id, "approved", reviewNotes)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">通过</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecruitmentManagement;
