import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const words = [
  "evolve?",
  "upgrade?",
  "simplify?",
  "grow?",
  "succeed?",
  "thrive?",
];

export function RotatingText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative inline-block min-h-[1.2em] flex items-center">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute text-5xl font-bold text-ink sm:text-6xl md:text-7xl bg-gradient-to-r from-accent via-teal-300 to-accent bg-[length:200%_auto] bg-clip-text text-transparent whitespace-nowrap"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
