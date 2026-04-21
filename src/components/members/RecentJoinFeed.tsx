import { motion } from "framer-motion";
import { UserPlus, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface Joined {
  id: string;
  name: string;
  term: string;
  created_at: string;
}

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return "今天";
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return `${Math.floor(days / 365)} 年前`;
};

const RecentJoinFeed = ({ items }: { items: Joined[] }) => {
  if (items.length === 0) return null;

  return (
    <section className="bg-[hsl(var(--archive-cream))]/40 py-14">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold tracking-widest text-[hsl(var(--archive-charcoal))]">
          新加入的校友
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">最近补录入库的故人</p>

        <div className="relative space-y-3 pl-6">
          <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
          {items.slice(0, 8).map((j, i) => (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative"
            >
              <div className="absolute -left-[18px] top-3 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
              <Link
                to={`/members/${j.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm"
              >
                <UserPlus className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="font-serif text-sm font-bold text-[hsl(var(--archive-charcoal))]">
                    {j.name} <span className="text-xs font-normal text-muted-foreground">· {j.term}</span>
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {timeAgo(j.created_at)}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentJoinFeed;
