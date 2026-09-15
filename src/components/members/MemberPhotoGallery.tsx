import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X } from "lucide-react";

export interface MemberPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  taken_on: string | null;
}

const MemberPhotoGallery = ({ photos }: { photos: MemberPhoto[] }) => {
  const [active, setActive] = useState<MemberPhoto | null>(null);
  if (photos.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-1.5 font-serif text-base font-bold text-[hsl(var(--archive-charcoal))]">
        <Camera className="h-4 w-4 text-primary" /> 影像集
        <span className="text-sm font-normal text-muted-foreground">({photos.length})</span>
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p, i) => (
          <motion.button
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: Math.min(i * 0.05, 0.4) }}
            onClick={() => setActive(p)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-[hsl(var(--archive-cream))]"
          >
            <img
              src={p.image_url}
              alt={p.caption || "校友照片"}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            {p.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-[11px] text-white line-clamp-2">
                {p.caption}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <button className="absolute right-4 top-4 text-white/70 hover:text-white" aria-label="关闭">
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="max-h-full max-w-3xl overflow-hidden rounded-xl"
              onClick={e => e.stopPropagation()}
            >
              <img src={active.image_url} alt={active.caption || "校友照片"} className="max-h-[75vh] w-auto object-contain" />
              {active.caption && (
                <p className="bg-[hsl(var(--archive-charcoal))] p-3 text-center font-serif text-sm text-[hsl(var(--archive-cream))]">
                  {active.caption}
                  {active.taken_on && <span className="ml-2 opacity-60">{active.taken_on}</span>}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemberPhotoGallery;
