import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search, Download, BookOpen, Eye, Calendar, PenLine, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Journal {
  id: string;
  title: string;
  issue_number: string | null;
  year: number;
  month: number | null;
  description: string | null;
  cover_url: string | null;
  pdf_url: string | null;
  table_of_contents: string | null;
  is_published: boolean;
  created_at: string;
}

const Journals = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("全部");
  const [previewJournal, setPreviewJournal] = useState<Journal | null>(null);

  useEffect(() => {
    const fetchJournals = async () => {
      const { data } = await supabase
        .from("journals")
        .select("*")
        .eq("is_published", true)
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      setJournals((data as Journal[]) || []);
      setLoading(false);
    };
    fetchJournals();
  }, []);

  const years = ["全部", ...Array.from(new Set(journals.map((j) => String(j.year)))).sort((a, b) => Number(b) - Number(a))];

  const filtered = journals.filter((j) => {
    const matchSearch = !search || j.title.includes(search) || j.description?.includes(search) || j.issue_number?.includes(search);
    const matchYear = selectedYear === "全部" || String(j.year) === selectedYear;
    return matchSearch && matchYear;
  });

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">📖 《红湖》期刊</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            红湖文学社核心社刊 · 2004年创刊 · 记录校园文学创作的每一个瞬间
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="搜索期刊标题、期号..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            {years.length > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => setSelectedYear(y)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                      selectedYear === y ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {y === "全部" ? "全部年份" : `${y}年`}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Journal Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded border border-border bg-card py-16 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">{journals.length === 0 ? "期刊正在整理中，敬请期待..." : "未找到匹配的期刊"}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((journal) => (
                <div key={journal.id} className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg">
                  {/* Cover */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                    {journal.cover_url ? (
                      <img src={journal.cover_url} alt={journal.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-primary/5">
                        <BookOpen className="h-12 w-12 text-primary/30" />
                        <span className="font-serif text-lg font-bold text-primary/40">《红湖》</span>
                        {journal.issue_number && <span className="text-xs text-muted-foreground">{journal.issue_number}</span>}
                      </div>
                    )}
                    {/* Overlay buttons */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      {journal.pdf_url && (
                        <>
                          <button
                            onClick={() => setPreviewJournal(journal)}
                            className="flex items-center gap-1 rounded-full bg-white/90 px-3 py-2 text-xs font-medium text-foreground transition hover:bg-white"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            阅读
                          </button>
                          <a
                            href={journal.pdf_url}
                            download
                            className="flex items-center gap-1 rounded-full bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                          >
                            <Download className="h-3.5 w-3.5" />
                            下载
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-serif text-sm font-bold">{journal.title}</h3>
                      {journal.issue_number && (
                        <Badge variant="secondary" className="text-[10px]">{journal.issue_number}</Badge>
                      )}
                    </div>
                    <div className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{journal.year}年{journal.month ? `${journal.month}月` : ""}</span>
                    </div>
                    {journal.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{journal.description}</p>
                    )}
                    {journal.table_of_contents && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-primary">查看目录</summary>
                        <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{journal.table_of_contents}</p>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to action */}
          <div className="mt-12 rounded-lg border border-border bg-card p-8 text-center">
            <PenLine className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-serif text-base font-bold">想让你的作品登上《红湖》？</h3>
            <p className="mb-4 text-xs text-muted-foreground">通过投稿系统提交你的原创文学作品，优秀稿件将被收录至下一期《红湖》</p>
            <Link
              to="/submit"
              className="inline-flex items-center gap-2 rounded bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <PenLine className="h-4 w-4" />
              前往投稿
            </Link>
          </div>
        </div>
      </section>

      {/* PDF Preview Dialog */}
      <Dialog open={!!previewJournal} onOpenChange={() => setPreviewJournal(null)}>
        <DialogContent className="max-w-4xl h-[85vh]">
          <DialogHeader>
            <DialogTitle className="font-serif">{previewJournal?.title} {previewJournal?.issue_number || ""}</DialogTitle>
          </DialogHeader>
          {previewJournal?.pdf_url && (
            <iframe
              src={previewJournal.pdf_url}
              className="h-full w-full flex-1 rounded border"
              title={previewJournal.title}
            />
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Journals;
