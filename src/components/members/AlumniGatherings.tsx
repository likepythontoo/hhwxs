import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarHeart, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Gathering {
  id: string;
  title: string;
  term: string | null;
  gather_at: string;
  location: string | null;
  description: string | null;
  contact: string | null;
  max_participants: number | null;
  organizer_name: string | null;
}

const AlumniGatherings = ({ currentUserId }: { currentUserId: string | null }) => {
  const [items, setItems] = useState<Gathering[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<Record<string, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", term: "", gather_at: "", location: "", description: "", contact: "", max_participants: "" });

  const load = async () => {
    const [gRes, cRes] = await Promise.all([
      supabase
        .from("alumni_gatherings")
        .select("id, title, term, gather_at, location, description, contact, max_participants, organizer_name")
        .eq("status", "approved")
        .order("gather_at", { ascending: true }),
      supabase.rpc("gathering_signup_counts"),
    ]);
    setItems((gRes.data as Gathering[]) || []);
    const c: Record<string, number> = {};
    ((cRes.data as any[]) || []).forEach(r => { c[r.gathering_id] = Number(r.signup_count); });
    setCounts(c);
    if (currentUserId) {
      const { data } = await supabase.from("alumni_gathering_signups").select("gathering_id").eq("user_id", currentUserId);
      const m: Record<string, boolean> = {};
      (data || []).forEach((s: any) => { m[s.gathering_id] = true; });
      setMine(m);
    }
  };

  useEffect(() => { load(); }, [currentUserId]);

  const createGathering = async () => {
    if (!currentUserId) return toast({ title: "请先登录", variant: "destructive" });
    if (!form.title.trim() || !form.gather_at) return toast({ title: "请填写标题和时间", variant: "destructive" });
    setSaving(true);
    const { data: profile } = await supabase
      .from("profiles").select("display_name").eq("user_id", currentUserId).maybeSingle();
    const { error } = await supabase.from("alumni_gatherings").insert({
      title: form.title.trim(),
      term: form.term || null,
      gather_at: new Date(form.gather_at).toISOString(),
      location: form.location || null,
      description: form.description || null,
      contact: form.contact || null,
      max_participants: form.max_participants ? Number(form.max_participants) : null,
      organizer_id: currentUserId,
      organizer_name: profile?.display_name || "校友",
    });
    setSaving(false);
    if (error) return toast({ title: "发起失败", description: error.message, variant: "destructive" });
    setForm({ title: "", term: "", gather_at: "", location: "", description: "", contact: "", max_participants: "" });
    setShowForm(false);
    toast({ title: "已提交", description: "管理员审核通过后公开显示" });
  };

  const signUp = async (g: Gathering) => {
    if (!currentUserId) return toast({ title: "请先登录", variant: "destructive" });
    const { data: profile } = await supabase
      .from("profiles").select("display_name").eq("user_id", currentUserId).maybeSingle();
    const { error } = await supabase.from("alumni_gathering_signups").insert({
      gathering_id: g.id,
      user_id: currentUserId,
      name: profile?.display_name || "校友",
    });
    if (error) return toast({ title: "报名失败", description: error.message, variant: "destructive" });
    setMine(m => ({ ...m, [g.id]: true }));
    setCounts(c => ({ ...c, [g.id]: (c[g.id] || 0) + 1 }));
    toast({ title: "报名成功", description: "到时见！" });
  };

  const cancelSignUp = async (g: Gathering) => {
    if (!currentUserId) return;
    const { error } = await supabase.from("alumni_gathering_signups").delete()
      .eq("gathering_id", g.id).eq("user_id", currentUserId);
    if (error) return toast({ title: "取消失败", description: error.message, variant: "destructive" });
    setMine(m => ({ ...m, [g.id]: false }));
    setCounts(c => ({ ...c, [g.id]: Math.max((c[g.id] || 1) - 1, 0) }));
    toast({ title: "已取消报名" });
  };

  return (
    <section className="bg-[hsl(var(--archive-cream))] py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="mb-2 flex items-center justify-center gap-2 text-center font-serif text-2xl font-bold tracking-widest text-[hsl(var(--archive-charcoal))]">
          <CalendarHeart className="h-5 w-5 text-primary" /> 校友聚会
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">重聚、分享、再写一页</p>

        <div className="mb-8 text-center">
          <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)}>
            {showForm ? "收起" : "我要发起聚会"}
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label className="text-xs">聚会主题</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="红湖文学社十周年小聚" />
            </div>
            <div>
              <Label className="text-xs">时间</Label>
              <Input type="datetime-local" value={form.gather_at} onChange={e => setForm(f => ({ ...f, gather_at: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">地点</Label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="学校北门老茶馆" />
            </div>
            <div>
              <Label className="text-xs">面向届别（选填）</Label>
              <Input value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} placeholder="不限 / 2018级" />
            </div>
            <div>
              <Label className="text-xs">人数上限（选填）</Label>
              <Input type="number" value={form.max_participants} onChange={e => setForm(f => ({ ...f, max_participants: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">活动说明</Label>
              <Textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="sm:col-span-2">
              <Label className="text-xs">联系方式</Label>
              <Input value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="微信 / 手机号" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button size="sm" onClick={createGathering} disabled={saving}>提交审核</Button>
            </div>
          </motion.div>
        )}

        {items.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">暂时还没有已发布的聚会</p>
        ) : (
          <div className="space-y-4">
            {items.map((g, i) => {
              const count = counts[g.id] || 0;
              const full = g.max_participants != null && count >= g.max_participants;
              return (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-lg font-bold text-[hsl(var(--archive-charcoal))]">{g.title}</p>
                      <p className="mt-1 text-xs text-primary">
                        {new Date(g.gather_at).toLocaleString("zh-CN", { dateStyle: "long", timeStyle: "short" })}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {g.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{g.location}</span>}
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />{count}{g.max_participants ? ` / ${g.max_participants}` : ""} 人已报名
                        </span>
                        {g.term && <span>{g.term}</span>}
                      </div>
                    </div>
                    {mine[g.id] ? (
                      <Button size="sm" variant="outline" onClick={() => cancelSignUp(g)}>取消报名</Button>
                    ) : (
                      <Button size="sm" onClick={() => signUp(g)} disabled={full}>{full ? "名额已满" : "我要参加"}</Button>
                    )}
                  </div>
                  {g.description && (
                    <p className="mt-3 whitespace-pre-line border-t border-border/50 pt-3 text-sm leading-relaxed text-muted-foreground">
                      {g.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>发起人：{g.organizer_name || "校友"}</span>
                    {g.contact && <span className="text-primary">{g.contact}</span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default AlumniGatherings;
