import { motion } from "framer-motion";

interface Props {
  termCounts: { term: string; members: number; works: number }[];
}

const TermPyramid = ({ termCounts }: Props) => {
  if (termCounts.length === 0) return null;
  const sorted = [...termCounts].sort((a, b) => b.term.localeCompare(a.term));
  const maxMembers = Math.max(...sorted.map((t) => t.members), 1);
  const maxWorks = Math.max(...sorted.map((t) => t.works), 1);

  return (
    <section className="py-14">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold tracking-widest text-[hsl(var(--archive-charcoal))]">
          届别金字塔
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">每届人数与作品产出</p>

        <div className="space-y-2">
          {sorted.map((t, i) => (
            <motion.div
              key={t.term}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="grid grid-cols-[60px_1fr_1fr] items-center gap-2"
            >
              <div className="font-serif text-xs font-bold text-primary">{t.term}</div>
              {/* Members bar (left) */}
              <div className="flex justify-end">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(t.members / maxMembers) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                  className="flex h-6 items-center justify-end rounded-l-full bg-gradient-to-l from-primary/70 to-primary/30 px-2 text-[11px] font-bold text-primary-foreground"
                >
                  {t.members}
                </motion.div>
              </div>
              {/* Works bar (right) */}
              <div className="flex justify-start">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(t.works / maxWorks) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.04 }}
                  className="flex h-6 items-center justify-start rounded-r-full bg-gradient-to-r from-amber-700/70 to-amber-700/30 px-2 text-[11px] font-bold text-amber-50"
                >
                  {t.works}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-primary/60" /> 成员人数
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-sm bg-amber-700/60" /> 作品数量
          </span>
        </div>
      </div>
    </section>
  );
};

export default TermPyramid;
