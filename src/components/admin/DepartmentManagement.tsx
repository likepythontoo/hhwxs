import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Users, Crown, UserPlus } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  member_count?: number;
  head_name?: string;
}

interface DeptMember {
  id: string;
  user_id: string;
  is_head: boolean;
  display_name: string | null;
  student_id: string | null;
}

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [deptMembers, setDeptMembers] = useState<DeptMember[]>([]);
  const [allProfiles, setAllProfiles] = useState<{ user_id: string; display_name: string | null }[]>([]);
  const [editing, setEditing] = useState<Partial<Department> | null>(null);
  const [saving, setSaving] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const fetchDepartments = async () => {
    const { data: depts } = await supabase.from("departments" as any).select("*").order("created_at") as any;
    const { data: members } = await supabase.from("department_members" as any).select("department_id, user_id, is_head") as any;
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name");

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));

    const enriched = (depts || []).map((d: any) => {
      const dMembers = (members || []).filter((m: any) => m.department_id === d.id);
      const head = dMembers.find((m: any) => m.is_head);
      return {
        ...d,
        member_count: dMembers.length,
        head_name: head ? profileMap.get(head.user_id) || "未知" : "未指定",
      };
    });
    setDepartments(enriched);
    setAllProfiles(profiles || []);
  };

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDeptMembers = async (deptId: string) => {
    setSelectedDept(deptId);
    const { data: members } = await supabase.from("department_members" as any).select("id, user_id, is_head").eq("department_id", deptId) as any;
    const { data: profiles } = await supabase.from("profiles").select("user_id, display_name, student_id");
    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
    setDeptMembers((members || []).map((m: any) => ({
      ...m,
      display_name: profileMap.get(m.user_id)?.display_name || "未知",
      student_id: profileMap.get(m.user_id)?.student_id || null,
    })));
  };

  const saveDept = async () => {
    if (!editing?.name) return;
    setSaving(true);
    if (editing.id) {
      await (supabase.from("departments" as any) as any).update({ name: editing.name, description: editing.description || null }).eq("id", editing.id);
    } else {
      await (supabase.from("departments" as any) as any).insert({ name: editing.name, description: editing.description || null });
    }
    setSaving(false); setEditing(null); fetchDepartments();
  };

  const deleteDept = async (id: string) => {
    if (!confirm("确定删除此部门？部门成员关系也会被删除。")) return;
    await (supabase.from("departments" as any) as any).delete().eq("id", id);
    if (selectedDept === id) setSelectedDept(null);
    fetchDepartments();
  };

  const addMember = async () => {
    if (!selectedUserId || !selectedDept) return;
    await (supabase.from("department_members" as any) as any).insert({ user_id: selectedUserId, department_id: selectedDept });
    setAddingMember(false); setSelectedUserId("");
    fetchDeptMembers(selectedDept);
    fetchDepartments();
  };

  const removeMember = async (id: string) => {
    await (supabase.from("department_members" as any) as any).delete().eq("id", id);
    if (selectedDept) fetchDeptMembers(selectedDept);
    fetchDepartments();
  };

  const toggleHead = async (member: DeptMember) => {
    await (supabase.from("department_members" as any) as any).update({ is_head: !member.is_head }).eq("id", member.id);
    if (selectedDept) fetchDeptMembers(selectedDept);
    fetchDepartments();
  };

  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none transition";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Department List */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-base font-bold">部门列表</h2>
          <button onClick={() => setEditing({})} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> 新增</button>
        </div>
        <div className="space-y-2">
          {departments.map(d => (
            <div key={d.id} onClick={() => fetchDeptMembers(d.id)}
              className={`cursor-pointer rounded-xl border p-4 transition-shadow hover:shadow-md ${selectedDept === d.id ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">{d.name}</h3>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    👥 {d.member_count} 人 · 部长: {d.head_name}
                  </p>
                  {d.description && <p className="mt-1 text-xs text-muted-foreground/70">{d.description}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); setEditing(d); }} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary text-xs">编辑</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteDept(d.id); }} className="rounded-lg p-1.5 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department Members */}
      <div>
        {selectedDept ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-serif text-base font-bold">{departments.find(d => d.id === selectedDept)?.name} - 成员</h2>
              <button onClick={() => setAddingMember(true)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"><UserPlus className="h-3.5 w-3.5" /> 添加</button>
            </div>
            <div className="space-y-2">
              {deptMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold">{(m.display_name || "?")[0]}</div>
                    <div>
                      <p className="text-xs font-medium">{m.display_name}</p>
                      {m.student_id && <p className="text-[10px] text-muted-foreground">{m.student_id}</p>}
                    </div>
                    {m.is_head && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">👑 部长</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => toggleHead(m)} className="rounded-lg px-2 py-1 text-[10px] transition hover:bg-secondary" title={m.is_head ? "取消部长" : "设为部长"}>
                      <Crown className={`h-3.5 w-3.5 ${m.is_head ? "text-amber-600" : "text-muted-foreground"}`} />
                    </button>
                    <button onClick={() => removeMember(m.id)} className="rounded-lg p-1 text-destructive/60 hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
              {deptMembers.length === 0 && <p className="py-8 text-center text-xs text-muted-foreground">暂无成员</p>}
            </div>

            {addingMember && (
              <div className="mt-3 rounded-lg border border-border bg-card p-3">
                <p className="mb-2 text-xs font-medium">选择要添加的成员</p>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className={inputClass}>
                  <option value="">请选择...</option>
                  {allProfiles.filter(p => !deptMembers.some(m => m.user_id === p.user_id)).map(p => (
                    <option key={p.user_id} value={p.user_id}>{p.display_name || p.user_id}</option>
                  ))}
                </select>
                <div className="mt-2 flex gap-2">
                  <button onClick={() => setAddingMember(false)} className="flex-1 rounded-lg border border-border py-1.5 text-xs text-muted-foreground">取消</button>
                  <button onClick={addMember} disabled={!selectedUserId} className="flex-1 rounded-lg bg-primary py-1.5 text-xs text-primary-foreground disabled:opacity-50">添加</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">← 选择一个部门查看成员</p>
          </div>
        )}
      </div>

      {/* Edit/Create Department Dialog */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-4 font-serif text-lg font-bold">{editing.id ? "编辑部门" : "新增部门"}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">部门名称 *</label>
                <input type="text" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputClass} placeholder="如：编辑部" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">部门描述</label>
                <input type="text" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputClass} placeholder="职责说明" />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-border py-2 text-sm text-muted-foreground">取消</button>
              <button onClick={saveDept} disabled={saving || !editing.name} className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;
