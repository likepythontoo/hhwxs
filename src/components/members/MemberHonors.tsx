import { motion } from "framer-motion";
import { Award } from "lucide-react";

export interface HonorItem {
  id: string;
  year: number | null;
  title: string;
  issuer: string | null;
  description: string | null;
}

const MemberHonors = ({ items }: { items: HonorItem[] }) => {
  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1.5 font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">
        <Award className="h-4 w-4 text-primary" /> 荣誉记录
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.05, 0.4) }}
            className="rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-4"
          >
            <div className="flex items-baseline gap-2">
              {h.year && <span className="font-serif text-sm font-bold text-primary">{h.year}</span>}
              <p className="font-serif text-sm font-medium text-[hsl(var(--archive-charcoal))]">{h.title}</p>
            </div>
            {h.issuer && <p className="mt-1 text-xs text-muted-foreground">颁发：{h.issuer}</p>}
            {h.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{h.description}</p>}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MemberHonors;
