import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Download, Eye, EyeOff, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface DocumentItem {
  id: string;
  name: string;
  file_name: string;
  category: string;
  description: string | null;
  file_date: string | null;
  file_type: string;
  file_url: string | null;
  is_public: boolean;
  sort_order: number;
  created_at?: string;
}

const emptyDoc: Partial<DocumentItem> = { category: "公开文件", file_type: "docx", is_public: true, sort_order: 0 };
const fileTypes = ["doc", "docx", "pdf", "xlsx", "other"];

const DocumentManagement = () => {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [editing, setEditing] = useState<Partial<DocumentItem> | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchItems = async () => {
    const { data } = await (supabase.from("documents" as any) as any).select("*").order("sort_order").order("created_at", { ascending: false });
    setItems((data as DocumentItem[]) || []);
  };

  useEffect(() => { fetchItems(); }, []);

  const uploadFile = async (file: File) => {
    setUploading(true);
    const path = `documents/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("site-assets").upload(path, file, { upsert: true });
    if (error) {
      toast.error("上传失败：" + error.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    const ext = file.name.split(".").pop()?.toLowerCase() || "other";
    setEditing(prev => ({ ...prev, file_name: file.name, file_url: data.publicUrl, file_type: fileTypes.includes(ext) ? ext : "other" }));
    setUploading(false);
    toast.success("文件已上传");
  };

  const save = async () => {
    if (!editing?.name || !editing?.file_name) return;
    setSaving(true);
    const payload = {
      name: editing.name,
      file_name: editing.file_name,
      category: editing.category || "公开文件",
      description: editing.description || null,
      file_date: editing.file_date || null,
      file_type: editing.file_type || "other",
      file_url: editing.file_url || `/files/${editing.file_name}`,
      is_public: editing.is_public ?? true,
      sort_order: Number(editing.sort_order || 0),
    };
    const res = editing.id
      ? await (supabase.from("documents" as any) as any).update(payload).eq("id", editing.id)
      : await (supabase.from("documents" as any) as any).insert(payload);
    setSaving(false);
    if (res.error) toast.error("保存失败：" + res.error.message);
    else { toast.success("文件已保存"); setEditing(null); fetchItems(); }
  };

  const remove = async (id: string) => {
    if (!confirm("确定删除这个文件记录？")) return;
    await (supabase.from("documents" as any) as any).delete().eq("id", id);
    fetchItems();
  };

  const toggle = async (item: DocumentItem) => {
    await (supabase.from("documents" as any) as any).update({ is_public: !item.is_public }).eq("id", item.id);
    fetchItems();
  };

  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="font-serif text-base font-bold">文件中心管理</h2><p className="text-xs text-muted-foreground">管理前台文件中心的公开资料</p></div>
        <button onClick={() => setEditing(emptyDoc)} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> 新增文件</button>
      </div>
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 hover:shadow-md">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-sm font-bold">{item.name}</h3><span className="rounded-full bg-secondary px-2 py-0.5 text-[10px]">{item.category}</span><span className={`rounded-full px-2 py-0.5 text-[10px] ${item.is_public ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>{item.is_public ? "公开" : "隐藏"}</span></div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{item.file_name} · {item.file_date || "未设置日期"} · {item.description}</p>
            </div>
            <div className="flex gap-1">
              {item.file_url && <a href={item.file_url} target="_blank" rel="noreferrer" className="rounded-lg p-2 hover:bg-secondary"><Download className="h-4 w-4" /></a>}
              <button onClick={() => toggle(item)} className="rounded-lg p-2 hover:bg-secondary">{item.is_public ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              <button onClick={() => setEditing(item)} className="rounded-lg p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(item.id)} className="rounded-lg p-2 text-destructive/70 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}><div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="mb-5 font-serif text-lg font-bold">{editing.id ? "编辑文件" : "新增文件"}</h3>
        <div className="space-y-4">
          <input className={inputClass} placeholder="文件名称 *" value={editing.name || ""} onChange={e => setEditing({ ...editing, name: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2"><input className={inputClass} placeholder="分类" value={editing.category || ""} onChange={e => setEditing({ ...editing, category: e.target.value })} /><input className={inputClass} placeholder="日期，如 2025-09" value={editing.file_date || ""} onChange={e => setEditing({ ...editing, file_date: e.target.value })} /></div>
          <textarea className={inputClass} rows={3} placeholder="文件描述" value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} />
          <div className="rounded-lg border border-dashed border-border p-4"><label className="flex cursor-pointer items-center justify-center gap-2 text-sm text-muted-foreground"><Upload className="h-4 w-4" />{uploading ? "上传中..." : "上传文件到资源库"}<input type="file" className="sr-only" onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} /></label></div>
          <input className={inputClass} placeholder="文件名 *" value={editing.file_name || ""} onChange={e => setEditing({ ...editing, file_name: e.target.value })} />
          <input className={inputClass} placeholder="文件链接" value={editing.file_url || ""} onChange={e => setEditing({ ...editing, file_url: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2"><select className={inputClass} value={editing.file_type || "other"} onChange={e => setEditing({ ...editing, file_type: e.target.value })}>{fileTypes.map(t => <option key={t}>{t}</option>)}</select><input className={inputClass} type="number" placeholder="排序" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editing.is_public ?? true} onChange={e => setEditing({ ...editing, is_public: e.target.checked })} /> 前台公开显示</label>
        </div>
        <div className="mt-6 flex gap-2"><button onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm">取消</button><button onClick={save} disabled={saving || !editing.name || !editing.file_name} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "保存中..." : "保存"}</button></div>
      </div></div>}
    </div>
  );
};

export default DocumentManagement;
