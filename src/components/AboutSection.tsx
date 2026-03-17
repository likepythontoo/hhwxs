import { Building2, Users, Award, BookOpen } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const departments = [
  { name: "办公室", desc: "活动策划与会议组织" },
  { name: "话剧部", desc: "文艺表演与团建联谊" },
  { name: "编辑部", desc: "社刊编辑与稿件征收" },
  { name: "网宣部", desc: "新媒体运营与活动宣传" },
  { name: "国学部", desc: "国学推广与知识普及" },
];

const stats = [
  { icon: Building2, label: "成立年份", value: "2003" },
  { icon: Users, label: "下设部门", value: "5个" },
  { icon: BookOpen, label: "核心社刊", value: "《红湖》" },
  { icon: Award, label: "品牌活动", value: "红湖杯" },
];

const AboutSection = () => {
  return (
    <section id="about" className="relative py-16 md:py-24 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-primary/3 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-accent/5 blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <ScrollReveal>
          <div className="mb-12">
            <span className="mb-2 inline-block text-xs font-medium uppercase tracking-[0.3em] text-accent">About Us</span>
            <h2 className="section-title text-3xl">社团概况</h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-12 md:grid-cols-2">
          {/* Introduction */}
          <ScrollReveal direction="left">
            <div>
              <h3 className="mb-5 font-serif text-2xl font-semibold">红湖简介</h3>
              <div className="relative pl-5 border-l-2 border-primary/20">
                <p className="mb-4 leading-[1.9] text-muted-foreground">
                  河北科技学院红湖文学社成立于2003年，社名取自校园内「红湖」，寓意热血、纯净与深邃。社团致力于繁荣校园文学创作，培养文学新人，传承中华优秀文化。
                </p>
                <p className="leading-[1.9] text-muted-foreground">
                  社团由主席团统筹管理，下设办公室、话剧部、编辑部、网宣部、国学部五个部门。以「一刊（《红湖》）、一赛（红湖杯征文大赛）、一会（暖冬诗歌朗诵会）」为核心运作模式。
                </p>
              </div>

              {/* Stats */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {stats.map((stat, i) => (
                  <ScrollReveal key={stat.label} delay={i * 0.1}>
                    <div className="group rounded-lg border border-border/60 bg-card p-4 text-center transition-all hover:border-primary/20 hover:shadow-[var(--shadow-card)]">
                      <stat.icon className="mx-auto mb-2.5 h-5 w-5 text-primary/70 transition-colors group-hover:text-primary" />
                      <div className="font-serif text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="mt-1.5 text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>

          {/* Organization */}
          <ScrollReveal direction="right">
            <div>
              <h3 className="mb-5 font-serif text-2xl font-semibold">组织架构</h3>

              {/* Presidium */}
              <div className="mb-4 rounded-lg border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 text-center transition-shadow hover:shadow-[var(--shadow-card)]">
                <div className="font-serif text-base font-bold text-primary">主席团</div>
                <div className="mt-1 text-xs text-muted-foreground">社团最高领导与决策机构</div>
              </div>

              <div className="mx-auto mb-4 flex flex-col items-center gap-1">
                <div className="h-4 w-px bg-primary/20" />
                <div className="h-1.5 w-1.5 rotate-45 bg-primary/30" />
                <div className="h-4 w-px bg-primary/20" />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {departments.map((dept, i) => (
                  <ScrollReveal key={dept.name} delay={i * 0.08}>
                    <div className="group rounded-lg border border-border/60 bg-card p-5 text-center transition-all duration-300 hover:border-primary/20 hover:shadow-[var(--shadow-card)] hover:-translate-y-0.5">
                      <div className="font-serif text-sm font-semibold transition-colors group-hover:text-primary">{dept.name}</div>
                      <div className="mt-1.5 text-xs text-muted-foreground">{dept.desc}</div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
