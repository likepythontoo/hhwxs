import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, Star, StarOff, Eye } from "lucide-react";

interface Submission {
  id: string;
  title: string;
  content: string;
  genre: string | null;
  author_name: string;
  status: string | null;
  reviewer_notes: string | null;
  is_featured: boolean | null;
  created_at: string;
  image_url?: string | null;
  college?: string | null;
  major?: string | null;
  class_name?: string | null;
  student_id?: string | null;
  phone?: string | null;
  attachment_url?: string | null;
}

const SubmissionsManagement = () => {
  const [items, setItems] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [viewing, setViewing] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const fetch = async () => {
    let q = supabase.from("submissions").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setItems((data as Submission[]) || []);
  };

  useEffect(() => { fetch(); }, [filter]);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    const update: Record<string, unknown> = { status };
    if (notes !== undefined) update.reviewer_notes = notes;
    await supabase.from("submissions").update(update).eq("id", id);
    setViewing(null);
    fetch();
  };

  const toggleFeatured = async (item: Submission) => {
    await supabase.from("submissions").update({ is_featured: !item.is_featured }).eq("id", item.id);
    fetch();
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: "待审核", color: "bg-amber-50 text-amber-700" },
    approved: { label: "已通过", color: "bg-green-50 text-green-700" },
    rejected: { label: "已拒绝", color: "bg-red-50 text-red-600" },
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-base font-bold">作品投稿 ({items.length})</h2>
        <div className="flex gap-1.5">
          {[{ key: "all", label: "全部" }, { key: "pending", label: "待审核" }, { key: "approved", label: "已通过" }, { key: "rejected", label: "已拒绝" }].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const sc = statusConfig[item.status || "pending"];
          return (
            <div key={item.id} className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-sm font-bold">{item.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.color}`}>{sc.label}</span>
                    {item.is_featured && <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] text-accent-foreground">⭐ 精选</span>}
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{item.genre}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ✍️ {item.author_name} · {[item.college, item.major, item.class_name].filter(Boolean).join(" / ")} · {new Date(item.created_at).toLocaleDateString("zh-CN")}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground/80">{item.content}</p>
                </div>
                <div className="ml-3 flex gap-1 opacity-60 group-hover:opacity-100">
                  <button onClick={() => { setViewing(item); setReviewNotes(item.reviewer_notes || ""); }} className="rounded-lg p-2 transition hover:bg-secondary" title="查看详情"><Eye className="h-4 w-4" /></button>
                  <button onClick={() => toggleFeatured(item)} className="rounded-lg p-2 transition hover:bg-secondary" title={item.is_featured ? "取消精选" : "设为精选"}>
                    {item.is_featured ? <StarOff className="h-4 w-4 text-accent" /> : <Star className="h-4 w-4" />}
                  </button>
                  {item.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(item.id, "approved")} className="rounded-lg p-2 text-green-600 transition hover:bg-green-50" title="通过"><Check className="h-4 w-4" /></button>
                      <button onClick={() => updateStatus(item.id, "rejected")} className="rounded-lg p-2 text-red-500 transition hover:bg-red-50" title="拒绝"><X className="h-4 w-4" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">暂无投稿</p>}
      </div>

      {/* Detail dialog */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" onClick={() => setViewing(null)}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">{viewing.genre}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusConfig[viewing.status || "pending"].color}`}>{statusConfig[viewing.status || "pending"].label}</span>
            </div>
            <h3 className="font-serif text-lg font-bold">{viewing.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">✍️ {viewing.author_name} · {new Date(viewing.created_at).toLocaleDateString("zh-CN")}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {viewing.college && <span>🏫 {viewing.college}</span>}
              {viewing.major && <span>📚 {viewing.major}</span>}
              {viewing.class_name && <span>🎓 {viewing.class_name}</span>}
              {viewing.student_id && <span>🆔 {viewing.student_id}</span>}
              {viewing.phone && <span>📱 {viewing.phone}</span>}
            </div>
            {viewing.image_url && (
              <div className="mt-4 overflow-hidden rounded-lg">
                <img src={viewing.image_url} alt={viewing.title} className="w-full object-contain" />
              </div>
            )}
            {viewing.attachment_url && (
              <a href={viewing.attachment_url} target="_blank" rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-primary hover:bg-secondary">
                📎 查看附件
              </a>
            )}
            <div className="mt-4 whitespace-pre-wrap rounded-lg bg-secondary/50 p-4 text-sm leading-relaxed">{viewing.content}</div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">审核备注</label>
              <textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className="w-full rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none" rows={2} placeholder="给作者的反馈..." />
            </div>

            <div className="mt-5 flex gap-2">
              <button onClick={() => setViewing(null)} className="flex-1 rounded-lg border border-border py-2.5 text-sm text-muted-foreground">关闭</button>
              <button onClick={() => updateStatus(viewing.id, "rejected", reviewNotes)} className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">拒绝</button>
              <button onClick={() => updateStatus(viewing.id, "approved", reviewNotes)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">通过</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubmissionsManagement;
