import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/integrations/supabase/client";

const tabs = ["社情快讯", "通知公告", "文学前沿"];

interface NewsItem {
  id: string;
  title: string;
  content: string | null;
  category: string | null;
  cover_url: string | null;
  published_at: string | null;
  created_at: string;
}

const NewsSection = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    supabase.from("news").select("id,title,content,category,cover_url,published_at,created_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setNews((data as NewsItem[]) || []));
  }, []);

  const featuredNews = news[0];
  const newsData = useMemo(() => {
    const grouped: Record<string, NewsItem[]> = { "社情快讯": [], "通知公告": [], "文学前沿": [] };
    news.forEach((item) => {
      const category = item.category || "通知公告";
      if (grouped[category]) grouped[category].push(item);
      else if (["公告", "通知"].includes(category)) grouped["通知公告"].push(item);
      else if (["新闻", "活动回顾"].includes(category)) grouped["社情快讯"].push(item);
      else grouped["文学前沿"].push(item);
    });
    return grouped;
  }, [news]);

  const formatDate = (item: NewsItem) => new Date(item.published_at || item.created_at).toLocaleDateString("zh-CN");

  return (
    <section id="news" className="relative py-16 md:py-24">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
        backgroundSize: '32px 32px',
      }} />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <span className="mb-2 inline-block text-xs font-medium uppercase tracking-[0.3em] text-accent">Latest News</span>
              <h2 className="section-title text-3xl">新闻速递</h2>
            </div>
            <Link to="/news" className="group flex items-center gap-2 text-sm font-medium text-primary transition hover:gap-3">
              更多新闻 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Featured news */}
          <ScrollReveal direction="left" className="md:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-lg bg-card shadow-[var(--shadow-elegant)] transition-shadow hover:shadow-2xl">
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-16 w-16 text-primary/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                <span className="absolute left-4 top-4 rounded-sm bg-primary px-3 py-1 text-xs font-semibold tracking-wider text-primary-foreground shadow-lg">
                  头条
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-lg font-bold leading-relaxed transition-colors group-hover:text-primary">
                  {featuredNews.title}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {featuredNews.desc}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {featuredNews.date}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Tabs */}
          <ScrollReveal direction="right" className="md:col-span-3">
            <div className="h-full rounded-lg bg-card p-6 shadow-[var(--shadow-elegant)]">
              <div className="mb-5 flex gap-1 border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative px-5 pb-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/50" />
                    )}
                  </button>
                ))}
              </div>
              <ul className="space-y-0.5">
                {newsData[activeTab].map((item, i) => (
                  <li
                    key={i}
                    className="group/item flex items-center justify-between border-b border-dashed border-border/60 py-3.5 last:border-0"
                  >
                    <a
                      href="#"
                      className="flex-1 truncate text-sm transition-colors group-hover/item:text-primary"
                    >
                      <span className="mr-2.5 inline-block h-1.5 w-1.5 rounded-full bg-primary/60 transition-all group-hover/item:bg-primary group-hover/item:shadow-[0_0_6px_rgba(164,42,42,0.4)]" />
                      {item.title}
                    </a>
                    <span className="ml-4 shrink-0 text-xs text-muted-foreground/70">
                      {item.date}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
