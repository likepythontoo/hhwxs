import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  avatar_url: string | null;
}

interface PhotoWallProps {
  termGroups: Record<string, Member[]>;
}

const PhotoWall = ({ termGroups }: PhotoWallProps) => {
  const sortedTerms = Object.keys(termGroups).sort((a, b) => b.localeCompare(a));
  if (sortedTerms.length === 0) return null;

  return (
    <section className="bg-[hsl(var(--archive-cream))] py-16">
      <div className="container mx-auto max-w-5xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold text-[hsl(var(--archive-charcoal))] tracking-widest">
          成员合影墙
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">每一届的青春与记忆</p>

        {sortedTerms.map(term => (
          <div key={term} className="mb-10">
            <h3 className="mb-4 font-serif text-lg font-bold text-primary">{term} 成员</h3>
            <div className="flex flex-wrap gap-3">
              {termGroups[term].map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary ring-2 ring-primary/20 transition-all hover:ring-primary/50 hover:scale-110"
                  title={m.name}
                >
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt={m.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    m.name[0]
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PhotoWall;
