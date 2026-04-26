import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, Mail, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface MessageItem { id: string; name: string; email: string | null; content: string; is_read: boolean | null; created_at: string; }
const filters = ["全部", "未读", "已读"];

const MessageManagement = () => {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [filter, setFilter] = useState("全部");
  const fetchItems = async () => { const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: false }); setItems((data as MessageItem[]) || []); };
  useEffect(() => { fetchItems(); }, []);
  const filtered = useMemo(() => items.filter(i => filter === "全部" || (filter === "未读" ? !i.is_read : i.is_read)), [items, filter]);
  const toggle = async (item: MessageItem) => { const { error } = await supabase.from("messages").update({ is_read: !item.is_read }).eq("id", item.id); if (error) toast.error(error.message); else fetchItems(); };
  const remove = async (id: string) => { if (!confirm("确定删除这条留言？")) return; const { error } = await supabase.from("messages").delete().eq("id", id); if (error) toast.error(error.message); else fetchItems(); };
  return <div><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-base font-bold">留言管理</h2><p className="text-xs text-muted-foreground">查看用户在联系我们页面提交的留言</p></div><div className="flex gap-2">{filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{f}</button>)}</div></div><div className="space-y-3">{filtered.map(item => <div key={item.id} className={`rounded-xl border p-4 ${item.is_read ? "border-border bg-card" : "border-primary/30 bg-primary/5"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-sm font-bold">{item.name}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] ${item.is_read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}>{item.is_read ? "已读" : "未读"}</span>{item.email && <a href={`mailto:${item.email}`} className="inline-flex items-center gap-1 text-xs text-primary"><Mail className="h-3 w-3" />{item.email}</a>}</div><p className="mt-1 text-[11px] text-muted-foreground">{new Date(item.created_at).toLocaleString("zh-CN")}</p></div><div className="flex gap-1"><button onClick={() => toggle(item)} className="rounded-lg p-2 hover:bg-secondary" title={item.is_read ? "标为未读" : "标为已读"}>{item.is_read ? <EyeOff className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}</button><button onClick={() => remove(item.id)} className="rounded-lg p-2 text-destructive/70 hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button></div></div><p className="mt-3 whitespace-pre-wrap rounded-lg bg-secondary/40 p-3 text-sm leading-relaxed">{item.content}</p></div>)}{filtered.length === 0 && <div className="py-16 text-center text-sm text-muted-foreground"><Eye className="mx-auto mb-3 h-8 w-8 opacity-40" />暂无留言</div>}</div></div>;
};
export default MessageManagement;
