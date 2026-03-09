import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, Eye, EyeOff, Upload, Loader2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Journal {
  id: string;
  title: string;
  issue_number: string | null;
  year: number;
  month: number | null;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  table_of_contents: string | null;
  is_published: boolean;
  created_at: string;
}

const emptyForm = {
  title: "",
  issue_number: "",
  year: new Date().getFullYear(),
  month: null as number | null,
  description: "",
  table_of_contents: "",
  is_published: false,
};

const JournalManagement = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Journal | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchJournals = async () => {
    const { data } = await supabase.from("journals").select("*").order("year", { ascending: false }).order("month", { ascending: false });
    setJournals((data as Journal[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchJournals(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setCoverFile(null);
    setPdfFile(null);
    setDialogOpen(true);
  };

  const openEdit = (j: Journal) => {
    setEditing(j);
    setForm({
      title: j.title,
      issue_number: j.issue_number || "",
      year: j.year,
      month: j.month,
      description: j.description || "",
      table_of_contents: j.table_of_contents || "",
      is_published: j.is_published,
    });
    setCoverFile(null);
    setPdfFile(null);
    setDialogOpen(true);
  };

  const uploadFile = async (file: File, folder: string) => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("journals").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("journals").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!form.title || !form.year) { toast.error("请填写标题和年份"); return; }
    setSaving(true);
    try {
      let cover_url = editing?.cover_url || null;
      let pdf_url = editing?.pdf_url || null;

      if (coverFile) cover_url = await uploadFile(coverFile, "covers");
      if (pdfFile) pdf_url = await uploadFile(pdfFile, "pdfs");

      const payload = {
        title: form.title,
        issue_number: form.issue_number || null,
        year: form.year,
        month: form.month,
        description: form.description || null,
        table_of_contents: form.table_of_contents || null,
        is_published: form.is_published,
        cover_url,
        pdf_url,
      };

      if (editing) {
        const { error } = await supabase.from("journals").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("期刊更新成功");
      } else {
        const { error } = await supabase.from("journals").insert(payload);
        if (error) throw error;
        toast.success("期刊创建成功");
      }

      setDialogOpen(false);
      fetchJournals();
    } catch (err: any) {
      toast.error(err.message || "操作失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (j: Journal) => {
    if (!confirm(`确认删除「${j.title}」？`)) return;
    const { error } = await supabase.from("journals").delete().eq("id", j.id);
    if (error) { toast.error("删除失败"); return; }
    toast.success("已删除");
    fetchJournals();
  };

  const togglePublish = async (j: Journal) => {
    const { error } = await supabase.from("journals").update({ is_published: !j.is_published }).eq("id", j.id);
    if (error) { toast.error("操作失败"); return; }
    toast.success(j.is_published ? "已取消发布" : "已发布");
    fetchJournals();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">共 {journals.length} 期</p>
        <Button onClick={openCreate} size="sm"><Plus className="mr-1 h-4 w-4" />新增期刊</Button>
      </div>

      {journals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">暂无期刊，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-3">
          {journals.map((j) => (
            <div key={j.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
              {/* Cover thumbnail */}
              <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-secondary">
                {j.cover_url ? (
                  <img src={j.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-sm font-bold">{j.title}</h4>
                  {j.issue_number && <span className="text-xs text-muted-foreground">({j.issue_number})</span>}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${j.is_published ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {j.is_published ? "已发布" : "草稿"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{j.year}年{j.month ? `${j.month}月` : ""}</p>
                {j.pdf_url && <span className="text-[10px] text-primary">📄 已上传PDF</span>}
              </div>

              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => togglePublish(j)} title={j.is_published ? "取消发布" : "发布"}>
                  {j.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(j)}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(j)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "编辑期刊" : "新增期刊"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>标题 *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="如：《红湖》2025年春季刊" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>年份 *</Label>
                <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
              </div>
              <div>
                <Label>月份</Label>
                <Input type="number" min={1} max={12} value={form.month || ""} onChange={(e) => setForm({ ...form, month: e.target.value ? Number(e.target.value) : null })} placeholder="可选" />
              </div>
              <div>
                <Label>期号</Label>
                <Input value={form.issue_number} onChange={(e) => setForm({ ...form, issue_number: e.target.value })} placeholder="如：总第42期" />
              </div>
            </div>
            <div>
              <Label>简介</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="本期内容简介..." rows={2} />
            </div>
            <div>
              <Label>目录</Label>
              <Textarea value={form.table_of_contents} onChange={(e) => setForm({ ...form, table_of_contents: e.target.value })} placeholder="每行一个目录条目..." rows={4} />
            </div>
            <div>
              <Label>封面图片</Label>
              <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              {editing?.cover_url && !coverFile && <p className="mt-1 text-[10px] text-muted-foreground">已有封面，选择新文件将替换</p>}
            </div>
            <div>
              <Label>PDF文件</Label>
              <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              {editing?.pdf_url && !pdfFile && <p className="mt-1 text-[10px] text-muted-foreground">已有PDF，选择新文件将替换</p>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label>立即发布</Label>
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "保存修改" : "创建期刊"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalManagement;
