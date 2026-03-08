import { Building2, Users, Award, BookOpen } from "lucide-react";

const departments = [
  { name: "理事会", desc: "社团最高决策机构" },
  { name: "编辑部", desc: "社刊编审与出版" },
  { name: "创作委员会", desc: "文学创作指导" },
  { name: "外联部", desc: "对外交流合作" },
  { name: "宣传部", desc: "品牌推广与传播" },
  { name: "秘书处", desc: "日常事务管理" },
];

const stats = [
  { icon: Building2, label: "成立年份", value: "1985" },
  { icon: Users, label: "现有社员", value: "320+" },
  { icon: Award, label: "获奖次数", value: "56" },
  { icon: BookOpen, label: "出版社刊", value: "48期" },
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
              红湖文学社成立于1985年，是我校历史最悠久、影响力最广泛的学生文学社团之一。社团以"笔耕红湖，墨绘春秋"为宗旨，致力于繁荣校园文学创作，培养文学新人，传承中华优秀文化。
            </p>
            <p className="mb-6 leading-relaxed text-muted-foreground">
              三十余年来，红湖文学社始终坚持文学理想，涌现出一大批优秀的文学创作者。社团定期出版文学刊物《红湖》，举办"红湖杯"征文大赛、文学讲座、采风活动等，已成为校园文化建设的重要力量。
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

            <div className="mt-6 rounded bg-secondary p-5">
              <h4 className="mb-3 font-serif text-sm font-semibold text-primary">历任主编</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between border-b border-dashed border-border pb-2">
                  <span>第一任 · 张文远</span><span>1985-1988</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-border pb-2">
                  <span>第二任 · 李墨华</span><span>1988-1991</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-border pb-2">
                  <span>第三任 · 王书韵</span><span>1991-1994</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary">更多历任主编 →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
