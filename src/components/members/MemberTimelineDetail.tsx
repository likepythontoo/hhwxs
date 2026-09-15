import { motion } from "framer-motion";
import { Milestone } from "lucide-react";

export interface TimelineItem {
  id: string;
  happened_on: string | null;
  year_label: string | null;
  kind: string;
  title: string;
  description: string | null;
}

const kindLabels: Record<string, string> = {
  join: "入社",
  role: "任职",
  award: "获奖",
  work: "作品",
  graduate: "毕业去向",
  other: "其他",
};

const MemberTimelineDetail = ({ items }: { items: TimelineItem[] }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-1.5 font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">
        <Milestone className="h-4 w-4 text-primary" /> 经历时间线
      </h3>
      <ol className="relative space-y-5 border-l border-primary/25 pl-6">
        {items.map((it, i) => (
          <motion.li
            key={it.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.06, 0.5) }}
          >
            <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-sm font-bold text-primary">
                {it.year_label || (it.happened_on ? it.happened_on.slice(0, 7) : "—")}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                {kindLabels[it.kind] || it.kind}
              </span>
            </div>
            <p className="mt-1 font-serif text-sm font-medium text-[hsl(var(--archive-charcoal))]">{it.title}</p>
            {it.description && (
              <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{it.description}</p>
            )}
          </motion.li>
        ))}
      </ol>
    </div>
  );
};

export default MemberTimelineDetail;
