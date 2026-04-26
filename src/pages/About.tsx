import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import LeadershipTimeline from "@/components/LeadershipTimeline";
import { Building2, Users, Award, BookOpen, Monitor, Feather, BookMarked, Crown, Trophy, Star, Medal, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const stats = [
  { icon: Building2, label: "成立年份", value: "2003" },
  { icon: Users, label: "下设部门", value: "5个" },
  { icon: BookOpen, label: "核心社刊", value: "《红湖》" },
  { icon: Trophy, label: "品牌活动", value: "红湖杯" },
];

const departments = [
  {
    name: "办公室",
    icon: Building2,
    duties: [
      "活动策划，素拓相关（出活动，过活动）",
      "主持或参加相关会议",
      "配合组织部完成组织活动相关事宜",
      "办公室相关工作",
    ],
  },
  {
    name: "话剧部",
    icon: Feather,
    duties: [
      "对表演文艺型活动，进行策划布局动员社团人员排练、表演节目",
      "筹划安排娱乐活动与其他社团或组织进行团建、联谊",
      "进行节目剧本搜集研究编写工作",
    ],
  },
  {
    name: "编辑部",
    icon: BookMarked,
    duties: [
      "活动稿件（团委新闻稿等），配合网宣部编写文案",
      "负责本社文字编辑，社刊排版、编辑、出版，征收全校稿件",
    ],
  },
  {
    name: "网宣部",
    icon: Monitor,
    duties: [
      "社团公众号运营，抖音、B站等网络平台进行活动宣传，大型相关活动直播",
      "活动现场拍摄取材",
      "活动海报制作",
    ],
  },
  {
    name: "国学部",
    icon: BookOpen,
    duties: [
      "国学文化宣传，国学经典讲解，国学知识普及（定期社团群内发知识清单、推送推荐书目），活跃社团内部阅读文学氛围，筹划安排社团内部国学活动团建",
      "配合组织部完成活动组织（布置会场，维持现场秩序，签到）",
    ],
  },
];

// ========== 发展历程（四个阶段） ==========
const timelinePhases = [
  {
    phase: "创立与奠基",
    period: "2003 - 2010",
    events: [
      { year: "2003", event: "红湖文学社在河北科技学院（保定校区）正式挂牌成立，社名取自校园内「红湖」，寓意热血、纯净与深邃" },
      { year: "2004", event: "社刊《红湖》正式创刊，确立了「笔耕不辍」的社魂" },
      { year: "2004", event: "确立以诗歌、散文交流为主的学术型社团方向，在保定高校文学圈初露锋芒" },
    ],
  },
  {
    phase: "繁荣与跨校交流",
    period: "2011 - 2016",
    events: [
      { year: "2011", event: "学校升格为全日制民办普通本科院校，社团随之发展壮大" },
      { year: "2012", event: "举办「红湖十载」十周年系列纪念活动" },
      { year: "2013", event: "与河北大学、华北电力大学等高校文学社团开展联谊和联合征文" },
      { year: "2014", event: "开通官方微博和微信公众号，文学作品发布向移动端延伸" },
      { year: "2015", event: "「红湖杯」校园征文大赛成为校内品牌活动，影响力扩展至全校" },
      { year: "2016", event: "获评校级「十佳最具影响力校园媒体」" },
    ],
  },
  {
    phase: "改革与品牌升级",
    period: "2017 - 2020",
    events: [
      { year: "2017", event: "2017届管理团队组建，社长孙浩然带领社团改革" },
      { year: "2018", event: "社员在省级比赛中多次获奖，获全国大学生诗歌竞赛「优秀社团奖」" },
      { year: "2019", event: "推行「声文结合」，举办大型诗歌朗诵会，与校广播站深度合作；获河北省大学生校园文学大赛「优秀组织奖」" },
      { year: "2020", event: "疫情主题征文《红湖战疫录》获校团委专项表彰" },
    ],
  },
  {
    phase: "搬迁唐山与新篇章",
    period: "2021 - 至今",
    events: [
      { year: "2021", event: "随学校整体搬迁至唐山曹妃甸校区，社团重新招新，获评「文化建设先锋社团」" },
      { year: "2022", event: "《红湖》创刊20周年，获「优秀校园期刊奖」；公众号获评校级「年度优秀校园新媒体」" },
      { year: "2023", event: "中华全国学生联合会、河北共青团等单位授予「2022年度河北省高校'活力社团'—思想政治类第三名」等荣誉称号；被河北共青团公众号通篇报道。" },
      { year: "2024", event: "社员在「燕赵杯」全国文学征文大赛中获一等奖" },
      { year: "2025", event: "获评校级最高荣誉「五星级学生社团」；组织架构优化，设立国学部与网宣部" },
    ],
  },
];

// ========== 荣誉表 ==========
const awards = [
  { year: "2025", title: "年度「五星级学生社团」", org: "河北科技学院团委", level: "校级最高荣誉" },
  { year: "2024", title: "「燕赵杯」全国文学征文大赛一等奖", org: "燕赵杯组委会", level: "国家级" },
  { year: "2023", title: "「2022年度河北省高校'活力社团'—思想政治类第三名」", org: "中华全国学生联合会、河北共青团", level: "省级" },
  { year: "2022", title: "《红湖》创刊20周年优秀校园期刊奖", org: "校园文学杂志社", level: "行业荣誉" },
  { year: "2022", title: "年度优秀校园新媒体", org: "河北科技学院", level: "校级" },
  { year: "2021", title: "曹妃甸新校区「文化建设先锋社团」", org: "河北科技学院", level: "校级" },
  { year: "2020", title: "《红湖战疫录》获校团委专项表彰", org: "河北科技学院团委", level: "校级" },
  { year: "2019", title: "河北省大学生校园文学大赛「优秀组织奖」", org: "河北省教育厅/作协", level: "省级" },
  { year: "2018", title: "全国大学生诗歌竞赛「优秀社团奖」", org: "中国诗歌网", level: "国家级" },
  { year: "2016", title: "十佳最具影响力校园媒体", org: "河北科技学院", level: "校级" },
];

const levelColors: Record<string, string> = {
  "国家级": "bg-primary text-primary-foreground",
  "省级": "bg-accent text-accent-foreground",
  "校级": "bg-secondary text-secondary-foreground",
  "校级最高荣誉": "bg-primary text-primary-foreground",
  "行业荣誉": "bg-muted text-muted-foreground",
};

// ========== 核心特色 ==========
const coreFeatures = [
  { icon: BookOpen, title: "核心社刊", desc: "《红湖》— 每年定期出刊，社团文学创作的核心阵地" },
  { icon: Trophy, title: "品牌活动", desc: "「红湖杯」征文大赛 — 跨学院参与的校内文学品牌赛事" },
  { icon: Mic, title: "暖冬朗诵会", desc: "年度诗歌朗诵盛会，声文结合，传递文字之美" },
  { icon: Star, title: "社团精神", desc: "坚持原创，拒绝平庸，用文字记录青春" },
];

const iconMap = { Building2, Users, Award, BookOpen, Monitor, Feather, BookMarked, Crown, Trophy, Star, Medal, Mic };

interface AboutItem {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  body: string | null;
  meta: any;
  icon: keyof typeof iconMap | null;
}

const About = () => {
  const [contentItems, setContentItems] = useState<AboutItem[]>([]);

  useEffect(() => {
    (supabase.from("about_content_items" as any) as any).select("id,type,title,subtitle,body,meta,icon")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }: any) => setContentItems(data || []));
  }, []);

  const displayStats = useMemo(() => {
    const items = contentItems.filter(i => i.type === "stat");
    return items.length ? items.map(i => ({ icon: iconMap[i.icon || "Award"] || Award, label: i.title, value: i.subtitle || "" })) : stats;
  }, [contentItems]);

  const displayTimeline = useMemo(() => {
    const items = contentItems.filter(i => i.type === "timeline");
    return items.length ? items.map(i => ({ phase: i.title, period: i.subtitle || "", events: (i.body || "").split("\n").filter(Boolean).map(line => {
      const [year, ...rest] = line.split("｜");
      return { year: year || "", event: rest.join("｜") || line };
    }) })) : timelinePhases;
  }, [contentItems]);

  const displayAwards = useMemo(() => {
    const items = contentItems.filter(i => i.type === "award");
    return items.length ? items.map(i => ({ year: i.subtitle || "", title: i.title, org: i.body || "", level: i.meta?.level || "校级" })) : awards;
  }, [contentItems]);

  const displayFeatures = useMemo(() => {
    const items = contentItems.filter(i => i.type === "feature");
    return items.length ? items.map(i => ({ icon: iconMap[i.icon || "Star"] || Star, title: i.title, desc: i.body || "" })) : coreFeatures;
  }, [contentItems]);

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">社团概况</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            河北科技学院红湖文学社 · 2003年成立 · 坚持原创，拒绝平庸，用文字记录青春
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-secondary py-8">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-sm bg-card p-5 text-center shadow-sm">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-primary" />
              <div className="font-serif text-2xl font-bold text-primary">{stat.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Introduction */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-6">红湖简介</h2>
          <div className="max-w-3xl space-y-4 leading-relaxed text-muted-foreground">
            <p>
              河北科技学院红湖文学社成立于2003年，社团名称取自校园内的"红湖"，寓意"热血、纯净与深邃"。社团致力于繁荣校园文学创作，培养文学新人，传承中华优秀文化。
            </p>
            <p>
              红湖文学社由主席团统筹管理，下设办公室、话剧部、编辑部、网宣部、国学部五个部门。社团以"一刊（《红湖》）、一赛（红湖杯征文大赛）、一会（暖冬诗歌朗诵会）"为核心的成熟运作模式，已成为校园文化建设的重要力量。
            </p>
            <p>
              一批批的红湖人在河北科技学院历史上各领风骚，一代代的红湖人以低调做人、高调做事的风格活跃在各个领域。回顾红湖的光辉史实，我们为自己是一名红湖人而感到骄傲和自豪。
            </p>
          </div>
        </div>
      </section>

      {/* Organization Chart */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">组织架构</h2>

          <div className="mx-auto mb-8 max-w-xs">
            <div className="rounded border-2 border-primary bg-primary/10 p-5 text-center shadow-sm">
              <Crown className="mx-auto mb-2 h-7 w-7 text-primary" />
              <h3 className="font-serif text-lg font-bold text-primary">主席团</h3>
              <p className="mt-1 text-xs text-muted-foreground">社团最高领导与决策机构</p>
            </div>
          </div>

          <div className="mx-auto mb-2 h-8 w-px bg-primary/30" />
          <div className="mx-auto mb-2 hidden max-w-3xl border-t-2 border-primary/30 md:block" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {departments.map((dept) => (
              <div key={dept.name} className="flex flex-col items-center">
                <div className="mb-2 hidden h-6 w-px bg-primary/30 md:block" />
                <div className="w-full rounded border border-border bg-card p-5 transition-shadow hover:shadow-md">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-primary/10">
                      <dept.icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-serif text-sm font-bold">{dept.name}</h3>
                  </div>
                  <ul className="space-y-2">
                    {dept.duties.map((duty, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline - Horizontal Phases */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-10">发展历程</h2>

          <div className="space-y-10">
            {timelinePhases.map((phase, pi) => (
              <div key={pi}>
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {pi + 1}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold">{phase.phase}</h3>
                    <span className="text-xs text-muted-foreground">{phase.period}</span>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-primary/15" />
                  <div className="flex gap-5 overflow-x-auto pb-3">
                    {phase.events.map((ev, ei) => (
                      <div key={ei} className="relative flex min-w-[200px] max-w-[240px] shrink-0 flex-col items-center">
                        <div className="z-10 mb-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-card">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                        <div className="mb-1 font-serif text-sm font-bold text-primary">{ev.year}</div>
                        <p className="text-center text-xs leading-relaxed text-muted-foreground">{ev.event}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">🏆 荣誉里程碑</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="px-4 py-3 text-left font-serif font-semibold">年份</th>
                  <th className="px-4 py-3 text-left font-serif font-semibold">荣誉名称</th>
                  <th className="px-4 py-3 text-left font-serif font-semibold">颁发机构</th>
                  <th className="px-4 py-3 text-left font-serif font-semibold">级别</th>
                </tr>
              </thead>
              <tbody>
                {awards.map((a, i) => (
                  <tr key={i} className="border-b border-border/50 transition-colors hover:bg-card">
                    <td className="px-4 py-3 font-serif font-bold text-primary">{a.year}</td>
                    <td className="px-4 py-3">{a.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{a.org}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${levelColors[a.level] || "bg-muted text-muted-foreground"}`}>
                        {a.level}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">核心特色</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {coreFeatures.map((f) => (
              <div key={f.title} className="rounded border border-border bg-card p-6 text-center transition-shadow hover:shadow-md">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-serif text-sm font-bold">{f.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Management Team */}
      <LeadershipTimeline />
    </Layout>
  );
};

export default About;
