import Layout from "@/components/Layout";
import { Building2, Users, Award, BookOpen, Heart, Feather, BookMarked, Mic } from "lucide-react";

const stats = [
  { icon: Building2, label: "成立年份", value: "1985" },
  { icon: Users, label: "现有社员", value: "320+" },
  { icon: Award, label: "获奖次数", value: "56" },
  { icon: BookOpen, label: "出版社刊", value: "48期" },
];

const departments = [
  { name: "理事会", desc: "社团最高决策机构，负责重大事务决策与方向把控", icon: Building2 },
  { name: "编辑部", desc: "负责社刊《红湖》的编审、排版与出版工作", icon: BookMarked },
  { name: "创作委员会", desc: "组织创作活动，提供文学创作指导与交流平台", icon: Feather },
  { name: "外联部", desc: "对外交流合作，联络兄弟社团与文学机构", icon: Heart },
  { name: "宣传部", desc: "品牌推广与新媒体运营，扩大社团影响力", icon: Mic },
  { name: "秘书处", desc: "日常事务管理，档案整理与会议组织", icon: BookOpen },
];

const milestones = [
  { year: "1985", event: "红湖文学社正式成立，首任社长张文远" },
  { year: "1990", event: "社刊《红湖》创刊，首期发行500册" },
  { year: "1998", event: "首次获得全国高校文学社团联合会优秀社团称号" },
  { year: "2005", event: "举办首届「红湖杯」全校征文大赛" },
  { year: "2010", event: "社员作品首次被省级文学刊物转载" },
  { year: "2018", event: "社团获评河北省优秀学生社团" },
  { year: "2023", event: "开通新媒体平台，线上社员突破千人" },
];

const editors = [
  { name: "张文远", term: "1985-1988", gen: "第一任" },
  { name: "李墨华", term: "1988-1991", gen: "第二任" },
  { name: "王书韵", term: "1991-1994", gen: "第三任" },
  { name: "赵明志", term: "1994-1997", gen: "第四任" },
  { name: "刘文静", term: "1997-2000", gen: "第五任" },
  { name: "陈思远", term: "2000-2003", gen: "第六任" },
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
            笔耕红湖，墨绘春秋 — 传承文学精神，培育时代新人
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
              红湖文学社成立于1985年，是河北科技学院历史最悠久、影响力最广泛的学生文学社团之一。社团以"笔耕红湖，墨绘春秋"为宗旨，致力于繁荣校园文学创作，培养文学新人，传承中华优秀文化。
            </p>
            <p>
              三十余年来，红湖文学社始终坚持文学理想，涌现出一大批优秀的文学创作者。社团定期出版文学刊物《红湖》，举办"红湖杯"征文大赛、文学讲座、采风活动等，已成为校园文化建设的重要力量。
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

      {/* Past Editors */}
      <section className="bg-secondary py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="section-title mb-8">历任主编</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {editors.map((e) => (
              <div
                key={e.gen}
                className="flex items-center justify-between rounded bg-card px-5 py-4 shadow-sm"
              >
                <div>
                  <span className="text-xs text-muted-foreground">{e.gen}</span>
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
