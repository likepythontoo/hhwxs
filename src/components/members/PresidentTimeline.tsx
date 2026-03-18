import { motion } from "framer-motion";

interface President {
  name: string;
  term: string;
  avatar_url: string | null;
}

const PresidentTimeline = ({ presidents }: { presidents: President[] }) => {
  if (presidents.length === 0) return null;

  return (
    <section className="bg-[hsl(var(--archive-charcoal))] py-16 text-[hsl(var(--archive-cream))]">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold tracking-widest">历届社长</h2>
        <p className="mb-10 text-center text-sm opacity-60">薪火相传，文脉不息</p>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary/40" />

          {presidents.map((p, i) => {
            const isLeft = i % 2 === 0;
            return (
              <motion.div
                key={`${p.term}-${p.name}`}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative mb-10 flex items-center ${isLeft ? "flex-row" : "flex-row-reverse"}`}
              >
                {/* Content */}
                <div className={`w-[calc(50%-2rem)] ${isLeft ? "text-right pr-6" : "text-left pl-6"}`}>
                  <p className="font-serif text-lg font-bold">{p.name}</p>
                  <p className="text-xs text-primary/80">{p.term}</p>
                </div>

                {/* Node */}
                <div className="absolute left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary bg-[hsl(var(--archive-charcoal))] font-serif text-sm font-bold text-primary">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    p.name[0]
                  )}
                </div>

                {/* Spacer for the other side */}
                <div className="w-[calc(50%-2rem)]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PresidentTimeline;
