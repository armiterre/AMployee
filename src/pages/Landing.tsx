import { motion, AnimatePresence, useInView } from "framer-motion";
import { useMemo, useState, useRef } from "react";
import { useSearchString } from "../hooks/useSearchString";
import { LandingNav, type LandingPage } from "../components/landing/LandingNav";
import { AnimatedHeading } from "../components/react-bits/AnimatedHeading";
import { AuroraBackdrop } from "../components/react-bits/AuroraBackdrop";
import { BlurWords } from "../components/react-bits/BlurWords";
import { GlareCard } from "../components/react-bits/GlareCard";
import { GradientText } from "../components/react-bits/GradientText";
import { ShinyText } from "../components/react-bits/ShinyText";
import { SlideUpLines } from "../components/react-bits/SlideUpLines";
import { AnimatedBackground } from "../components/react-bits/AnimatedBackground";
import { MarqueeTestimonials } from "../components/react-bits/TestimonialSection";
import { FloatingMenu } from "../components/react-bits/FloatingMenu";
import { RotatingText } from "../components/react-bits/RotatingText";
import { LogoLoop } from "../components/react-bits/LogoLoop";
import { DEMO_CODE } from "../lib/demoSeed";
import { parseInviteFromSearch } from "../lib/inviteParam";
import { SET_POWERS } from "../lib/setPowers";
import { useBiz } from "../state/bizStore";

type Flow = "create" | "join" | "demo" | null;

const MAX_AVATAR_CHARS = 600_000;

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ScrollStagger({ children, className = "", staggerDelay = 0.1 }: { children: React.ReactNode; className?: string; staggerDelay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: staggerDelay } }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const staggerItem = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

