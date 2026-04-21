import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Quote } from "lucide-react";

interface MemoirItem {
  id: string;
  name: string;
  term: string;
  text: string;
}

const paperBg = [
  "bg-[hsl(var(--archive-cream))]",
  "bg-amber-50/80",
  "bg-rose-50/60",
  "bg-stone-100",
];

const MemoirWall = ({ items }: { items: MemoirItem[] }) => {
  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-[hsl(var(--archive-cream))]/40 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold tracking-widest text-[hsl(var(--archive-charcoal))]">
          校友寄语墙
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">那些写在岁月里的话</p>

        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {items.slice(0, 24).map((item, i) => {
            const rotate = (((i * 13) % 7) - 3) * 0.4; // -1.2 ~ 1.2 deg
            const bg = paperBg[i % paperBg.length];
            return (
              <motion.div
                key={item.id + i}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, rotate }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                whileHover={{ rotate: 0, scale: 1.02 }}
                className="mb-4 break-inside-avoid"
              >
                <Link
                  to={`/members/${item.id}`}
                  className={`relative block rounded-md border border-border/60 ${bg} p-5 shadow-sm transition-shadow hover:shadow-md`}
                >
                  <Quote className="absolute -left-1 -top-1 h-4 w-4 text-primary/30" />
                  <p className="font-serif text-sm leading-relaxed text-[hsl(var(--archive-charcoal))]">
                    {item.text}
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
                    <span className="font-serif font-bold text-primary">— {item.name}</span>
                    <span className="italic text-muted-foreground">{item.term}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MemoirWall;
