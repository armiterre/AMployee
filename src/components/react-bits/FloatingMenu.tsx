import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface FloatingMenuProps {
  currentPage: string;
  onNavigate: (page: "home" | "about" | "contact" | "begin-menu" | "begin-flows") => void;
  onHome: () => void;
  showOnPages?: string[];
}

const menuItems: { id: "home" | "about" | "contact"; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

export function FloatingMenu({ currentPage, onNavigate, onHome, showOnPages }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const pagesToShow = showOnPages || ["home", "about", "contact", "begin-menu", "begin-flows"];
  
  useEffect(() => {
    if (pagesToShow.includes(currentPage)) {
      setIsVisible(true);
    }
  }, [currentPage]);

  if (!isVisible || !pagesToShow.includes(currentPage)) {
    return null;
  }

  const handleNavigate = (id: "home" | "about" | "contact") => {
    if (id === "home") {
      onHome();
    } else {
      onNavigate(id);
    }
    setIsOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, x: 20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed right-6 top-1/2 z-[200] -translate-y-1/2"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-full mr-3 flex flex-col gap-2"
          >
            {menuItems.map((item, i) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                onClick={() => handleNavigate(item.id)}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium whitespace-nowrap backdrop-blur-md transition-colors ${
                  currentPage === item.id
                    ? "bg-accent text-black"
                    : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                }`}
              >
                {item.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
        className={`relative flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
          isOpen 
            ? "bg-accent text-black" 
            : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
        }`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </motion.div>
      </motion.button>
    </motion.div>
  );
}
