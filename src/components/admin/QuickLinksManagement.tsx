import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface QuickLink { id: string; label: string; description: string | null; href: string; icon: string; accent: string | null; is_active: boolean; sort_order: number; }
const emptyLink: Partial<QuickLink> = { href: "/", icon: "FileText", accent: "from-primary/10 to-primary/5", is_active: true, sort_order: 0 };
const icons = ["PenLine", "BookOpen", "Users", "CalendarCheck", "Download", "FileBarChart", "FileText", "MessageSquare", "Star"];

const QuickLinksManagement = () => {
  const [items, setItems] = useState<QuickLink[]>([]);
  const [editing, setEditing] = useState<Partial<QuickLink> | null>(null);
  const [saving, setSaving] = useState(false);
  const fetchItems = async () => {
    const { data } = await (supabase.from("quick_links" as any) as any).select("*").order("sort_order");
    setItems((data as QuickLink[]) || []);
  };
  useEffect(() => { fetchItems(); }, []);
  const save = async () => {
    if (!editing?.label || !editing?.href) return;
    setSaving(true);
    const payload = { label: editing.label, description: editing.description || null, href: editing.href, icon: editing.icon || "FileText", accent: editing.accent || null, is_active: editing.is_active ?? true, sort_order: Number(editing.sort_order || 0) };
    const res = editing.id ? await (supabase.from("quick_links" as any) as any).update(payload).eq("id", editing.id) : await (supabase.from("quick_links" as any) as any).insert(payload);
    setSaving(false);
    if (res.error) toast.error("保存失败：" + res.error.message); else { toast.success("快捷入口已保存"); setEditing(null); fetchItems(); }
  };
  const remove = async (id: string) => { if (!confirm("确定删除？")) return; await (supabase.from("quick_links" as any) as any).delete().eq("id", id); fetchItems(); };
  const toggle = async (item: QuickLink) => { await (supabase.from("quick_links" as any) as any).update({ is_active: !item.is_active }).eq("id", item.id); fetchItems(); };
  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none";
  return <div><div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-base font-bold">首页快捷入口</h2><p className="text-xs text-muted-foreground">控制首页“功能导航”的入口卡片</p></div><button onClick={() => setEditing(emptyLink)} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> 新增入口</button></div><div className="grid gap-3 md:grid-cols-2">{items.map(item => <div key={item.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-serif text-sm font-bold">{item.label}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] ${item.is_active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>{item.is_active ? "启用" : "隐藏"}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.description} · {item.href}</p></div><div className="flex gap-1"><button onClick={() => toggle(item)} className="rounded-lg p-2 hover:bg-secondary">{item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button onClick={() => setEditing(item)} className="rounded-lg p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(item.id)} className="rounded-lg p-2 text-destructive/70 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div>{editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}><div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}><h3 className="mb-5 font-serif text-lg font-bold">{editing.id ? "编辑入口" : "新增入口"}</h3><div className="space-y-4"><input className={inputClass} placeholder="标题 *" value={editing.label || ""} onChange={e => setEditing({ ...editing, label: e.target.value })} /><input className={inputClass} placeholder="描述" value={editing.description || ""} onChange={e => setEditing({ ...editing, description: e.target.value })} /><input className={inputClass} placeholder="链接，如 /submit" value={editing.href || ""} onChange={e => setEditing({ ...editing, href: e.target.value })} /><div className="grid gap-3 sm:grid-cols-2"><select className={inputClass} value={editing.icon || "FileText"} onChange={e => setEditing({ ...editing, icon: e.target.value })}>{icons.map(i => <option key={i}>{i}</option>)}</select><input className={inputClass} type="number" placeholder="排序" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div><input className={inputClass} placeholder="渐变样式" value={editing.accent || ""} onChange={e => setEditing({ ...editing, accent: e.target.value })} /><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editing.is_active ?? true} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> 启用显示</label></div><div className="mt-6 flex gap-2"><button onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm">取消</button><button onClick={save} disabled={saving || !editing.label || !editing.href} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "保存中..." : "保存"}</button></div></div></div>}</div>;
};
export default QuickLinksManagement;
