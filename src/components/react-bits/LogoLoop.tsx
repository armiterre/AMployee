import { motion } from "framer-motion";

const companies = [
  { name: "McDonald's", icon: "🍟" },
  { name: "Starbucks", icon: "☕" },
  { name: "Apple", icon: "🍎" },
  { name: "Tesla", icon: "⚡" },
  { name: "Nike", icon: "✓" },
  { name: "Amazon", icon: "📦" },
  { name: "Google", icon: "🔍" },
  { name: "Netflix", icon: "🎬" },
  { name: "Microsoft", icon: "🪟" },
  { name: "Meta", icon: "💬" },
  { name: "Spotify", icon: "🎵" },
  { name: "Uber", icon: "🚗" },
];

function LogoItem({ name, icon }: { name: string; icon: string }) {
  return (
    <div className="flex items-center gap-3 px-8 py-4 mx-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors shrink-0">
      <span className="text-3xl">{icon}</span>
      <span className="whitespace-nowrap font-semibold text-white/70 text-sm">{name}</span>
      <span className="text-xs text-accent/60">uses AMployee</span>
    </div>
  );
}

export function LogoLoop() {
  const allCompanies = [...companies, ...companies, ...companies];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0c0f14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0c0f14] to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex"
        animate={{ x: ["0%", "-33.333%"] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 30,
            ease: "linear",
          },
        }}
      >
        {allCompanies.map((company, i) => (
          <LogoItem key={`${company.name}-${i}`} {...company} />
        ))}
      </motion.div>
    </div>
  );
}
