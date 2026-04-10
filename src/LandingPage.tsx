import { useState, useEffect, useRef, useCallback } from "react";
import qrCode from "./assets/qr-appstore.png";
import LandingProjection from "./components/LandingProjection";

// ---- Constants ----------------------------------------------------------------

const APP_STORE_URL = "https://apps.apple.com/app/patternbank/id6759760762";

const PATTERNS = [
  { name: "Two Pointers", count: 14, conf: 4.2 },
  { name: "Hash Table", count: 22, conf: 3.8 },
  { name: "Sliding Window", count: 9, conf: 4.5 },
  { name: "Binary Search", count: 11, conf: 3.1 },
  { name: "Sorting", count: 8, conf: 4.0 },
  { name: "Linked List", count: 7, conf: 2.8 },
  { name: "Stack", count: 12, conf: 4.1 },
  { name: "Queue", count: 4, conf: 2.3 },
  { name: "Tree", count: 18, conf: 3.5 },
  { name: "BFS", count: 6, conf: 2.9 },
  { name: "DFS", count: 10, conf: 3.7 },
  { name: "Heap", count: 5, conf: 3.2 },
  { name: "Greedy", count: 8, conf: 4.3 },
  { name: "Backtracking", count: 6, conf: 2.5 },
  { name: "Graph", count: 9, conf: 2.1 },
  { name: "Union Find", count: 3, conf: 1.8 },
  { name: "Trie", count: 4, conf: 3.0 },
  { name: "DP", count: 15, conf: 2.6 },
];

const STEPS = [
  { n: "01", title: "Log problems from a 3,800+ problem database", body: "Search by number or title. Difficulty and link auto-fill. Or add your own." },
  { n: "02", title: "Tag patterns, rate your confidence", body: "24 algorithmic patterns. 5-star confidence rating. Notes for your future self." },
  { n: "03", title: "Review what's fading", body: "PatternBank schedules reviews automatically. Low confidence surfaces first." },
];

const PAIN_POINTS = [
  { emoji: "\u{1F504}", title: "The forgetting loop", body: "You solved Two Sum three months ago. You see it in an interview. You blank. Sound familiar?" },
  { emoji: "\u{1F4CA}", title: "Quantity over retention", body: "Grinding more problems doesn't help if you can't recall the ones you've done." },
  { emoji: "\u{1F3AF}", title: "Patterns, not problems", body: "Interviews test pattern recognition. You need to know which patterns are weak." },
];

const FEATURES = [
  { icon: "\u25EB", title: "24 Pattern Categories", desc: "Two Pointers through System Design. See your confidence at a glance." },
  { icon: "\u2605", title: "Confidence Tracking", desc: "Rate 1-5 stars. The app schedules reviews based on how well you know it." },
  { icon: "\u27F3", title: "Spaced Repetition", desc: "SM-2 intervals. Low confidence = review tomorrow. High = review in 2 weeks." },
  { icon: "\u2601", title: "Cloud Sync", desc: "Sign in with Google, GitHub, or Apple. Your data follows you everywhere." },
  { icon: "\u26A1", title: "Works Offline", desc: "localStorage-first. No account needed. Your data stays on your device." },
  { icon: "\u25CE", title: "Open Source", desc: "Free forever. No ads, no paywalls, no tracking. Built by a fellow grinder." },
];

// ---- Helpers ------------------------------------------------------------------

function getHeatColor(c: number): string {
  if (c < 2.0) return "#f85149";
  if (c < 3.0) return "#d29922";
  if (c < 4.0) return "#e3b341";
  return "#3fb950";
}

function getHeatBg(c: number): string {
  if (c < 2.0) return "rgba(248,81,73,0.12)";
  if (c < 3.0) return "rgba(210,153,34,0.10)";
  if (c < 4.0) return "rgba(227,179,65,0.08)";
  return "rgba(63,185,80,0.10)";
}

// ---- Hooks --------------------------------------------------------------------

