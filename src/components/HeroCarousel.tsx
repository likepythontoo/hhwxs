import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const slides = [
  { image: hero1, title: "红湖文学社", subtitle: "河北科技学院", desc: "成立于2003年 · 坚持原创，拒绝平庸，用文字记录青春" },
  { image: hero2, title: "年度盛典", subtitle: "荣誉加冕", desc: "表彰优秀创作者，共襄文学盛事" },
  { image: hero3, title: "翰墨飘香", subtitle: "以文会友", desc: "探索文学之美，感悟生命真谛" },
];

const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative h-[50vh] w-full overflow-hidden md:h-[70vh]">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: current === i ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>
      ))}

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="gold-divider mb-6" />
        <h1
          className="font-serif text-4xl font-bold tracking-[0.3em] text-rice-paper drop-shadow-lg md:text-6xl"
          key={`title-${current}`}
        >
          {slides[current].title}
        </h1>
        <h2
          className="mt-2 font-serif text-2xl tracking-[0.2em] text-gold-light drop-shadow md:text-4xl"
          key={`subtitle-${current}`}
        >
          {slides[current].subtitle}
        </h2>
        <p className="mt-4 text-sm tracking-widest text-rice-paper/80 md:text-base">
          {slides[current].desc}
        </p>
        <div className="gold-divider mt-6" />
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-ink-black/30 p-2 text-rice-paper backdrop-blur transition hover:bg-ink-black/60"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-ink-black/30 p-2 text-rice-paper backdrop-blur transition hover:bg-ink-black/60"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${
              current === i ? "w-8 bg-gold" : "w-2 bg-rice-paper/50"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;
