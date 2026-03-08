import { useState } from "react";
import { CalendarDays, ArrowRight } from "lucide-react";

const tabs = ["社情快讯", "通知公告", "文学前沿"];

const newsData: Record<string, { title: string; date: string }[]> = {
  "社情快讯": [
    { title: "红湖文学社2025年度总结大会圆满举行", date: "2025-12-20" },
    { title: "第十二届"红湖杯"征文大赛获奖名单公布", date: "2025-11-15" },
    { title: "文学社赴西湖开展秋季采风活动", date: "2025-10-28" },
    { title: "新任社长就职典礼暨社团发展规划发布", date: "2025-09-10" },
    { title: "红湖文学社招新工作圆满结束，新增社员86名", date: "2025-09-05" },
  ],
  通知公告: [
    { title: "关于开展2026年春季学期社员注册工作的通知", date: "2026-02-28" },
    { title: "《红湖》第48期征稿启事", date: "2026-02-15" },
    { title: "关于调整社团活动室使用时间的公告", date: "2026-01-20" },
    { title: "2025年度优秀社员评选结果公示", date: "2025-12-25" },
    { title: "关于举办寒假文学创作营的通知", date: "2025-12-10" },
  ],
  文学前沿: [
    { title: "当代校园文学创作的新趋势与新探索", date: "2026-01-18" },
    { title: "人工智能时代的文学写作何去何从", date: "2025-12-30" },
    { title: "第十一届全国大学生文学作品大赛征稿启事", date: "2025-11-20" },
    { title: "著名作家余华教授莅临我校讲座纪实", date: "2025-10-15" },
    { title: "浅析网络文学对传统文学教育的影响", date: "2025-09-22" },
  ],
};

const featuredNews = {
  title: "红湖文学社荣获"全国百佳大学生社团"称号",
  date: "2026-01-10",
  desc: "近日，由中国高等教育学会主办的全国大学生社团评选活动揭晓，我校红湖文学社凭借在文学创作、文化传承、社会服务等方面的突出表现，荣获"全国百佳大学生社团"称号。这是红湖文学社继获得省级优秀社团后再次获得的重要荣誉。",
  image: "",
};

const NewsSection = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <section id="news" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="section-title">新闻速递</h2>
          <a href="#" className="flex items-center gap-1 text-sm text-primary transition hover:underline">
            更多新闻 <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Featured news left */}
          <div className="rounded bg-card shadow-sm md:col-span-2">
            <div className="h-48 bg-secondary">
              <div className="flex h-full items-center justify-center font-serif text-lg text-muted-foreground">
                📰 头条新闻
              </div>
            </div>
            <div className="p-5">
              <span className="mb-2 inline-block rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                头条
              </span>
              <h3 className="mt-2 font-serif text-lg font-semibold leading-relaxed">
                {featuredNews.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                {featuredNews.desc}
              </p>
              <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {featuredNews.date}
              </div>
            </div>
          </div>

          {/* Tabs right */}
          <div className="rounded bg-card p-5 shadow-sm md:col-span-3">
            <div className="mb-4 flex border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 pb-2 text-sm font-medium transition ${
                    activeTab === tab
                      ? "news-tab-active"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <ul className="space-y-1">
              {newsData[activeTab].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-dashed border-border py-3 last:border-0"
                >
                  <a
                    href="#"
                    className="flex-1 truncate text-sm transition hover:text-primary"
                  >
                    <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    {item.title}
                  </a>
                  <span className="ml-4 shrink-0 text-xs text-muted-foreground">
                    {item.date}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
