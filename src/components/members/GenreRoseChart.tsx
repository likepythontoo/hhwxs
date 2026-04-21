import { motion } from "framer-motion";

interface Props {
  tags: Record<string, number>;
}

const GenreRoseChart = ({ tags }: Props) => {
  const entries = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 12);
  if (entries.length === 0) return null;
  const max = entries[0][1];
  const cx = 200, cy = 200;
  const sliceAngle = (Math.PI * 2) / entries.length;

  return (
    <section className="bg-[hsl(var(--archive-cream))]/40 py-14">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold tracking-widest text-[hsl(var(--archive-charcoal))]">
          流派玫瑰图
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">文学流派分布的视觉投影</p>

        <div className="flex justify-center">
          <svg viewBox="0 0 400 400" className="h-[400px] w-full max-w-[400px]">
            {/* concentric grid */}
            {[40, 80, 120, 160].map((r) => (
              <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--primary) / 0.08)" />
            ))}
            {entries.map(([tag, count], i) => {
              const startAngle = i * sliceAngle - Math.PI / 2;
              const endAngle = startAngle + sliceAngle * 0.85;
              const radius = (count / max) * 160;
              const x1 = cx + Math.cos(startAngle) * radius;
              const y1 = cy + Math.sin(startAngle) * radius;
              const x2 = cx + Math.cos(endAngle) * radius;
              const y2 = cy + Math.sin(endAngle) * radius;
              const labelAngle = startAngle + (sliceAngle * 0.85) / 2;
              const lx = cx + Math.cos(labelAngle) * (radius + 16);
              const ly = cy + Math.sin(labelAngle) * (radius + 16);
              const hue = (i / entries.length) * 360;
              return (
                <motion.g key={tag} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                    fill={`hsl(${hue}, 50%, 55%)`}
                    fillOpacity={0.7}
                    stroke="hsl(var(--archive-cream))"
                    strokeWidth={1}
                  />
                  <text x={lx} y={ly} textAnchor="middle" fontSize="10" fill="hsl(var(--archive-charcoal))" fontFamily="serif">
                    {tag} <tspan fill="hsl(var(--primary))" fontWeight="bold">{count}</tspan>
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>
      </div>
    </section>
  );
};

export default GenreRoseChart;
