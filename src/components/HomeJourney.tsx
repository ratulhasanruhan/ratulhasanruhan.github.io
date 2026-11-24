"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, BriefcaseBusiness, FlaskConical, GraduationCap, Rocket, Trophy, UsersRound } from "lucide-react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useLayoutEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties } from "react";
import {
  awards,
  communities,
  educationItems,
  experience,
  linkedinPosts,
  profile,
  projects,
  publication,
} from "@/data/catalog";

type StopKind = "education" | "work" | "award" | "project" | "research" | "community";

type Stop = {
  id: string;
  kind: StopKind;
  year: number;
  sort: number;
  when: string;
  title: string;
  place: string;
  note?: string;
  href: string;
  photo?: { src: string; alt: string };
};

const kindMeta: Record<StopKind, { label: string; Icon: ComponentType<{ size?: number; strokeWidth?: number }> }> = {
  education: { label: "Education", Icon: GraduationCap },
  work: { label: "Work", Icon: BriefcaseBusiness },
  award: { label: "Award", Icon: Trophy },
  project: { label: "Project", Icon: Rocket },
  research: { label: "Research", Icon: FlaskConical },
  community: { label: "Community", Icon: UsersRound },
};

const filters: { id: "all" | StopKind | "build"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "education", label: "Education" },
  { id: "work", label: "Work" },
  { id: "award", label: "Awards" },
  { id: "build", label: "Projects & research" },
  { id: "community", label: "Community" },
];

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function startSort(text: string | undefined, fallbackYear: number, fallbackMonth = 6) {
  const monthMatch = text?.match(/([A-Za-z]{3})[a-z]*\.?\s+(\d{4})/);
  if (monthMatch) {
    const month = months.indexOf(monthMatch[1].toLowerCase());
    if (month >= 0) return Number(monthMatch[2]) * 12 + month;
  }
  const yearMatch = text?.match(/(\d{4})/);
  return (yearMatch ? Number(yearMatch[1]) : fallbackYear) * 12 + fallbackMonth;
}

function postPhoto(slug: string) {
  const post = linkedinPosts.find((entry) => entry.slug === slug);
  const photo = post?.photos[0];
  if (!post || !photo) return undefined;
  return { src: `/assets/images/linkedin/${photo.file}`, alt: post.title };
}

function postSort(slug: string, fallbackYear: number) {
  const post = linkedinPosts.find((entry) => entry.slug === slug);
  if (!post) return fallbackYear * 12 + 6;
  return Number(post.date.slice(0, 4)) * 12 + Number(post.date.slice(5, 7)) - 1;
}

const awardStops: { slug: string; post: string }[] = [
  { slug: "startup-world-cup-2025-regional-finalist", post: "startup-world-cup-2025" },
  { slug: "bangladesh-ict-innovation-award-2025", post: "bangladesh-ict-innovation-award-2025" },
  { slug: "national-tech-award-2025", post: "national-tech-award-2025" },
  { slug: "national-ai-build-a-thon-trailblazer", post: "national-ai-build-a-thon-trailblazer" },
  { slug: "coding-fest-2026-1st-place", post: "coding-fest-2026-buildathon" },
];

const communityStops: { slug: string; post?: string }[] = [
  { slug: "bangladesh-open-source-network", post: "software-freedom-day-2026" },
  { slug: "global-logic-reasoning-challenge" },
  { slug: "amazon-web-services", post: "aws-goodies" },
  { slug: "hult-prize", post: "hult-prize-semi-final" },
];

