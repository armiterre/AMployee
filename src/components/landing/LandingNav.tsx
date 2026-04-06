import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export type LandingPage =
  | "home"
  | "begin-menu"
  | "begin-flows"
  | "about"
  | "contact";

export function LandingNav({
  page,
  onHome,
}: {
  page: LandingPage;
  onNavigate?: (p: LandingPage) => void;
  onHome: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showLogo = page !== "home" && scrolled;

  if (page === "home" && !scrolled) {
    return null;
  }

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[100]"
    >
      <div className={`mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 ${
        page === "home" && !scrolled 
          ? "bg-transparent" 
          : "bg-[#0c0f14]/95 backdrop-blur-xl border-b border-white/5"
      }`}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showLogo ? 1 : 1 }}
          transition={{ duration: 0.01 }}
        >
          <motion.button
            type="button"
            onClick={onHome}
            className="group font-bold tracking-tight"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="bg-gradient-to-r from-accent via-teal-300 to-accent bg-[length:200%_auto] bg-clip-text text-2xl text-transparent transition-all group-hover:bg-[position:0%_center] sm:text-3xl">
              AMployee
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
