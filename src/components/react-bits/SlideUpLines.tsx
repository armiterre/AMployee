import { motion } from "framer-motion";

/** Paragraph lines slide up and fade in (scroll-triggered). */
export function SlideUpLines({
  lines,
  className = "",
  lineClassName = "text-muted",
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
}) {
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <motion.p
          key={i}
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{
            delay: i * 0.1,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`${lineClassName} ${i > 0 ? "mt-3" : ""} leading-relaxed`}
        >
          {line}
        </motion.p>
      ))}
    </div>
  );
}
