import { motion } from "framer-motion";
import { Trophy, Medal } from "lucide-react";
import { Link } from "react-router-dom";

interface RankedAuthor {
  id: string;
  name: string;
  term: string;
  avatar_url: string | null;
  works_count: number;
}

const AuthorRanking = ({ authors }: { authors: RankedAuthor[] }) => {
  if (authors.length === 0) return null;

  const rankColors = ["text-yellow-500", "text-gray-400", "text-amber-700"];

  return (
    <section className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold text-[hsl(var(--archive-charcoal))] tracking-widest">
          最受欢迎作者
        </h2>
        <p className="mb-10 text-center text-sm text-muted-foreground">以作品数量排名</p>

        <div className="space-y-3">
          {authors.slice(0, 10).map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link
                to={`/members/${a.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                  {i < 3 ? (
                    <Trophy className={`h-5 w-5 ${rankColors[i]}`} />
                  ) : (
                    <span className="font-serif text-sm font-bold text-muted-foreground">{i + 1}</span>
                  )}
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
                  {a.avatar_url ? (
                    <img src={a.avatar_url} alt={a.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    a.name[0]
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-serif text-sm font-bold text-[hsl(var(--archive-charcoal))]">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.term}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-lg font-bold text-primary">{a.works_count}</p>
                  <p className="text-[10px] text-muted-foreground">篇作品</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuthorRanking;
