import { Building2, Users, Award, BookOpen, Monitor, Crown, Feather, BookMarked } from "lucide-react";

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
    <section id="about" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-8">社团概况</h2>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Introduction */}
          <div>
            <h3 className="mb-4 font-serif text-xl font-semibold">红湖简介</h3>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              河北科技学院红湖文学社成立于2003年，社名取自校园内「红湖」，寓意热血、纯净与深邃。社团致力于繁荣校园文学创作，培养文学新人，传承中华优秀文化。
            </p>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              社团由主席团统筹管理，下设办公室、话剧部、编辑部、网宣部、国学部五个部门。以「一刊（《红湖》）、一赛（红湖杯征文大赛）、一会（暖冬诗歌朗诵会）」为核心运作模式。
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded bg-secondary p-4 text-center">
                  <stat.icon className="mx-auto mb-2 h-5 w-5 text-primary" />
                  <div className="font-serif text-xl font-bold text-primary">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Organization */}
          <div>
            <h3 className="mb-4 font-serif text-xl font-semibold">组织架构</h3>

            {/* Presidium */}
            <div className="mb-3 rounded border-2 border-primary bg-primary/10 p-3 text-center">
              <div className="font-serif text-sm font-bold text-primary">主席团</div>
              <div className="mt-1 text-xs text-muted-foreground">社团最高领导与决策机构</div>
            </div>

            <div className="mx-auto mb-3 h-4 w-px bg-primary/30" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {departments.map((dept) => (
                <div
                  key={dept.name}
                  className="rounded border border-border bg-card p-4 text-center transition-shadow hover:shadow-md"
                >
                  <div className="font-serif text-sm font-semibold">{dept.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{dept.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
