import Layout from "@/components/Layout";
import { Building2, Users, Award, BookOpen, Monitor, Feather, BookMarked, Heart, Crown } from "lucide-react";

const stats = [
  { icon: Building2, label: "成立年份", value: "2006" },
  { icon: Users, label: "下设部门", value: "5个" },
  { icon: BookOpen, label: "社团期刊", value: "《雨巷》" },
  { icon: Award, label: "社团报刊", value: "《墨香阁》" },
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

const milestones = [
  { year: "1990", event: "河北科技学院（前身）建校" },
  { year: "2006", event: "红湖文学社于5月正式成立" },
  { year: "2006", event: "创办社内期刊《雨巷》" },
  { year: "2006", event: "创办社内报刊《墨香阁》" },
  { year: "2011", event: "学校升格为全日制本科院校，社团随之发展壮大" },
  { year: "2017", event: "2017届管理团队组建，社长孙浩然" },
  { year: "2017", event: "下设办公室、话剧部、编辑部、外联部、网络部" },
  { year: "至今", event: "组织架构优化，设立国学部与网宣部，持续繁荣校园文学" },
];

const leaders = [
  { name: "孙浩然", role: "社长", term: "2017届" },
  { name: "沈威、李晨", role: "办公室主任", term: "2017届" },
  { name: "刘雅晴、李金铵", role: "话剧部部长", term: "2017届" },
  { name: "康雅倩、李钰", role: "编辑部部长", term: "2017届" },
  { name: "高凡", role: "外联部部长", term: "2017届" },
  { name: "张立起、伊创业", role: "网络部部长", term: "2017届" },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-widest md:text-4xl">社团概况</h1>
          <div className="gold-divider mx-auto mt-4" />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed opacity-80">
            河北科技学院红湖文学社 · 2006年5月成立
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
              河北科技学院红湖文学社成立于2006年5月，是河北科技学院的学生文学社团组织。社团致力于繁荣校园文学创作，培养文学新人，传承中华优秀文化。
            </p>
            <p>
              红湖文学社由主席团统筹管理，下设办公室、话剧部、编辑部、网宣部、国学部五个部门，定期出版社内期刊《雨巷》和报刊《墨香阁》，组织征文活动、演讲比赛、话剧专场等丰富多彩的文学活动。
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

          {/* Presidium at top */}
          <div className="mx-auto mb-8 max-w-xs">
            <div className="rounded border-2 border-primary bg-primary/10 p-5 text-center shadow-sm">
              <Crown className="mx-auto mb-2 h-7 w-7 text-primary" />
              <h3 className="font-serif text-lg font-bold text-primary">主席团</h3>
              <p className="mt-1 text-xs text-muted-foreground">社团最高领导与决策机构</p>
            </div>
          </div>

          {/* Connecting line */}
          <div className="mx-auto mb-2 h-8 w-px bg-primary/30" />

          {/* Horizontal line */}
          <div className="mx-auto mb-2 hidden max-w-3xl border-t-2 border-primary/30 md:block" />

          {/* Branch lines + Department cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {departments.map((dept) => (
              <div key={dept.name} className="flex flex-col items-center">
                {/* Vertical connector */}
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

      {/* Timeline */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">发展历程</h2>
          <div className="relative ml-4 border-l-2 border-primary/30 pl-8">
            {milestones.map((m, i) => (
              <div key={i} className="relative mb-8 last:mb-0">
                <div className="absolute -left-[2.55rem] top-1 h-3 w-3 rounded-full bg-primary" />
                <div className="font-serif text-lg font-bold text-primary">{m.year}</div>
                <p className="mt-1 text-sm text-muted-foreground">{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Management Team */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">管理团队（2017届）</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((e) => (
              <div
                key={e.role}
                className="flex items-center justify-between rounded bg-card px-5 py-4 shadow-sm"
              >
                <div>
                  <span className="text-xs text-muted-foreground">{e.role}</span>
                  <div className="font-serif font-semibold">{e.name}</div>
                </div>
                <span className="text-sm text-muted-foreground">{e.term}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
