import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface Member {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  city: string | null;
  is_claimed: boolean;
  works_count: number;
}

const MemberListView = ({ members }: { members: Member[] }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-[hsl(var(--archive-cream))]">
    <table className="w-full text-sm">
      <thead className="bg-primary/5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
        <tr>
          <th className="px-4 py-3">姓名</th>
          <th className="hidden px-4 py-3 sm:table-cell">届别</th>
          <th className="hidden px-4 py-3 md:table-cell">职务</th>
          <th className="hidden px-4 py-3 md:table-cell">所在地</th>
          <th className="px-4 py-3 text-right">作品</th>
        </tr>
      </thead>
      <tbody>
        {members.map((m, i) => (
          <motion.tr
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.01, 0.5) }}
            className="border-t border-border/50 transition-colors hover:bg-primary/5"
          >
            <td className="px-4 py-3">
              <Link to={`/members/${m.id}`} className="flex items-center gap-2 font-serif font-medium text-[hsl(var(--archive-charcoal))] hover:text-primary">
                {m.name}
                {m.is_claimed && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
              </Link>
            </td>
            <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{m.term}</td>
            <td className="hidden px-4 py-3 text-primary md:table-cell">{m.role_title || "—"}</td>
            <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{m.city || "—"}</td>
            <td className="px-4 py-3 text-right font-serif font-bold text-primary">{m.works_count}</td>
          </motion.tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default MemberListView;
