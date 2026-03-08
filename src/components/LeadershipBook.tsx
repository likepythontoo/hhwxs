import { useState } from "react";
import { ChevronLeft, ChevronRight, Crown, User } from "lucide-react";
import { leadershipData } from "@/data/leadershipData";

const LeadershipBook = () => {
  const [page, setPage] = useState(0);
  const [flipping, setFlipping] = useState<"left" | "right" | null>(null);

  const term = leadershipData[page];

  const flip = (dir: "left" | "right") => {
    const next = dir === "right" ? page + 1 : page - 1;
    if (next < 0 || next >= leadershipData.length) return;
    setFlipping(dir);
    setTimeout(() => {
      setPage(next);
      setFlipping(null);
    }, 400);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Book */}
      <div className="relative" style={{ perspective: "1200px" }}>
        <div
          className={`rounded-xl border border-border bg-card shadow-xl transition-transform duration-400 ${
            flipping === "right"
              ? "[transform:rotateY(-12deg)]"
              : flipping === "left"
              ? "[transform:rotateY(12deg)]"
              : ""
          }`}
          style={{ transformOrigin: flipping === "right" ? "left center" : "right center" }}
        >
          {/* Book spine decoration */}
          <div className="absolute left-0 top-0 bottom-0 w-2 rounded-l-xl bg-primary/20" />

          <div className="p-8 pl-10 md:p-12 md:pl-14">
            {/* Page number */}
            <div className="mb-6 flex items-center justify-between">
              <span className="font-serif text-xs italic text-muted-foreground">
                第 {page + 1} 页 / 共 {leadershipData.length} 页
              </span>
              <span className="inline-block rounded-full bg-primary px-4 py-1 font-serif text-sm font-bold text-primary-foreground">
                {term.year}
              </span>
            </div>

            {/* Decorative line */}
            <div className="mb-6 border-b-2 border-primary/10" />

            {/* President - centered, book style */}
            <div className="mb-6 text-center">
              <div className="mb-1 font-serif text-xs tracking-[0.3em] text-muted-foreground">社　长</div>
              <div className="flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-primary" />
                <span className="font-serif text-2xl font-bold tracking-wider text-primary">{term.president}</span>
              </div>
            </div>

            {/* Vice Presidents */}
            {term.vicePresidents && term.vicePresidents.length > 0 && (
              <div className="mb-6 text-center">
                <div className="mb-2 font-serif text-xs tracking-[0.3em] text-muted-foreground">副社长</div>
                <div className="flex flex-wrap justify-center gap-3">
                  {term.vicePresidents.map((vp) => (
                    <span key={vp} className="font-serif text-base font-semibold tracking-wider">{vp}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Decorative divider */}
            <div className="mx-auto my-6 flex w-32 items-center gap-2">
              <div className="h-px flex-1 bg-primary/20" />
              <div className="h-1.5 w-1.5 rotate-45 bg-primary/30" />
              <div className="h-px flex-1 bg-primary/20" />
            </div>

            {/* Departments */}
            <div className="grid gap-4 sm:grid-cols-2">
              {term.departments.map((dept) => (
                <div key={dept.title} className="rounded border border-border/50 bg-secondary/20 p-4">
                  <div className="mb-2 font-serif text-xs font-bold text-primary">{dept.title}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {dept.names.map((n) => (
                      <span key={n} className="rounded bg-card px-2 py-0.5 text-xs text-foreground shadow-sm">{n}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom decoration */}
            <div className="mt-8 border-t border-primary/10 pt-4 text-center">
              <span className="font-serif text-[10px] italic tracking-wider text-muted-foreground/50">
                — 红湖文学社 · {term.year} —
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={() => flip("left")}
          disabled={page === 0}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 text-primary" />
        </button>
        <div className="flex gap-1">
          {leadershipData.map((_, i) => (
            <button
              key={i}
              onClick={() => { setPage(i); }}
              className={`h-2 rounded-full transition-all ${
                i === page ? "w-5 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => flip("right")}
          disabled={page === leadershipData.length - 1}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card transition-all hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );
};

export default LeadershipBook;
