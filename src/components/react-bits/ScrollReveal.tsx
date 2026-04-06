import { motion, type Variants } from "framer-motion";
import { Children, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

const getDirectionalVariants = (direction: string, delay: number): Variants => {
  const transitions = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };
  
  const directions: Record<string, Variants> = {
    up: { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { ...transitions, delay } } },
    down: { hidden: { opacity: 0, y: -40 }, show: { opacity: 1, y: 0, transition: { ...transitions, delay } } },
    left: { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { ...transitions, delay } } },
    right: { hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { ...transitions, delay } } },
    none: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { ...transitions, delay } } },
  };
  
  return directions[direction] || directions.up;
};

export function ScrollReveal({ children, className = "", delay = 0, direction = "up" }: ScrollRevealProps) {
  return (
    <motion.div
      className={className}
      variants={getDirectionalVariants(direction, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
    >
      {children}
    </motion.div>
  );
}

interface ScrollStaggerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function ScrollStagger({ children, className = "", staggerDelay = 0.1 }: ScrollStaggerProps) {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: staggerDelay },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
    >
      {Children.map(children, (child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
