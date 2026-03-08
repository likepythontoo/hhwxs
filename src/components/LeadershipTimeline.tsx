import { useState } from "react";
import { Crown, User } from "lucide-react";

interface Dept {
  title: string;
  names: string[];
}

interface Term {
  year: string;
  president: string;
  vicePresidents?: string[];
  departments: Dept[];
}

const terms: Term[] = [
  {
    year: "2025届",
    president: "黄博文",
    vicePresidents: ["付高鹏", "王斯侬"],
    departments: [
      { title: "办公室部长", names: ["左亚峥"] },
      { title: "编辑部部长", names: ["夏天"] },
    ],
  },
  {
    year: "2024届",
    president: "崔晨莹",
    vicePresidents: ["马哲"],
    departments: [
      { title: "组织部部长", names: ["赵梓菁", "夏向花"] },
      { title: "办公室部长", names: ["赵鱼帆", "胡梦瑾"] },
      { title: "网宣部部长", names: ["薛博鑫", "赵国群"] },
      { title: "话剧部部长", names: ["庞悦欣", "张盛凯"] },
      { title: "编辑部部长", names: ["魏梦德"] },
    ],
  },
  {
    year: "2023届",
    president: "宋镓铖",
    vicePresidents: ["赵艺凇", "张文清"],
    departments: [
      { title: "组织部部长", names: ["马圣奇", "崔馨颐", "邸佳蕊"] },
      { title: "办公室部长", names: ["张家畅", "邢睿譞", "彭姣宁"] },
      { title: "网宣部部长", names: ["王雨桐", "于海雅", "闫秋旭"] },
      { title: "话剧部部长", names: ["李妍", "龙海静", "刘岚竹"] },
      { title: "编辑部部长", names: ["张家豪", "李佳潞"] },
    ],
  },
  {
    year: "2022届",
    president: "胡宝文",
    vicePresidents: ["黄家驹"],
    departments: [
      { title: "组织部部长", names: ["王琦", "杜轩"] },
      { title: "办公室部长", names: ["马境蔓", "李秀云"] },
      { title: "网宣部部长", names: ["刘嘉颖", "刘静"] },
      { title: "话剧部部长", names: ["袁鑫", "张孟雨"] },
      { title: "编辑部部长", names: ["刘佳鑫", "刘馨"] },
    ],
  },
  {
    year: "2021届",
    president: "韩雨轩",
    vicePresidents: ["杜毅飞", "白燕飞"],
    departments: [
      { title: "组织部部长", names: ["董俊豪", "曹旭彤"] },
      { title: "办公室部长", names: ["路秋爽", "雷泽玉"] },
      { title: "网宣部部长", names: ["杨晨", "沈伟华"] },
      { title: "话剧部部长", names: ["周树坤"] },
      { title: "编辑部部长", names: ["王天玉"] },
    ],
  },
  {
    year: "2020届",
    president: "霍娅洁",
    vicePresidents: ["丁稳"],
    departments: [
      { title: "组织部部长", names: ["赵文琪", "郝丽鑫"] },
      { title: "办公室部长", names: ["苏紫云", "王子平"] },
      { title: "网宣部部长", names: ["张子璇", "王茹霞"] },
      { title: "话剧部部长", names: ["王莹"] },
      { title: "编辑部部长", names: ["张佳宇"] },
    ],
  },
  {
    year: "2019届",
    president: "韩月瑶",
    vicePresidents: ["李双蕊", "程鑫阳"],
    departments: [
      { title: "组织部部长", names: ["宋博涵"] },
      { title: "办公室部长", names: ["张玉笑", "孙路伟"] },
      { title: "网宣部部长", names: ["谢薇"] },
      { title: "话剧部部长", names: ["张紫苑", "陈春姝"] },
      { title: "编辑部部长", names: ["王一可"] },
    ],
  },
  {
    year: "2018届",
    president: "刘翰林",
    vicePresidents: ["商航"],
    departments: [
      { title: "组织部部长", names: ["孟兆香", "南大龙"] },
      { title: "办公室部长", names: ["刘宏炎", "张帆"] },
      { title: "网宣部部长", names: ["李雪", "宫欣怡"] },
      { title: "话剧部部长", names: ["柴颖"] },
      { title: "编辑部部长", names: ["张义昕"] },
    ],
  },
  {
    year: "2017届",
    president: "孙浩然",
    departments: [
      { title: "办公室部长", names: ["沈威", "李晨"] },
      { title: "话剧部部长", names: ["刘雅晴", "李金铵"] },
      { title: "编辑部部长", names: ["康雅倩", "李钰"] },
      { title: "外联部部长", names: ["高凡"] },
      { title: "网络部部长", names: ["张立起", "伊创业"] },
    ],
  },
];

const LeadershipTimeline = () => {
  const [expandedYear, setExpandedYear] = useState<string>("2025届");

  return (
    <section className="bg-secondary py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-8">历届管理团队</h2>

        {/* Year selector pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {terms.map((t) => (
            <button
              key={t.year}
              onClick={() => setExpandedYear(expandedYear === t.year ? "" : t.year)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                expandedYear === t.year
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              {t.year}
            </button>
          ))}
        </div>

        {/* Expanded detail */}
        {terms.map((t) => (
          <div
            key={t.year}
            className={`overflow-hidden transition-all duration-300 ${
              expandedYear === t.year ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mx-auto max-w-3xl">
              {/* President */}
              <div className="mb-4 flex justify-center">
                <div className="inline-flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/10 px-6 py-4 shadow-sm">
                  <Crown className="h-5 w-5 text-primary" />
                  <div className="text-center">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">社长</div>
                    <div className="font-serif text-lg font-bold text-primary">{t.president}</div>
                  </div>
                </div>
              </div>

              <div className="mx-auto mb-4 h-6 w-px bg-primary/30" />

              {/* Vice Presidents */}
              {t.vicePresidents && t.vicePresidents.length > 0 && (
                <>
                  <div className="mb-4 flex flex-wrap justify-center gap-3">
                    {t.vicePresidents.map((vp) => (
                      <div
                        key={vp}
                        className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-card px-4 py-2.5 shadow-sm"
                      >
                        <User className="h-4 w-4 text-primary/70" />
                        <div>
                          <div className="text-[10px] text-muted-foreground">副社长</div>
                          <div className="font-serif text-sm font-semibold">{vp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mx-auto mb-4 h-6 w-px bg-border" />
                </>
              )}

              {/* Departments */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {t.departments.map((dept) => (
                  <div
                    key={dept.title}
                    className="rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="mb-2 text-xs font-bold text-primary">{dept.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.names.map((n) => (
                        <span
                          key={n}
                          className="rounded bg-secondary px-2 py-0.5 text-xs text-foreground"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LeadershipTimeline;
