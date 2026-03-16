import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, Save, X, Upload, BookOpen, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { leadershipData } from "@/data/leadershipData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Member {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_id: string | null;
}

interface Submission {
  id: string;
  title: string;
  genre: string | null;
  author_name: string;
}

const MemberDirectoryManagement = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState<string>("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Member>>({});
  const [adding, setAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", term: "", role_title: "", bio: "" });
  const [importing, setImporting] = useState(false);

  // Works linking
  const [worksDialogMember, setWorksDialogMember] = useState<Member | null>(null);
  const [memberWorks, setMemberWorks] = useState<{ id: string; submission_id: string; submissions: Submission }[]>([]);
  const [availableSubmissions, setAvailableSubmissions] = useState<Submission[]>([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("members")
      .select("*")
      .order("term", { ascending: false })
      .order("name");
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const terms = [...new Set(members.map(m => m.term))].sort((a, b) => b.localeCompare(a));

  const filtered = filterTerm ? members.filter(m => m.term === filterTerm) : members;

  const handleAdd = async () => {
    if (!newMember.name.trim() || !newMember.term.trim()) return;
    const { error } = await supabase.from("members").insert({
      name: newMember.name.trim(),
      term: newMember.term.trim(),
      role_title: newMember.role_title.trim() || null,
      bio: newMember.bio.trim() || null,
    });
    if (error) { toast({ title: "添加失败", description: error.message, variant: "destructive" }); return; }
    toast({ title: "添加成功" });
    setNewMember({ name: "", term: "", role_title: "", bio: "" });
    setAdding(false);
    fetchMembers();
  };

  const handleSaveEdit = async (id: string) => {
    const { error } = await supabase.from("members").update(editData).eq("id", id);
    if (error) { toast({ title: "保存失败", description: error.message, variant: "destructive" }); return; }
    toast({ title: "已保存" });
    setEditing(null);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除该成员吗？")) return;
    await supabase.from("members").delete().eq("id", id);
    toast({ title: "已删除" });
    fetchMembers();
  };

  const handleImportLeadershipData = async () => {
    setImporting(true);
    const rows: { name: string; term: string; role_title: string }[] = [];
    for (const t of leadershipData) {
      rows.push({ name: t.president, term: t.year, role_title: "社长" });
      (t.vicePresidents || []).forEach(vp => rows.push({ name: vp, term: t.year, role_title: "副社长" }));
      t.departments.forEach(d => d.names.forEach(n => rows.push({ name: n, term: t.year, role_title: d.title })));
    }
    const { error } = await supabase.from("members").insert(rows);
    if (error) {
      toast({ title: "导入失败", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `成功导入 ${rows.length} 条记录` });
      fetchMembers();
    }
    setImporting(false);
  };

  // Works management
  const openWorksDialog = async (member: Member) => {
    setWorksDialogMember(member);
    const [worksRes, subsRes] = await Promise.all([
      supabase.from("member_works").select("id, submission_id, submissions(id, title, genre, author_name)").eq("member_id", member.id) as any,
      supabase.from("submissions").select("id, title, genre, author_name").eq("status", "approved").order("created_at", { ascending: false }).limit(100),
    ]);
    setMemberWorks(worksRes.data || []);
    setAvailableSubmissions(subsRes.data || []);
  };

  const linkWork = async () => {
    if (!selectedSubmissionId || !worksDialogMember) return;
    const { error } = await supabase.from("member_works").insert({
      member_id: worksDialogMember.id,
      submission_id: selectedSubmissionId,
    });
    if (error) { toast({ title: "关联失败", description: error.message, variant: "destructive" }); return; }
    toast({ title: "已关联" });
    setSelectedSubmissionId("");
    openWorksDialog(worksDialogMember);
  };

  const unlinkWork = async (workId: string) => {
    await supabase.from("member_works").delete().eq("id", workId);
    toast({ title: "已取消关联" });
    if (worksDialogMember) openWorksDialog(worksDialogMember);
  };

  if (loading) return <p className="animate-pulse text-muted-foreground">加载中...</p>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterTerm}
            onChange={e => setFilterTerm(e.target.value)}
            className="rounded-lg border border-border bg-secondary/30 px-3 py-1.5 text-xs"
          >
            <option value="">全部届别</option>
            {terms.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <span className="text-xs text-muted-foreground">{filtered.length} 人</span>
        </div>
        <div className="flex gap-2">
          {members.length === 0 && (
            <button
              onClick={handleImportLeadershipData}
              disabled={importing}
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition hover:bg-accent/80"
            >
              <Upload className="h-3.5 w-3.5" />
              {importing ? "导入中..." : "导入历届干部"}
            </button>
          )}
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5" /> 添加成员
          </button>
        </div>
      </div>

      {/* Add Form */}
      {adding && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <input placeholder="姓名 *" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs" />
            <input placeholder="届别 (如2025届) *" value={newMember.term} onChange={e => setNewMember({ ...newMember, term: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs" />
            <input placeholder="职务" value={newMember.role_title} onChange={e => setNewMember({ ...newMember, role_title: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs" />
            <input placeholder="个性签名" value={newMember.bio} onChange={e => setNewMember({ ...newMember, bio: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground">确认添加</button>
            <button onClick={() => setAdding(false)} className="rounded-lg bg-secondary px-3 py-1 text-xs">取消</button>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-secondary/50">
            <tr>
              <th className="px-3 py-2 text-left font-medium">姓名</th>
              <th className="px-3 py-2 text-left font-medium">届别</th>
              <th className="px-3 py-2 text-left font-medium">职务</th>
              <th className="px-3 py-2 text-left font-medium">个性签名</th>
              <th className="px-3 py-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-secondary/30">
                {editing === m.id ? (
                  <>
                    <td className="px-3 py-2">
                      <input value={editData.name || ""} onChange={e => setEditData({ ...editData, name: e.target.value })}
                        className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={editData.term || ""} onChange={e => setEditData({ ...editData, term: e.target.value })}
                        className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={editData.role_title || ""} onChange={e => setEditData({ ...editData, role_title: e.target.value })}
                        className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs" />
                    </td>
                    <td className="px-3 py-2">
                      <input value={editData.bio || ""} onChange={e => setEditData({ ...editData, bio: e.target.value })}
                        className="w-full rounded border border-border bg-background px-1.5 py-1 text-xs" />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => handleSaveEdit(m.id)} className="mr-1 text-primary"><Save className="h-3.5 w-3.5" /></button>
                      <button onClick={() => setEditing(null)} className="text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-3 py-2 font-medium">{m.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.term}</td>
                    <td className="px-3 py-2"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">{m.role_title || "社员"}</span></td>
                    <td className="px-3 py-2 max-w-[200px] truncate text-muted-foreground italic">{m.bio || "-"}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => openWorksDialog(m)} className="mr-1 text-muted-foreground hover:text-primary" title="管理作品集"><BookOpen className="h-3.5 w-3.5 inline" /></button>
                      <button onClick={() => { setEditing(m.id); setEditData(m); }} className="mr-1 text-muted-foreground hover:text-primary" title="编辑"><Edit2 className="h-3.5 w-3.5 inline" /></button>
                      <button onClick={() => handleDelete(m.id)} className="text-muted-foreground hover:text-destructive" title="删除"><Trash2 className="h-3.5 w-3.5 inline" /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Works linking dialog */}
      <Dialog open={!!worksDialogMember} onOpenChange={(open) => !open && setWorksDialogMember(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-sm">管理作品集 — {worksDialogMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {/* Link new */}
            <div className="flex gap-2">
              <select value={selectedSubmissionId} onChange={e => setSelectedSubmissionId(e.target.value)}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs">
                <option value="">选择已审核作品...</option>
                {availableSubmissions
                  .filter(s => !memberWorks.some(w => w.submission_id === s.id))
                  .map(s => <option key={s.id} value={s.id}>{s.title} — {s.author_name}</option>)}
              </select>
              <button onClick={linkWork} disabled={!selectedSubmissionId}
                className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50">
                <Link2 className="h-3.5 w-3.5" />
              </button>
            </div>
            {/* Existing works */}
            {memberWorks.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">暂无关联作品</p>
            ) : (
              <div className="space-y-2">
                {memberWorks.map(w => (
                  <div key={w.id} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
                    <div>
                      <p className="text-xs font-medium">{w.submissions?.title}</p>
                      <p className="text-[10px] text-muted-foreground">{w.submissions?.genre}</p>
                    </div>
                    <button onClick={() => unlinkWork(w.id)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MemberDirectoryManagement;
