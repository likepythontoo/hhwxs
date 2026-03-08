import Layout from "@/components/Layout";
import { Building2, Users, Award, BookOpen, Heart, Feather, BookMarked, Mic, Monitor } from "lucide-react";

const stats = [
  { icon: Building2, label: "成立年份", value: "2006" },
  { icon: Users, label: "下设部门", value: "5个" },
  { icon: BookOpen, label: "社团期刊", value: "《雨巷》" },
  { icon: Award, label: "社团报刊", value: "《墨香阁》" },
];

const departments = [
  { name: "办公室", desc: "活动策划，文件管理，展板制作，活动细节安排", icon: Building2 },
  { name: "话剧部", desc: "以排、演文学话剧为主，负责挑选、改编剧本，演员确定和整体表演", icon: Feather },
  { name: "编辑部", desc: "负责出版社内期刊《雨巷》、报刊《墨香阁》，组织征文活动与演讲比赛", icon: BookMarked },
  { name: "外联部", desc: "负责各种活动的联谊及涉外活动的组织，向外界筹集活动经费，加强对内沟通和对外联系", icon: Heart },
  { name: "网络部", desc: "以网络为平台推送社团文学作品，协调各部门完成网络宣传和网络资料管理，制作视频和PPT", icon: Monitor },
];

const milestones = [
  { year: "2006", event: "红湖文学社于2006年5月在河北科技学院正式成立" },
  { year: "2017", event: "2017届管理团队组建，社长孙浩然带领社团发展" },
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
              红湖文学社下设办公室、话剧部、编辑部、外联部、网络部五个部门，定期出版社内期刊《雨巷》和报刊《墨香阁》，组织征文活动、演讲比赛、话剧专场等丰富多彩的文学活动。
            </p>
            <p>
              一批批的红湖人在河北科技学院历史上各领风骚，一代代的红湖人以低调做人、高调做事的风格活跃在各个领域。回顾红湖的光辉史实，我们为自己是一名红湖人而感到骄傲和自豪。
            </p>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-secondary py-12 md:py-16">
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

      {/* Organization */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">组织架构</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept) => (
              <div
                key={dept.name}
                className="rounded border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                    <dept.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-serif text-base font-semibold">{dept.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{dept.desc}</p>
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
