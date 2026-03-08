import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Send, CheckCircle } from "lucide-react";

const genres = ["诗歌", "散文", "小说", "评论", "其他"];

const Submit = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("诗歌");
  const [content, setContent] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      supabase.from("profiles").select("display_name").eq("user_id", session.user.id).single()
        .then(({ data }) => setDisplayName(data?.display_name || session.user.email || ""));
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    const { error: err } = await supabase.from("submissions").insert({
      title: title.trim(),
      content: content.trim(),
      genre,
      author_id: user.id,
      author_name: displayName,
    });

    if (err) {
      setError("提交失败，请稍后重试");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <Layout>
        <div className="relative bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">作品投稿</h1>
            <div className="gold-divider mx-auto mt-4" />
          </div>
        </div>
        <section className="py-16">
          <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-bold">投稿成功！</h2>
            <p className="max-w-md text-muted-foreground">你的作品已提交，编辑部将尽快审核。可在个人中心查看审核状态。</p>
            <div className="flex gap-3">
              <button onClick={() => { setSubmitted(false); setTitle(""); setContent(""); }}
                className="rounded-lg border border-border px-5 py-2 text-sm transition hover:bg-secondary">继续投稿</button>
              <a href="/profile" className="rounded-lg bg-primary px-5 py-2 text-sm text-primary-foreground transition hover:bg-primary/90">个人中心</a>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">作品投稿</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">提交你的文学作品，展现你的才华</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-10 md:py-16">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="h-5 w-5" />
              <h2 className="font-serif text-lg font-bold">投稿表单</h2>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">作品标题 <span className="text-destructive">*</span></label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                placeholder="你的作品标题" maxLength={200} />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">体裁 <span className="text-destructive">*</span></label>
              <select value={genre} onChange={e => setGenre(e.target.value)}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                {genres.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">作品正文 <span className="text-destructive">*</span></label>
              <textarea required value={content} onChange={e => setContent(e.target.value)} rows={12}
                className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm leading-relaxed focus:border-primary focus:outline-none"
                placeholder="在此粘贴或书写你的作品..." maxLength={50000} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
              <Send className="h-4 w-4" />
              {loading ? "提交中..." : "提交作品"}
            </button>

            <p className="text-center text-[11px] text-muted-foreground">投稿人: {displayName}</p>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Submit;