function useCountUp(target: number, duration = 1600, delay = 0, trigger = true): number {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    const t = setTimeout(() => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay, trigger]);
  return val;
}

function useInView(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ---- Sub-components -----------------------------------------------------------

function FadeIn({ children, delay = 0, className = "", style = {} }: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function AppleLogo({ size = 14, color = "#8b949e" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function IOSPopover({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-[999]"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      />
      <div className="fixed left-1/2 top-1/2 z-[1000] w-[90%] max-w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-pb-border bg-pb-surface p-8 text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3 cursor-pointer border-none bg-transparent p-1 text-lg leading-none text-pb-text-dim"
        >
          ✕
        </button>

        <div className="mb-5 text-sm font-semibold text-pb-text">
          Get PatternBank on iOS
        </div>

        <div className="mx-auto mb-4 flex h-[180px] w-[180px] items-center justify-center rounded-xl bg-white p-3">
          <img src={qrCode} alt="App Store QR Code" className="h-full w-full object-contain" />
        </div>

        <div className="mb-5 text-xs text-pb-text-muted">
          Scan with your phone's camera
        </div>

        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-pb-accent no-underline"
        >
          Open in App Store →
        </a>
      </div>
    </>
  );
}

function HeatmapCard() {
  const [ref, inView] = useInView();
  const totalProblems = useCountUp(156, 1400, 300, inView);
  const avgConf = useCountUp(33, 1400, 500, inView);

  return (
    <div
      ref={ref}
      className="relative w-full max-w-[380px] overflow-hidden rounded-xl border border-pb-border bg-pb-surface p-6"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s, transform 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s",
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute left-[10%] right-[10%] top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(124,107,245,0.25), transparent)" }}
      />

      <div className="mb-4 flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-pb-text-muted">
          Pattern Confidence
        </span>
        <span className="font-mono text-[11px] text-pb-text-dim">
          {totalProblems} problems
        </span>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-1.5">
        {PATTERNS.map((p, i) => {
          const d = 0.4 + i * 0.06;
          return (
            <div
              key={p.name}
              className="flex min-h-[56px] flex-col justify-between rounded-lg p-2.5"
              style={{
                background: inView ? getHeatBg(p.conf) : "rgba(48,54,61,0.2)",
                border: `1px solid ${inView ? getHeatColor(p.conf) + "30" : "#21262d"}`,
                opacity: inView ? 1 : 0,
                transform: inView ? "scale(1)" : "scale(0.92)",
                transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${d}s`,
              }}
            >
              <span
                className="text-[10px] font-semibold leading-tight"
                style={{ color: inView ? "#e6edf3" : "#21262d", transition: `color 0.4s ease ${d}s` }}
              >
                {p.name}
              </span>
              <div className="mt-1 flex items-end justify-between">
                <span
                  className="text-[9px]"
                  style={{ color: inView ? "#8b949e" : "#21262d", transition: `color 0.4s ease ${d}s` }}
                >
                  {inView ? `${p.count}` : "\u2014"}
                </span>
                <span
                  className="font-mono text-[15px] font-bold"
                  style={{
                    color: inView ? getHeatColor(p.conf) : "#21262d",
                    transition: `color 0.5s ease ${d}s`,
                    letterSpacing: -0.5,
                  }}
                >
                  {inView ? p.conf.toFixed(1) : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-pb-border-light pt-3.5">
        <div>
          <span className="text-[10px] uppercase tracking-wide text-pb-text-dim">Avg. Confidence</span>
          <div className="mt-0.5 font-mono text-[22px] font-bold text-pb-star">
            {(avgConf / 10).toFixed(1)}
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-full border border-pb-accent/20 bg-pb-accent-subtle px-3 py-1">
          <span className="block h-1.5 w-1.5 rounded-full bg-pb-accent" />
          <span className="text-[11px] font-medium text-pb-accent">Reviewing</span>
        </div>
      </div>
    </div>
  );
}

// ---- Main Component -----------------------------------------------------------

interface LandingPageProps {
  onOpenApp: () => void;
}

export default function LandingPage({ onOpenApp }: LandingPageProps) {
  const [heroVisible, setHeroVisible] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  useEffect(() => { setTimeout(() => setHeroVisible(true), 100); }, []);

  const handleOpenApp = useCallback(() => onOpenApp(), [onOpenApp]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-pb-bg text-pb-text">
      <IOSPopover open={qrOpen} onClose={() => setQrOpen(false)} />

      {/* ---- Background ---- */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute"
          style={{
            top: "-12%", right: "-6%", width: 550, height: 550, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,107,245,0.08) 0%, transparent 65%)",
            filter: "blur(50px)", animation: "landing-orb1 22s ease-in-out infinite",
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: "-15%", left: "-8%", width: 450, height: 450, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,107,245,0.06) 0%, transparent 65%)",
            filter: "blur(65px)", animation: "landing-orb2 28s ease-in-out infinite",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, #484f58 0.7px, transparent 0.7px)",
            backgroundSize: "28px 28px", opacity: 0.12,
            maskImage: "radial-gradient(ellipse 75% 65% at 50% 35%, black 15%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 35%, black 15%, transparent 100%)",
          }}
        />
      </div>

      {/* ---- Navbar ---- */}
      <nav
        className="sticky top-0 z-50 border-b border-pb-border-light"
        style={{ background: "rgba(22,27,34,0.93)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <img src="/favicon-32.png" alt="" className="h-[22px] w-[22px] rounded-[5px]" />
            <span className="text-[15px] font-bold tracking-tight">PatternBank</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#how" className="hidden text-[13px] text-pb-text-muted no-underline transition-opacity hover:opacity-80 md:inline-block" style={{ padding: "6px 12px" }}>
              How it works
            </a>
            <a href="#features" className="hidden text-[13px] text-pb-text-muted no-underline transition-opacity hover:opacity-80 md:inline-block" style={{ padding: "6px 12px" }}>
              Features
            </a>
            <button
              onClick={handleOpenApp}
              className="cursor-pointer rounded-lg border border-pb-accent/15 bg-pb-accent-subtle px-4 py-2 text-[13px] font-semibold text-pb-accent transition-opacity hover:opacity-85"
            >
              Open App →
            </button>
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <section className="relative z-10 mx-auto flex max-w-[1120px] flex-wrap items-center gap-12 px-6 py-20 md:py-24">
        <div
          className="min-w-0 flex-[1_1_420px]"
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(18px)",
            transition: "all 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {/* Pill badge */}
          <div
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-pb-accent/15 bg-pb-accent-subtle px-3.5 py-1.5"
            style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.5s ease 0.1s" }}
          >
            <span
              className="block h-1.5 w-1.5 rounded-full bg-pb-accent"
              style={{ animation: "landing-pulse 2.5s ease-in-out infinite" }}
            />
            <span className="font-mono text-[11px] tracking-wider text-pb-accent">
              SPACED REPETITION FOR LEETCODE
            </span>
          </div>

          {/* Headline */}
          <h1
            className="mb-5 font-bold leading-[1.1] tracking-tight"
            style={{
              fontSize: "clamp(38px, 5vw, 58px)",
              letterSpacing: "-1px",
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition: "all 0.65s cubic-bezier(0.16,1,0.3,1) 0.15s",
            }}
          >
            <span className="text-pb-text">Remember what</span>
            <br />
            <span className="text-pb-text-muted">you practiced.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="mb-8 max-w-[440px] text-[17px] leading-relaxed text-pb-text-muted"
            style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.6s ease 0.3s" }}
          >
            PatternBank reminds you to review the LeetCode problems you've already solved.
            Track patterns, build retention, and walk into interviews confident.
          </p>

          {/* CTAs */}
          <div
            className="mb-3.5 flex flex-wrap items-center gap-3"
            style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.5s ease 0.4s" }}
          >
            <button
              onClick={handleOpenApp}
              className="cursor-pointer rounded-[10px] border-none bg-pb-accent px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-[0.88]"
            >
              Open the app →
            </button>
            <a
              href="#how"
              className="rounded-[10px] border border-pb-border px-7 py-3.5 text-sm font-medium text-pb-text-muted no-underline transition-colors hover:border-pb-text-muted hover:text-pb-text"
            >
              See how it works
            </a>
            <button
              onClick={() => setQrOpen(true)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-[10px] border border-pb-border bg-transparent px-5 py-3.5 text-[13px] font-semibold text-pb-text-muted transition-colors hover:border-pb-text-muted"
            >
              <AppleLogo size={15} color="currentColor" />
              App Store
            </button>
          </div>

          {/* Subtext */}
          <div
            className="mb-12"
            style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.5s ease 0.48s" }}
          >
            <span className="text-[13px] text-pb-text-dim">No account required. Works in your browser.</span>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap border-t border-pb-border-light pt-7"
            style={{ opacity: heroVisible ? 1 : 0, transition: "opacity 0.5s ease 0.55s" }}
          >
            {[
              { value: "3,800+", label: "LeetCode problems" },
              { value: "24", label: "pattern categories" },
              { value: "Free", label: "forever" },
            ].map(({ value, label }, i) => (
              <div
                key={label}
                className="flex-[1_0_120px] pr-7"
                style={i > 0 ? { borderLeft: "1px solid #21262d", paddingLeft: 28 } : undefined}
              >
                <div className="mb-1 font-mono text-2xl font-bold text-pb-text">{value}</div>
                <div className="text-xs text-pb-text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap card */}
        <div className="flex flex-[0_1_380px] justify-center">
          <HeatmapCard />
        </div>
      </section>

      {/* ---- The Problem ---- */}
      <section className="relative z-10 mx-auto max-w-[1120px] px-6 pb-20 pt-10">
        <FadeIn style={{ marginBottom: 40 }}>
          <div className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-pb-accent opacity-70">THE PROBLEM</div>
          <h2 className="m-0 font-bold leading-[1.15]" style={{ fontSize: "clamp(24px, 2.8vw, 38px)", letterSpacing: "-0.5px" }}>
            <span className="text-pb-text">You've solved hundreds of problems.</span>
            <br />
            <span className="text-pb-text-muted">How many can you solve again?</span>
          </h2>
        </FadeIn>
        <div className="flex flex-wrap gap-4">
          {PAIN_POINTS.map((p, i) => (
            <FadeIn key={p.title} delay={i * 0.1} style={{ flex: "1 1 280px", minWidth: 0 }}>
              <div className="relative h-full overflow-hidden rounded-xl border border-pb-border bg-pb-surface p-7">
                <div
                  className="absolute left-[15%] right-[15%] top-0 h-px"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(124,107,245,0.15), transparent)" }}
                />
                <div className="mb-3.5 text-2xl">{p.emoji}</div>
                <h3 className="mb-2 text-base font-semibold text-pb-text">{p.title}</h3>
                <p className="m-0 text-sm leading-relaxed text-pb-text-muted">{p.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section id="how" className="relative z-10 mx-auto max-w-[1120px] px-6 pb-20 pt-10">
        <FadeIn style={{ marginBottom: 40 }}>
          <div className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-pb-accent opacity-70">HOW IT WORKS</div>
          <h2 className="m-0 font-bold leading-[1.15] text-pb-text" style={{ fontSize: "clamp(24px, 2.8vw, 38px)", letterSpacing: "-0.5px" }}>
            Three steps. Zero friction.
          </h2>
        </FadeIn>
        <div className="relative flex flex-wrap">
          {STEPS.map((step, i) => (
            <FadeIn
              key={step.n}
              delay={i * 0.12 + 0.1}
              style={{
                flex: "1 1 280px", minWidth: 0, paddingTop: 48, position: "relative",
                ...(i < STEPS.length - 1 ? { paddingRight: 32 } : {}), marginBottom: 24,
              }}
            >
              <div className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border border-pb-accent/20 bg-pb-surface font-mono text-[11px] font-semibold text-pb-accent">
                {step.n}
              </div>
              <h3 className="mb-2 text-base font-semibold leading-snug text-pb-text">{step.title}</h3>
              <p className="m-0 text-sm leading-relaxed text-pb-text-muted">{step.body}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---- Projection ---- */}
      <section id="projection" className="relative z-10 mx-auto max-w-[1120px] px-6 pb-20 pt-10">
        <FadeIn style={{ marginBottom: 40 }}>
          <div className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-pb-accent opacity-70">SEE THE MATH</div>
          <h2 className="m-0 font-bold leading-[1.15] text-pb-text" style={{ fontSize: "clamp(24px, 2.8vw, 38px)", letterSpacing: "-0.5px" }}>
            Spaced repetition compounds.
          </h2>
          <p className="mt-3 max-w-[520px] text-sm leading-relaxed text-pb-text-muted">
            Adjust the sliders and watch 30 days of consistent review transform your library.
          </p>
        </FadeIn>
        <FadeIn delay={0.15}>
          <LandingProjection />
        </FadeIn>
      </section>

      {/* ---- Features ---- */}
      <section id="features" className="relative z-10 mx-auto max-w-[1120px] px-6 pb-20 pt-10">
        <FadeIn style={{ marginBottom: 40 }}>
          <div className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-pb-accent opacity-70">FEATURES</div>
          <h2 className="m-0 font-bold leading-[1.15] text-pb-text" style={{ fontSize: "clamp(24px, 2.8vw, 38px)", letterSpacing: "-0.5px" }}>
            Everything you need. Nothing you don't.
          </h2>
        </FadeIn>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.06}>
              <div className="flex h-full items-start gap-4 rounded-xl border border-pb-border bg-pb-surface p-6">
                <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] border border-pb-accent/15 bg-pb-accent-subtle text-[17px] text-pb-accent">
                  {f.icon}
                </div>
                <div>
                  <h3 className="mb-1.5 text-sm font-semibold text-pb-text">{f.title}</h3>
                  <p className="m-0 text-[13px] leading-relaxed text-pb-text-muted">{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---- CTA Banner ---- */}
      <section className="relative z-10 mx-auto max-w-[1120px] px-6 pb-20">
        <FadeIn>
          <div
            className="flex flex-wrap items-center justify-between gap-6 rounded-xl border border-pb-accent/10 p-10 md:p-12"
            style={{ background: "linear-gradient(135deg, rgba(124,107,245,0.08), transparent)" }}
          >
            <div>
              <h2 className="mb-2 font-bold text-pb-text" style={{ fontSize: "clamp(22px, 2.4vw, 32px)" }}>
                Start reviewing.
              </h2>
              <p className="m-0 text-sm text-pb-text-muted">
                Free. No account required. Your data stays on your device.
              </p>
            </div>
            <button
              onClick={handleOpenApp}
              className="w-full shrink-0 cursor-pointer whitespace-nowrap rounded-[10px] border-none bg-pb-accent px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-[0.88] md:w-auto"
            >
              Open PatternBank →
            </button>
          </div>
        </FadeIn>
      </section>

      {/* ---- Footer ---- */}
      <footer className="relative z-10 mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 border-t border-pb-border-light px-6 pb-10 pt-6">
        <span className="text-sm font-semibold text-pb-text-muted">PatternBank</span>
        <span className="text-xs text-pb-text-dim">Built by Derek Zhang</span>
        <div className="flex gap-5">
          {([
            ["GitHub", "https://github.com/DerekZ-113"],
            ["LinkedIn", "https://linkedin.com/in/derekz113"],
            ["Privacy", "/privacy"],
          ] as const).map(([label, href]) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("/") ? undefined : "_blank"}
              rel={href.startsWith("/") ? undefined : "noopener noreferrer"}
              className="text-xs text-pb-text-dim no-underline transition-colors hover:text-pb-text-muted"
            >
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
