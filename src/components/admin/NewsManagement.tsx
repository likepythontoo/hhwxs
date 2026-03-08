import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  cover_url: string | null;
  is_published: boolean | null;
  published_at: string | null;
  created_at: string;
}

const NewsManagement = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchNews = async () => {
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    setItems((data as NewsItem[]) || []);
  };

  useEffect(() => { fetchNews(); }, []);

  const save = async () => {
    if (!editing?.title) return;
    setSaving(true);
    const payload = {
      title: editing.title,
      content: editing.content || null,
      category: editing.category || "公告",
      cover_url: editing.cover_url || null,
      is_published: editing.is_published ?? false,
      published_at: editing.is_published ? new Date().toISOString() : null,
    };
    if (editing.id) {
      await supabase.from("news").update(payload).eq("id", editing.id);
    } else {
      await supabase.from("news").insert(payload);
    }
    setSaving(false);
    setEditing(null);
    fetchNews();
  };

  const deleteItem = async (id: string) => {
    if (!confirm("确定删除？")) return;
    await supabase.from("news").delete().eq("id", id);
    fetchNews();
  };

  const togglePublish = async (item: NewsItem) => {
    await supabase.from("news").update({
      is_published: !item.is_published,
      published_at: !item.is_published ? new Date().toISOString() : null,
    }).eq("id", item.id);
    fetchNews();
  };

  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none transition";
  const categories = ["公告", "新闻", "通知", "活动回顾"];

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-base font-bold">新闻公告 ({items.length})</h2>
        <button onClick={() => setEditing({ is_published: false, category: "公告" })} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
          <Plus className="h-3.5 w-3.5" /> 发布新闻
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm font-bold">{item.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${item.is_published ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>
                  {item.is_published ? "已发布" : "草稿"}
                </span>
                <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent-foreground">{item.category}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString("zh-CN")}
                {item.content && ` · ${item.content.slice(0, 60)}...`}
              </p>
            </div>
            <div className="flex gap-1 opacity-60 group-hover:opacity-100">
              <button onClick={() => togglePublish(item)} className="rounded-lg p-2 transition hover:bg-secondary" title={item.is_published ? "取消发布" : "发布"}>
                {item.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button onClick={() => setEditing(item)} className="rounded-lg p-2 transition hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => deleteItem(item.id)} className="rounded-lg p-2 text-destructive/60 transition hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无新闻公告</p>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-5 font-serif text-lg font-bold">{editing.id ? "编辑新闻" : "📢 发布新闻"}</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">标题 *</label>
                <input type="text" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputClass} placeholder="新闻标题" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">分类</label>
                <div className="flex gap-2">
                  {categories.map(c => (
                    <button key={c} onClick={() => setEditing({ ...editing, category: c })} className={`rounded-full px-3 py-1 text-xs ${editing.category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">内容</label>
                <textarea value={editing.content || ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className={inputClass} rows={8} placeholder="新闻正文..." />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">封面图片URL</label>
                <input type="text" value={editing.cover_url || ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <div className={`relative h-5 w-9 rounded-full transition ${editing.is_published ? "bg-primary" : "bg-muted"}`}>
                  <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${editing.is_published ? "translate-x-4" : "translate-x-0.5"}`} />
                  <input type="checkbox" className="sr-only" checked={editing.is_published ?? false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} />
                </div>
                立即发布
              </label>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground transition hover:bg-secondary">取消</button>
              <button onClick={save} disabled={saving || !editing.title} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground shadow-sm disabled:opacity-50">{saving ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewsManagement;
