import { useState } from "react";
import Layout from "@/components/Layout";
import LeadershipVerticalTimeline from "@/components/LeadershipVerticalTimeline";
import LeadershipCarousel from "@/components/LeadershipCarousel";
import LeadershipAccordion from "@/components/LeadershipAccordion";
import LeadershipGrid from "@/components/LeadershipGrid";
import LeadershipBook from "@/components/LeadershipBook";
import { LayoutList, Clock, Layers, Grid3X3, BookOpen } from "lucide-react";

const views = [
  { id: "vertical", label: "垂直时间轴", icon: Clock, desc: "左右交错，强调传承感" },
  { id: "carousel", label: "卡片轮播", icon: Layers, desc: "左右滑动，更有仪式感" },
  { id: "accordion", label: "折叠手风琴", icon: LayoutList, desc: "信息密度高，适合移动端" },
  { id: "grid", label: "网格全览", icon: Grid3X3, desc: "全局纵览，点击查看详情" },
  { id: "book", label: "书页翻页", icon: BookOpen, desc: "契合文学社气质的翻页体验" },
] as const;

type ViewId = (typeof views)[number]["id"];

const Leadership = () => {
  const [activeView, setActiveView] = useState<ViewId>("vertical");

  return (
    <Layout>
      {/* Hero */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">历届管理团队</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            红湖文学社 2017—2025 届管理团队一览 · 五种展示风格自由切换
          </p>
        </div>
      </div>

      {/* View Switcher */}
      <div className="bg-secondary py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {views.map((v) => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id)}
                className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-all ${
                  activeView === v.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <v.icon className="h-4 w-4" />
                <div className="text-left">
                  <div>{v.label}</div>
                  <div className={`text-[10px] ${activeView === v.id ? "opacity-70" : "opacity-50"}`}>{v.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {activeView === "vertical" && <LeadershipVerticalTimeline />}
          {activeView === "carousel" && <LeadershipCarousel />}
          {activeView === "accordion" && <LeadershipAccordion />}
          {activeView === "grid" && <LeadershipGrid />}
          {activeView === "book" && <LeadershipBook />}
        </div>
      </section>
    </Layout>
  );
};

export default Leadership;
