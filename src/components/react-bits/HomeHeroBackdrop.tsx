import { motion } from "framer-motion";

/**
 * Layered mesh + grid for the landing hero (home gate only).
 */
export function HomeHeroBackdrop() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#06080d]"
      aria-hidden
    >
      {/* Soft base wash */}
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 120% 80% at 50% -20%, rgba(61, 214, 195, 0.18), transparent 55%), radial-gradient(ellipse 90% 60% at 100% 50%, rgba(99, 102, 241, 0.12), transparent 50%), radial-gradient(ellipse 70% 50% at 0% 80%, rgba(34, 197, 158, 0.1), transparent 45%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(232, 236, 244, 0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Drifting blobs */}
      <motion.div
        className="absolute -left-[20%] top-[5%] h-[min(85vw,720px)] w-[min(85vw,720px)] rounded-full bg-gradient-to-br from-accent/35 via-teal-400/20 to-transparent blur-[120px]"
        animate={{
          x: [0, 45, -20, 0],
          y: [0, 30, 15, 0],
          scale: [1, 1.08, 1.02, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-[15%] top-[25%] h-[min(70vw,560px)] w-[min(70vw,560px)] rounded-full bg-gradient-to-bl from-indigo-500/25 via-violet-500/15 to-transparent blur-[110px]"
        animate={{
          x: [0, -40, 25, 0],
          y: [0, 50, 20, 0],
          scale: [1, 1.06, 1, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[15%] h-[min(65vw,480px)] w-[min(65vw,480px)] rounded-full bg-gradient-to-tr from-cyan-500/20 via-accent/15 to-transparent blur-[100px]"
        animate={{
          x: [0, 35, -15, 0],
          y: [0, -35, -10, 0],
          opacity: [0.5, 0.85, 0.6, 0.5],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Fine horizon line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent"
        aria-hidden
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,transparent_0%,rgba(6,8,13,0.5)_100%)]" />
    </div>
  );
}
