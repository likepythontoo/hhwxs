import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useLeadershipData";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  desc: string;
}

const defaultSlides: Slide[] = [
  { image: hero1, title: "红湖文学社", subtitle: "河北科技学院", desc: "成立于2003年 · 坚持原创，拒绝平庸，用文字记录青春" },
  { image: hero2, title: "年度盛典", subtitle: "荣誉加冕", desc: "表彰优秀创作者，共襄文学盛事" },
  { image: hero3, title: "翰墨飘香", subtitle: "以文会友", desc: "探索文学之美，感悟生命真谛" },
];

const textVariants = {
  enter: { opacity: 0, y: 30, filter: "blur(8px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -20, filter: "blur(4px)" },
};

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [, setDirection] = useState(1);

  const { data: dbSlides = [] } = useQuery<Slide[]>({
    queryKey: ["hero_slides"],
    queryFn: async () => {
      const { data } = await supabase.from("hero_slides" as any).select("*").eq("is_active", true).order("sort_order", { ascending: true });
      return ((data as any[]) || []).map((s) => ({
        image: s.image_url,
        title: s.title,
        subtitle: s.subtitle || "",
        desc: s.description || "",
      })).filter(s => s.image);
    },
    staleTime: 60_000,
  });

  const { data: settings } = useSiteSettings();
  const interval = Number(settings?.hero_autoplay_interval || 6) * 1000;

  const slides = dbSlides.length > 0 ? dbSlides : defaultSlides;

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);
  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((c) => (c - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  const safeCurrent = Math.min(current, slides.length - 1);

  return (
    <section className="relative h-[55vh] w-full overflow-hidden md:h-[75vh]">
      {slides.map((slide, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: safeCurrent === i ? 1 : 0,
            scale: safeCurrent === i ? 1.05 : 1.1,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
        </motion.div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-ink-black/20 via-ink-black/10 to-ink-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-black/30 via-transparent to-ink-black/30" />

      <div className="absolute inset-6 border border-rice-paper/10 pointer-events-none md:inset-12" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.div className="mb-8 flex items-center gap-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.3 }}>
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold md:w-20" />
          <div className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold md:w-20" />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={safeCurrent}
            variants={textVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center"
          >
            <h1 className="font-serif text-4xl font-bold tracking-[0.3em] text-rice-paper drop-shadow-2xl md:text-7xl">
              {slides[safeCurrent].title}
            </h1>
            {slides[safeCurrent].subtitle && (
              <h2 className="mt-3 font-serif text-xl tracking-[0.2em] text-gold-light drop-shadow-lg md:text-3xl">
                {slides[safeCurrent].subtitle}
              </h2>
            )}
            {slides[safeCurrent].desc && (
              <p className="mt-5 max-w-lg text-sm tracking-[0.15em] text-rice-paper/70 md:text-base">
                {slides[safeCurrent].desc}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div className="mt-8 flex items-center gap-4" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.5 }}>
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold md:w-20" />
          <div className="h-1.5 w-1.5 rotate-45 bg-gold" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold md:w-20" />
        </motion.div>
      </div>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-rice-paper/20 bg-ink-black/20 p-3 text-rice-paper/80 backdrop-blur-md transition-all hover:border-gold/40 hover:bg-ink-black/40 hover:text-gold-light md:left-8" aria-label="上一张">
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-rice-paper/20 bg-ink-black/20 p-3 text-rice-paper/80 backdrop-blur-md transition-all hover:border-gold/40 hover:bg-ink-black/40 hover:text-gold-light md:right-8" aria-label="下一张">
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > safeCurrent ? 1 : -1); setCurrent(i); }}
            className="group relative h-3 w-3 p-0"
            aria-label={`第 ${i + 1} 张`}
          >
            <span className={`block h-full w-full rounded-full border transition-all duration-500 ${
              safeCurrent === i ? "scale-100 border-gold bg-gold shadow-[0_0_12px_rgba(218,165,32,0.5)]" : "scale-75 border-rice-paper/40 bg-transparent group-hover:border-rice-paper/70"
            }`} />
          </button>
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ink-black/90 via-ink-black/40 to-transparent" />
    </section>
  );
};

export default HeroCarousel;
