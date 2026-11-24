"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeCheck, FlaskConical, GraduationCap, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { certifications, educationItems, linkedinPosts, publication, researchInterests } from "@/data/catalog";
import type { LinkedInPost, Writing } from "@/data/types";

function formatDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en", { month: "short", year: "numeric", timeZone: "UTC" });
}

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function WritingShelf({ writings, onOpenAll }: { writings: Writing[]; onOpenAll: () => void }) {
  const sorted = useMemo(
    () => [...writings].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [writings],
  );
  if (sorted.length === 0) return null;
  const [lead, ...rest] = sorted;

  return (
    <section id="writing" className="home-section writing-shelf" aria-labelledby="writing-title">
      <Reveal className="home-section-heading">
        <p className="section-eyebrow">Writing · {sorted.length} articles</p>
        <h2 id="writing-title">
          Notes from <em>the workbench.</em>
        </h2>
        <p>Practical write-ups on Flutter, tooling and the systems I build, published on Hashnode and Medium.</p>
      </Reveal>

      <div className="writing-layout">
        <Reveal className="writing-lead-wrap">
          <Link className="writing-lead" href={`/${lead.branch}/${lead.slug}/`}>
            {lead.cover && (
              <span className="writing-cover">
                <Image src={lead.cover} alt="" fill sizes="(max-width: 900px) 92vw, 620px" loading="lazy" />
              </span>
            )}
            <span className="writing-lead-copy">
              <span className="writing-badge">Latest</span>
              <span className="writing-date">{formatDate(lead.publishedAt)}</span>
              <strong>{lead.title}</strong>
              <span className="writing-summary">{lead.summary}</span>
              <span className="writing-read">
                Read the article <ArrowRight size={15} aria-hidden="true" />
              </span>
            </span>
          </Link>
        </Reveal>

        <div className="writing-rail" role="list">
          {rest.slice(0, 6).map((item, index) => (
            <Reveal className="writing-rail-item" key={item.slug} delay={index * 0.05}>
              <Link role="listitem" className="writing-card" href={`/${item.branch}/${item.slug}/`}>
                <span className="writing-thumb">
                  {item.cover ? (
                    <Image src={item.cover} alt="" fill sizes="(max-width: 760px) 72vw, 180px" loading="lazy" />
                  ) : (
                    <span className="writing-thumb-fallback" aria-hidden="true">
                      {item.title.slice(0, 1)}
                    </span>
                  )}
                </span>
                <span className="writing-card-copy">
                  <span className="writing-date">{formatDate(item.publishedAt)}</span>
                  <strong>{item.title}</strong>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="home-section-actions">
        <button type="button" className="home-pill-button" onClick={onOpenAll}>
          See all {sorted.length} articles <ArrowRight size={15} aria-hidden="true" />
        </button>
        <a className="home-text-link" href="https://ratulhasan.hashnode.dev" target="_blank" rel="noreferrer">
          Follow on Hashnode ↗
        </a>
      </div>
    </section>
  );
}

export function EducationSection() {
  return (
    <section id="education" className="home-section education-section" aria-labelledby="education-title">
      <Reveal className="home-section-heading">
        <p className="section-eyebrow">Education &amp; research</p>
        <h2 id="education-title">
          Always <em>still learning.</em>
        </h2>
        <p>Computer science from Dhaka to Greenwich, plus the research and certifications along the way.</p>
      </Reveal>

      <div className="education-grid">
        <ol className="education-list">
          {educationItems.map((item, index) => {
            const ongoing = /ongoing/i.test(item.status ?? "");
            return (
              <Reveal key={item.slug} delay={index * 0.06}>
                <li className={`education-card${ongoing ? " is-ongoing" : ""}`}>
                  <span className="education-icon" aria-hidden="true">
                    <GraduationCap size={20} strokeWidth={2} />
                  </span>
                  <div className="education-copy">
                    <span className="education-when">{item.tenure}</span>
                    <Link href={`/${item.branch}/${item.slug}/`} className="education-title">
                      {item.title}
                    </Link>
                    <span className="education-school">{item.organization}</span>
                  </div>
                  <span className={`education-status${ongoing ? " is-ongoing" : ""}`}>
                    {ongoing ? "In progress" : "Completed"}
                  </span>
                </li>
              </Reveal>
            );
          })}
        </ol>

        <div className="education-side">
          <Reveal>
            <Link className="research-card" href={`/${publication.branch}/${publication.slug}/`}>
              <span className="research-kicker">
                <FlaskConical size={15} aria-hidden="true" /> Research preprint · Oct 2025
              </span>
              <strong>Caller Collision Resolution Protocol (CCRP)</strong>
              <span>Bridging simultaneous call attempts in real-world telephony.</span>
              <span className="research-open">Read the paper →</span>
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="interest-card">
              <span className="interest-title">Research interests</span>
              <ul>
                {researchInterests.map((item) => (
                  <li key={item.slug}>{item.title}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="cert-card">
              <span className="interest-title">Certifications</span>
              <ul>
                {certifications.map((item) => (
                  <li key={item.slug}>
                    <BadgeCheck size={15} aria-hidden="true" />
                    <a href={item.href} target="_blank" rel="noreferrer">
                      {item.title}
                    </a>
                    <small>{item.summary}</small>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

type GalleryPhoto = { post: LinkedInPost; src: string; width: number; height: number; index: number };

const momentTags: { id: "all" | LinkedInPost["tag"]; label: string }[] = [
  { id: "all", label: "All moments" },
  { id: "award", label: "Awards" },
  { id: "event", label: "Events" },
  { id: "community", label: "Community" },
  { id: "project", label: "Projects" },
];

export function MomentsGallery() {
  const reduce = useReducedMotion();
  const [tag, setTag] = useState<(typeof momentTags)[number]["id"]>("all");
  const [expanded, setExpanded] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dragStart = useRef<number | null>(null);

  const photos = useMemo<GalleryPhoto[]>(
    () =>
      linkedinPosts
        .filter((post) => post.gallery && (tag === "all" || post.tag === tag))
        .flatMap((post) =>
          post.photos.map((photo, index) => ({
            post,
            src: `/assets/images/linkedin/${photo.file}`,
            width: photo.width,
            height: photo.height,
            index,
          })),
        ),
    [tag],
  );
  const visible = expanded ? photos : photos.slice(0, 12);
  const active = openIndex === null ? null : photos[openIndex];

  const close = useCallback(() => {
    setOpenIndex(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);
  const step = useCallback(
    (delta: number) => setOpenIndex((current) => (current === null ? current : (current + delta + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey, true);
    };
  }, [close, openIndex, step]);

  return (
    <section id="moments" className="home-section moments" aria-labelledby="moments-title">
      <Reveal className="home-section-heading">
        <p className="section-eyebrow">Moments · from LinkedIn</p>
        <h2 id="moments-title">
          On stage, <em>in the room.</em>
        </h2>
        <p>Award nights, summits, hackathons and community days, straight from my LinkedIn posts.</p>
      </Reveal>

      <div className="moments-tags" role="group" aria-label="Filter moments">
        {momentTags.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={tag === entry.id ? "is-active" : ""}
            aria-pressed={tag === entry.id}
            onClick={() => {
              setTag(entry.id);
              setExpanded(false);
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="moments-grid">
        {visible.map((photo, index) => (
          <motion.button
            key={photo.src}
            type="button"
            className="moment"
            onClick={(event) => {
              triggerRef.current = event.currentTarget;
              setOpenIndex(index);
            }}
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.55, delay: (index % 4) * 0.05 }}
            aria-label={`Open photo: ${photo.post.title}`}
          >
            <Image
              src={photo.src}
              alt={photo.post.title}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 46vw, (max-width: 1100px) 31vw, 290px"
              loading="lazy"
            />
            <span className="moment-caption">
              <strong>{photo.post.title}</strong>
              <small>{formatDate(photo.post.date)}</small>
            </span>
          </motion.button>
        ))}
      </div>

      {photos.length > 12 && (
        <div className="home-section-actions">
          <button type="button" className="home-pill-button" onClick={() => setExpanded((value) => !value)}>
            {expanded ? "Show fewer" : `Show all ${photos.length} photos`}
          </button>
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
          >
            <div
              ref={dialogRef}
              className="lightbox-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={active.post.title}
              tabIndex={-1}
              onPointerDown={(event) => {
                dragStart.current = event.clientX;
              }}
              onPointerUp={(event) => {
                if (dragStart.current === null) return;
                const delta = event.clientX - dragStart.current;
                dragStart.current = null;
                if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1);
              }}
            >
              <button type="button" className="lightbox-close" onClick={close} aria-label="Close photo">
                <X size={20} />
              </button>
              <motion.div
                key={active.src}
                className="lightbox-media"
                initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Image src={active.src} alt={active.post.title} width={active.width} height={active.height} sizes="92vw" />
              </motion.div>
              <div className="lightbox-copy">
                <span className="lightbox-meta">
                  {formatDate(active.post.date)} · {openIndex! + 1} / {photos.length}
                </span>
                <strong>{active.post.title}</strong>
                <p>{active.post.caption}</p>
                <a href={active.post.postUrl} target="_blank" rel="noreferrer">
                  View the post on LinkedIn ↗
                </a>
              </div>
              <button type="button" className="lightbox-nav lightbox-prev" onClick={() => step(-1)} aria-label="Previous photo">
                <ArrowLeft size={20} />
              </button>
              <button type="button" className="lightbox-nav lightbox-next" onClick={() => step(1)} aria-label="Next photo">
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
