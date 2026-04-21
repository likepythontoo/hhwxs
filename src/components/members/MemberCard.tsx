import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface MemberCardProps {
  id: string;
  name: string;
  term: string;
  role_title: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_claimed: boolean;
  works_count: number;
  city?: string | null;
  literary_tags?: string[] | null;
  memoir?: string | null;
}

const MemberCard = ({
  id, name, term, role_title, bio, avatar_url, is_claimed, works_count,
  city, literary_tags, memoir,
}: MemberCardProps) => {
  const [flipped, setFlipped] = useState(false);
  const hasBack = !!(memoir || (literary_tags && literary_tags.length > 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      style={{ perspective: 1000 }}
      onMouseEnter={() => hasBack && setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      className="relative h-[180px]"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* Front */}
        <Link
          to={`/members/${id}`}
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 block rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-5 text-left transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30"
        >
          <div className="flex items-start gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-xl font-bold text-primary">
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
              {city && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{city}</span>
                </div>
              )}
              {bio && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground italic">
                  "{bio}"
                </p>
              )}
              <div className="mt-2 flex items-center gap-2">
                {works_count > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <BookOpen className="h-2.5 w-2.5" />
                    {works_count} 篇
                  </span>
                )}
                {literary_tags?.slice(0, 2).map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Link>

        {/* Back */}
        {hasBack && (
          <Link
            to={`/members/${id}`}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            className="absolute inset-0 block overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/5 to-[hsl(var(--archive-cream))] p-5"
          >
            <div className="flex h-full flex-col">
              <p className="mb-2 font-serif text-xs font-bold text-primary">{name} · {term}</p>
              {memoir && (
                <p className="line-clamp-5 flex-1 font-serif text-xs italic leading-relaxed text-[hsl(var(--archive-charcoal))]">
                  「{memoir}」
                </p>
              )}
              {literary_tags && literary_tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {literary_tags.map((t) => (
                    <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MemberCard;
