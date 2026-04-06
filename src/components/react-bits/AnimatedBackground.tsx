import { motion, useMotionValue, useTransform } from "framer-motion";

interface AnimatedBackgroundProps {
  className?: string;
}

export function AnimatedBackground({ className = "" }: AnimatedBackgroundProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const gradientX = useTransform(mouseX, [-500, 500], [-30, 30]);
  const gradientY = useTransform(mouseY, [-500, 500], [-30, 30]);

  return (
    <div
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
      onMouseMove={(e) => {
        mouseX.set(e.clientX - window.innerWidth / 2);
        mouseY.set(e.clientY - window.innerHeight / 2);
      }}
    >
      <div className="absolute inset-0 bg-[#06080d]" />

      <motion.div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(61,214,195,0.15), transparent 60%)",
          x: gradientX,
          y: gradientY,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(232, 236, 244, 0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] w-[2px] rounded-full bg-accent/30"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: Math.random() * 8 + 6,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        />
      ))}

      <motion.div
        className="absolute -left-[30%] top-[10%] h-[600px] w-[600px] rounded-full"
        animate={{
          x: [0, 60, -30, 0],
          y: [0, 40, 20, 0],
          scale: [1, 1.1, 1.05, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle, rgba(61,214,195,0.25), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        className="absolute -right-[20%] top-[30%] h-[500px] w-[500px] rounded-full"
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 60, 30, 0],
          scale: [1, 1.08, 1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.2), transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      <motion.div
        className="absolute bottom-[-15%] left-[20%] h-[400px] w-[400px] rounded-full"
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -40, -20, 0],
          opacity: [0.4, 0.7, 0.5, 0.4],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(circle, rgba(34,197,158,0.2), transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,rgba(6,8,13,0.4)_100%)]" />
    </div>
  );
}
