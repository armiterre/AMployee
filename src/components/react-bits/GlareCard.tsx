/** Card with hover glare and light tilt. */
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import type { ReactNode } from "react";

export function GlareCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const bg = useMotionTemplate`radial-gradient(380px circle at ${mx}px ${my}px, rgba(61,214,195,0.18), transparent 50%)`;

  return (
    <motion.div
      className={`group relative overflow-hidden rounded-2xl border border-line bg-surface ${className}`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 420, damping: 30 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onMouseLeave={() => {
        mx.set(-200);
        my.set(-200);
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: bg }}
      />
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  );
}
