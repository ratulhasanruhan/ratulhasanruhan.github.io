"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Award,
  Camera,
  CodeXml,
  FolderKanban,
  Globe2,
  PenLine,
  Sparkles,
  Trophy,
  UsersRound,
  CalendarRange,
} from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { branches, linkedinPosts, profile } from "@/data/catalog";
import type { BranchId } from "@/data/types";

const MangoTree3D = dynamic(() => import("@/components/MangoTree3D"), {
  ssr: false,
  loading: () => (
    <div className="mango3d-poster" aria-hidden="true">
      <span className="mango3d-poster-glow" />
      <span className="mango3d-poster-copy">Growing the tree…</span>
    </div>
  ),
});

const credentials: { label: string; detail: string; href: string; Icon: typeof Trophy }[] = [
  {
    label: "Bangladesh ICT & Innovation Award",
    detail: "Winner · 2025",
    href: "/awards/bangladesh-ict-innovation-award-2025/",
    Icon: Trophy,
  },
  {
    label: "Startup World Cup",
    detail: "Regional finalist · 2025",
    href: "/awards/startup-world-cup-2025-regional-finalist/",
    Icon: Globe2,
  },
  {
    label: "National AI Build-a-thon",
    detail: "Trailblazer",
    href: "/awards/national-ai-build-a-thon-trailblazer/",
    Icon: Sparkles,
  },
  {
    label: "Creator of Ojogor",
    detail: "First Bengali programming language",
    href: "/projects/ojogor/",
    Icon: CodeXml,
  },
];

type StatTarget = { branch: BranchId } | { section: string };

type Stat = {
  id: string;
  value: number;
  suffix: string;
  label: string;
  hint: string;
  Icon: typeof Trophy;
  accent: string;
  target: StatTarget;
};

type HomeHeroProps = {
  branchCounts: Record<BranchId, number>;
  yearsBuilding: number;
  night: boolean;
  season: string;
  bangla: boolean;
  onSelectBranch: (branch: BranchId) => void;
  onToggleListView: () => void;
  onAbout: () => void;
  onJump: (sectionId: string) => void;
};

function CountUp({ value, run }: { value: number; run: boolean }) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (reduce) {
      const frame = window.requestAnimationFrame(() => setDisplay(value));
      return () => window.cancelAnimationFrame(frame);
    }
    let frame = 0;
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 4))));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [reduce, run, value]);
  return <>{display}</>;
}

const headlineWords = ["I", "build", "software", "that"];

