import { motion } from "framer-motion";

interface Props {
  tags: Record<string, number>;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const genreColor = (tag: string): string => {
  if (/诗|韵|句/.test(tag)) return "text-rose-700";
  if (/小说|故事|叙事/.test(tag)) return "text-amber-700";
  if (/散文|随笔|札记/.test(tag)) return "text-emerald-700";
  if (/评论|文学批评/.test(tag)) return "text-indigo-700";
  return "text-primary";
};

const LiteraryTagCloud = ({ tags, selectedTag, onSelectTag }: Props) => {
  const entries = Object.entries(tags).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const max = entries[0][1];
  const min = entries[entries.length - 1][1];

  return (
    <section className="bg-[hsl(var(--archive-cream))] py-14">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="mb-2 text-center font-serif text-2xl font-bold tracking-widest text-[hsl(var(--archive-charcoal))]">
          文学流派 · 标签云
        </h2>
        <p className="mb-8 text-center text-sm text-muted-foreground">点击标签筛选同流派校友</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {selectedTag && (
            <button
              onClick={() => onSelectTag(null)}
              className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
            >
              清除筛选 ✕
            </button>
          )}
          {entries.map(([tag, count], i) => {
            const range = Math.max(max - min, 1);
            const size = 0.85 + ((count - min) / range) * 1.6; // 0.85rem ~ 2.45rem
            const isActive = selectedTag === tag;
            return (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02 }}
                whileHover={{ scale: 1.1 }}
                onClick={() => onSelectTag(isActive ? null : tag)}
                style={{ fontSize: `${size}rem` }}
                className={`font-serif font-bold transition ${
                  isActive ? "text-primary underline decoration-wavy underline-offset-4" : `${genreColor(tag)} hover:text-primary`
                }`}
              >
                {tag}
                <sup className="ml-0.5 text-[10px] font-normal text-muted-foreground">{count}</sup>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LiteraryTagCloud;
