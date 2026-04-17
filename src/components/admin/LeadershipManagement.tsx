import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Save, ChevronDown, ChevronUp, X, Crown } from "lucide-react";
import { toast } from "sonner";

interface Term {
  id: string;
  year: string;
  president: string;
  vice_presidents: string[];
  sort_order: number;
}

interface Dept {
  id: string;
  term_id: string;
  title: string;
  members: string[];
  sort_order: number;
}

const LeadershipManagement = () => {
  const qc = useQueryClient();
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [showNewTerm, setShowNewTerm] = useState(false);
  const [newTerm, setNewTerm] = useState({ year: "", president: "", vice_presidents: "", sort_order: 0 });

  const { data: terms = [], isLoading } = useQuery<Term[]>({
    queryKey: ["admin_leadership_terms"],
    queryFn: async () => {
      const { data } = await supabase.from("leadership_terms" as any).select("*").order("sort_order", { ascending: true });
      return (data as any) || [];
    },
  });

  const { data: depts = [] } = useQuery<Dept[]>({
    queryKey: ["admin_leadership_departments"],
    queryFn: async () => {
      const { data } = await supabase.from("leadership_departments" as any).select("*").order("sort_order", { ascending: true });
      return (data as any) || [];
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin_leadership_terms"] });
    qc.invalidateQueries({ queryKey: ["admin_leadership_departments"] });
    qc.invalidateQueries({ queryKey: ["leadership"] });
  };

  const createTerm = async () => {
    if (!newTerm.year || !newTerm.president) { toast.error("年份和社长必填"); return; }
    const vps = newTerm.vice_presidents.split(/[,，、\s]+/).filter(Boolean);
    const { error } = await supabase.from("leadership_terms" as any).insert({
      year: newTerm.year, president: newTerm.president,
      vice_presidents: vps, sort_order: Number(newTerm.sort_order) || 0,
    });
    if (error) { toast.error("新增失败：" + error.message); return; }
    toast.success("已新增届数");
    setNewTerm({ year: "", president: "", vice_presidents: "", sort_order: 0 });
    setShowNewTerm(false);
    refresh();
  };

  const deleteTerm = async (id: string) => {
    if (!confirm("确认删除该届？所有部门与成员将一并删除")) return;
    await supabase.from("leadership_terms" as any).delete().eq("id", id);
    toast.success("已删除");
    refresh();
  };

  const updateTerm = async (id: string, patch: Partial<Term>) => {
    await supabase.from("leadership_terms" as any).update(patch).eq("id", id);
    refresh();
  };

  const addDept = async (term_id: string) => {
    const max = depts.filter(d => d.term_id === term_id).reduce((m, d) => Math.max(m, d.sort_order), 0);
    await supabase.from("leadership_departments" as any).insert({
      term_id, title: "新部门", members: [], sort_order: max + 1,
    });
    refresh();
  };

  const updateDept = async (id: string, patch: Partial<Dept>) => {
    await supabase.from("leadership_departments" as any).update(patch).eq("id", id);
    refresh();
  };

  const deleteDept = async (id: string) => {
    if (!confirm("删除该部门？")) return;
    await supabase.from("leadership_departments" as any).delete().eq("id", id);
    refresh();
  };

  if (isLoading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-base font-bold">历届管理团队</h2>
          <p className="text-xs text-muted-foreground mt-1">编辑后会立即在前台显示</p>
        </div>
        <button onClick={() => setShowNewTerm(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> 新增届数
        </button>
      </div>

      {showNewTerm && (
        <div className="mb-4 rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">新增届数</h3>
            <button onClick={() => setShowNewTerm(false)}><X className="h-4 w-4" /></button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={newTerm.year} onChange={(e) => setNewTerm({ ...newTerm, year: e.target.value })} placeholder="年份 如：2026届" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={newTerm.president} onChange={(e) => setNewTerm({ ...newTerm, president: e.target.value })} placeholder="社长姓名" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={newTerm.vice_presidents} onChange={(e) => setNewTerm({ ...newTerm, vice_presidents: e.target.value })} placeholder="副社长（多人用逗号分隔）" className="rounded-lg border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
            <input type="number" value={newTerm.sort_order} onChange={(e) => setNewTerm({ ...newTerm, sort_order: Number(e.target.value) })} placeholder="排序（越小越靠前）" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button onClick={createTerm} className="rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">创建</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {terms.map((term) => {
          const termDepts = depts.filter(d => d.term_id === term.id);
          const expanded = expandedTerm === term.id;
          return (
            <div key={term.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between gap-3 p-4">
                <button onClick={() => setExpandedTerm(expanded ? null : term.id)} className="flex flex-1 items-center gap-3 text-left">
                  {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {term.year}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm">
                    <Crown className="h-3.5 w-3.5 text-primary" />
                    {term.president}
                  </span>
                  <span className="text-xs text-muted-foreground">· {termDepts.length} 个部门</span>
                </button>
                <button onClick={() => deleteTerm(term.id)} className="rounded p-2 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {expanded && (
                <div className="border-t border-border bg-secondary/30 p-4 space-y-4">
                  {/* Term basic info */}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="text-[11px] font-medium text-muted-foreground">年份</span>
                      <input defaultValue={term.year} onBlur={(e) => e.target.value !== term.year && updateTerm(term.id, { year: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-medium text-muted-foreground">社长</span>
                      <input defaultValue={term.president} onBlur={(e) => e.target.value !== term.president && updateTerm(term.id, { president: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-medium text-muted-foreground">排序</span>
                      <input type="number" defaultValue={term.sort_order} onBlur={(e) => Number(e.target.value) !== term.sort_order && updateTerm(term.id, { sort_order: Number(e.target.value) })} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
                    </label>
                    <label className="block sm:col-span-3">
                      <span className="text-[11px] font-medium text-muted-foreground">副社长（用逗号分隔多人）</span>
                      <input defaultValue={(term.vice_presidents || []).join("，")} onBlur={(e) => {
                        const arr = e.target.value.split(/[,，、\s]+/).filter(Boolean);
                        if (JSON.stringify(arr) !== JSON.stringify(term.vice_presidents)) {
                          updateTerm(term.id, { vice_presidents: arr });
                        }
                      }} placeholder="例如：张三，李四" className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm" />
                    </label>
                  </div>

                  {/* Departments */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-bold">部门设置</h4>
                      <button onClick={() => addDept(term.id)} className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20">
                        <Plus className="h-3 w-3" /> 增加部门
                      </button>
                    </div>
                    <div className="space-y-2">
                      {termDepts.map((d) => (
                        <div key={d.id} className="rounded-lg border border-border bg-card p-3">
                          <div className="grid gap-2 sm:grid-cols-[1fr_2fr_80px_auto]">
                            <input defaultValue={d.title} onBlur={(e) => e.target.value !== d.title && updateDept(d.id, { title: e.target.value })} placeholder="部门名" className="rounded border border-border bg-background px-2 py-1.5 text-xs" />
                            <input defaultValue={(d.members || []).join("，")} onBlur={(e) => {
                              const arr = e.target.value.split(/[,，、\s]+/).filter(Boolean);
                              if (JSON.stringify(arr) !== JSON.stringify(d.members)) updateDept(d.id, { members: arr });
                            }} placeholder="成员（逗号分隔）" className="rounded border border-border bg-background px-2 py-1.5 text-xs" />
                            <input type="number" defaultValue={d.sort_order} onBlur={(e) => Number(e.target.value) !== d.sort_order && updateDept(d.id, { sort_order: Number(e.target.value) })} placeholder="排序" className="rounded border border-border bg-background px-2 py-1.5 text-xs" />
                            <button onClick={() => deleteDept(d.id)} className="rounded p-1.5 text-destructive hover:bg-destructive/10">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {termDepts.length === 0 && <p className="text-xs text-muted-foreground italic">暂无部门，点击"增加部门"</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-xs text-muted-foreground italic">提示：编辑字段后点击外部即自动保存。</p>
    </div>
  );
};

export default LeadershipManagement;
