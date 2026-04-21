import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface Member {
  id: string;
  name: string;
  term: string;
}

const MemberRelationGraph = ({ members }: { members: Member[] }) => {
  const nodes = useMemo(() => {
    const grouped: Record<string, Member[]> = {};
    members.forEach((m) => (grouped[m.term] = grouped[m.term] || []).push(m));
    const terms = Object.keys(grouped).sort();
    const cx = 400, cy = 300;
    const result: { x: number; y: number; m: Member; angle: number; ring: number }[] = [];
    terms.forEach((term, ti) => {
      const radius = 80 + ti * 55;
      const list = grouped[term];
      list.forEach((m, i) => {
        const angle = (i / list.length) * Math.PI * 2;
        result.push({
          x: cx + Math.cos(angle) * radius,
          y: cy + Math.sin(angle) * radius,
          m,
          angle,
          ring: ti,
        });
      });
    });
    return { points: result, terms };
  }, [members]);

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-[hsl(var(--archive-cream))] p-4">
      <svg viewBox="0 0 800 600" className="mx-auto h-[600px] w-full max-w-[800px]">
        {/* concentric guides */}
        {nodes.terms.map((term, ti) => (
          <g key={term}>
            <circle cx={400} cy={300} r={80 + ti * 55} fill="none" stroke="hsl(var(--primary) / 0.1)" strokeDasharray="2 4" />
            <text x={400} y={300 - (80 + ti * 55) - 4} textAnchor="middle" fontSize="10" fill="hsl(var(--primary) / 0.5)" fontFamily="serif">
              {term}
            </text>
          </g>
        ))}
        {/* lines connecting same term */}
        {nodes.terms.map((term, ti) => {
          const ring = nodes.points.filter((p) => p.ring === ti);
          if (ring.length < 2) return null;
          return ring.map((p, i) => {
            const next = ring[(i + 1) % ring.length];
            return <line key={`${term}-${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="hsl(var(--primary) / 0.15)" strokeWidth={1} />;
          });
        })}
        {/* center */}
        <circle cx={400} cy={300} r={28} fill="hsl(var(--primary))" />
        <text x={400} y={304} textAnchor="middle" fontSize="11" fill="hsl(var(--primary-foreground))" fontFamily="serif" fontWeight="bold">
          红湖
        </text>
        {/* nodes */}
        {nodes.points.map((p, i) => (
          <motion.g
            key={p.m.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.005, duration: 0.3 }}
          >
            <Link to={`/members/${p.m.id}`}>
              <circle cx={p.x} cy={p.y} r={6} fill="hsl(var(--primary) / 0.7)" className="cursor-pointer transition-all hover:r-8" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fill="hsl(var(--archive-charcoal))" fontFamily="serif" className="pointer-events-none">
                {p.m.name}
              </text>
            </Link>
          </motion.g>
        ))}
      </svg>
      <p className="mt-2 text-center text-xs text-muted-foreground">同心环 · 每环代表一届，节点连线表示同届校友</p>
    </div>
  );
};

export default MemberRelationGraph;
