import { motion } from "framer-motion";
import { Cake, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface AnniversaryItem {
  id: string;
  name: string;
  term: string;
  type: "birthday" | "joined";
  years?: number;
}

const AnniversaryCard = ({ items }: { items: AnniversaryItem[] }) => {
  if (items.length === 0) return null;

  return (
    <section className="py-10">
      <div className="container mx-auto max-w-5xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-[hsl(var(--archive-cream))] to-amber-50 p-6 shadow-sm"
        >
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 font-serif text-lg font-bold text-primary">
                <Sparkles className="h-4 w-4" />
                今日纪念
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">{new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" })} · 与红湖同行的特别日子</p>
            </div>
          </div>
          <div className="relative mt-4 flex flex-wrap gap-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id + item.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  to={`/members/${item.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/80 px-4 py-2 text-xs backdrop-blur transition hover:border-primary hover:shadow-md"
                >
                  {item.type === "birthday" ? (
                    <Cake className="h-3.5 w-3.5 text-rose-600" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  )}
                  <span className="font-serif font-bold text-[hsl(var(--archive-charcoal))]">{item.name}</span>
                  <span className="text-muted-foreground">{item.term}</span>
                  <span className="text-primary">
                    {item.type === "birthday" ? "生日快乐" : `入社${item.years ? item.years + "周年" : "纪念"}`}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AnniversaryCard;
