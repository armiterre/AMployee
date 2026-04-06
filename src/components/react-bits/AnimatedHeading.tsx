/** Staggered per-letter heading reveal. */
import { motion } from "framer-motion";

const letter = {
  hidden: { opacity: 0, y: 12 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function AnimatedHeading({
  text,
  className = "",
  as: Tag = "h1",
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "p";
}) {
  const chars = text.split("");
  return (
    <Tag className={className}>
      {chars.map((c, i) => (
        <motion.span
          key={`${i}-${c}`}
          custom={i}
          variants={letter}
          initial="hidden"
          animate="show"
          className="inline-block"
          style={{ whiteSpace: c === " " ? "pre" : undefined }}
        >
          {c === " " ? "\u00a0" : c}
        </motion.span>
      ))}
    </Tag>
  );
}
