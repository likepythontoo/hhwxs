import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AboutItem { id: string; type: string; title: string; subtitle: string | null; body: string | null; meta: any; icon: string | null; is_active: boolean; sort_order: number; }
const typeLabels: Record<string, string> = { stat: "统计卡片", timeline: "发展历程", award: "荣誉里程碑", feature: "核心特色" };
const icons = ["Building2", "Users", "BookOpen", "Trophy", "Star", "Mic", "Award", "Crown", "Feather", "Monitor"];

const AboutContentManagement = () => {
  const [items, setItems] = useState<AboutItem[]>([]);
  const [active, setActive] = useState("stat");
  const [editing, setEditing] = useState<Partial<AboutItem> | null>(null);
  const [level, setLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const fetchItems = async () => {
    const { data } = await (supabase.from("about_content_items" as any) as any).select("*").order("type").order("sort_order");
    setItems((data as AboutItem[]) || []);
  };
  useEffect(() => { fetchItems(); }, []);
  const openEdit = (item?: AboutItem) => { setEditing(item || { type: active, is_active: true, sort_order: 0, meta: {} }); setLevel(item?.meta?.level || ""); };
  const save = async () => {
    if (!editing?.title || !editing?.type) return;
    setSaving(true);
    const payload = { type: editing.type, title: editing.title, subtitle: editing.subtitle || null, body: editing.body || null, meta: editing.type === "award" ? { level } : (editing.meta || {}), icon: editing.icon || null, is_active: editing.is_active ?? true, sort_order: Number(editing.sort_order || 0) };
    const res = editing.id ? await (supabase.from("about_content_items" as any) as any).update(payload).eq("id", editing.id) : await (supabase.from("about_content_items" as any) as any).insert(payload);
    setSaving(false);
    if (res.error) toast.error("保存失败：" + res.error.message); else { toast.success("社团概况内容已保存"); setEditing(null); fetchItems(); }
  };
  const remove = async (id: string) => { if (!confirm("确定删除？")) return; await (supabase.from("about_content_items" as any) as any).delete().eq("id", id); fetchItems(); };
  const toggle = async (item: AboutItem) => { await (supabase.from("about_content_items" as any) as any).update({ is_active: !item.is_active }).eq("id", item.id); fetchItems(); };
  const inputClass = "w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none";
  return <div><div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-base font-bold">社团概况内容</h2><p className="text-xs text-muted-foreground">管理关于页的统计、历程、荣誉与特色</p></div><button onClick={() => openEdit()} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"><Plus className="h-3.5 w-3.5" /> 新增内容</button></div><Tabs value={active} onValueChange={setActive}><TabsList className="mb-4 flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">{Object.entries(typeLabels).map(([k, v]) => <TabsTrigger key={k} value={k} className="rounded-lg border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{v}</TabsTrigger>)}</TabsList>{Object.keys(typeLabels).map(type => <TabsContent key={type} value={type} className="mt-0 space-y-3">{items.filter(i => i.type === type).map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4"><div className="min-w-0"><div className="flex items-center gap-2"><h3 className="font-serif text-sm font-bold">{item.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] ${item.is_active ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"}`}>{item.is_active ? "显示" : "隐藏"}</span></div><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.subtitle}{item.body ? ` · ${item.body}` : ""}</p></div><div className="flex gap-1"><button onClick={() => toggle(item)} className="rounded-lg p-2 hover:bg-secondary">{item.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button><button onClick={() => openEdit(item)} className="rounded-lg p-2 hover:bg-secondary"><Pencil className="h-4 w-4" /></button><button onClick={() => remove(item.id)} className="rounded-lg p-2 text-destructive/70 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button></div></div>)}</TabsContent>)}</Tabs>{editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}><div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={e => e.stopPropagation()}><h3 className="mb-5 font-serif text-lg font-bold">{editing.id ? "编辑内容" : "新增内容"}</h3><div className="space-y-4"><select className={inputClass} value={editing.type || active} onChange={e => setEditing({ ...editing, type: e.target.value })}>{Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select><input className={inputClass} placeholder="标题 *" value={editing.title || ""} onChange={e => setEditing({ ...editing, title: e.target.value })} /><input className={inputClass} placeholder={editing.type === "award" ? "年份" : "副标题 / 数值 / 年份范围"} value={editing.subtitle || ""} onChange={e => setEditing({ ...editing, subtitle: e.target.value })} /><textarea className={inputClass} rows={editing.type === "timeline" ? 7 : 4} placeholder={editing.type === "timeline" ? "每行一个事件，格式：年份｜事件内容" : editing.type === "award" ? "颁发机构" : "正文描述"} value={editing.body || ""} onChange={e => setEditing({ ...editing, body: e.target.value })} />{editing.type === "award" && <input className={inputClass} placeholder="荣誉级别，如 国家级 / 省级 / 校级" value={level} onChange={e => setLevel(e.target.value)} />}<div className="grid gap-3 sm:grid-cols-2"><select className={inputClass} value={editing.icon || ""} onChange={e => setEditing({ ...editing, icon: e.target.value })}><option value="">无图标</option>{icons.map(i => <option key={i}>{i}</option>)}</select><input className={inputClass} type="number" placeholder="排序" value={editing.sort_order || 0} onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></div><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={editing.is_active ?? true} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} /> 前台显示</label></div><div className="mt-6 flex gap-2"><button onClick={() => setEditing(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm">取消</button><button onClick={save} disabled={saving || !editing.title} className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{saving ? "保存中..." : "保存"}</button></div></div></div>}</div>;
};
export default AboutContentManagement;
