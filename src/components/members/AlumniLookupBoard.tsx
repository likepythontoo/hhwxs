import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SearchX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface LookupItem {
  id: string;
  author_name: string;
  term: string | null;
  target_name: string;
  content: string;
  contact: string | null;
  is_resolved: boolean;
  created_at: string;
}

const AlumniLookupBoard = ({ currentUserId }: { currentUserId: string | null }) => {
  const [items, setItems] = useState<LookupItem[]>([]);
  const [form, setForm] = useState({ target_name: "", term: "", content: "", contact: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("alumni_lookups")
      .select("id, author_name, term, target_name, content, contact, is_resolved, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(40);
    setItems((data as LookupItem[]) || []);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!currentUserId) return toast({ title: "请先登录", variant: "destructive" });
    if (!form.target_name.trim() || form.content.trim().length < 5) {
      return toast({ title: "请填写要寻找的人和说明", variant: "destructive" });
    }
    setSaving(true);
    const { data: profile } = await supabase
      .from("profiles").select("display_name").eq("user_id", currentUserId).maybeSingle();
    const { error } = await supabase.from("alumni_lookups").insert({
      author_id: currentUserId,
      author_name: profile?.display_name || "校友",
      target_name: form.target_name.trim(),
      term: form.term || null,
      content: form.content.trim().slice(0, 800),
      contact: form.contact || null,
    });
    setSaving(false);
    if (error) return toast({ title: "提交失败", description: error.message, variant: "destructive" });
    setForm({ target_name: "", term: "", content: "", contact: "" });
    toast({ title: "已提交", description: "管理员审核通过后公开显示" });
  };

  return (
    <section className="py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="mb-2 flex items-center justify-center gap-2 text-center font-serif text-2xl font-bold tracking-widest text-[hsl(var(--archive-charcoal))]">
          <SearchX className="h-5 w-5 text-primary" /> 寻人启事
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">寻找那些失联的老社友</p>

        <div className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
          <div>
            <Label className="text-xs">想找的人</Label>
            <Input value={form.target_name} onChange={e => setForm(f => ({ ...f, target_name: e.target.value }))} placeholder="姓名或昵称" />
          </div>
          <div>
            <Label className="text-xs">大致届别</Label>
            <Input value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} placeholder="2018级" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">线索与说明</Label>
            <Textarea rows={3} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="记得一起办过社刊，后来联系方式丢了…" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">联系方式（选填，会公开显示）</Label>
            <Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="微信 / 邮箱" />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button size="sm" onClick={submit} disabled={saving}>发布寻人启事</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">暂时还没有公开的寻人启事</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.05, 0.4) }}
                className="rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-5"
              >
                <div className="flex items-center justify-between">
                  <p className="font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">寻：{it.target_name}</p>
                  {it.is_resolved && <Badge variant="secondary" className="text-[10px]">已找到</Badge>}
                </div>
                {it.term && <p className="mt-0.5 text-xs text-muted-foreground">{it.term}</p>}
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{it.content}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
                  <span>发布者：{it.author_name}</span>
                  {it.contact && <span className="text-primary">{it.contact}</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default AlumniLookupBoard;
