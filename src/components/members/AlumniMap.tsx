import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

interface AlumniMapProps {
  cityData: Record<string, number>;
}

const AlumniMap = ({ cityData }: AlumniMapProps) => {
  const entries = Object.entries(cityData).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const max = entries[0][1];

  return (
    <section className="bg-[hsl(var(--archive-cream))] py-16">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold text-[hsl(var(--archive-charcoal))] tracking-widest">
          红湖文学社足迹
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">校友遍布各地，文学联结彼此</p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {entries.map(([city, count], i) => (
            <motion.div
              key={city}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-serif text-sm font-bold text-[hsl(var(--archive-charcoal))]">{city}</span>
              </div>
              <p className="text-2xl font-bold text-primary">{count}<span className="text-xs font-normal text-muted-foreground"> 人</span></p>
              {/* Bar */}
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-primary/10">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(count / max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="h-full rounded-full bg-primary/60"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlumniMap;
