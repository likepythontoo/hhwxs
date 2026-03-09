import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Edit2, Eye, EyeOff, Loader2, BookOpen, Library, FileText, ArrowUp, ArrowDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  type: string;
  created_at: string;
}

interface Submission {
  id: string;
  title: string;
  author_name: string;
  genre: string | null;
  content: string;
}

interface JournalArticle {
  id: string;
  journal_id: string;
  submission_id: string;
  sort_order: number;
  section_title: string | null;
  submission?: Submission;
}

const emptyForm = {
  title: "",
  issue_number: "",
  year: new Date().getFullYear(),
  month: null as number | null,
  description: "",
  table_of_contents: "",
  is_published: false,
  type: "期刊" as string,
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
  const [activeTab, setActiveTab] = useState("期刊");

  // Article editor state
  const [articleDialogOpen, setArticleDialogOpen] = useState(false);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  const [approvedSubmissions, setApprovedSubmissions] = useState<Submission[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);

  const fetchJournals = async () => {
    const { data } = await supabase.from("journals").select("*").order("year", { ascending: false }).order("month", { ascending: false });
    setJournals((data as Journal[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchJournals(); }, []);

  const filteredJournals = journals.filter(j => j.type === activeTab);

  const openCreate = (type: string) => {
    setEditing(null);
    setForm({ ...emptyForm, type });
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
      type: j.type,
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
        type: form.type,
        cover_url,
        pdf_url,
      };

      if (editing) {
        const { error } = await supabase.from("journals").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("更新成功");
      } else {
        const { error } = await supabase.from("journals").insert(payload);
        if (error) throw error;
        toast.success("创建成功");
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

  // ===== Article Editor =====
  const openArticleEditor = async (journalId: string) => {
    setEditingJournalId(journalId);
    setArticlesLoading(true);
    setArticleDialogOpen(true);

    const [artRes, subRes] = await Promise.all([
      supabase.from("journal_articles").select("*").eq("journal_id", journalId).order("sort_order"),
      supabase.from("submissions").select("id, title, author_name, genre, content").eq("status", "approved"),
    ]);

    const articleData = (artRes.data || []) as JournalArticle[];
    const submissionData = (subRes.data || []) as Submission[];

    // Attach submission info to articles
    const subMap = new Map(submissionData.map(s => [s.id, s]));
    const enriched = articleData.map(a => ({ ...a, submission: subMap.get(a.submission_id) }));

    setArticles(enriched);
    setApprovedSubmissions(submissionData);
    setArticlesLoading(false);
  };

  const addArticle = async (submissionId: string) => {
    if (!editingJournalId) return;
    if (articles.some(a => a.submission_id === submissionId)) {
      toast.error("该作品已添加");
      return;
    }
    const maxOrder = articles.length > 0 ? Math.max(...articles.map(a => a.sort_order)) + 1 : 0;
    const { error } = await supabase.from("journal_articles").insert({
      journal_id: editingJournalId,
      submission_id: submissionId,
      sort_order: maxOrder,
    });
    if (error) { toast.error("添加失败"); return; }
    toast.success("已添加");
    openArticleEditor(editingJournalId);
  };

  const removeArticle = async (articleId: string) => {
    const { error } = await supabase.from("journal_articles").delete().eq("id", articleId);
    if (error) { toast.error("移除失败"); return; }
    if (editingJournalId) openArticleEditor(editingJournalId);
  };

  const moveArticle = async (articleId: string, direction: "up" | "down") => {
    const idx = articles.findIndex(a => a.id === articleId);
    if (idx < 0) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= articles.length) return;

    const updates = [
      supabase.from("journal_articles").update({ sort_order: articles[swapIdx].sort_order }).eq("id", articles[idx].id),
      supabase.from("journal_articles").update({ sort_order: articles[idx].sort_order }).eq("id", articles[swapIdx].id),
    ];
    await Promise.all(updates);
    if (editingJournalId) openArticleEditor(editingJournalId);
  };

  const updateSectionTitle = async (articleId: string, title: string) => {
    await supabase.from("journal_articles").update({ section_title: title || null }).eq("id", articleId);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const availableSubmissions = approvedSubmissions.filter(s => !articles.some(a => a.submission_id === s.id));

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="期刊" className="gap-1"><BookOpen className="h-3.5 w-3.5" />期刊《红湖》</TabsTrigger>
            <TabsTrigger value="报刊" className="gap-1"><Library className="h-3.5 w-3.5" />报刊《墨香阁》</TabsTrigger>
          </TabsList>
          <Button onClick={() => openCreate(activeTab)} size="sm"><Plus className="mr-1 h-4 w-4" />新增{activeTab}</Button>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {filteredJournals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">暂无{activeTab}，点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJournals.map((j) => (
                <div key={j.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
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
                    {j.type === "报刊" && (
                      <button onClick={() => openArticleEditor(j.id)} className="mt-1 text-[10px] text-primary hover:underline">
                        📝 编排文章内容
                      </button>
                    )}
                    {j.type === "期刊" && j.pdf_url && <span className="text-[10px] text-primary">📄 已上传PDF</span>}
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
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editing ? "编辑" : "新增"}{form.type}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>标题 *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.type === "报刊" ? "如：《墨香阁》2025年春季号" : "如：《红湖》2025年春季刊"} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>年份 *</Label><Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></div>
              <div><Label>月份</Label><Input type="number" min={1} max={12} value={form.month || ""} onChange={(e) => setForm({ ...form, month: e.target.value ? Number(e.target.value) : null })} placeholder="可选" /></div>
              <div><Label>期号</Label><Input value={form.issue_number} onChange={(e) => setForm({ ...form, issue_number: e.target.value })} placeholder="如：总第42期" /></div>
            </div>
            <div><Label>简介</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            {form.type === "期刊" && (
              <>
                <div><Label>目录</Label><Textarea value={form.table_of_contents} onChange={(e) => setForm({ ...form, table_of_contents: e.target.value })} rows={4} /></div>
                <div><Label>PDF文件</Label><Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} /></div>
              </>
            )}
            <div><Label>封面图片</Label><Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /><Label>立即发布</Label></div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "保存修改" : "创建"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article Editor Dialog (报刊) */}
      <Dialog open={articleDialogOpen} onOpenChange={setArticleDialogOpen}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">📝 编排文章内容</DialogTitle>
          </DialogHeader>
          {articlesLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="space-y-4">
              {/* Current articles */}
              <div>
                <h4 className="mb-2 text-sm font-semibold">已选文章（{articles.length}篇）</h4>
                {articles.length === 0 ? (
                  <p className="rounded border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                    暂未添加文章，从下方已审核作品中选择添加
                  </p>
                ) : (
                  <div className="space-y-2">
                    {articles.map((a, i) => (
                      <div key={a.id} className="flex items-center gap-2 rounded border border-border bg-card p-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium">{a.submission?.title || "未知作品"}</p>
                          <p className="text-[10px] text-muted-foreground">{a.submission?.author_name} · {a.submission?.genre}</p>
                          <Input
                            placeholder="栏目标题（可选，如：卷首语、诗歌专栏）"
                            defaultValue={a.section_title || ""}
                            onBlur={(e) => updateSectionTitle(a.id, e.target.value)}
                            className="mt-1 h-7 text-xs"
                          />
                        </div>
                        <div className="flex shrink-0 gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => moveArticle(a.id, "up")}><ArrowUp className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === articles.length - 1} onClick={() => moveArticle(a.id, "down")}><ArrowDown className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeArticle(a.id)}><X className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available submissions */}
              <div>
                <h4 className="mb-2 text-sm font-semibold">可添加的已审核作品（{availableSubmissions.length}篇）</h4>
                {availableSubmissions.length === 0 ? (
                  <p className="text-xs text-muted-foreground">没有可添加的作品，请先在「作品投稿」中审核通过一些作品</p>
                ) : (
                  <div className="max-h-[200px] space-y-1 overflow-y-auto">
                    {availableSubmissions.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded bg-secondary/50 px-3 py-2">
                        <div>
                          <p className="text-xs font-medium">{s.title}</p>
                          <p className="text-[10px] text-muted-foreground">{s.author_name} · {s.genre}</p>
                        </div>
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => addArticle(s.id)}>
                          <Plus className="mr-1 h-3 w-3" />添加
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalManagement;