function SplitText({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const words = text.split(" ");
  
  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 20, rotateX: -90 }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: "inline-block", transformOrigin: "center bottom" }}
          className="mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function Landing() {
  const search = useSearchString();
  const { state, createOrg, joinOrg, enterDemoPower, acceptPersonalInvite } = useBiz();
  const [page, setPage] = useState<LandingPage>("home");
  const [flow, setFlow] = useState<Flow>(null);
  const [orgName, setOrgName] = useState("");
  const [founderName, setFounderName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteAvatar, setInviteAvatar] = useState<string | undefined>();
  const [inviteBusy, setInviteBusy] = useState(false);
  const [demoMemberId, setDemoMemberId] = useState(SET_POWERS[0]?.memberId ?? "m1");
  const [demoPass, setDemoPass] = useState("");
  const [demoErr, setDemoErr] = useState("");

  const inviteToken = useMemo(() => parseInviteFromSearch(search), [search]);

  const inviteMatch = useMemo(() => {
    if (!inviteToken) return null;
    return state.personalInvites.find((i) => i.token === inviteToken) ?? null;
  }, [inviteToken, state.personalInvites]);

  const inviteOrg = inviteMatch
    ? state.orgs.find((o) => o.id === inviteMatch.orgId) ?? null
    : null;

  const handleNavigate = (p: LandingPage) => {
    if (p !== "begin-flows") setFlow(null);
    setPage(p);
  };

  const goHome = () => handleNavigate("home");
  const goStartMenu = () => handleNavigate("begin-menu");

  const goFlows = (f: NonNullable<Flow>) => {
    setFlow(f);
    setPage("begin-flows");
  };

  const onCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !founderName.trim()) return;
    createOrg(orgName.trim(), founderName.trim());
  };

  const onJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinErr("");
    if (!joinCode.trim() || !joinName.trim()) return;
    const ok = joinOrg(joinCode, joinName.trim());
    if (!ok) setJoinErr("No workplace matches that invite code.");
  };

  const onDemo = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoErr("");
    const ok = enterDemoPower(demoMemberId, demoPass);
    if (!ok) setDemoErr("Wrong password for that power, or pick another role.");
  };

  const clearInviteUrl = () => {
    window.history.replaceState({}, "", window.location.pathname || "/");
    setInviteAvatar(undefined);
  };

  const onPickInviteAvatar = (fileList: FileList | null) => {
    setInviteMsg("");
    const f = fileList?.[0];
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => {
      const data = String(r.result || "");
      if (data.length > MAX_AVATAR_CHARS) {
        setInviteMsg("Photo is too large — try a smaller image.");
        setInviteAvatar(undefined);
        return;
      }
      setInviteAvatar(data);
    };
    r.readAsDataURL(f);
  };

  const showHeroBackdrop = page === "home";

  const testimonials = [
    { name: "Sarah M.", role: "Restaurant Manager", text: "Finally, a clock-in system that my team actually uses without complaining.", rating: 5 },
    { name: "Mike R.", role: "Retail Owner", text: "The exports save me hours every week. Exactly what I needed.", rating: 5 },
    { name: "Lisa K.", role: "Field Team Lead", text: "Simple, clean, works. That's all I wanted.", rating: 5 },
    { name: "James T.", role: "Warehouse Supervisor", text: "My crew loves how easy it is. No more forgotten clock-outs.", rating: 4 },
    { name: "Anna P.", role: "Cafe Owner", text: "Best workforce tool I've tried. Period.", rating: 5 },
    { name: "David L.", role: "Construction Foreman", text: "Finally something that works for my entire team.", rating: 5 },
    { name: "Chris B.", role: "Gym Manager", text: "Scheduling has never been easier. My staff actually checks the app.", rating: 5 },
    { name: "Maria S.", role: "Hotel Supervisor", text: "The break tracking is a game changer for payroll.", rating: 4.5 },
    { name: "Tom H.", role: "Landscaping Co.", text: "Simple enough for my whole crew to use without training.", rating: 5 },
    { name: "Rachel G.", role: "Beauty Salon Owner", text: "I can finally track everyone's hours accurately.", rating: 5 },
    { name: "Kevin M.", role: "Auto Shop Manager", text: "Best decision I made for my small business.", rating: 5 },
    { name: "Emma W.", role: "Cleaning Services", text: "My team checks in and out without any hassle.", rating: 4 },
  ];

  return (
    <div className="relative min-h-screen">
      {showHeroBackdrop ? <AnimatedBackground /> : <AuroraBackdrop />}
      <FloatingMenu currentPage={page} onNavigate={handleNavigate} onHome={goHome} />
      <LandingNav page={page} onHome={goHome} />

      <div className="relative z-[1] mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pt-24 md:px-6">
        <AnimatePresence mode="wait">
          {inviteToken && (
            <motion.div
              key="invite"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="mb-10 rounded-2xl border border-accent/35 bg-[#141922]/90 p-8 backdrop-blur-md"
            >
              {!inviteMatch ? (
                <>
                  <h2 className="text-xl font-bold text-ink">We couldn&apos;t open this invite</h2>
                  <p className="mt-3 text-sm text-muted leading-relaxed">Personal links only exist in the browser where your workplace was created. On a new device, ask your manager for the <strong className="text-ink">workplace code</strong> and use <strong className="text-ink">Start → Join with code</strong>.</p>
                  <button type="button" onClick={clearInviteUrl} className="mt-5 rounded-xl border border-line px-5 py-2.5 text-sm text-ink">Back to home</button>
                </>
              ) : inviteMatch.used ? (
                <>
                  <h2 className="text-xl font-bold text-ink">This invite was already used</h2>
                  <p className="mt-3 text-sm text-muted">Ask your owner for a new invite if you need access again.</p>
                  <button type="button" onClick={clearInviteUrl} className="mt-5 rounded-xl border border-line px-5 py-2.5 text-sm text-ink">Back to home</button>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-ink">You&apos;re invited to {inviteOrg?.name ?? "a workplace"}</h2>
                  <BlurWords text="Your name is set by your owner. Add a profile photo (optional), then enter your workspace." className="mt-4 text-sm text-muted" />
                  <p className="mt-4 rounded-xl border border-line bg-[#0c0f14] px-5 py-3.5 text-center font-mono text-lg text-accent">{inviteMatch.assignedName}</p>
                  <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-2 border-line bg-[#0c0f14]" style={{ backgroundImage: inviteAvatar ? `url(${inviteAvatar})` : undefined, backgroundSize: "cover", backgroundPosition: "center" }} />
                    <div className="w-full max-w-sm space-y-3">
                      <label className="block text-xs font-semibold uppercase tracking-wide text-muted">Profile photo (optional)</label>
                      <input type="file" accept="image/*" onChange={(e) => onPickInviteAvatar(e.target.files)} className="w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-accent-dim file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-accent" />
                      {inviteAvatar && <button type="button" onClick={() => setInviteAvatar(undefined)} className="text-xs text-muted underline">Remove photo</button>}
                    </div>
                  </div>
                  {inviteMsg && <p className="mt-4 text-sm text-red-400">{inviteMsg}</p>}
                  <button type="button" disabled={inviteBusy} onClick={() => { setInviteMsg(""); setInviteBusy(true); const r = acceptPersonalInvite(inviteToken, { avatarDataUrl: inviteAvatar }); setInviteBusy(false); if (!r.ok) setInviteMsg("Could not join — link may have just been used."); }} className="mt-8 w-full rounded-xl bg-accent py-4 text-sm font-semibold text-[#04120f] disabled:opacity-50 sm:w-auto sm:px-10">{inviteBusy ? "Joining…" : "Enter workspace"}</button>
                  <button type="button" onClick={clearInviteUrl} className="mt-4 block text-sm text-muted underline">Cancel</button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {page === "home" && (
          <div className="flex min-h-screen flex-col">
            <section className="flex min-h-[90vh] flex-col items-center justify-center text-center">
              <motion.div initial={{ opacity: 0, y: 40, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mb-6">
                <GradientText className="text-6xl font-black tracking-tighter sm:text-8xl md:text-9xl">AMployee</GradientText>
              </motion.div>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }} className="font-mono text-xs uppercase tracking-[0.4em] text-accent/90">Workforce, simplified</motion.p>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="mt-10 max-w-xl">
                <ShinyText className="text-lg sm:text-xl md:text-2xl">Time, team, payroll — one calm workspace.</ShinyText>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-5 max-w-2xl">
                <SplitText text="Built for crews who clock in fast and leaders who need the numbers." className="text-base leading-relaxed text-muted md:text-lg" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }} className="mt-16 flex flex-col gap-5 sm:flex-row sm:gap-8">
                <motion.button type="button" whileHover={{ scale: 1.06, y: -5, boxShadow: "0 25px 50px rgba(61, 214, 195, 0.35)" }} whileTap={{ scale: 0.98 }} onClick={goStartMenu} className="rounded-2xl bg-accent px-14 py-5 text-lg font-bold text-[#04120f] shadow-xl shadow-accent/20 transition-shadow">
                  Begin
                </motion.button>
                <motion.button type="button" whileHover={{ scale: 1.06, y: -5, borderColor: "rgba(61, 214, 195, 0.6)" }} whileTap={{ scale: 0.98 }} onClick={() => handleNavigate("about")} className="group relative overflow-hidden rounded-2xl border-2 border-white/20 bg-white/5 px-14 py-5 text-lg font-semibold text-white backdrop-blur-sm transition-colors hover:border-accent/50">
                  <span className="relative z-10">Know more</span>
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-transparent opacity-0 group-hover:opacity-100" transition={{ duration: 0.3 }} />
                </motion.button>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }} className="mt-32">
                <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 2, repeat: Infinity }} className="flex flex-col items-center gap-3 text-white/50">
                  <span className="text-xs uppercase tracking-[0.3em]">Scroll to explore</span>
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </motion.div>
              </motion.div>
            </section>

            <div className="space-y-40 py-20">
              <ScrollReveal className="space-y-20">
                <div className="text-center space-y-8">
                  <AnimatedHeading text="Everything you need" className="text-5xl font-bold text-ink sm:text-6xl md:text-7xl" />
                  <SplitText text="Three tools that work together, built for how teams actually operate." className="text-base text-muted max-w-xl mx-auto md:text-lg" />
                </div>

                <ScrollStagger className="grid gap-10 md:grid-cols-3" staggerDelay={0.15}>
                  {[
                    { icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, title: "Time Tracking", desc: "Clock in and out with breaks that stay separate. Big, obvious controls for the floor." },
                    { icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, title: "Team Management", desc: "Invite codes and personal links. Shared schedules so everyone's on the same page." },
                    { icon: <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, title: "Smart Exports", desc: "Dashboard exports by week when you choose. No surprise downloads on employees." },
                  ].map((feature, i) => (
                    <motion.div key={i} variants={staggerItem} whileHover={{ y: -15, scale: 1.03, transition: { type: "spring", stiffness: 200, damping: 15 } }}>
                      <GlareCard className="h-full p-10 text-center">
                        <div className="flex flex-col items-center gap-6">
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10 text-accent">{feature.icon}</div>
                          <h3 className="text-2xl font-bold text-ink">{feature.title}</h3>
                          <p className="text-base text-muted leading-relaxed">{feature.desc}</p>
                        </div>
                      </GlareCard>
                    </motion.div>
                  ))}
                </ScrollStagger>
              </ScrollReveal>

              <ScrollReveal className="space-y-20">
                <div className="text-center space-y-8">
                  <AnimatedHeading text="Built for real teams" className="text-5xl font-bold text-ink sm:text-6xl md:text-7xl" />
                  <SplitText text="From retail to hospitality, field teams to growing businesses." className="text-base text-muted max-w-xl mx-auto md:text-lg" />
                </div>

                <ScrollStagger className="grid gap-10 md:grid-cols-2 max-w-4xl mx-auto" staggerDelay={0.2}>
                  {[
                    { title: "For Crew", points: ["One-tap clock in", "Break tracking", "See your schedule"] },
                    { title: "For Leaders", points: ["Team overview", "Export reports", "Invite & manage"] },
                  ].map((card, i) => (
                    <motion.div key={i} variants={staggerItem} whileHover={{ scale: 1.04, transition: { type: "spring", stiffness: 200 } }}>
                      <GlareCard className="h-full p-10">
                        <h3 className="text-3xl font-bold text-accent mb-8">{card.title}</h3>
                        <ul className="space-y-5">
                          {card.points.map((point, j) => (
                            <li key={j} className="flex items-center gap-4 text-lg text-muted">
                              <span className="h-3 w-3 rounded-full bg-accent" />{point}
                            </li>
                          ))}
                        </ul>
                      </GlareCard>
                    </motion.div>
                  ))}
                </ScrollStagger>
              </ScrollReveal>

              <section className="space-y-20">
                <ScrollReveal className="text-center space-y-8">
                  <AnimatedHeading text="What teams say" className="text-5xl font-bold text-ink sm:text-6xl md:text-7xl" />
                </ScrollReveal>

                <MarqueeTestimonials testimonials={testimonials.slice(0, 4)} direction="left" />
                <MarqueeTestimonials testimonials={testimonials.slice(2, 6)} direction="right" />

                <ScrollReveal className="flex flex-col sm:flex-row justify-center items-center gap-10 pt-12">
                  <div className="flex items-center gap-5">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <motion.svg key={i} className="h-8 w-8 -ml-1.5 first:ml-0 text-accent" fill="currentColor" viewBox="0 0 20 20" initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: false }} transition={{ delay: i * 0.08, type: "spring", stiffness: 150 }}>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                    </div>
                    <span className="text-4xl font-bold text-ink">5.0</span>
                  </div>
                  <div className="h-12 w-px bg-line hidden sm:block" />
                  <ScrollReveal delay={0.3} className="flex items-center gap-4">
                    <svg className="h-10 w-10 text-[#00b67a]" viewBox="0 0 24 24" fill="currentColor"><path d="M12.971 2.446c2.155-.815 4.693-.164 6.368 1.818 1.675 1.982 1.675 4.902 0 6.884-1.675 1.982-4.213 2.633-6.368 1.818L12 14.998l-1.971-.968c-2.155.815-4.693.164-6.368-1.818-1.675-1.982-1.675-4.902 0-6.884 1.675-1.982 4.213-2.633 6.368-1.818L12 14.998l.971-.022z"/></svg>
                    <span className="text-lg font-medium text-muted">Trusted by teams worldwide</span>
                  </ScrollReveal>
                </ScrollReveal>
              </section>

              <ScrollReveal className="text-center space-y-12">
                <AnimatedHeading text="Trusted by industry leaders" className="text-3xl font-bold text-ink sm:text-4xl md:text-5xl" />
                <LogoLoop />
              </ScrollReveal>

              <ScrollReveal className="text-center space-y-4">
                <div className="flex items-baseline justify-center gap-1">
                  <AnimatedHeading text="Ready to " className="text-5xl font-bold text-ink sm:text-6xl md:text-7xl" />
                  <RotatingText />
                </div>
                <BlurWords text="Start free today. No credit card needed." className="text-base text-muted md:text-lg" />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06, y: -3, boxShadow: "0 20px 40px rgba(61, 214, 195, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goStartMenu}
                  className="mt-8 rounded-2xl bg-accent px-14 py-4 text-lg font-bold text-[#04120f] shadow-lg shadow-accent/20"
                >
                  Get Started
                </motion.button>
              </ScrollReveal>
            </div>
          </div>
        )}

        {page === "begin-menu" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col justify-center py-20">
            <div className="max-w-3xl mx-auto w-full space-y-16">
              <ScrollReveal className="text-center space-y-10">
                <AnimatedHeading text="How do you want to start?" className="text-5xl font-bold text-ink sm:text-6xl" />
                <SplitText text="Pick a path — you can always go back and choose another." className="text-base text-muted max-w-xl mx-auto md:text-lg" />
              </ScrollReveal>

              <ScrollStagger className="grid gap-8 md:grid-cols-2" staggerDelay={0.15}>
                {[
                  { title: "Register your workplace", body: "Create a new organisation. You'll be the owner and get codes to invite your team.", action: () => goFlows("create"), cta: "Create workplace", accent: true },
                  { title: "Join a team", body: "Have an invite code from your manager? Enter the code and your name.", action: () => goFlows("join"), cta: "Join with code", accent: false },
                ].map((card) => (
                  <motion.div key={card.title} variants={staggerItem} whileHover={{ y: -12, scale: 1.02, transition: { type: "spring", stiffness: 200, damping: 15 } }}>
                    <GlareCard className="flex h-full flex-col p-10">
                      <h2 className="text-2xl font-bold text-ink">{card.title}</h2>
                      <p className="mt-4 flex-1 text-base leading-relaxed text-muted">{card.body}</p>
                      <motion.button type="button" onClick={card.action} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className={`mt-10 w-full rounded-xl py-5 text-base font-semibold transition-all ${card.accent ? "bg-accent text-[#04120f] hover:bg-accent/90" : "border-2 border-line text-ink hover:bg-surface-hover"}`}>{card.cta}</motion.button>
                    </GlareCard>
                  </motion.div>
                ))}
              </ScrollStagger>
            </div>
          </motion.div>
        )}

        {page === "begin-flows" && flow && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen flex flex-col justify-center py-20">
            <div className="max-w-lg mx-auto w-full space-y-8">
              <motion.button type="button" onClick={goStartMenu} whileHover={{ x: -4 }} className="text-sm text-accent hover:underline">← Choose another way to start</motion.button>

              {flow === "create" && (
                <GlareCard className="p-10">
                  <AnimatedHeading text="Create your workplace" as="h2" className="text-3xl font-bold text-ink" />
                  <BlurWords text="Name your organisation and yourself — you'll enter as owner." className="mt-5 text-sm text-muted" />
                  <form onSubmit={onCreate} className="mt-8 space-y-5">
                    <input required placeholder="Company or team name" value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full rounded-xl border border-line bg-[#0c0f14] px-5 py-4 text-base text-ink transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
                    <input required placeholder="Your name" value={founderName} onChange={(e) => setFounderName(e.target.value)} className="w-full rounded-xl border border-line bg-[#0c0f14] px-5 py-4 text-base text-ink transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
                    <motion.button type="submit" whileHover={{ scale: 1.03, boxShadow: "0 15px 40px rgba(61, 214, 195, 0.25)" }} whileTap={{ scale: 0.98 }} className="w-full rounded-xl bg-accent py-5 text-base font-semibold text-[#04120f]">Create &amp; enter</motion.button>
                  </form>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 p-6 rounded-2xl border border-accent/25 bg-accent/5 text-center">
                    <p className="text-sm text-muted mb-4">Want to test first?</p>
                    <motion.button type="button" onClick={() => goFlows("demo")} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="w-full rounded-xl border-2 border-accent/40 bg-accent/10 py-3.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">Try AMployee (demo)</motion.button>
                  </motion.div>
                </GlareCard>
              )}

              {flow === "join" && (
                <GlareCard className="p-10">
                  <AnimatedHeading text="Join your team" as="h2" className="text-3xl font-bold text-ink" />
                  <BlurWords text="Use the short code from your workplace sidebar or your invite email." className="mt-5 text-sm text-muted" />
                  <form onSubmit={onJoin} className="mt-8 space-y-5">
                    <input required placeholder="Invite code" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} className="w-full rounded-xl border border-line bg-[#0c0f14] px-5 py-4 font-mono text-base uppercase text-ink tracking-wider transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
                    <input required placeholder="Your name" value={joinName} onChange={(e) => setJoinName(e.target.value)} className="w-full rounded-xl border border-line bg-[#0c0f14] px-5 py-4 text-base text-ink transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
                    {joinErr && <p className="text-sm text-red-400">{joinErr}</p>}
                    <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full rounded-xl border-2 border-accent/40 bg-accent/10 py-5 text-base font-semibold text-accent">Join workplace</motion.button>
                  </form>
                  <p className="mt-5 text-xs text-muted">Demo: <code className="text-accent">{DEMO_CODE}</code> after loading demo once.</p>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 p-6 rounded-2xl border border-accent/25 bg-accent/5 text-center">
                    <p className="text-sm text-muted mb-4">Want to test first?</p>
                    <motion.button type="button" onClick={() => goFlows("demo")} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }} className="w-full rounded-xl border-2 border-accent/40 bg-accent/10 py-3.5 text-sm font-medium text-accent hover:bg-accent/20 transition-colors">Try AMployee (demo)</motion.button>
                  </motion.div>
                </GlareCard>
              )}

              {flow === "demo" && (
                <GlareCard className="p-10">
                  <AnimatedHeading text="Try sandbox" as="h2" className="text-3xl font-bold text-ink" />
                  <BlurWords text="Choose a role and password from the About page table, then sign in." className="mt-5 text-sm text-muted" />
                  <form onSubmit={onDemo} className="mt-8 space-y-5">
                    <select value={demoMemberId} onChange={(e) => setDemoMemberId(e.target.value)} className="w-full rounded-xl border border-line bg-[#0c0f14] px-5 py-4 text-base text-ink">
                      {SET_POWERS.map((p) => (<option key={p.id} value={p.memberId}>{p.label}</option>))}
                    </select>
                    <input type="password" autoComplete="off" placeholder="Password for this role" value={demoPass} onChange={(e) => setDemoPass(e.target.value)} className="w-full rounded-xl border border-line bg-[#0c0f14] px-5 py-4 text-base text-ink transition-all focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20" />
                    {demoErr && <p className="text-sm text-red-400">{demoErr}</p>}
                    <motion.button type="submit" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="w-full rounded-xl border-2 border-line py-5 text-base font-semibold text-ink hover:bg-surface-hover">Enter demo</motion.button>
                  </form>
                </GlareCard>
              )}
            </div>
          </motion.div>
        )}

        {page === "about" && (
          <div className="space-y-32 pb-16 pt-8">
            <ScrollReveal className="space-y-10">
              <AnimatedHeading text="Work that fits how teams actually run" className="text-5xl font-bold leading-tight text-ink sm:text-6xl md:text-7xl" />
              <div className="max-w-3xl"><ShinyText className="text-2xl text-ink/90 sm:text-3xl">AMployee is workforce software for small and growing teams.</ShinyText></div>
              <SplitText text="We focus on the moment someone walks in — clock in, breaks, end of shift — and the moment leadership needs proof — hours, breaks, exports." className="text-lg leading-relaxed text-muted" />
            </ScrollReveal>

            <ScrollStagger className="grid gap-8 sm:grid-cols-3" staggerDelay={0.15}>
              {[
                { title: "Time", lines: ["Clock in and out with breaks that stay separate from paid time.", "Crew lands on a big, obvious clock — less friction on the floor."] },
                { title: "Team", lines: ["Invite codes and personal links with names set by the owner.", "Shared schedules so everyone sees the same shifts."] },
                { title: "Leaders", lines: ["Dashboard exports by week — current and past — when you choose.", "No surprise downloads on employees when they clock out."] },
              ].map((card, i) => (
                <motion.div key={i} variants={staggerItem} whileHover={{ y: -10, scale: 1.02, transition: { type: "spring", stiffness: 200, damping: 15 } }}>
                  <GlareCard className="p-8 h-full">
                    <AnimatedHeading text={card.title} as="h2" className="text-2xl font-bold text-accent" />
                    <SlideUpLines lines={card.lines} className="mt-5" lineClassName="text-sm text-muted" />
                  </GlareCard>
                </motion.div>
              ))}
            </ScrollStagger>

            <ScrollReveal className="space-y-8">
              <AnimatedHeading text="Our company" as="h2" className="text-4xl font-bold text-ink sm:text-5xl" />
              <SlideUpLines lines={["AMployee is built as a focused toolkit — not a pile of modules you'll never open.", "We're obsessed with clarity: who's working, for how long, and what counts toward pay.", "Today the product runs entirely in your browser for demos and pilots; a hosted version can plug into your payroll and identity systems when you're ready."]} lineClassName="text-lg text-muted" />
            </ScrollReveal>

            <ScrollReveal className="space-y-6">
              <AnimatedHeading text="Who it's for" as="h2" className="text-4xl font-bold text-ink sm:text-5xl" />
              <SplitText text="Retail, hospitality, field teams, and any workplace where hourly honesty and manager trust both matter." className="text-lg text-muted max-w-2xl" />
            </ScrollReveal>

            <ScrollReveal className="space-y-8">
              <AnimatedHeading text="Demo — role passwords" as="h2" className="text-4xl font-bold text-ink sm:text-5xl" />
              <SplitText text="Use Start → Open sandbox, or the form below. Passwords are for local testing only." className="text-sm text-muted" />
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} className="overflow-x-auto rounded-2xl border border-line bg-surface/90">
                <table className="w-full min-w-[600px] text-base">
                  <thead><tr className="border-b border-line text-sm uppercase text-muted"><th className="px-8 py-5">Power</th><th className="px-8 py-5">Role</th><th className="px-8 py-5">Password</th></tr></thead>
                  <tbody>
                    {SET_POWERS.map((p) => (
                      <tr key={p.id} className="border-b border-line/70 hover:bg-accent/5 transition-colors">
                        <td className="px-8 py-5"><div className="font-semibold text-ink">{p.label}</div><div className="text-sm text-muted">{p.tagline}</div></td>
                        <td className="px-8 py-5 text-muted">{p.roleLabel}</td>
                        <td className="px-8 py-5 font-mono text-accent">{p.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            </ScrollReveal>
          </div>
        )}

        {page === "contact" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen flex flex-col justify-center py-20">
            <div className="max-w-xl mx-auto w-full space-y-12">
              <div className="text-center space-y-8">
                <AnimatedHeading text="Contact" className="text-5xl font-bold text-ink sm:text-6xl" />
                <SplitText text="Questions about AMployee, a pilot, or partnerships — we read every message." className="text-base text-muted" />
              </div>

              <ScrollReveal>
                <GlareCard className="space-y-8 p-10">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Email</p>
                    <motion.a href="mailto:olivierlafrance10@gmail.com" whileHover={{ scale: 1.02, x: 4 }} transition={{ type: "spring", stiffness: 400 }} className="mt-3 block break-all font-mono text-xl text-accent">{`olivierlafrance10@gmail.com`}</motion.a>
                  </div>
                  <SlideUpLines lines={["We aim to reply within one to two business days.", "AMployee · remote-friendly product team."]} lineClassName="text-base text-muted" />
                </GlareCard>
              </ScrollReveal>

              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center text-sm text-muted">
                Prefer to start in the app? Use <motion.button type="button" onClick={goStartMenu} whileHover={{ scale: 1.05 }} className="text-accent hover:underline">Start</motion.button> in the menu.
              </motion.p>
            </div>
          </motion.div>
        )}

        {page !== "home" && page !== "begin-flows" && page !== "begin-menu" && (
          <motion.button type="button" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ x: -4 }} onClick={goHome} className="mt-20 flex items-center gap-2 text-sm text-accent">← Back to home</motion.button>
        )}
      </div>
    </div>
  );
}