function buildStops(): Stop[] {
  const stops: Stop[] = [];

  for (const item of educationItems) {
    stops.push({
      id: `edu-${item.slug}`,
      kind: "education",
      year: item.year ?? 0,
      sort: startSort(item.tenure, item.year ?? 0, 0),
      when: item.tenure,
      title: item.title,
      place: item.organization,
      note: item.status,
      href: `/${item.branch}/${item.slug}/`,
    });
  }

  for (const item of experience) {
    const [company, role] = item.title.split(" — ");
    stops.push({
      id: `work-${item.slug}`,
      kind: "work",
      year: item.year ?? 0,
      sort: startSort(item.tenure, item.year ?? 0),
      when: item.tenure ?? String(item.year ?? ""),
      title: role ?? item.title,
      place: company,
      note: item.description.split(" · ").at(-1),
      href: `/${item.branch}/${item.slug}/`,
    });
  }

  for (const { slug, post } of awardStops) {
    const award = awards.find((entry) => entry.slug === slug);
    if (!award) continue;
    stops.push({
      id: `award-${slug}`,
      kind: "award",
      year: award.year ?? 0,
      sort: postSort(post, award.year ?? 0),
      when: String(award.year ?? ""),
      title: award.title,
      place: award.issuer ?? "",
      href: `/${award.branch}/${award.slug}/`,
      photo: postPhoto(post) ?? (award.images[0] ? { src: award.images[0].src, alt: award.images[0].alt } : undefined),
    });
  }

  const ojogor = projects.find((entry) => entry.slug === "ojogor");
  if (ojogor) {
    stops.push({
      id: "project-ojogor",
      kind: "project",
      year: 2025,
      sort: 2025 * 12 + 1,
      when: "2025",
      title: "Ojogor (অজগর)",
      place: "The first Bengali programming language",
      note: "Featured by The Business Standard, Dhaka Tribune and more.",
      href: `/${ojogor.branch}/${ojogor.slug}/`,
      photo: { src: ojogor.image, alt: "Ojogor programming language" },
    });
  }

  stops.push({
    id: "project-offline-relief",
    kind: "project",
    year: 2026,
    sort: postSort("offline-disaster-relief-system", 2026),
    when: "2026",
    title: "A relief system that works without the internet",
    place: "P2P mesh · Go + gRPC · Flutter",
    note: "Decentralised relief coordination for floods, with autonomous drone support.",
    href: linkedinPosts.find((entry) => entry.slug === "offline-disaster-relief-system")?.postUrl ?? "/projects/",
  });

  stops.push({
    id: "research-ccrp",
    kind: "research",
    year: publication.year ?? 2025,
    sort: 2025 * 12 + 9,
    when: "Oct 2025",
    title: "Caller Collision Resolution Protocol (CCRP)",
    place: "Research preprint",
    note: "Bridging simultaneous call attempts in real-world telephony.",
    href: `/${publication.branch}/${publication.slug}/`,
  });

  for (const { slug, post } of communityStops) {
    const community = communities.find((entry) => entry.slug === slug);
    if (!community) continue;
    stops.push({
      id: `community-${slug}`,
      kind: "community",
      year: community.year ?? 0,
      sort: post ? postSort(post, community.year ?? 0) : startSort(community.tenure, community.year ?? 0),
      when: community.tenure,
      title: community.role,
      place: community.title,
      href: `/${community.branch}/${community.slug}/`,
      photo: post ? postPhoto(post) : undefined,
    });
  }

  return stops.sort((a, b) => a.sort - b.sort || a.title.localeCompare(b.title));
}

const allStops = buildStops();

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return "";
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

type Geometry = { width: number; height: number; d: string; pins: number[] };

