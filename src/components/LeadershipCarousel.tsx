import { useState } from "react";
import { ChevronLeft, ChevronRight, Crown, User } from "lucide-react";
import { useLeadershipData } from "@/hooks/useLeadershipData";

const LeadershipCarousel = () => {
  const { data: leadershipData = [], isLoading } = useLeadershipData();
  const [current, setCurrent] = useState(0);
  if (isLoading || leadershipData.length === 0) return <p className="py-10 text-center text-sm text-muted-foreground animate-pulse">加载中...</p>;
  const term = leadershipData[Math.min(current, leadershipData.length - 1)];

  const prev = () => setCurrent((c) => (c === 0 ? leadershipData.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === leadershipData.length - 1 ? 0 : c + 1));

  return (
    <div className="mx-auto max-w-3xl">
      {/* Navigation */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <button
          onClick={prev}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-primary/10"
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </button>
        <div className="flex gap-1.5">
          {leadershipData.map((t, i) => (
            <button
              key={t.year}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${
                i === current ? "w-6 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-primary/10"
        >
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </div>

      {/* Card */}
      <div className="rounded-xl border-2 border-primary/20 bg-card p-8 shadow-lg">
        {/* Year badge */}
        <div className="mb-6 text-center">
          <span className="inline-block rounded-full bg-primary px-5 py-1.5 font-serif text-sm font-bold text-primary-foreground">
            {term.year}
          </span>
        </div>

        {/* President */}
        <div className="mb-5 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/10 px-6 py-4">
            <Crown className="h-5 w-5 text-primary" />
            <div className="text-center">
              <div className="text-[10px] tracking-widest text-muted-foreground">社长</div>
              <div className="font-serif text-xl font-bold text-primary">{term.president}</div>
            </div>
          </div>
        </div>

        {/* Vice Presidents */}
        {term.vicePresidents && term.vicePresidents.length > 0 && (
          <div className="mb-5 flex flex-wrap justify-center gap-3">
            {term.vicePresidents.map((vp) => (
              <div key={vp} className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-card px-4 py-2.5">
                <User className="h-4 w-4 text-primary/70" />
                <div>
                  <div className="text-[10px] text-muted-foreground">副社长</div>
                  <div className="font-serif text-sm font-semibold">{vp}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Departments */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {term.departments.map((dept) => (
            <div key={dept.title} className="rounded-md border border-border bg-secondary/50 p-4">
              <div className="mb-2 text-xs font-bold text-primary">{dept.title}</div>
              <div className="flex flex-wrap gap-1.5">
                {dept.names.map((n) => (
                  <span key={n} className="rounded bg-card px-2 py-0.5 text-xs text-foreground">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadershipCarousel;
