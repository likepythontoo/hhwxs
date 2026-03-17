import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  distance?: number;
  once?: boolean;
}

const ScrollReveal = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
  distance = 40,
  once = true,
}: ScrollRevealProps) => {
  const directionMap = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };

  const initial = { opacity: 0, ...directionMap[direction] };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
