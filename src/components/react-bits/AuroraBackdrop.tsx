/** Soft moving aurora for secondary landing screens. */
import { motion } from "framer-motion";

export function AuroraBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute -left-1/4 top-0 h-[60vh] w-[70vw] rounded-full bg-accent/20 blur-[100px]"
        animate={{ x: [0, 40, 0], y: [0, 20, 0], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-[50vh] w-[60vw] rounded-full bg-violet-500/15 blur-[100px]"
        animate={{ x: [0, -30, 0], y: [0, -25, 0], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[#0c0f14]/85" />
    </div>
  );
}
