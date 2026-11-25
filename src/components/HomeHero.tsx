"use client";

import Image from "next/image";
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
});

const credentials: { label: string; href: string; Icon: typeof Trophy }[] = [
  {
    label: "ICT Award 2025",
    href: "/awards/bangladesh-ict-innovation-award-2025/",
    Icon: Trophy,
  },
  {
    label: "Startup World Cup finalist",
    href: "/awards/startup-world-cup-2025-regional-finalist/",
    Icon: Globe2,
  },
  {
    label: "AI Build-a-thon Trailblazer",
    href: "/awards/national-ai-build-a-thon-trailblazer/",
    Icon: Sparkles,
  },
  {
    label: "Creator of Ojogor",
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
    const start = performance.now();
    const duration = 1600;
    const timer = window.setInterval(() => {
      const now = performance.now();
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 4))));
      if (progress >= 1) window.clearInterval(timer);
    }, 100);
    return () => window.clearInterval(timer);
  }, [reduce, run, value]);
  return <>{display}</>;
}

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
  const [mountTree, setMountTree] = useState(false);
  const [treeReady, setTreeReady] = useState(false);
  const statsRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.2]);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    if (
      reduce ||
      connection?.saveData ||
      (deviceMemory !== undefined && deviceMemory < 4)
    ) {
      return;
    }

    let idleTimer = 0;
    let idleCallback = 0;
    const start = () => {
      window.clearTimeout(idleTimer);
      setMountTree(true);
    };
    const scheduleIdleMount = () => {
      idleTimer = window.setTimeout(() => {
        const idleWindow = window as Window & {
          requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
          cancelIdleCallback?: (handle: number) => void;
        };
        if (idleWindow.requestIdleCallback) {
          idleCallback = idleWindow.requestIdleCallback(start, { timeout: 3000 });
        } else {
          start();
        }
      }, 3000);
    };
    const inputEvents = ["pointermove", "touchstart", "scroll", "keydown"] as const;
    inputEvents.forEach((eventName) => window.addEventListener(eventName, start, { once: true, passive: true }));
    if (document.readyState === "complete") scheduleIdleMount();
    else window.addEventListener("load", scheduleIdleMount, { once: true });

    return () => {
      inputEvents.forEach((eventName) => window.removeEventListener(eventName, start));
      window.removeEventListener("load", scheduleIdleMount);
      window.clearTimeout(idleTimer);
      const idleWindow = window as Window & { cancelIdleCallback?: (handle: number) => void };
      if (idleCallback) idleWindow.cancelIdleCallback?.(idleCallback);
    };
  }, [reduce]);

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
      accent: "var(--accent)",
      target: { branch: "projects" },
    },
    {
      id: "awards",
      value: branchCounts.awards,
      suffix: "",
      label: "Awards & honours",
      hint: "See the awards",
      Icon: Award,
      accent: "var(--accent)",
      target: { branch: "awards" },
    },
    {
      id: "writing",
      value: branchCounts.writing,
      suffix: "",
      label: "Articles written",
      hint: "Read the notes",
      Icon: PenLine,
      accent: "var(--accent)",
      target: { section: "writing" },
    },
    {
      id: "communities",
      value: branchCounts.communities,
      suffix: "",
      label: "Communities",
      hint: "Meet the people",
      Icon: UsersRound,
      accent: "var(--accent)",
      target: { branch: "communities" },
    },
    {
      id: "moments",
      value: linkedinPosts.length,
      suffix: "+",
      label: "Stages & events",
      hint: "View the moments",
      Icon: Camera,
      accent: "var(--accent)",
      target: { section: "moments" },
    },
    {
      id: "years",
      value: yearsBuilding,
      suffix: "",
      label: "Years building",
      hint: "Walk the journey",
      Icon: CalendarRange,
      accent: "var(--accent)",
      target: { section: "journey" },
    },
  ];

  function openStat(target: StatTarget) {
    if ("branch" in target) onSelectBranch(target.branch);
    else onJump(target.section);
  }

  return (
    <section
      ref={heroRef}
      className={`home-hero${night ? " home-hero-night" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className="home-hero-copy">
        <a className="home-hero-status" href={profile.booking} target="_blank" rel="noreferrer">
          <span className="home-hero-status-dot" aria-hidden="true" />
          <span>
            <strong>Open to new work</strong>
            <span className="home-hero-status-sep" aria-hidden="true">·</span>
            Dhaka, Bangladesh
          </span>
        </a>

        <h1 id="hero-title" className="home-hero-title">Ratul Hasan Ruhan</h1>

        <p className="home-hero-deck">
          Software engineer building programming languages, accessibility tools and offline-first systems for Bangladesh.
        </p>

        <div className="home-hero-actions">
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
          <button className="home-cta-link home-about-link" type="button" onClick={onAbout}>
            About me
          </button>
        </div>

        <ul className="home-hero-creds" aria-label="Highlights">
          {credentials.map(({ label, href, Icon }) => (
            <li key={href}>
              <Link href={href} className="home-hero-cred">
                <span className="home-hero-cred-icon" aria-hidden="true">
                  <Icon size={16} strokeWidth={2.2} />
                </span>
                <span className="home-hero-cred-copy">
                  <strong>{label}</strong>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <motion.div
        className="home-hero-scene"
        style={{ y: sceneY, opacity: sceneOpacity }}
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`home-tree-stage${treeReady && !reduce ? " home-tree-stage-ready" : ""}`}>
          <picture className="home-tree-poster">
            <source
              media="(max-width: 768px)"
              srcSet="/assets/images/mango-tree-poster-mobile.webp"
              type="image/webp"
            />
            <Image
              src="/assets/images/mango-tree-poster-desktop.webp"
              alt="A mango tree with a leafy canopy and ripe fruit."
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </picture>
          {mountTree && !reduce && (
            <div className="home-tree-canvas">
              <MangoTree3D
                branches={treeBranches}
                hoveredBranch={hoveredBranch}
                onHoverBranch={setHoveredBranch}
                onSelectBranch={onSelectBranch}
                onFirstFrame={() => setTreeReady(true)}
                night={night}
                season={season}
                reducedMotion={reduce}
              />
            </div>
          )}
          <nav className="poster-branch-links" aria-label="Open a portfolio branch">
            {treeBranches.map((branch) => (
              <button
                key={branch.id}
                type="button"
                className={`poster-branch-link poster-branch-${branch.id}${hoveredBranch === branch.id ? " is-active" : ""}`}
                onPointerEnter={() => setHoveredBranch(branch.id)}
                onPointerLeave={() => setHoveredBranch(null)}
                onClick={() => onSelectBranch(branch.id)}
                aria-label={`${branch.label}, ${branch.count} items`}
              >
                <span>{branch.label}</span><small>{branch.count}</small>
              </button>
            ))}
          </nav>
        </div>
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