export default function HomeJourney({ onContact }: { onContact: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [geometry, setGeometry] = useState<Geometry>({ width: 0, height: 0, d: "", pins: [] });
  const [reached, setReached] = useState(0);
  const roadRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const litRef = useRef<SVGGElement>(null);
  const travelerRef = useRef<HTMLDivElement>(null);
  const lengthRef = useRef(0);

  const stops = useMemo(
    () =>
      allStops.filter((stop) =>
        filter === "all" ? true : filter === "build" ? stop.kind === "project" || stop.kind === "research" : stop.kind === filter,
      ),
    [filter],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: allStops.length };
    for (const stop of allStops) {
      result[stop.kind] = (result[stop.kind] ?? 0) + 1;
      if (stop.kind === "project" || stop.kind === "research") result.build = (result.build ?? 0) + 1;
    }
    return result;
  }, []);

  const { scrollYProgress } = useScroll({ target: roadRef, offset: ["start 72%", "end 72%"] });

  function placeTraveler(progress: number) {
    const path = pathRef.current;
    const length = lengthRef.current;
    if (!path || !length) return;
    const clamped = Math.min(1, Math.max(0, progress));
    const point = path.getPointAtLength(clamped * length);
    if (travelerRef.current) {
      travelerRef.current.style.transform = `translate3d(${point.x.toFixed(1)}px, ${point.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
    if (litRef.current) litRef.current.style.strokeDashoffset = String(length * (1 - clamped));
    const count = geometry.pins.filter((y) => y <= point.y + 6).length;
    setReached((current) => (current === count ? current : count));
  }

  useLayoutEffect(() => {
    const road = roadRef.current;
    if (!road) return;
    const measure = () => {
      const box = road.getBoundingClientRect();
      const pins = Array.from(road.querySelectorAll<HTMLElement>("[data-road-pin]")).map((pin) => {
        const rect = pin.getBoundingClientRect();
        return { x: rect.left + rect.width / 2 - box.left, y: rect.top + rect.height / 2 - box.top };
      });
      const start = road.querySelector<HTMLElement>("[data-road-start]");
      const finish = road.querySelector<HTMLElement>("[data-road-finish]");
      const startRect = start?.getBoundingClientRect();
      const finishRect = finish?.getBoundingClientRect();
      const points = [
        startRect
          ? { x: startRect.left + startRect.width / 2 - box.left, y: startRect.top + startRect.height / 2 - box.top }
          : { x: pins[0]?.x ?? 0, y: 0 },
        ...pins,
        finishRect
          ? { x: finishRect.left + finishRect.width / 2 - box.left, y: finishRect.top + finishRect.height / 2 - box.top }
          : { x: pins.at(-1)?.x ?? 0, y: box.height },
      ];
      setGeometry({ width: box.width, height: box.height, d: smoothPath(points), pins: pins.map((pin) => pin.y) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(road);
    return () => observer.disconnect();
  }, [stops]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path || !geometry.d) return;
    lengthRef.current = path.getTotalLength();
    if (litRef.current) litRef.current.style.strokeDasharray = `${lengthRef.current} ${lengthRef.current}`;
    placeTraveler(reduce ? 1 : scrollYProgress.get());
    // placeTraveler reads the latest geometry through closure on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, reduce]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!reduce) placeTraveler(value);
  });

  return (
    <section id="journey" className="journey" aria-labelledby="journey-title">
      <div className="journey-sky" aria-hidden="true">
        <span className="journey-star journey-star-a" />
        <span className="journey-star journey-star-b" />
        <span className="journey-star journey-star-c" />
      </div>

      <div className="journey-heading">
        <p className="journey-eyebrow">My journey · 2016 → today</p>
        <h2 id="journey-title">
          The road <em>so far.</em>
        </h2>
        <p>
          From a school in Shariatpur to national stages. Every stop opens the full story.
        </p>
      </div>

      <div className="journey-filters" role="group" aria-label="Filter the journey">
        {filters.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={filter === entry.id ? "is-active" : ""}
            aria-pressed={filter === entry.id}
            onClick={() => setFilter(entry.id)}
          >
            {entry.label}
            <span>{counts[entry.id] ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="road" ref={roadRef}>
        {geometry.d && (
          <svg
            className="road-svg"
            width={geometry.width}
            height={geometry.height}
            viewBox={`0 0 ${geometry.width} ${geometry.height}`}
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="road-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffd27a" />
                <stop offset="55%" stopColor="#f4a42c" />
                <stop offset="100%" stopColor="#ff7a45" />
              </linearGradient>
              <filter id="road-blur" x="-50%" y="-5%" width="200%" height="110%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <path className="road-verge" d={geometry.d} />
            <path ref={pathRef} className="road-asphalt" d={geometry.d} />
            <path className="road-dash" d={geometry.d} />
            <g ref={litRef} className="road-lit-group">
              <path className="road-lit-glow" d={geometry.d} filter="url(#road-blur)" />
              <path className="road-lit" d={geometry.d} />
            </g>
          </svg>
        )}

        <div className="road-start">
          <span className="road-start-dot" data-road-start aria-hidden="true" />
          <span className="road-sign">
            <strong>2016</strong> The road begins · Shariatpur
          </span>
        </div>

        <ol className="road-stops">
          {stops.map((stop, index) => {
            const { Icon, label } = kindMeta[stop.kind];
            const side = index % 2 === 0 ? "left" : "right";
            const showYear = stop.year !== stops[index - 1]?.year;
            const external = stop.href.startsWith("http");
            const card = (
              <>
                {stop.photo && (
                  <span className="road-card-photo">
                    <Image src={stop.photo.src} alt={stop.photo.alt} fill sizes="(max-width: 760px) 120px, 180px" loading="lazy" />
                  </span>
                )}
                <span className="road-card-body">
                  <span className="road-card-meta">
                    <span className={`road-kind road-kind-${stop.kind}`}>
                      <Icon size={13} strokeWidth={2.2} /> {label}
                    </span>
                    <span className="road-when">{stop.when}</span>
                  </span>
                  <strong className="road-card-title">{stop.title}</strong>
                  {stop.place && <span className="road-card-place">{stop.place}</span>}
                  {stop.note && <span className="road-card-note">{stop.note}</span>}
                  <span className="road-card-open">
                    {external ? "View on LinkedIn" : "Open story"} <span aria-hidden="true">{external ? "↗" : "→"}</span>
                  </span>
                </span>
              </>
            );
            return (
              <li
                key={stop.id}
                className={`road-stop road-stop-${side}${stop.photo ? " has-photo" : ""}${index < reached ? " is-reached" : ""}`}
                style={{ "--wiggle": Math.sin(index * 1.15 + 0.6).toFixed(3), "--row": index + 1 } as CSSProperties}
              >
                <span className="road-pin" data-road-pin aria-hidden="true">
                  <Icon size={14} strokeWidth={2.4} />
                </span>
                {showYear && (
                  <span className="road-year" aria-hidden="true">
                    {stop.year}
                  </span>
                )}
                <motion.div
                  className="road-card-wrap"
                  initial={reduce ? false : { opacity: 0, x: side === "left" ? -36 : 36, y: 12 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -12% 0px" }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {external ? (
                    <a className="road-card" href={stop.href} target="_blank" rel="noreferrer">
                      {card}
                    </a>
                  ) : (
                    <Link className="road-card" href={stop.href}>
                      {card}
                    </Link>
                  )}
                </motion.div>
              </li>
            );
          })}
        </ol>

        <div className="road-finish">
          <span className="road-finish-dot" data-road-finish aria-hidden="true">
            <span className="road-flag" />
          </span>
          <div className="road-finish-copy">
            <strong>Today, and the next stop.</strong>
            <span>Building Appibrium, studying at Greenwich, and looking for the next hard problem.</span>
            <div className="road-finish-actions">
              <button type="button" className="road-finish-primary" onClick={onContact}>
                Let&apos;s work together
              </button>
              <a href={profile.resume} download>
                Download résumé ↓
              </a>
            </div>
          </div>
        </div>

        <div ref={travelerRef} className="road-traveler" aria-hidden="true">
          <Image src={profile.portrait} alt="" width={40} height={40} />
        </div>
      </div>

      <p className="journey-certs">
        <BadgeCheck size={15} strokeWidth={2.2} aria-hidden="true" /> Also certified in Cisco CCNA + Python network
        automation, computer architecture and data literacy.
      </p>
    </section>
  );
}
