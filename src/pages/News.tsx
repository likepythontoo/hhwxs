import { useState } from "react";
import Layout from "@/components/Layout";
import UpcomingEvents from "@/components/UpcomingEvents";
import { newsItems, type NewsItem } from "@/data/newsData";
import { CalendarDays, Search, Tag } from "lucide-react";

const categories = ["全部", "社情快讯", "通知公告", "文学前沿", "活动回顾"] as const;

const News = () => {
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = newsItems.filter((item) => {
    const matchCategory = activeCategory === "全部" || item.category === activeCategory;
    const matchSearch = !searchQuery || item.title.includes(searchQuery) || item.summary.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  const featured = newsItems.find((n) => n.featured);
  const regularItems = filtered.filter((n) => n !== featured || activeCategory !== "全部");

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
            {/* Category tabs */}
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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索新闻..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Featured card (only show on "全部") */}
          {activeCategory === "全部" && featured && !searchQuery && (
            <div className="mb-10 overflow-hidden rounded-lg border border-border bg-card shadow-sm md:flex">
              <div className="flex h-56 items-center justify-center bg-secondary md:h-auto md:w-2/5">
                <div className="text-center">
                  <span className="font-serif text-4xl">📰</span>
                  <p className="mt-2 text-xs text-muted-foreground">头条报道</p>
                </div>
              </div>
              <div className="p-6 md:w-3/5 md:p-8">
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded bg-primary px-2.5 py-0.5 text-[11px] font-medium text-primary-foreground">
                    头条
                  </span>
                  <span className="rounded bg-accent px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground">
                    {featured.category}
                  </span>
                </div>
                <h2 className="mb-3 font-serif text-xl font-bold leading-relaxed md:text-2xl">
                  {featured.title}
                </h2>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {featured.summary}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {featured.date}
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mb-6 text-sm text-muted-foreground">
            共 <span className="font-semibold text-primary">{filtered.length}</span> 条新闻
          </div>

          {/* News grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(activeCategory === "全部" && !searchQuery ? regularItems : filtered).map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <p className="font-serif text-lg">暂无相关新闻</p>
              <p className="mt-2 text-sm">尝试切换分类或修改搜索关键词</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

const categoryColors: Record<string, string> = {
  "社情快讯": "bg-primary/10 text-primary",
  "通知公告": "bg-accent text-accent-foreground",
  "文学前沿": "bg-secondary text-secondary-foreground",
  "活动回顾": "bg-muted text-muted-foreground",
};

const NewsCard = ({ item }: { item: NewsItem }) => (
  <article className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
    {/* Colored top bar */}
    <div className="h-1 bg-primary" />
    <div className="flex flex-1 flex-col p-5">
      {/* Category & date */}
      <div className="mb-3 flex items-center justify-between">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${categoryColors[item.category] || "bg-muted text-muted-foreground"}`}>
          <Tag className="h-3 w-3" />
          {item.category}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          {item.date}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 font-serif text-sm font-bold leading-relaxed transition-colors group-hover:text-primary">
        {item.title}
      </h3>

      {/* Summary */}
      <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
        {item.summary}
      </p>

      {/* Read more */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
          阅读全文 →
        </span>
      </div>
    </div>
  </article>
);

export default News;
