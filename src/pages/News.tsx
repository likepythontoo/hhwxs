import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import UpcomingEvents from "@/components/UpcomingEvents";
import { CalendarDays, Search, Tag } from "lucide-react";
import { Link } from "react-router-dom";

interface NewsItem {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
}

const categories = ["全部", "公告", "社情快讯", "通知公告", "文学前沿", "活动回顾"];

const categoryColors: Record<string, string> = {
  "社情快讯": "bg-primary/10 text-primary",
  "通知公告": "bg-accent text-accent-foreground",
  "文学前沿": "bg-secondary text-secondary-foreground",
  "活动回顾": "bg-muted text-muted-foreground",
  "公告": "bg-accent text-accent-foreground",
};

const News = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    supabase.from("news").select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => { setNews(data || []); setLoading(false); });
  }, []);

  const filtered = news.filter((item) => {
    const matchCategory = activeCategory === "全部" || item.category === activeCategory;
    const matchSearch = !searchQuery || item.title.includes(searchQuery) || (item.content || "").includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const formatDate = (item: NewsItem) => {
    const d = item.published_at || item.created_at;
    return new Date(d).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">新闻动态</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            社团新闻、活动报道、通知公告与文学前沿资讯
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-secondary py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text" placeholder="搜索新闻..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <UpcomingEvents />

          <div className="mb-6 text-sm text-muted-foreground">
            共 <span className="font-semibold text-primary">{filtered.length}</span> 条新闻
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <p className="font-serif text-lg">暂无相关新闻</p>
              <p className="mt-2 text-sm">尝试切换分类或修改搜索关键词</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <Link key={item.id} to={`/news/${item.id}`}
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left transition-shadow hover:shadow-md">
                  <div className="h-1 bg-primary" />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryColors[item.category || ""] || "bg-muted text-muted-foreground"}`}>
                        <Tag className="h-3 w-3" />
                        {item.category || "公告"}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(item)}
                      </span>
                    </div>
                    <h3 className="mb-2 font-serif text-sm font-bold leading-relaxed transition-colors group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {item.content || ""}
                    </p>
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        阅读全文 →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default News;
