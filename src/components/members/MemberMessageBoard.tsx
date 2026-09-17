import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface MessageItem {
  id: string;
  author_name: string;
  content: string;
  like_count: number;
  created_at: string;
}

interface Props {
  memberId?: string | null;
  currentUserId: string | null;
  title?: string;
}

const MemberMessageBoard = ({ memberId, currentUserId, title = "留言寄语" }: Props) => {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const load = async () => {
    let q = supabase
      .from("member_messages")
      .select("id, author_name, content, like_count, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(50);
    q = memberId ? q.eq("target_member_id", memberId) : q.is("target_member_id", null);
    const { data } = await q;
    setItems((data as MessageItem[]) || []);
  };

  useEffect(() => { load(); }, [memberId]);

  const submit = async () => {
    if (!currentUserId) return toast({ title: "请先登录后留言", variant: "destructive" });
    if (content.trim().length < 2) return toast({ title: "留言太短了", variant: "destructive" });
    setSaving(true);
    const { data: profile } = await supabase
      .from("profiles").select("display_name").eq("user_id", currentUserId).maybeSingle();
    const { error } = await supabase.from("member_messages").insert({
      target_member_id: memberId || null,
      author_id: currentUserId,
      author_name: profile?.display_name || "匿名校友",
      content: content.trim().slice(0, 500),
    });
    setSaving(false);
    if (error) return toast({ title: "提交失败", description: error.message, variant: "destructive" });
    setContent("");
    toast({ title: "留言已提交", description: "管理员审核通过后公开显示" });
  };

  const like = async (id: string) => {
    if (liked[id]) return;
    const { data, error } = await supabase.rpc("like_member_message", { p_id: id });
    if (error) return toast({ title: "需要登录后才能点赞", variant: "destructive" });
    setLiked(l => ({ ...l, [id]: true }));
    setItems(list => list.map(m => (m.id === id ? { ...m, like_count: (data as number) ?? m.like_count + 1 } : m)));
  };

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1.5 font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">
        <MessageCircle className="h-4 w-4 text-primary" /> {title}
        <span className="text-sm font-normal text-muted-foreground">({items.length})</span>
      </h3>

      <div className="mb-5 rounded-xl border border-border bg-card p-4">
        <Textarea
          rows={3}
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder={currentUserId ? "写下你想说的话…" : "登录后即可留言"}
          maxLength={500}
        />
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">留言经审核后公开</span>
          <Button size="sm" onClick={submit} disabled={saving}>发布留言</Button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">还没有留言，来做第一个吧。</p>
      ) : (
        <div className="space-y-3">
          {items.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-4"
            >
              <p className="font-serif text-sm leading-relaxed text-[hsl(var(--archive-charcoal))] whitespace-pre-line">
                {m.content}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-serif font-bold text-primary">— {m.author_name}</span>
                <div className="flex items-center gap-3">
                  <span>{new Date(m.created_at).toLocaleDateString("zh-CN")}</span>
                  <button
                    onClick={() => like(m.id)}
                    className={`flex items-center gap-1 transition ${liked[m.id] ? "text-primary" : "hover:text-primary"}`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${liked[m.id] ? "fill-primary" : ""}`} /> {m.like_count}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MemberMessageBoard;
