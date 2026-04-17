import { useState } from "react";
import { Crown, User } from "lucide-react";
import { useLeadershipData } from "@/hooks/useLeadershipData";

const LeadershipTimeline = () => {
  const { data: leadershipData = [], isLoading } = useLeadershipData();
  const [expandedYear, setExpandedYear] = useState<string>("2025届");

  if (isLoading) return <section className="bg-secondary py-12"><p className="text-center text-sm text-muted-foreground animate-pulse">加载中...</p></section>;
  return (
    <section className="bg-secondary py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="section-title mb-8">历届管理团队</h2>

        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {leadershipData.map((t) => (
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

        {leadershipData.map((t) => (
          <div
            key={t.year}
            className={`overflow-hidden transition-all duration-300 ${
              expandedYear === t.year ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mx-auto max-w-3xl">
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

              {t.vicePresidents && t.vicePresidents.length > 0 && (
                <>
                  <div className="mb-4 flex flex-wrap justify-center gap-3">
                    {t.vicePresidents.map((vp) => (
                      <div key={vp} className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-card px-4 py-2.5 shadow-sm">
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

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {t.departments.map((dept) => (
                  <div key={dept.title} className="rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-md">
                    <div className="mb-2 text-xs font-bold text-primary">{dept.title}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {dept.names.map((n) => (
                        <span key={n} className="rounded bg-secondary px-2 py-0.5 text-xs text-foreground">{n}</span>
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