export default function HomeHero({
  branchCounts,
  yearsBuilding,
  night,
  season,
  bangla,
  onSelectBranch,
  onToggleListView,
  onAbout,
  onJump,
}: HomeHeroProps) {
  const reduce = useReducedMotion() ?? false;
  const heroRef = useRef<HTMLElement>(null);
  const [hoveredBranch, setHoveredBranch] = useState<BranchId | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  useEffect(() => {
    const element = statsRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const treeBranches = branches.map((branch) => ({
    id: branch.id,
    label: bangla ? branch.bangla : branch.label,
    count: branchCounts[branch.id] ?? 0,
  }));

  const stats: Stat[] = [
    {
      id: "projects",
      value: branchCounts.projects,
      suffix: "+",
      label: "Projects shipped",
      hint: "Open the projects",
      Icon: FolderKanban,
      accent: "var(--green-bright)",
      target: { branch: "projects" },
    },
    {
      id: "awards",
      value: branchCounts.awards,
      suffix: "",
      label: "Awards & honours",
      hint: "See the awards",
      Icon: Award,
      accent: "var(--mango)",
      target: { branch: "awards" },
    },
    {
      id: "writing",
      value: branchCounts.writing,
      suffix: "",
      label: "Articles written",
      hint: "Read the notes",
      Icon: PenLine,
      accent: "var(--coral)",
      target: { section: "writing" },
    },
    {
      id: "communities",
      value: branchCounts.communities,
      suffix: "",
      label: "Communities",
      hint: "Meet the people",
      Icon: UsersRound,
      accent: "var(--sky)",
      target: { branch: "communities" },
    },
    {
      id: "moments",
      value: linkedinPosts.length,
      suffix: "+",
      label: "Stages & events",
      hint: "View the moments",
      Icon: Camera,
      accent: "var(--rose)",
      target: { section: "moments" },
    },
    {
      id: "years",
      value: yearsBuilding,
      suffix: "",
      label: "Years building",
      hint: "Walk the journey",
      Icon: CalendarRange,
      accent: "var(--mango-light)",
      target: { section: "journey" },
    },
  ];

  function openStat(target: StatTarget) {
    if ("branch" in target) onSelectBranch(target.branch);
    else onJump(target.section);
  }

  const reveal = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section
      ref={heroRef}
      className={`home-hero${night ? " home-hero-night" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className="home-hero-backdrop" aria-hidden="true">
        <span className="home-hero-orb home-hero-orb-a" />
        <span className="home-hero-orb home-hero-orb-b" />
        <span className="home-hero-orb home-hero-orb-c" />
        <span className="home-hero-grain" />
      </div>

      <div className="home-hero-copy">
        <motion.a className="home-hero-status" href={profile.booking} target="_blank" rel="noreferrer" {...reveal(0)}>
          <span className="home-hero-status-dot" aria-hidden="true" />
          <span>
            <strong>Open to new work</strong>
            <span className="home-hero-status-sep" aria-hidden="true">·</span>
            Dhaka, Bangladesh
          </span>
        </motion.a>

        <h1 id="hero-title" className="home-hero-title">
          {headlineWords.map((word, index) => (
            <motion.span
              key={word}
              className="home-hero-word"
              initial={reduce ? false : { opacity: 0, y: "0.6em", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.08 + index * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {word}
            </motion.span>
          ))}
          <motion.em
            className="home-hero-word home-hero-accent"
            initial={reduce ? false : { opacity: 0, y: "0.6em", filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.42, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            grows.
          </motion.em>
        </h1>

        <motion.p className="home-hero-deck" {...reveal(0.5)}>
          I&apos;m <button type="button" className="home-hero-name" onClick={onAbout}>Ratul Hasan Ruhan</button>, a
          software engineer and systems researcher building programming languages, accessibility tools and
          offline-first systems for Bangladesh.
        </motion.p>

        <motion.div className="home-hero-actions" {...reveal(0.62)}>
          <button type="button" className="home-cta home-cta-primary" onClick={() => onJump("featured")}>
            See my best work <ArrowRight size={17} strokeWidth={2.4} aria-hidden="true" />
          </button>
          <a className="home-cta home-cta-secondary" href={profile.booking} target="_blank" rel="noreferrer">
            Book a call <span aria-hidden="true">↗</span>
          </a>
          <a className="home-cta-link" href={profile.resume} download>
            Résumé (PDF)
          </a>
          <button className="home-cta-link home-list-view-toggle" type="button" onClick={onToggleListView}>
            Browse as a list
          </button>
        </motion.div>

        <motion.ul className="home-hero-creds" aria-label="Highlights" {...reveal(0.74)}>
          {credentials.map(({ label, detail, href, Icon }) => (
            <li key={href}>
              <Link href={href} className="home-hero-cred">
                <span className="home-hero-cred-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={2.2} />
                </span>
                <span className="home-hero-cred-copy">
                  <strong>{label}</strong>
                  <small>{detail}</small>
                </span>
              </Link>
            </li>
          ))}
        </motion.ul>
      </div>

      <motion.div
        className="home-hero-scene"
        style={{ y: sceneY, opacity: sceneOpacity }}
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className="home-hero-halo" aria-hidden="true" />
        <MangoTree3D
          branches={treeBranches}
          hoveredBranch={hoveredBranch}
          onHoverBranch={setHoveredBranch}
          onSelectBranch={onSelectBranch}
          night={night}
          season={season}
          reducedMotion={reduce}
        />
        <p className="home-hero-hint" aria-hidden="true">
          <span className="home-hero-hint-dot" /> Tap a mango to open a branch
          <span className="home-hero-hint-desktop"> · drag to turn the tree</span>
        </p>
      </motion.div>

      <nav ref={statsRef} className="home-stats" aria-label="Portfolio at a glance">
        {stats.map(({ id, value, suffix, label, hint, Icon, accent, target }, index) => {
          const branch = "branch" in target ? target.branch : null;
          return (
            <motion.button
              key={id}
              type="button"
              className={`home-stat${branch && hoveredBranch === branch ? " is-active" : ""}`}
              style={{ "--stat-accent": accent } as CSSProperties}
              onPointerEnter={() => branch && setHoveredBranch(branch)}
              onPointerLeave={() => setHoveredBranch(null)}
              onFocus={() => branch && setHoveredBranch(branch)}
              onBlur={() => setHoveredBranch(null)}
              onClick={() => openStat(target)}
              aria-label={`${value}${suffix} ${label}. ${hint}`}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + index * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="home-stat-top" aria-hidden="true">
                <span className="home-stat-icon">
                  <Icon size={18} strokeWidth={2.2} />
                </span>
                <ArrowRight className="home-stat-arrow" size={16} strokeWidth={2.4} />
              </span>
              <span className="home-stat-value" aria-hidden="true">
                <CountUp value={value} run={statsVisible} />
                {suffix && <span className="home-stat-suffix">{suffix}</span>}
              </span>
              <span className="home-stat-label" aria-hidden="true">{label}</span>
              <span className="home-stat-hint" aria-hidden="true">{hint}</span>
            </motion.button>
          );
        })}
      </nav>
    </section>
  );
}
