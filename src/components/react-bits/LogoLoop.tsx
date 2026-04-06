const companies = [
  { name: "McDonald's", color: "#FFC72C" },
  { name: "Starbucks", color: "#00704A" },
  { name: "Apple", color: "#A2AAAD" },
  { name: "Walmart", color: "#0071DC" },
  { name: "Target", color: "#CC0000" },
  { name: "Nike", color: "#000000" },
  { name: "Amazon", color: "#FF9900" },
  { name: "Google", color: "#4285F4" },
  { name: "Microsoft", color: "#00A4EF" },
  { name: "Meta", color: "#0081FB" },
  { name: "Netflix", color: "#E50914" },
  { name: "Spotify", color: "#1DB954" },
  { name: "Tesla", color: "#CC0000" },
  { name: "Uber", color: "#000000" },
  { name: "Airbnb", color: "#FF5A5F" },
  { name: "Shopify", color: "#96BF48" },
  { name: "Slack", color: "#4A154B" },
  { name: "Zoom", color: "#2D8CFF" },
  { name: "Disney", color: "#113CCF" },
  { name: "Coca-Cola", color: "#F40009" },
  { name: "Pepsi", color: "#004B93" },
  { name: "FedEx", color: "#4D148C" },
  { name: "UPS", color: "#351C15" },
  { name: "Home Depot", color: "#F96302" },
];

function LogoItem({ name, color }: { name: string; color: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 mx-3 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-colors shrink-0">
      <div 
        className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
        style={{ backgroundColor: color, color: color === "#000000" || color === "#4D148C" || color === "#351C15" ? "#fff" : "#000" }}
      >
        {name.charAt(0)}
      </div>
      <div className="flex flex-col">
        <span className="whitespace-nowrap font-semibold text-white/80 text-sm">{name}</span>
        <span className="text-[10px] text-accent/50">uses AMployee</span>
      </div>
    </div>
  );
}

export function LogoLoop() {
  const allCompanies = [...companies, ...companies];

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0c0f14] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0c0f14] to-transparent z-10 pointer-events-none" />
      
      <div className="flex animate-logo-scroll hover:pause">
        {allCompanies.map((company, i) => (
          <LogoItem key={`${company.name}-${i}`} {...company} />
        ))}
      </div>
    </div>
  );
}
