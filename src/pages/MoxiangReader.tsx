import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Loader2, PenLine } from "lucide-react";

interface Journal {
  id: string;
  title: string;
  issue_number: string | null;
  year: number;
  month: number | null;
  description: string | null;
  cover_url: string | null;
}

interface Article {
  id: string;
  sort_order: number;
  section_title: string | null;
  title: string;
  author_name: string;
  genre: string | null;
  content: string;
}

/** Render article content with genre-aware typography */
const renderContent = (content: string, genre: string | null) => {
  const isPoetry = genre === "诗歌";
  const paragraphs = content.split(/\n+/).filter(p => p.trim());

  if (isPoetry) {
    return (
      <div className="flex flex-col items-center gap-1 py-4 font-serif text-[15px] leading-[2.2] text-foreground/90">
        {paragraphs.map((line, i) => (
          <p key={i} className={`${line.trim() === "" ? "h-4" : ""}`}>
            {line}
          </p>
        ))}
      </div>
    );
  }

  // Prose: indent first line, generous spacing
  return (
    <div className="space-y-4 font-serif text-[15px] leading-[2] text-foreground/90">
      {paragraphs.map((para, i) => (
        <p key={i} className="indent-[2em]">
          {para}
        </p>
      ))}
    </div>
  );
};

const MoxiangReader = () => {
  const { id } = useParams<{ id: string }>();
  const [journal, setJournal] = useState<Journal | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // 0 = cover, 1+ = articles

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      const [jRes, aRes] = await Promise.all([
        supabase.from("journals").select("id, title, issue_number, year, month, description, cover_url").eq("id", id).single(),
        supabase.from("journal_articles").select("id, sort_order, section_title, submission_id").eq("journal_id", id).order("sort_order"),
      ]);

      setJournal(jRes.data as Journal | null);

      if (aRes.data && aRes.data.length > 0) {
        const subIds = aRes.data.map((a: any) => a.submission_id);
        const { data: subs } = await supabase.from("submissions").select("id, title, author_name, genre, content").in("id", subIds);
        const subMap = new Map((subs || []).map((s: any) => [s.id, s]));

        const enriched: Article[] = aRes.data.map((a: any) => {
          const sub = subMap.get(a.submission_id);
          return {
            id: a.id,
            sort_order: a.sort_order,
            section_title: a.section_title,
            title: sub?.title || "未知",
            author_name: sub?.author_name || "未知",
            genre: sub?.genre || null,
            content: sub?.content || "",
          };
        });
        setArticles(enriched);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const totalPages = articles.length + 1; // cover + articles
  const canPrev = currentPage > 0;
  const canNext = currentPage < totalPages - 1;

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!journal) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">未找到该报刊</p>
          <Link to="/moxiang" className="text-sm text-primary hover:underline">← 返回报刊列表</Link>
        </div>
      </Layout>
    );
  }

  const currentArticle = currentPage > 0 ? articles[currentPage - 1] : null;

  return (
    <Layout>
      {/* Top bar */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <Link to="/moxiang" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回列表
          </Link>
          <span className="font-serif text-sm font-bold">{journal.title}</span>
          <span className="text-xs text-muted-foreground">{currentPage + 1} / {totalPages}</span>
        </div>
      </div>

      {/* Reader */}
      <div className="min-h-[70vh] bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-2xl">
            {/* Cover page */}
            {currentPage === 0 && (
              <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 shadow-sm md:p-12">
                {journal.cover_url ? (
                  <img src={journal.cover_url} alt={journal.title} className="mb-6 max-h-[300px] rounded-lg object-contain shadow-md" />
                ) : (
                  <div className="mb-6 flex h-[200px] w-[160px] items-center justify-center rounded-lg bg-primary/5">
                    <BookOpen className="h-16 w-16 text-primary/20" />
                  </div>
                )}
                <h1 className="font-serif text-2xl font-bold tracking-wider md:text-3xl">{journal.title}</h1>
                {journal.issue_number && <p className="mt-1 text-sm text-muted-foreground">{journal.issue_number}</p>}
                <p className="mt-1 text-xs text-muted-foreground">{journal.year}年{journal.month ? `${journal.month}月` : ""}</p>
                {journal.description && (
                  <p className="mt-4 max-w-md text-center text-sm leading-relaxed text-muted-foreground">{journal.description}</p>
                )}

                {articles.length > 0 && (
                  <div className="mt-8 w-full">
                    <h3 className="mb-3 text-center font-serif text-sm font-semibold">— 目 录 —</h3>
                    <div className="space-y-1">
                      {articles.map((a, i) => (
                        <button
                          key={a.id}
                          onClick={() => setCurrentPage(i + 1)}
                          className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm transition hover:bg-secondary"
                        >
                          <span className="w-6 shrink-0 text-right text-xs text-muted-foreground">{i + 1}</span>
                          <div className="min-w-0 flex-1">
                            {a.section_title && <span className="mr-2 text-[10px] text-primary">【{a.section_title}】</span>}
                            <span className="font-medium">{a.title}</span>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{a.author_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Article page */}
            {currentArticle && (
              <article className="rounded-lg border border-border bg-card p-6 shadow-sm md:p-10">
                {currentArticle.section_title && (
                  <p className="mb-2 text-center text-xs font-medium text-primary">— {currentArticle.section_title} —</p>
                )}
                <h2 className="text-center font-serif text-xl font-bold md:text-2xl">{currentArticle.title}</h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {currentArticle.author_name}
                  {currentArticle.genre && <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-[10px]">{currentArticle.genre}</span>}
                </p>
                <div className="mx-auto mt-4 h-px w-16 bg-primary/20" />
                <div className="mt-6">
                  {renderContent(currentArticle.content, currentArticle.genre)}
                </div>
              </article>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage(p => p - 1)}
                disabled={!canPrev}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm transition hover:bg-card disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentPage === 1 ? "封面" : "上一篇"}
              </button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i)}
                    className={`h-2 w-2 rounded-full transition ${i === currentPage ? "bg-primary" : "bg-border hover:bg-muted-foreground/40"}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(p => p + 1)}
                disabled={!canNext}
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm transition hover:bg-card disabled:opacity-30"
              >
                下一篇
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MoxiangReader;
