import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  avatar_url: string | null;
}

const MemberTimelineView = ({ members }: { members: Member[] }) => {
  const grouped: Record<string, Member[]> = {};
  members.forEach((m) => (grouped[m.term] = grouped[m.term] || []).push(m));
  const terms = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="relative pl-8">
      <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
      {terms.map((term, i) => (
        <motion.div
          key={term}
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="relative mb-8"
        >
          <div className="absolute -left-7 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-[hsl(var(--archive-cream))]" />
          <h3 className="mb-3 font-serif text-lg font-bold text-primary">{term}</h3>
          <div className="flex flex-wrap gap-2">
            {grouped[term].map((m) => (
              <Link
                key={m.id}
                to={`/members/${m.id}`}
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-[hsl(var(--archive-cream))] py-1 pl-1 pr-3 text-xs transition hover:border-primary/40 hover:shadow-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-serif text-[10px] font-bold text-primary">
                  {m.avatar_url ? <img src={m.avatar_url} alt={m.name} className="h-full w-full rounded-full object-cover" /> : m.name[0]}
                </span>
                <span className="font-serif text-[hsl(var(--archive-charcoal))]">{m.name}</span>
                {m.role_title && <span className="text-[10px] text-primary/70">{m.role_title}</span>}
              </Link>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default MemberTimelineView;
