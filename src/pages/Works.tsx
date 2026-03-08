import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Star, ChevronLeft, Image, Pen, Camera, Mic, FileText } from "lucide-react";

interface Work {
  id: string;
  title: string;
  content: string;
  author_name: string;
  genre: string | null;
  is_featured: boolean | null;
  created_at: string;
  image_url?: string | null;
}

const genres = ["全部", "诗歌", "散文", "小说", "书评", "剧本", "书法", "摄影", "绘画", "朗诵", "其他"];

const genreIcons: Record<string, typeof BookOpen> = {
  "诗歌": Pen, "散文": FileText, "书法": Pen, "摄影": Camera, "绘画": Image, "朗诵": Mic,
};

const imageGenres = ["书法", "摄影", "绘画"];

const Works = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("全部");
  const [selected, setSelected] = useState<Work | null>(null);

  useEffect(() => {
    supabase.from("submissions").select("*")
      .eq("status", "approved")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => { setWorks((data as any) || []); setLoading(false); });
  }, []);

  const filtered = activeGenre === "全部" ? works : works.filter(w => w.genre === activeGenre);
  const isImage = (w: Work) => imageGenres.includes(w.genre || "");

  if (selected) {
    return (
      <Layout>
        <div className="relative bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4">
            <button onClick={() => setSelected(null)} className="mb-3 flex items-center gap-1 text-sm opacity-70 hover:opacity-100">
              <ChevronLeft className="h-4 w-4" /> 返回列表
            </button>
            <div className="flex items-center gap-2">
              {selected.is_featured && <Star className="h-4 w-4 fill-accent text-accent" />}
              {selected.genre && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">{selected.genre}</span>}
            </div>
            <h1 className="mt-2 font-serif text-2xl font-bold md:text-3xl">{selected.title}</h1>
            <p className="mt-2 text-sm text-primary-foreground/70">作者：{selected.author_name} · {new Date(selected.created_at).toLocaleDateString("zh-CN")}</p>
          </div>
        </div>
        <section className="py-8 md:py-12">
          <div className="container mx-auto max-w-2xl px-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
              {selected.image_url && (
                <div className="mb-6 overflow-hidden rounded-lg">
                  <img src={selected.image_url} alt={selected.title} className="w-full object-contain" />
                </div>
              )}
              <div className="whitespace-pre-wrap font-serif text-sm leading-loose">{selected.content}</div>
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
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">作品展示</h1>
          <p className="mt-3 text-sm text-primary-foreground/70">诗歌 · 散文 · 书法 · 摄影 · 朗诵 · 更多</p>
          <div className="gold-divider mx-auto mt-4" />
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 flex flex-wrap gap-1.5">
            {genres.map(g => (
              <button key={g} onClick={() => setActiveGenre(g)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${activeGenre === g ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
                {g}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">暂无作品</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(work => {
                const hasImage = isImage(work) && work.image_url;
                const Icon = genreIcons[work.genre || ""] || BookOpen;
                return (
                  <button key={work.id} onClick={() => setSelected(work)}
                    className="group overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition hover:border-primary/30 hover:shadow-md">
                    {hasImage ? (
                      <div className="aspect-[4/3] overflow-hidden bg-muted">
                        <img src={work.image_url!} alt={work.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-primary/5 to-secondary">
                        <Icon className="h-10 w-10 text-primary/20" />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center gap-1.5">
                        {work.is_featured && <Star className="h-3 w-3 fill-accent text-accent flex-shrink-0" />}
                        <span className="font-serif text-sm font-bold truncate group-hover:text-primary transition-colors">{work.title}</span>
                      </div>
                      {!hasImage && (
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{work.content}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>{work.author_name}</span>
                        <div className="flex items-center gap-1.5">
                          {work.genre && <span className="rounded-full bg-secondary px-1.5 py-0.5">{work.genre}</span>}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center">
            <a href="/submit" className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
              <BookOpen className="h-4 w-4" /> 我也要投稿
            </a>
            <p className="mt-2 text-xs text-muted-foreground">无需登录即可投稿，支持文字、图片等多种形式</p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Works;
