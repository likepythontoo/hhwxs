import { useState } from "react";
import { Crown, User, X } from "lucide-react";
import { leadershipData, type Term } from "@/data/leadershipData";

const LeadershipGrid = () => {
  const [selected, setSelected] = useState<Term | null>(null);

  return (
    <>
      <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 md:grid-cols-3">
        {leadershipData.map((term) => (
          <button
            key={term.year}
            onClick={() => setSelected(term)}
            className="group rounded-lg border border-border bg-card p-6 text-left transition-all hover:border-primary/50 hover:shadow-lg hover-scale"
          >
            <div className="mb-3 inline-block rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-primary-foreground">
              {term.year}
            </div>
            <div className="mb-1 flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="font-serif text-lg font-bold text-primary">{term.president}</span>
            </div>
            {term.vicePresidents && term.vicePresidents.length > 0 && (
              <div className="mb-2 text-xs text-muted-foreground">
                副社长：{term.vicePresidents.join("、")}
              </div>
            )}
            <div className="text-[11px] text-muted-foreground/60">
              {term.departments.length} 个部门 · 点击查看详情
            </div>
          </button>
        ))}
      </div>

      {/* Dialog Overlay */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-xl border-2 border-primary/20 bg-card p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setSelected(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-secondary transition-colors hover:bg-primary/10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Year */}
            <div className="mb-5 text-center">
              <span className="inline-block rounded-full bg-primary px-5 py-1.5 font-serif text-sm font-bold text-primary-foreground">
                {selected.year}
              </span>
            </div>

            {/* President */}
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/10 px-6 py-3">
                <Crown className="h-5 w-5 text-primary" />
                <div className="text-center">
                  <div className="text-[10px] tracking-widest text-muted-foreground">社长</div>
                  <div className="font-serif text-xl font-bold text-primary">{selected.president}</div>
                </div>
              </div>
            </div>

            {/* Vice Presidents */}
            {selected.vicePresidents && selected.vicePresidents.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-2">
                {selected.vicePresidents.map((vp) => (
                  <div key={vp} className="inline-flex items-center gap-2 rounded-md border border-primary/30 px-3 py-2">
                    <User className="h-3.5 w-3.5 text-primary/60" />
                    <div>
                      <div className="text-[9px] text-muted-foreground">副社长</div>
                      <div className="text-xs font-semibold">{vp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Departments */}
            <div className="grid gap-2 sm:grid-cols-2">
              {selected.departments.map((dept) => (
                <div key={dept.title} className="rounded-md border border-border bg-secondary/30 p-3">
                  <div className="mb-1.5 text-[11px] font-bold text-primary">{dept.title}</div>
                  <div className="flex flex-wrap gap-1">
                    {dept.names.map((n) => (
                      <span key={n} className="rounded bg-card px-1.5 py-0.5 text-[11px] text-foreground">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadershipGrid;
