import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { CalendarDays, ChevronLeft, Tag } from "lucide-react";

interface NewsItem {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
}

const NewsDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from("news").select("id,title,content,category,cover_url,published_at,created_at")
      .eq("id", id)
      .eq("is_published", true)
      .maybeSingle()
      .then(({ data }) => {
        setItem((data as NewsItem) || null);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (news: NewsItem) => new Date(news.published_at || news.created_at).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <Layout>
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4">
          <Link to="/news" className="mb-4 inline-flex items-center gap-1 text-sm opacity-75 transition hover:opacity-100">
            <ChevronLeft className="h-4 w-4" /> 返回新闻列表
          </Link>
          {item?.category && <span className="inline-flex items-center gap-1 rounded-full bg-primary-foreground/10 px-2.5 py-1 text-xs"><Tag className="h-3 w-3" />{item.category}</span>}
          <h1 className="mt-3 max-w-3xl font-serif text-2xl font-bold leading-relaxed tracking-widest md:text-4xl">
            {loading ? "新闻加载中" : item?.title || "新闻不存在"}
          </h1>
          {item && <p className="mt-3 flex items-center gap-1.5 text-sm text-primary-foreground/75"><CalendarDays className="h-4 w-4" />{formatDate(item)}</p>}
        </div>
      </div>

      <section className="py-10 md:py-14">
        <div className="container mx-auto max-w-3xl px-4">
          {loading ? (
            <div className="flex justify-center py-16"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
          ) : !item ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">这篇新闻不存在或尚未发布。</div>
          ) : (
            <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              {item.cover_url && <img src={item.cover_url} alt={item.title} className="max-h-[420px] w-full object-cover" />}
              <div className="p-6 md:p-9">
                <div className="whitespace-pre-wrap text-sm leading-loose text-foreground md:text-base">{item.content || "暂无内容"}</div>
              </div>
            </article>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default NewsDetail;