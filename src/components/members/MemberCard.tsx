import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface MemberCardProps {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_claimed: boolean;
  works_count: number;
}

const MemberCard = ({ id, name, term, role_title, bio, avatar_url, is_claimed, works_count }: MemberCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.4 }}
  >
    <Link
      to={`/members/${id}`}
      className="group block rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-xl font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          {avatar_url ? (
            <img src={avatar_url} alt={name} className="h-full w-full rounded-full object-cover" />
          ) : (
            name[0]
          )}
          {is_claimed && (
            <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-[hsl(var(--archive-cream))] text-emerald-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">{name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{term}</span>
            {role_title && (
              <>
                <span>·</span>
                <span className="text-primary font-medium">{role_title}</span>
              </>
            )}
          </div>
          {bio && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground italic">
              "{bio}"
            </p>
          )}
          {works_count > 0 && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-primary/70">
              <BookOpen className="h-3 w-3" />
              <span>{works_count} 篇作品</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  </motion.div>
);

export default MemberCard;
