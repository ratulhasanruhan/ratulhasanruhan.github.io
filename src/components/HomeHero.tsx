"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { branches, profile } from "@/data/catalog";
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

const branchHues: Record<BranchId, string> = {
  projects: "#5f8f45",
  awards: "#e19a35",
  communities: "#4f87a0",
  research: "#8a6db0",
  writing: "#c46a4f",
  experience: "#6f6a4c",
};

type HomeHeroProps = {
  branchCounts: Record<BranchId, number>;
  stats: { label: string; value: number }[];
  night: boolean;
  season: string;
  bangla: boolean;
  onSelectBranch: (branch: BranchId) => void;
  onAbout: () => void;
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
    const duration = 1400;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
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
  stats,
  night,
  season,
  bangla,
  onSelectBranch,
  onAbout,
}: HomeHeroProps) {
  const reduce = useReducedMotion() ?? false;
  const heroRef = useRef<HTMLElement>(null);
  const [hoveredBranch, setHoveredBranch] = useState<BranchId | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDListElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 140]);
  const sceneScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 0.88]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.15]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);

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
      { threshold: 0.4 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const treeBranches = branches.map((branch) => ({
    id: branch.id,
    label: bangla ? branch.bangla : branch.label,
    count: branchCounts[branch.id] ?? 0,
  }));

  function scrollToFeatured() {
    document.getElementById("featured")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <section
      ref={heroRef}
      className={`home-hero${night ? " home-hero-night" : ""}`}
      aria-labelledby="hero-title"
    >
      <div className="home-hero-backdrop" aria-hidden="true">
        <span className="home-hero-orb home-hero-orb-a" />
        <span className="home-hero-orb home-hero-orb-b" />
        <span className="home-hero-grain" />
      </div>

      <motion.div className="home-hero-copy" style={{ y: copyY }}>
        <motion.button
          type="button"
          className="home-hero-intro"
          onClick={onAbout}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="home-hero-avatar">
            <Image src={profile.portrait} alt="" width={36} height={36} priority />
          </span>
          <span className="home-hero-intro-copy">
            <strong>{profile.name}</strong>
            <small>{profile.title} · Dhaka</small>
          </span>
          <span className="home-hero-intro-arrow" aria-hidden="true">→</span>
        </motion.button>

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

        <motion.p
          className="home-hero-deck"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          Software engineer and systems researcher from Bangladesh. I created <strong>Ojogor</strong>, the first
          Bengali programming language, and won the <strong>Bangladesh ICT &amp; Innovation Award 2025</strong>.
        </motion.p>

        <motion.div
          className="home-hero-actions"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.68, duration: 0.7 }}
        >
          <button type="button" className="home-cta home-cta-primary" onClick={scrollToFeatured}>
            See my best work <span aria-hidden="true">↓</span>
          </button>
          <a className="home-cta home-cta-secondary" href={profile.booking} target="_blank" rel="noreferrer">
            Book a call <span aria-hidden="true">↗</span>
          </a>
          <a className="home-cta-link" href={profile.resume} download>
            Résumé (PDF)
          </a>
        </motion.div>

        <motion.dl
          ref={statsRef}
          className="home-hero-stats"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.8 }}
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>
                <CountUp value={stat.value} run={statsVisible} />
                <span aria-hidden="true">+</span>
              </dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      <motion.div
        className="home-hero-scene"
        style={{ y: sceneY, scale: sceneScale, opacity: sceneOpacity }}
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
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

      <nav className="home-branch-chips" aria-label="Explore Ratul's work by branch">
        {branches.map((branch, index) => (
          <motion.button
            key={branch.id}
            type="button"
            className={`home-branch-chip${hoveredBranch === branch.id ? " is-active" : ""}`}
            style={{ "--chip-hue": branchHues[branch.id] } as CSSProperties}
            onPointerEnter={() => setHoveredBranch(branch.id)}
            onPointerLeave={() => setHoveredBranch(null)}
            onFocus={() => setHoveredBranch(branch.id)}
            onBlur={() => setHoveredBranch(null)}
            onClick={() => onSelectBranch(branch.id)}
            initial={reduce ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + index * 0.06, duration: 0.5 }}
          >
            <span className="home-branch-chip-dot" aria-hidden="true" />
            <span className="home-branch-chip-label">{bangla ? branch.bangla : branch.label}</span>
            <span className="home-branch-chip-count">{branchCounts[branch.id] ?? 0}</span>
          </motion.button>
        ))}
      </nav>

      <button type="button" className="home-scroll-cue" onClick={scrollToFeatured} aria-label="Scroll to featured work">
        <span className="home-scroll-cue-line" aria-hidden="true" />
      </button>
    </section>
  );
}
