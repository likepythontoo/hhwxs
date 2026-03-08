import { useState } from "react";
import { ChevronDown, Crown, User } from "lucide-react";
import { leadershipData } from "@/data/leadershipData";

const LeadershipAccordion = () => {
  const [openYear, setOpenYear] = useState<string>("2025届");

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      {leadershipData.map((term) => {
        const isOpen = openYear === term.year;
        return (
          <div key={term.year} className="overflow-hidden rounded-lg border border-border bg-card">
            {/* Header */}
            <button
              onClick={() => setOpenYear(isOpen ? "" : term.year)}
              className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {term.year.replace("届", "").slice(-2)}
                </span>
                <div>
                  <span className="font-serif text-sm font-bold">{term.year}</span>
                  <span className="ml-2 text-xs text-muted-foreground">社长：{term.president}</span>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Content */}
            <div
              className={`transition-all duration-300 ${
                isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="border-t border-border px-5 pb-5 pt-4">
                {/* President & VP */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-md border-2 border-primary bg-primary/10 px-3 py-2">
                    <Crown className="h-4 w-4 text-primary" />
                    <div>
                      <div className="text-[9px] text-muted-foreground">社长</div>
                      <div className="font-serif text-sm font-bold text-primary">{term.president}</div>
                    </div>
                  </div>

                  {term.vicePresidents?.map((vp) => (
                    <div key={vp} className="inline-flex items-center gap-2 rounded-md border border-primary/30 bg-card px-3 py-2">
                      <User className="h-3.5 w-3.5 text-primary/60" />
                      <div>
                        <div className="text-[9px] text-muted-foreground">副社长</div>
                        <div className="text-xs font-semibold">{vp}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Departments */}
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {term.departments.map((dept) => (
                    <div key={dept.title} className="rounded border border-border/50 bg-secondary/30 p-3">
                      <div className="mb-1.5 text-[11px] font-bold text-primary">{dept.title}</div>
                      <div className="flex flex-wrap gap-1">
                        {dept.names.map((n) => (
                          <span key={n} className="rounded bg-card px-1.5 py-0.5 text-[11px] text-foreground">
                            {n}
                          </span>
                        ))}
                      </div>
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

export default LeadershipAccordion;
