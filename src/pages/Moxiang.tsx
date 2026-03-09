import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search, BookOpen, Calendar, Loader2, PenLine, Library } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Journal {
  id: string;
  title: string;
  issue_number: string | null;
  year: number;
  month: number | null;
  description: string | null;
  cover_url: string | null;
  is_published: boolean;
}

const Moxiang = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("journals")
        .select("id, title, issue_number, year, month, description, cover_url, is_published")
        .eq("is_published", true)
        .eq("type", "报刊")
        .order("year", { ascending: false })
        .order("month", { ascending: false });
      setJournals((data as Journal[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = journals.filter((j) => {
    if (!search) return true;
    return j.title.includes(search) || j.description?.includes(search) || j.issue_number?.includes(search);
  });

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">📰 《墨香阁》电子报刊</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            汇集社员优秀原创作品，以电子书形式呈现，随时随地在线阅读
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <div className="relative mx-auto max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="搜索报刊标题、期号..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="rounded border border-border bg-card py-16 text-center">
              <Library className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">{journals.length === 0 ? "报刊正在编排中，敬请期待..." : "未找到匹配的报刊"}</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((j) => (
                <Link
                  key={j.id}
                  to={`/moxiang/${j.id}`}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                    {j.cover_url ? (
                      <img src={j.cover_url} alt={j.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 bg-primary/5">
                        <Library className="h-12 w-12 text-primary/20" />
                        <span className="font-serif text-sm text-primary/30">《墨香阁》</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-medium text-foreground">📖 开始阅读</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-sm font-bold">{j.title}</h3>
                      {j.issue_number && <Badge variant="secondary" className="text-[10px]">{j.issue_number}</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{j.year}年{j.month ? `${j.month}月` : ""}</span>
                    </div>
                    {j.description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{j.description}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-lg border border-border bg-card p-8 text-center">
            <PenLine className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-2 font-serif text-base font-bold">想让你的作品登上《墨香阁》？</h3>
            <p className="mb-4 text-xs text-muted-foreground">投稿审核通过后，你的作品将有机会被编入下一期《墨香阁》电子报刊</p>
            <Link to="/submit" className="inline-flex items-center gap-2 rounded bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
              <PenLine className="h-4 w-4" />前往投稿
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Moxiang;
