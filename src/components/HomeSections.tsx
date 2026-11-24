"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { awards, projects, skillGroups } from "@/data/catalog";
import type { PortfolioItem } from "@/data/types";

type Feature = {
  item: PortfolioItem;
  kicker: string;
  image: string;
  imageAlt: string;
  tone: "mango" | "leaf" | "ink" | "sky";
  contain?: boolean;
};

function findProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

function findAward(slug: string) {
  return awards.find((award) => award.slug === slug);
}

function buildFeatures(): Feature[] {
  const features: Feature[] = [];
  const ojogor = findProject("ojogor");
  if (ojogor) {
    features.push({
      item: ojogor,
      kicker: "Language design · Compiler",
      image: ojogor.image,
      imageAlt: "Ojogor programming language",
      tone: "ink",
    });
  }
  const ict = findAward("bangladesh-ict-innovation-award-2025");
  if (ict) {
    features.push({
      item: ict,
      kicker: "National award · 2025",
      image: ict.images[0]?.src ?? "",
      imageAlt: ict.images[0]?.alt ?? ict.title,
      tone: "mango",
    });
  }
  const ishara = findProject("ishara");
  if (ishara) {
    features.push({
      item: ishara,
      kicker: "Accessibility · AI",
      image: ishara.image,
      imageAlt: "Ishara sign-language translation",
      tone: "sky",
      contain: true,
    });
  }
  const codingFest = findAward("coding-fest-2026-1st-place");
  if (codingFest) {
    features.push({
      item: codingFest,
      kicker: "Competitive programming · 2026",
      image: codingFest.images[0]?.src ?? "",
      imageAlt: codingFest.images[0]?.alt ?? codingFest.title,
      tone: "leaf",
    });
  }
  const startup = awards.find((award) => award.slug.startsWith("startup-world-cup"));
  if (startup) {
    features.push({
      item: startup,
      kicker: "Entrepreneurship · 2025",
      image: startup.images[0]?.src ?? "",
      imageAlt: startup.images[0]?.alt ?? startup.title,
      tone: "ink",
    });
  }
  return features.filter((feature) => feature.image);
}

const features = buildFeatures();

function TiltCard({ feature, index }: { feature: Feature; index: number }) {
  const reduce = useReducedMotion();
  const cardRef = useRef<HTMLAnchorElement>(null);

  function handleMove(event: ReactPointerEvent<HTMLAnchorElement>) {
    if (reduce || event.pointerType !== "mouse") return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    card.style.setProperty("--tilt-x", `${(0.5 - y) * 9}deg`);
    card.style.setProperty("--tilt-y", `${(x - 0.5) * 11}deg`);
    card.style.setProperty("--glare-x", `${x * 100}%`);
    card.style.setProperty("--glare-y", `${y * 100}%`);
  }

  function handleLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }

  const { item } = feature;

  return (
    <motion.div
      className={`feature-cell feature-cell-${index}`}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        ref={cardRef}
        href={`/${item.branch}/${item.slug}/`}
        className={`feature-card feature-tone-${feature.tone}`}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <span className={`feature-media${feature.contain ? " feature-media-contain" : ""}`}>
          <Image
            src={feature.image}
            alt={feature.imageAlt}
            fill
            sizes={index === 0 ? "(max-width: 900px) 92vw, 640px" : "(max-width: 900px) 92vw, 420px"}
            loading="lazy"
          />
        </span>
        <span className="feature-shade" aria-hidden="true" />
        <span className="feature-glare" aria-hidden="true" />
        <span className="feature-copy">
          <span className="feature-kicker">{feature.kicker}</span>
          <strong className="feature-title">{item.title}</strong>
          <span className="feature-summary">{item.summary}</span>
          <span className="feature-open">
            View the story <span aria-hidden="true">→</span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

export function FeaturedWork() {
  const reduce = useReducedMotion();
  if (features.length === 0) return null;
  return (
    <section id="featured" className="featured-section" aria-labelledby="featured-title">
      <motion.div
        className="featured-heading"
        initial={reduce ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="section-eyebrow">Featured work</p>
        <h2 id="featured-title">
          The fruit worth <em>picking first.</em>
        </h2>
        <p>
          The work I&apos;m proudest of: a programming language, an accessibility system, and the awards they earned.
        </p>
      </motion.div>
      <div className="featured-grid">
        {features.map((feature, index) => (
          <TiltCard key={feature.item.slug} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
}

const marqueeTerms = Array.from(
  new Set([
    ...skillGroups.flatMap((group) => group.technologies),
    "Dart",
    "Compilers",
    "Systems research",
    "Accessibility",
  ]),
).slice(0, 20);

export function SkillMarquee() {
  return (
    <section className="skill-marquee" aria-label="Tools and disciplines">
      <ul className="skill-marquee-list">
        {marqueeTerms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
      <ul className="skill-marquee-list" aria-hidden="true">
        {marqueeTerms.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ul>
    </section>
  );
}
