import { motion } from "framer-motion";

interface TestimonialCardProps {
  name: string;
  role: string;
  text: string;
  rating: number;
}

export function TestimonialCard({ name, role, text, rating }: TestimonialCardProps) {
  return (
    <div className="group relative w-[380px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface p-8 transition-all duration-500 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
      
      <div className="relative z-10">
        <div className="mb-6 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-5 w-5 ${i < rating ? 'text-accent' : 'text-muted/30'}`}
              fill={i < rating ? "currentColor" : "none"}
              viewBox="0 0 20 20"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <p className="mb-6 text-base leading-relaxed text-muted group-hover:text-ink transition-colors duration-300">
          "{text}"
        </p>

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 font-bold text-lg text-accent">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-ink">{name}</p>
            <p className="text-sm text-muted">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MarqueeTestimonialsProps {
  testimonials: TestimonialCardProps[];
  direction?: "left" | "right";
}

export function MarqueeTestimonials({ testimonials, direction = "left" }: MarqueeTestimonialsProps) {
  const allTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials];
  
  return (
    <div className="relative overflow-hidden -mx-4 sm:mx-0 sm:-mx-8 md:-mx-12 lg:-mx-16 xl:-mx-24">
      <motion.div
        className="flex gap-6 py-6 px-4"
        animate={{ x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear",
        }}
        whileHover={{ animationPlayState: "paused" }}
      >
        {allTestimonials.map((testimonial, i) => (
          <div key={`${i}-${testimonial.name}`} className="shrink-0">
            <TestimonialCard {...testimonial} />
          </div>
        ))}
      </motion.div>
      
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#06080d] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#06080d] to-transparent" />
    </div>
  );
}

export function StaticTestimonials({ testimonials }: { testimonials: TestimonialCardProps[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial, i) => (
        <motion.div
          key={`static-${i}`}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        >
          <TestimonialCard {...testimonial} />
        </motion.div>
      ))}
    </div>
  );
}
