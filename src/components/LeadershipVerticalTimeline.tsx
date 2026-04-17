import { Crown, User } from "lucide-react";
import { useLeadershipData } from "@/hooks/useLeadershipData";

const LeadershipVerticalTimeline = () => {
  const { data: leadershipData = [], isLoading } = useLeadershipData();
  if (isLoading) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;
  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Vertical line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary/20 md:left-1/2 md:-translate-x-px" />

      {leadershipData.map((term, i) => {
        const isLeft = i % 2 === 0;
        return (
          <div key={term.year} className="relative mb-12">
            {/* Year node */}
            <div className="absolute left-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-card font-serif text-xs font-bold text-primary md:left-1/2">
              {term.year.replace("届", "")}
            </div>

            {/* Content card */}
            <div
              className={`ml-16 md:ml-0 md:w-[calc(50%-40px)] ${
                isLeft ? "md:mr-auto md:pr-4" : "md:ml-auto md:pl-4"
              }`}
            >
              <div className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                {/* Header */}
                <div className="mb-3 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground">社长</span>
                  <span className="font-serif text-base font-bold text-primary">{term.president}</span>
                </div>

                {/* Vice Presidents */}
                {term.vicePresidents && term.vicePresidents.length > 0 && (
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary/60" />
                    <span className="text-[10px] text-muted-foreground">副社长</span>
                    {term.vicePresidents.map((vp) => (
                      <span key={vp} className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {vp}
                      </span>
                    ))}
                  </div>
                )}

                {/* Departments */}
                <div className="space-y-2 border-t border-border/50 pt-3">
                  {term.departments.map((dept) => (
                    <div key={dept.title} className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-medium text-primary/80">{dept.title}：</span>
                      {dept.names.map((n) => (
                        <span key={n} className="rounded bg-secondary px-1.5 py-0.5 text-[11px] text-foreground">
                          {n}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeadershipVerticalTimeline;
