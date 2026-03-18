import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Users, BookOpen, Crown, Calendar } from "lucide-react";

interface MemberStatsProps {
  totalMembers: number;
  totalWorks: number;
  totalPresidents: number;
}

const AnimatedNumber = ({ value, duration = 1.5 }: { value: number; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = Math.ceil(value / (duration * 60));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [isInView, value, duration]);

  return <span ref={ref}>{display}</span>;
};

const stats = [
  { icon: Calendar, label: "社团成立", suffix: " 年" },
  { icon: Users, label: "历届成员" , suffix: " 人" },
  { icon: BookOpen, label: "累计作品", suffix: " 篇" },
  { icon: Crown, label: "历届社长", suffix: " 位" },
];

const MemberStats = ({ totalMembers, totalWorks, totalPresidents }: MemberStatsProps) => {
  const values = [2006, totalMembers, totalWorks, totalPresidents];

  return (
    <section className="border-y border-border bg-[hsl(var(--archive-cream))]">
      <div className="container mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 py-10 md:grid-cols-4 md:gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            <s.icon className="mx-auto mb-2 h-6 w-6 text-primary/60" />
            <p className="font-serif text-3xl font-bold text-[hsl(var(--archive-charcoal))]">
              {i === 0 ? values[i] : <AnimatedNumber value={values[i]} />}
              {i !== 0 && <span className="text-sm font-normal text-muted-foreground">{s.suffix}</span>}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MemberStats;
