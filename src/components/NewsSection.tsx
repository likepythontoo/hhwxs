import { useState } from "react";
import { CalendarDays, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";

const tabs = ["社情快讯", "通知公告", "文学前沿"];

const newsData: Record<string, { title: string; date: string }[]> = {
  "社情快讯": [
    { title: "红湖文学社2025年度总结大会圆满举行", date: "2025-12-20" },
    { title: '第十二届"红湖杯"征文大赛获奖名单公布', date: "2025-11-15" },
    { title: "文学社赴西湖开展秋季采风活动", date: "2025-10-28" },
    { title: "新任社长就职典礼暨社团发展规划发布", date: "2025-09-10" },
    { title: "红湖文学社招新工作圆满结束，新增社员86名", date: "2025-09-05" },
  ],
  "通知公告": [
    { title: "关于开展2026年春季学期社员注册工作的通知", date: "2026-02-28" },
    { title: "《红湖》第48期征稿启事", date: "2026-02-15" },
    { title: "关于调整社团活动室使用时间的公告", date: "2026-01-20" },
    { title: "2025年度优秀社员评选结果公示", date: "2025-12-25" },
    { title: "关于举办寒假文学创作营的通知", date: "2025-12-10" },
  ],
  "文学前沿": [
    { title: "当代校园文学创作的新趋势与新探索", date: "2026-01-18" },
    { title: "人工智能时代的文学写作何去何从", date: "2025-12-30" },
    { title: "第十一届全国大学生文学作品大赛征稿启事", date: "2025-11-20" },
    { title: "著名作家余华教授莅临我校讲座纪实", date: "2025-10-15" },
    { title: "浅析网络文学对传统文学教育的影响", date: "2025-09-22" },
  ],
};

const featuredNews = {
  title: '红湖文学社荣获"全国百佳大学生社团"称号',
  date: "2026-01-10",
  desc: '近日，由中国高等教育学会主办的全国大学生社团评选活动揭晓，我校红湖文学社凭借在文学创作、文化传承、社会服务等方面的突出表现，荣获"全国百佳大学生社团"称号。',
  image: "",
};

const NewsSection = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

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
