"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Camera,
  Flag,
  FlaskConical,
  FolderKanban,
  GraduationCap,
  Handshake,
  House,
  Medal,
  Menu as MenuIcon,
  PenLine,
  Signpost,
  Sparkles,
  Trophy,
  UsersRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import ContactSoil from "@/components/ContactSoil";
import HomeHero from "@/components/HomeHero";
import { EducationSection, MomentsGallery, WritingShelf } from "@/components/HomeContent";
import HomeJourney from "@/components/HomeJourney";
import { FeaturedWork, SkillMarquee } from "@/components/HomeSections";
import TreeScene, { crownLayout, DESKTOP_TREE_OFFSET_X, DESKTOP_TREE_SCALE_X } from "@/components/TreeScene";
import WeatherCanvas from "@/components/WeatherCanvas";
import { setWebMcpHandlers } from "@/components/webmcp-actions";
import {
  awards,
  branches,
  communities,
  experience,
  getItemsForBranch,
  getEventsForItem,
  getTreeItems,
  mediaCoverage,
  profile,
  projects,
  researchItems,
  resumeLeaf,
  skillGroups,
} from "@/data/catalog";
import type { BranchId, FreshRepository, PortfolioItem, Writing } from "@/data/types";

const seasons = [
  { name: "Grishma", bengali: "গ্রীষ্ম", note: "mango season", noteBn: "আমের মৌসুম" },
  { name: "Borsha", bengali: "বর্ষা", note: "monsoon rain", noteBn: "বর্ষার বৃষ্টি" },
  { name: "Sharat", bengali: "শরৎ", note: "kash flowers", noteBn: "কাশফুল" },
  { name: "Hemanta", bengali: "হেমন্ত", note: "golden paddy", noteBn: "সোনালি ধান" },
  { name: "Sheet", bengali: "শীত", note: "soft winter fog", noteBn: "শীতের কুয়াশা" },
  { name: "Basanta", bengali: "বসন্ত", note: "mango blossoms", noteBn: "আমের মুকুল" },
];

const tourStops: { branch: BranchId; caption: string; subcaption: string }[] = [
  {
    branch: "projects",
    caption: "Ideas take root here.",
    subcaption: "Thirty projects, from Ojogor to tools and systems.",
  },
  {
    branch: "awards",
    caption: "Milestones gathered in golden fruit.",
    subcaption: "Eight awards and recognitions, with their stories and photographs.",
  },
  {
    branch: "communities",
    caption: "Growth is a shared practice.",
    subcaption: "Six community roles, each rooted in people and purpose.",
  },
  {
    branch: "research",
    caption: "Questions become a way forward.",
    subcaption: "One publication, with four questions still growing.",
  },
  {
    branch: "writing",
    caption: "Field notes from the making.",
    subcaption: "Practical writing on engineering, Flutter, and systems.",
  },
  {
    branch: "experience",
    caption: "Every branch has a history.",
    subcaption: "Work and learning above ground; education beneath it.",
  },
];

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function getDhakaSeason() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "numeric",
    month: "numeric",
  }).formatToParts();
  const day = Number(parts.find((part) => part.type === "day")?.value ?? 1);
  const month = Number(parts.find((part) => part.type === "month")?.value ?? 1);

  if ((month === 4 && day >= 15) || month === 5 || (month === 6 && day < 15)) return "Grishma";
  if ((month === 6 && day >= 15) || month === 7 || (month === 8 && day < 15)) return "Borsha";
  if ((month === 8 && day >= 15) || month === 9 || (month === 10 && day < 15)) return "Sharat";
  if ((month === 10 && day >= 15) || month === 11 || (month === 12 && day < 15)) return "Hemanta";
  if ((month === 12 && day >= 15) || month === 1 || (month === 2 && day < 15)) return "Sheet";
  return "Basanta";
}

function getDhakaNight() {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts()
      .find((part) => part.type === "hour")?.value ?? 12,
  );
  return hour < 6 || hour >= 18;
}

function subscribeDhakaClock(callback: () => void) {
  const interval = window.setInterval(callback, 60_000);
  return () => window.clearInterval(interval);
}

function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function subscribeSearchParams(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("hashchange", callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("hashchange", callback);
  };
}

function getSearchParamsSnapshot() {
  return window.location.search;
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function subscribeListView(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("mango-tree-list-view", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mango-tree-list-view", callback);
  };
}

function getListViewSnapshot() {
  try {
    return window.localStorage.getItem("mango-tree-list-view-v1") === "true";
  } catch {
    return false;
  }
}

function saveListView(value: boolean) {
  try {
    window.localStorage.setItem("mango-tree-list-view-v1", String(value));
    window.dispatchEvent(new Event("mango-tree-list-view"));
  } catch {
    return;
  }
}

const getServerSeasonSnapshot = () => "Grishma";
const getServerBooleanSnapshot = () => false;
const getServerSearchParamsSnapshot = () => "";

function desktopTreeX(x: number) {
  return x * DESKTOP_TREE_SCALE_X + DESKTOP_TREE_OFFSET_X;
}

function imageForItem(item: PortfolioItem) {
  if (item.kind === "project") return { src: item.image, alt: item.title };
  if (item.kind === "community") return { src: item.image, alt: `${item.title} logo` };
  if (item.kind === "award") {
    const award = awards.find((entry) => entry.slug === item.slug);
    if (award?.images[0]) return award.images[0];
  }
  if (item.kind === "writing") {
    const writing = item as Writing;
    if (writing.cover) return { src: writing.cover, alt: `Cover for ${writing.title}` };
  }
  return null;
}

function ItemTypeIcon({ item }: { item: PortfolioItem }) {
  if (item.kind === "project") {
    return /ai|machine|ml/i.test(item.category)
      ? <Sparkles size={15} strokeWidth={2.1} />
      : <FolderKanban size={15} strokeWidth={2.1} />;
  }
  if (item.kind === "award") {
    return item.year ? <Medal size={15} strokeWidth={2.1} /> : <Trophy size={15} strokeWidth={2.1} />;
  }
  if (item.kind === "community") {
    if (/ambassador/i.test(item.role)) return <Flag size={15} strokeWidth={2.1} />;
    if (/volunteer/i.test(item.role)) return <Handshake size={15} strokeWidth={2.1} />;
    return <UsersRound size={15} strokeWidth={2.1} />;
  }
  if (item.kind === "experience") return <BriefcaseBusiness size={15} strokeWidth={2.1} />;
  if (item.kind === "education") return <GraduationCap size={15} strokeWidth={2.1} />;
  if (item.kind === "certification") return <BadgeCheck size={15} strokeWidth={2.1} />;
  if (item.kind === "publication" || item.kind === "interest") return <FlaskConical size={15} strokeWidth={2.1} />;
  if (item.kind === "writing") return <PenLine size={15} strokeWidth={2.1} />;
  return <Camera size={15} strokeWidth={2.1} />;
}

function formatMonthYear(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  const month = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)).toLocaleString("en", {
    month: "short",
    timeZone: "UTC",
  });
  return `${month} ${match[1]}`;
}

function itemDate(item: PortfolioItem) {
  if (item.kind === "award" && item.receivedAt) {
    return `${item.year ?? ""} · Received ${formatMonthYear(item.receivedAt)}`;
  }
  if (item.kind === "project" && item.period) return item.period;
  if ("tenure" in item && item.tenure) return item.tenure;
  return item.year ?? "Living work";
}

function itemOrganization(item: PortfolioItem) {
  if ("organization" in item && item.organization) return item.organization;
  if ("issuer" in item && item.issuer) return item.issuer;
  if (item.kind === "community") return item.role;
  return "";
}

function itemHref(item: PortfolioItem) {
  return `/${item.branch}/${item.slug}/`;
}

function profileLinkLabel(url: string) {
  const labels: Record<string, string> = {
    "https://www.linkedin.com/in/ratul-hasan-ruhan/": "LinkedIn",
    "https://github.com/ratulhasanruhan": "GitHub",
    "https://ratulhasan.link": "Website",
    "https://peerlist.io/ratulhasan": "Peerlist",
    "https://ratulhasan.hashnode.dev": "Hashnode",
    "https://ratulhasanruhan.medium.com": "Medium",
    "https://www.facebook.com/ratulhasan.ruhan": "Facebook",
    "https://www.youtube.com/@ratulicious": "YouTube",
  };
  return labels[url] ?? new URL(url).hostname.replace(/^www\./, "");
}

function trapDialogFocus(event: ReactKeyboardEvent<HTMLElement>, dialog: HTMLElement | null) {
  if (event.key !== "Tab" || !dialog) return;
  const focusable = Array.from(
    dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]'),
  );
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}

function ItemCard({
  item,
  onHover,
  highlighted = false,
}: {
  item: PortfolioItem;
  onHover?: (slug: string | null) => void;
  highlighted?: boolean;
}) {
  const image = imageForItem(item);
  const relatedEvents = getEventsForItem(item).flatMap((event) =>
    event.photos.slice(0, 3).map((photo) => ({ event, photo })),
  );

  return (
    <Link
      className={`item-card${highlighted ? " item-card-highlighted" : ""}`}
      href={itemHref(item)}
      onMouseEnter={() => onHover?.(item.slug)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(item.slug)}
      onBlur={() => onHover?.(null)}
    >
      <span className="item-card-image">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(max-width: 640px) 80vw, 320px"
            loading="lazy"
          />
        ) : (
          <span className="item-card-monogram" aria-hidden="true">
            {item.title.slice(0, 1)}
          </span>
        )}
        <span className="item-card-icon" aria-hidden="true"><ItemTypeIcon item={item} /></span>
      </span>
      <span className="item-card-copy">
        <span className="item-card-eyebrow">
          {itemDate(item)}
        </span>
        <strong>{item.title}</strong>
        {itemOrganization(item) && <span className="item-card-organization">{itemOrganization(item)}</span>}
        <span className="item-card-summary">{item.summary}</span>
        {relatedEvents.length > 0 && (
          <span className="item-event-photos" aria-label={`${relatedEvents.length} related event photos`}>
            {relatedEvents.slice(0, 3).map(({ event, photo }) => (
              <Image
                key={`${event.slug}-${photo.file}`}
                src={`/assets/images/events/${photo.file}`}
                alt={`Event photo: ${event.event}`}
                width={58}
                height={42}
                loading="lazy"
              />
            ))}
          </span>
        )}
      </span>
      <span className="item-card-arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

function SearchOverlay({
  open,
  query,
  setQuery,
  results,
  onClose,
  onHover,
  bangla,
}: {
  open: boolean;
  query: string;
  setQuery: (value: string) => void;
  results: (PortfolioItem | (typeof mediaCoverage)[number])[];
  onClose: () => void;
  onHover: (slug: string | null) => void;
  bangla: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      inputRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="search-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            className="search-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-title"
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              const focusable = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  'button:not([disabled]), input:not([disabled]), a[href], textarea:not([disabled])',
                ),
              );
              const first = focusable[0];
              const last = focusable.at(-1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <div className="search-dialog-heading">
              <div>
                <span className="eyebrow-kicker">{bangla ? "একটি পাতা খুঁজুন" : "Find a leaf"}</span>
                <h2 id="search-title">{bangla ? "গাছ খুঁজুন" : "Search the tree"}</h2>
              </div>
              <button className="icon-button close-search" type="button" onClick={onClose} aria-label={bangla ? "অনুসন্ধান বন্ধ করুন" : "Close search"}>
                Esc
              </button>
            </div>
            <label className="search-input-wrap">
              <span className="search-glass" aria-hidden="true">⌕</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={bangla ? "প্রকল্প, গল্প বা দক্ষতা খুঁজুন…" : "Search projects, stories, or skills…"}
            aria-label={bangla ? "প্রকল্প, গল্প বা দক্ষতা খুঁজুন" : "Search projects, stories, or skills"}
              />
              <kbd>↵</kbd>
            </label>
            <div className="search-results" role="listbox" aria-label="Search results">
              {query.trim() ? (
                results.length ? (
                  results.slice(0, 8).map((item) => {
                    const isStory = "url" in item;
                    const href = isStory ? item.url : itemHref(item);
                    const title = item.title;
                    const summary = item.summary;
                    return isStory ? (
                      <a
                        className="search-result"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        key={item.slug}
                        onMouseEnter={() => onHover(item.slug)}
                        onMouseLeave={() => onHover(null)}
                      >
                        <span className="search-result-icon" aria-hidden="true">↗</span>
                        <span><strong>{title}</strong><small>{summary}</small></span>
                      </a>
                    ) : (
                      <Link
                        className="search-result"
                        href={href}
                        key={item.slug}
                        onClick={onClose}
                        onMouseEnter={() => onHover(item.slug)}
                        onMouseLeave={() => onHover(null)}
                        onFocus={() => onHover(item.slug)}
                        onBlur={() => onHover(null)}
                      >
                        <span className="search-result-icon" aria-hidden="true">⌕</span>
                        <span><strong>{title}</strong><small>{summary}</small></span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="search-empty">{bangla ? "পাতা পাওয়া যায়নি। অন্য শব্দ চেষ্টা করুন।" : "No leaves found. Try another word."}</p>
                )
              ) : (
                <p className="search-empty">
                  {bangla ? "নাম, প্রকল্প, পুরস্কার, লেখা বা “জীবনবৃত্তান্ত” লিখুন।" : "Try a name, project, award, article, or “résumé”."}
                </p>
              )}
            </div>
            <div className="search-hint">
              <kbd>Ctrl</kbd><kbd>K</kbd> {bangla ? "খুলতে" : "to open"} <span>·</span>
              {bangla ? "উচ্চারণচিহ্ন উপেক্ষা করে খোঁজ" : "Accent-insensitive search"}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BranchPanel({
  branch,
  items,
  bangla,
  onClose,
  onHover,
  highlightedSlug,
  projectFilter,
  onProjectFilter,
}: {
  branch: BranchId;
  items: PortfolioItem[];
  bangla: boolean;
  onClose: () => void;
  onHover: (slug: string | null) => void;
  highlightedSlug: string | null;
  projectFilter: string;
  onProjectFilter: (value: string) => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const branchInfo = branches.find((entry) => entry.id === branch);
  const [kindFilter, setKindFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const kinds = [...new Set(items.map((item) => item.kind))];
  const years = [...new Set(items.map((item) => item.year).filter((year): year is number => year !== null))]
    .sort((a, b) => b - a);
  const categories = [...new Set(items.flatMap((item) => ("category" in item ? [item.category] : [])))].sort();
  const filteredItems = items.filter((item) =>
    (kindFilter === "all" || item.kind === kindFilter) &&
    (yearFilter === "all" || String(item.year) === yearFilter) &&
    (categoryFilter === "all" || ("category" in item && item.category === categoryFilter)) &&
    (branch !== "projects" || !projectFilter.trim() ||
      normalizeText(`${item.title} ${item.summary} ${"category" in item ? item.category : ""}`).includes(normalizeText(projectFilter.trim()))),
  );

  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>(".panel-close")?.focus();
  }, []);

  function trapFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const controls = [...(panelRef.current?.querySelectorAll<HTMLElement>(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter((element) => {
      const style = window.getComputedStyle(element);
      return !element.matches(":disabled") && element.getClientRects().length > 0 &&
        style.visibility !== "hidden" && style.display !== "none";
    });
    if (!controls.length) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <AnimatePresence>
      <motion.button
        key="branch-panel-scrim"
        className="panel-scrim"
        type="button"
        aria-label={bangla ? "শাখার বিবরণ বন্ধ করুন" : "Close branch details"}
        tabIndex={-1}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.aside
        key="branch-panel-content"
        ref={panelRef}
        id="branch-panel"
        className="branch-panel"
        data-branch={branch}
        role="dialog"
        aria-modal="true"
        aria-label={`${bangla ? branchInfo?.bangla : branchInfo?.label ?? branch} branch items`}
        onKeyDown={trapFocus}
        initial={{ opacity: 0, x: 28, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 22, y: 0 }}
        transition={{ type: "spring", stiffness: 310, damping: 30 }}
      >
        <div className="branch-panel-head">
          <div className="panel-topline">
            <span><i /> {filteredItems.length} {bangla ? "টি পাতা" : "growing things"}</span>
            <button className="icon-button panel-close" type="button" onClick={onClose} aria-label={bangla ? "শাখা বন্ধ করুন" : "Close branch panel"}>
              ×
            </button>
          </div>
          <div className="panel-heading">
            <span className="eyebrow-kicker">{branchInfo?.short}</span>
            <h2>{bangla ? branchInfo?.bangla : branchInfo?.label}</h2>
            <p>{branchInfo?.description}</p>
          </div>
          {branch === "projects" && (
            <label className="branch-filter">
              <span className="visually-hidden">{bangla ? "শিরোনাম, বিবরণ বা বিভাগ দিয়ে প্রকল্প বাছুন" : "Filter projects by title, description, or category"}</span>
              <span aria-hidden="true">⌕</span>
              <input
                value={projectFilter}
                onChange={(event) => onProjectFilter(event.currentTarget.value)}
                placeholder={bangla ? "প্রকল্প বাছুন…" : "Filter projects…"}
              />
            </label>
          )}
          <div className="gallery-filters" role="group" aria-label="Filter gallery items">
            <label>
              <span className="visually-hidden">Type</span>
              <select value={kindFilter} onChange={(event) => setKindFilter(event.currentTarget.value)}>
                <option value="all">All types</option>
                {kinds.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
              </select>
            </label>
            <label>
              <span className="visually-hidden">Year</span>
              <select value={yearFilter} onChange={(event) => setYearFilter(event.currentTarget.value)}>
                <option value="all">All years</option>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </label>
            {categories.length > 0 && (
              <label>
                <span className="visually-hidden">Category</span>
                <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.currentTarget.value)}>
                  <option value="all">All categories</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
            )}
          </div>
        </div>
        <div className="panel-items">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <ItemCard
                item={item}
                key={item.slug}
                highlighted={item.slug === highlightedSlug}
                onHover={onHover}
              />
            ))
          ) : (
            <p className="panel-empty">
              {bangla ? "এই বলয়ের জন্য শাখায় তারিখযুক্ত কোনো পাতা নেই।" : "No dated items on this branch for the selected ring."}
            </p>
          )}
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}

function PlainList({
  writings,
  onOpenBranch,
  onReturnToTree,
}: {
  writings: Writing[];
  onOpenBranch: (branch: BranchId) => void;
  onReturnToTree: () => void;
}) {
  return (
    <section className="plain-list" aria-label="Portfolio list view">
      <div className="list-view-intro">
        <span className="eyebrow-kicker">A quiet walk through the orchard</span>
        <h2>The whole tree, <em>in plain words.</em></h2>
        <p>Every branch, every leaf. Choose a story to open its detail page.</p>
        <button className="list-view-return" type="button" onClick={onReturnToTree}>
          Return to the illustrated tree <span aria-hidden="true">↗</span>
        </button>
      </div>
      {branches.map((branch) => (
        <section className="list-section" key={branch.id} aria-labelledby={`list-${branch.id}`}>
          <div className="list-section-heading">
            <div>
              <span className="eyebrow-kicker">{branch.short}</span>
              <h3 id={`list-${branch.id}`}>{branch.label}</h3>
            </div>
            <button className="text-action" type="button" onClick={() => onOpenBranch(branch.id)}>
              Explore branch <span aria-hidden="true">↗</span>
            </button>
          </div>
          <div className="plain-list-grid">
            {getItemsForBranch(branch.id, writings).map((item) => (
              <ItemCard item={item} key={item.slug} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

function FreshGarden({
  writings,
  repositories,
}: {
  writings: Writing[];
  repositories: FreshRepository[];
}) {
  const recentWritings = [...writings]
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 3);

  return (
    <section className="fresh-garden" aria-labelledby="fresh-title">
      <div className="fresh-heading">
        <div>
          <span className="section-eyebrow"><span /> New growth</span>
          <h2 id="fresh-title">What&apos;s growing <em>now.</em></h2>
        </div>
        <p>Fresh notes and recent open-source work, gathered at build time.</p>
      </div>
      <div className="fresh-columns">
        <div className="fresh-column">
          <h3><span className="fresh-bud" /> Latest writing</h3>
          {recentWritings.map((item) => (
            <Link className="fresh-row" href={itemHref(item)} key={item.slug}>
              <span className="fresh-date">{item.publishedAt.slice(0, 7)}</span>
              <span><strong>{item.title}</strong><small>{item.summary}</small></span>
              <span aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
        <div className="fresh-column">
          <h3><span className="fresh-bud fresh-bud-gold" /> Recent repositories</h3>
          {repositories.slice(0, 6).map((repo) => (
            <a className="fresh-row" href={repo.url} target="_blank" rel="noreferrer" key={repo.url}>
              <span className="fresh-date">{repo.language ?? "GitHub"}</span>
              <span>
                <strong>{repo.name}</strong>
                <small>{repo.description || "Open-source work on GitHub."}</small>
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export interface MangoExperienceProps {
  writings: Writing[];
  repositories: FreshRepository[];
  initialBranch?: BranchId | "contact";
  initialFocus?: string;
  children?: ReactNode;
}

export default function MangoExperience({
  writings,
  repositories,
  initialBranch,
  initialFocus,
  children,
}: MangoExperienceProps) {
  const locationSearch = useSyncExternalStore(
    subscribeSearchParams,
    getSearchParamsSnapshot,
    getServerSearchParamsSnapshot,
  );
  const queryParams = useMemo(() => new URLSearchParams(locationSearch), [locationSearch]);
  const automaticSeason = useSyncExternalStore(
    subscribeDhakaClock,
    getDhakaSeason,
    getServerSeasonSnapshot,
  );
  const automaticNight = useSyncExternalStore(
    subscribeDhakaClock,
    getDhakaNight,
    getServerBooleanSnapshot,
  );
  const prefersReducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getServerBooleanSnapshot,
  );
  const requestedSeason = queryParams.get("season")?.toLowerCase();
  const seasonOverride = seasons.find((entry) => entry.name.toLowerCase() === requestedSeason)?.name ?? null;
  const requestedTime = queryParams.get("time");
  const nightOverride = requestedTime === "day" ? false : requestedTime === "night" ? true : null;
  const season = seasonOverride ?? automaticSeason;
  const night = nightOverride ?? automaticNight;
  const [bangla, setBangla] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchId | null>(
    initialBranch && initialBranch !== "contact" ? initialBranch : null,
  );
  const [focusedSlug, setFocusedSlug] = useState<string | null>(initialFocus ?? null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(2016);
  const storedListView = useSyncExternalStore(
    subscribeListView,
    getListViewSnapshot,
    getServerBooleanSnapshot,
  );
  const [listModeOverride, setListModeOverride] = useState<boolean | null>(null);
  const listView = listModeOverride ?? (initialBranch || initialFocus ? false : storedListView);
  const [growthSkipped, setGrowthSkipped] = useState(true);
  const growthYear = 2016;
  const growthComplete = growthSkipped || prefersReducedMotion;
  const activeYear = growthSkipped || prefersReducedMotion ? null : selectedYear;
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [tourPaused, setTourPaused] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [activeSection, setActiveSection] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const showHome = !initialBranch && !initialFocus;
  const treeStageRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const aboutDialogRef = useRef<HTMLElement>(null);
  const tourPauseButtonRef = useRef<HTMLButtonElement>(null);
  const tourStartTimeoutRef = useRef<number | null>(null);
  const focusTourPauseOnStartRef = useRef(false);
  const stopTour = useCallback(() => {
    if (tourStartTimeoutRef.current !== null) {
      window.clearTimeout(tourStartTimeoutRef.current);
      tourStartTimeoutRef.current = null;
    }
    focusTourPauseOnStartRef.current = false;
    setTourIndex(null);
    setTourPaused(false);
  }, []);
  const openSearch = useCallback(() => {
    stopTour();
    setMobileMenuOpen(false);
    setSearchOpen(true);
  }, [stopTour]);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const allItems = useMemo(() => getTreeItems(writings), [writings]);
  const visibleItems = useMemo(
    () => allItems.filter((item) => activeYear === null || item.year === null || item.year <= activeYear),
    [activeYear, allItems],
  );
  const searchableItems = useMemo(() => [...allItems, ...mediaCoverage], [allItems]);
  const normalizedQuery = normalizeText(searchQuery.trim());
  const matchedSearchResults = useMemo(
    () =>
      normalizedQuery
        ? searchableItems.filter((item) =>
            normalizeText(`${item.title} ${item.summary}`).includes(normalizedQuery),
          )
        : [],
    [normalizedQuery, searchableItems],
  );
  const branchCounts = useMemo(() => {
    const counts = Object.fromEntries(branches.map((branch) => [branch.id, 0])) as Record<BranchId, number>;
    for (const item of allItems) counts[item.branch] += 1;
    return counts;
  }, [allItems]);
  const highlightedBranches = useMemo(
    () => new Set(matchedSearchResults.map((item) => item.branch)),
    [matchedSearchResults],
  );
  const freshBuds = useMemo(
    () => [
      ...[...writings]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 3)
        .map((item) => ({ title: item.title, href: itemHref(item), year: item.year })),
      ...repositories.slice(0, 6).map((repository) => ({
        title: repository.name,
        href: repository.url,
        external: true,
        year: Number.parseInt(repository.updatedAt.slice(0, 4), 10) || null,
      })),
    ],
    [repositories, writings],
  );
  const focusedItem = visibleItems.find((item) => item.slug === (hoveredSlug ?? focusedSlug));
  const initialFocusedItem = visibleItems.find((item) => item.slug === initialFocus);
  const currentTourStop = tourIndex === null ? null : tourStops[tourIndex];
  const branchItems = selectedBranch
    ? visibleItems.filter((item) => {
        if (item.branch !== selectedBranch) return false;
        if (selectedBranch !== "projects" || !projectFilter.trim()) return true;
        const project = projects.find((entry) => entry.slug === item.slug);
        return normalizeText(`${item.title} ${item.summary} ${project?.category ?? ""}`).includes(
          normalizeText(projectFilter.trim()),
        );
      })
    : [];

  useEffect(() => {
    if (!mobileMenuOpen && !aboutOpen) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    (mobileMenuOpen ? mobileMenuRef : aboutDialogRef).current?.querySelector<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled])',
    )?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [aboutOpen, mobileMenuOpen]);

  useEffect(() => {
    if (initialBranch === "contact") {
      window.setTimeout(() => document.getElementById("roots")?.scrollIntoView({ behavior: "smooth" }), 250);
    }
  }, [initialBranch]);

  useEffect(() => {
    const updateHeader = () => {
      setScrolled(window.scrollY > 60);
      let current = "home";
      for (const id of ["featured", "journey", "writing", "education", "moments", "roots"]) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top < window.innerHeight * 0.45) current = id;
      }
      setActiveSection(current === "roots" ? "contact" : current);
    };
    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    if (!initialFocus) return;
    const frame = window.requestAnimationFrame(() => {
      const detail = document.querySelector<HTMLElement>("#item-detail");
      if (!detail) return;
      detail.focus({ preventScroll: true });
      detail.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [initialFocus, prefersReducedMotion]);

  useEffect(() => {
    if (tourIndex === null || !focusTourPauseOnStartRef.current) return;
    focusTourPauseOnStartRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      tourPauseButtonRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [tourIndex]);

  useEffect(() => {
    if (tourIndex === null) return;
    const branch = tourStops[tourIndex]?.branch;
    if (!branch) return;
    const frame = window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(`.crown-cluster[data-branch="${branch}"] .crown-hit`)
        ?.scrollIntoView({
          block: "nearest",
          behavior: prefersReducedMotion ? "instant" : "smooth",
        });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [prefersReducedMotion, tourIndex]);

  useEffect(() => {
    if (tourIndex === null || tourPaused) return;
    const timeout = window.setTimeout(() => {
      if (tourIndex >= tourStops.length - 1) {
        stopTour();
      } else {
        setTourIndex(tourIndex + 1);
      }
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [stopTour, tourIndex, tourPaused]);

  useEffect(() => () => {
    if (tourStartTimeoutRef.current !== null) {
      window.clearTimeout(tourStartTimeoutRef.current);
    }
  }, []);

  function nextTourStop() {
    if (tourIndex === null || tourIndex >= tourStops.length - 1) {
      stopTour();
      return;
    }
    setTourIndex(tourIndex + 1);
    setTourPaused(false);
  }

  function goToTree() {
    stopTour();
    setMobileMenuOpen(false);
    setSelectedBranch(null);
    setActiveSection("home");
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "instant" : "smooth" });
  }

  function goToSection(id: string) {
    if (id === "roots" || id === "contact") {
      goToContact();
      return;
    }
    stopTour();
    setMobileMenuOpen(false);
    setSelectedBranch(null);
    const section = document.getElementById(id);
    if (!section) {
      router.push(`/#${id}`);
      return;
    }
    setActiveSection(id);
    section.scrollIntoView({ behavior: prefersReducedMotion ? "instant" : "smooth", block: "start" });
  }

  function goToContact() {
    stopTour();
    setMobileMenuOpen(false);
    setSelectedBranch(null);
    setActiveSection("contact");
    document.getElementById("roots")?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "start",
    });
  }

  function openAbout() {
    stopTour();
    setMobileMenuOpen(false);
    setSelectedBranch(null);
    setAboutOpen(true);
  }

  function openMenu() {
    stopTour();
    setMobileMenuOpen(true);
  }

  function closeMenu() {
    setMobileMenuOpen(false);
    window.requestAnimationFrame(() => menuTriggerRef.current?.focus());
  }

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
      if (event.key === "Escape") {
        if (searchOpen) {
          setSearchOpen(false);
        } else if (aboutOpen) {
          setAboutOpen(false);
        } else if (mobileMenuOpen) {
          closeMenu();
        } else if (selectedBranch) {
          setSelectedBranch(null);
          restoreFocusRef.current?.focus();
        } else if (
          tourIndex !== null ||
          tourStartTimeoutRef.current !== null ||
          focusTourPauseOnStartRef.current
        ) {
          stopTour();
        }
      }
      if (!event.metaKey && !event.ctrlKey && !event.altKey && event.key.length === 1) {
        window.__mangoSequence = `${window.__mangoSequence ?? ""}${event.key.toLowerCase()}`.slice(-6);
        if (window.__mangoSequence === "ojogor") {
          setBangla((current) => !current);
          setToast("বাংলা labels toggled · UI labels changed");
          window.setTimeout(() => setToast(""), 2800);
        }
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [aboutOpen, mobileMenuOpen, openSearch, searchOpen, selectedBranch, stopTour, tourIndex]);

  function openBranch(branch: BranchId) {
    stopTour();
    setMobileMenuOpen(false);
    setListModeOverride(false);
    saveListView(false);
    setSearchOpen(false);
    restoreFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFocusedSlug(null);
    setHoveredSlug(null);
    setSelectedBranch(branch);
  }

  function closeBranch() {
    setSelectedBranch(null);
    restoreFocusRef.current?.focus();
  }

  function toggleListView() {
    setSelectedBranch(null);
    setMobileMenuOpen(false);
    const next = !listView;
    setListModeOverride(next);
    stopTour();
    saveListView(next);
  }

  function startTour() {
    setSearchOpen(false);
    setListModeOverride(false);
    saveListView(false);
    setFocusedSlug(null);
    setHoveredSlug(null);
    setSelectedBranch(null);
    setSelectedYear(null);
    setGrowthSkipped(true);
    setTourPaused(false);
    if (tourStartTimeoutRef.current !== null) {
      window.clearTimeout(tourStartTimeoutRef.current);
    }
    focusTourPauseOnStartRef.current = true;
    treeStageRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "instant" : "smooth",
      block: "center",
    });
    tourStartTimeoutRef.current = window.setTimeout(() => {
      tourStartTimeoutRef.current = null;
      setTourIndex(0);
    }, prefersReducedMotion ? 0 : 400);
  }

  async function sharePage() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("This leaf’s link is ready to share.");
    } catch {
      setToast("Copy this page’s address to share this leaf.");
    }
    window.setTimeout(() => setToast(""), 2600);
  }

  const navigateFromWebMcp = useCallback((page: string) => {
    stopTour();
    setSearchOpen(false);
    const sectionBranches: Record<string, BranchId> = {
      projects: "projects",
      awards: "awards",
      communities: "communities",
      research: "research",
      writing: "writing",
      writings: "writing",
      experience: "experience",
      resume: "experience",
      recognition: "awards",
    };
    const branch = sectionBranches[page];
    if (branch) {
      setListModeOverride(false);
      saveListView(false);
      setFocusedSlug(null);
      setHoveredSlug(null);
      setSelectedBranch(branch);
    } else if (page === "contact") {
      setFocusedSlug(null);
      setHoveredSlug(null);
      setSelectedBranch(null);
      document.getElementById("roots")?.scrollIntoView({ behavior: "smooth" });
    } else {
      setListModeOverride(false);
      saveListView(false);
      setFocusedSlug(null);
      setHoveredSlug(null);
      setSelectedBranch(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stopTour]);

  const filterProjectsFromWebMcp = useCallback((filter: string) => {
    stopTour();
    setSearchOpen(false);
    setListModeOverride(false);
    saveListView(false);
    setFocusedSlug(null);
    setHoveredSlug(null);
    setSelectedBranch("projects");
    setProjectFilter(filter.toLowerCase() === "all" ? "" : filter);
  }, [stopTour]);

  const prefillContactFromWebMcp = useCallback(
    (values: { fullname: string; email: string; message: string }) => {
      stopTour();
        setSearchOpen(false);
      setFocusedSlug(null);
      setHoveredSlug(null);
      setSelectedBranch(null);
      document.getElementById("roots")?.scrollIntoView({ behavior: "smooth" });
      window.setTimeout(() => {
        const form = document.querySelector<HTMLFormElement>(".seed-form");
        if (!form) return;
        for (const [name, value] of Object.entries(values)) {
          const field = form.elements.namedItem(name);
          if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
            field.value = value;
            field.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        (form.elements.namedItem("message") as HTMLTextAreaElement | null)?.focus();
      }, 650);
    },
    [stopTour],
  );

  useEffect(
    () =>
      setWebMcpHandlers({
        onNavigate: navigateFromWebMcp,
        onFilterProjects: filterProjectsFromWebMcp,
        onPrefillContact: prefillContactFromWebMcp,
      }),
    [filterProjectsFromWebMcp, navigateFromWebMcp, prefillContactFromWebMcp],
  );

  const headerLinks: { id: string; label: string; branch?: BranchId }[] = [
    { id: "home", label: "Home" },
    { id: "featured", label: "Work" },
    { id: "journey", label: "Journey" },
    { id: "writing", label: "Writing" },
    { id: "education", label: "Education" },
    { id: "awards", label: "Awards", branch: "awards" },
    { id: "contact", label: "Contact" },
  ];

  const branchButtons = branches.map((branch) => {
    const count = visibleItems.filter((item) => item.branch === branch.id).length;
    const isDimmed = activeYear !== null && count === 0;
    const label = crownLayout[branch.id].label;
    return (
      <button
        key={branch.id}
        className={`branch-label branch-${branch.id}${selectedBranch === branch.id ? " branch-selected" : ""}${
          highlightedBranches.has(branch.id) ? " branch-search-hit" : ""
        }${isDimmed ? " branch-dimmed" : ""}`}
        style={{
          left: `${(desktopTreeX(label.x) / 1600) * 100}%`,
          top: `${(label.y / 1040) * 100}%`,
        }}
        type="button"
        aria-expanded={selectedBranch === branch.id}
        aria-controls="branch-panel"
        onClick={() => openBranch(branch.id)}
      >
        <span className="branch-label-name">{bangla ? branch.bangla : branch.label}</span>
        <span className="branch-label-count">{count}</span>
      </button>
    );
  });

  return (
    <MotionConfig reducedMotion="user">
    <div
      className={`portfolio-page${growthComplete ? " growth-complete" : " growth-playing"}${listView ? " list-view-mode" : ""}${tourIndex !== null ? " touring" : ""}`}
      id="top"
      onClickCapture={(event) => {
        if (event.target instanceof Element && event.target.closest("a[href]")) {
                if (tourIndex !== null) stopTour();
        }
      }}
    >
      <header className={`site-header${scrolled ? " header-condensed" : ""}`}>
        <Link className="brand" href="/" onClick={goToTree} aria-label="Ratul Hasan Ruhan — home">
          <span className="brand-avatar"><Image src={profile.portrait} alt="" width={40} height={40} priority /></span>
          <span className="brand-copy"><strong>Ratul Hasan Ruhan</strong><small>{profile.title} · Dhaka</small></span>
        </Link>
        <nav className="header-links" aria-label="Site navigation">
          {headerLinks.map((link) => {
            const active = link.branch ? selectedBranch === link.branch : !selectedBranch && activeSection === link.id;
            return (
              <button
                key={link.id}
                className={active ? "nav-active" : ""}
                aria-current={active ? "location" : undefined}
                type="button"
                onClick={() => (link.branch ? openBranch(link.branch) : link.id === "home" ? goToTree() : goToSection(link.id))}
              >
                {link.label}
              </button>
            );
          })}
        </nav>
        <div className="header-actions">
          <button
            className="search-trigger"
            type="button"
            onClick={openSearch}
            aria-label={bangla ? "পোর্টফোলিও খুঁজুন" : "Search portfolio"}
          >
            <span aria-hidden="true">⌕</span><span>{bangla ? "খুঁজুন" : "Search"}</span><kbd>⌘K</kbd>
          </button>
          <a className="header-resume" href={profile.resume} download>Résumé</a>
          <Link className="header-language" href="/bn/" aria-label="View Bangla portfolio">EN / বাং</Link>
        </div>
      </header>

      <main>
        {showHome && (
          <>
            <HomeHero
              branchCounts={branchCounts}
              yearsBuilding={currentYear - 2016}
              night={night}
              season={season}
              bangla={bangla}
              onSelectBranch={openBranch}
              onToggleListView={toggleListView}
              onAbout={openAbout}
              onJump={goToSection}
            />
            <FeaturedWork />
            <HomeJourney onContact={goToContact} />
            <WritingShelf writings={writings} onOpenAll={() => openBranch("writing")} />
            <EducationSection />
            <MomentsGallery />
            <SkillMarquee />
          </>
        )}

        {!showHome && (
          <>
            <section
              id="orchard"
              className="orchard-hero"
              aria-labelledby="hero-title"
            >
              <div className="hero-copy">
                <div className="hero-overline"><span className="overline-line" /> A living portfolio · Bangladesh</div>
                <h1 id="hero-title">A life in full <em>bloom.</em></h1>
                <p className="hero-deck">
                  I&apos;m Ratul — a software engineer and systems researcher. My work grows across projects,
                  people, ideas, and time.
                </p>
                <div className="hero-note">
                  <span className="note-spark" aria-hidden="true">✳</span>
                  <span>Bangladesh&apos;s national tree is the mango. <strong>So this is my kind of family tree.</strong></span>
                </div>
              </div>

              <div className="tree-stage" ref={treeStageRef}>
                {!listView && (
                  <>
                    <WeatherCanvas season={season} night={night} />
                    <TreeScene
                      season={season}
                      night={night}
                      selectedYear={activeYear}
                      focusBranch={currentTourStop?.branch ?? selectedBranch ?? initialFocusedItem?.branch}
                      expandedBranch={selectedBranch}
                      focusedSlug={focusedItem?.slug ?? null}
                      highlightedBranches={highlightedBranches}
                      writings={writings}
                      freshBuds={freshBuds}
                      onSelectBranch={openBranch}
                      onItemHover={setHoveredSlug}
                    />
                    {focusedItem && selectedBranch && (
                      <svg className="relationship-threads" viewBox="0 0 1600 1040" aria-hidden="true">
                        <defs>
                          <filter id="thread-glow">
                            <feGaussianBlur stdDeviation="5" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                          </filter>
                        </defs>
                        <g transform={`matrix(1.12 0 0 1.12 ${Math.round(desktopTreeX(crownLayout[selectedBranch].cx) * -0.12)} ${Math.round(crownLayout[selectedBranch].cy * -0.12)})`}>
                          {focusedItem.relatedSlugs?.map((slug) => {
                            const target = allItems.find((item) => item.slug === slug);
                            const sourcePosition = crownLayout[focusedItem.branch];
                            const targetPosition = target ? crownLayout[target.branch] : crownLayout.awards;
                            return (
                              <path
                                key={slug}
                                d={`M${desktopTreeX(sourcePosition.cx)} ${sourcePosition.cy} Q${desktopTreeX(800)} 520 ${desktopTreeX(targetPosition.cx)} ${targetPosition.cy}`}
                              />
                            );
                          })}
                        </g>
                      </svg>
                    )}
                  </>
                )}

                {!listView && (
                  <button className="trunk-portrait" type="button" onClick={openAbout} aria-label="About Ratul Hasan Ruhan">
                    <Image src={profile.portrait} alt="" width={92} height={92} priority />
                    <span className="portrait-open-label">About</span>
                  </button>
                )}

                <div className="scene-caption scene-caption-right">
                  <span>Dhaka, Bangladesh</span><span className="compass">N</span>
                </div>

                {!listView && (
                  <div className="desktop-branch-labels" role="group" aria-label="Explore the six tree branches">
                    {branchButtons}
                  </div>
                )}

                {!listView && (
                  <output className="growth-year-counter" aria-live="polite">
                    {growthComplete ? `Since 2016 · ${allItems.length} things grown` : growthYear}
                  </output>
                )}

                {!listView && (
                  <div className="growth-intro" aria-hidden={growthComplete}>
                    <span className="growth-seed" />
                    <span className="growth-intro-copy">A little growth first…</span>
                    {!growthComplete && (
                      <button type="button" onClick={() => {
                        setSelectedYear(null);
                        setGrowthSkipped(true);
                      }}>Skip</button>
                    )}
                  </div>
                )}

              </div>

              {!listView && (
                <div className="tree-control-dock">
                  <div className="tour-actions">
                    <div className="tour-buttons">
                      <button className="tour-start" type="button" onClick={startTour}>
                        {bangla ? "৩০ সেকেন্ডের ভ্রমণ" : "Take the 30-second tour"} <span aria-hidden="true">→</span>
                      </button>
                    </div>
                    <button className="share-leaf" type="button" onClick={sharePage}>
                      {bangla ? "শেয়ার" : "Share"} <span aria-hidden="true">↗</span>
                    </button>
                  </div>
                </div>
              )}

              {!listView && (
                <div className="mobile-branch-grid" role="group" aria-label="Explore the six tree branches">
                  {branches.map((branch) => (
                    <button
                      className={`mobile-branch mobile-branch-${branch.id}${
                        highlightedBranches.has(branch.id) ? " branch-search-hit" : ""
                      }`}
                      type="button"
                      key={branch.id}
                      aria-expanded={selectedBranch === branch.id}
                      onClick={() => openBranch(branch.id)}
                    >
                      <span className="mobile-branch-mark" aria-hidden="true" />
                      <span>{bangla ? branch.bangla : branch.label}</span>
                      <small>
                        {visibleItems.filter((item) => item.branch === branch.id).length} {bangla ? "টি পাতা" : "leaves"}
                      </small>
                    </button>
                  ))}
                </div>
              )}

              {currentTourStop && (
                <motion.div
                  className="tour-caption"
                  role="group"
                  aria-label={bangla ? "নির্দেশিত ভ্রমণ" : "Guided tour"}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.span
                    className="tour-caption-step"
                    key={`step-${currentTourStop.branch}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    0{(tourIndex ?? 0) + 1} / 06
                  </motion.span>
                  <motion.div
                    className="tour-caption-copy"
                    key={`copy-${currentTourStop.branch}`}
                    aria-live="polite"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <strong>{currentTourStop.caption}</strong><p>{currentTourStop.subcaption}</p>
                  </motion.div>
                  {tourPaused && <span className="tour-paused">{bangla ? "বিরতি" : "Paused"}</span>}
                  <div className="tour-caption-controls" key="tour-controls">
                    <button
                      type="button"
                      ref={tourPauseButtonRef}
                      aria-label={tourPaused ? "Resume tour" : "Pause tour"}
                      onClick={() => setTourPaused((current) => !current)}
                    >
                      {tourPaused ? (bangla ? "চালু" : "Resume") : (bangla ? "বিরতি" : "Pause")}
                    </button>
                    <button type="button" onClick={nextTourStop}>{bangla ? "পরবর্তী" : "Next"}</button>
                    <button type="button" onClick={stopTour}>{bangla ? "শেষ" : "Exit"}</button>
                  </div>
                </motion.div>
              )}
            </section>

            <section className="tree-guide" aria-label="How to explore the tree">
              <p><span className="guide-icon" aria-hidden="true">↗</span> Choose a branch to explore each collection.</p>
              <p><span className="guide-icon" aria-hidden="true">⌕</span> Search by title or story, even without accents.</p>
              <p><span className="guide-icon" aria-hidden="true">◉</span> Watch the rings trace each year of the tree.</p>
            </section>
          </>
        )}

        {children}

        {listView ? (
          <PlainList writings={writings} onOpenBranch={openBranch} onReturnToTree={toggleListView} />
        ) : (
          !showHome && <FreshGarden writings={writings} repositories={repositories} />
        )}

        <ContactSoil bangla={bangla} compact={showHome} />
      </main>

      {selectedBranch && !listView && (
        <BranchPanel
          key={selectedBranch}
          branch={selectedBranch}
          items={branchItems}
          bangla={bangla}
          onClose={closeBranch}
          onHover={setHoveredSlug}
          highlightedSlug={focusedItem?.slug ?? null}
          projectFilter={projectFilter}
          onProjectFilter={setProjectFilter}
        />
      )}

      <SearchOverlay
        open={searchOpen}
        query={searchQuery}
        setQuery={setSearchQuery}
        results={matchedSearchResults}
        onClose={() => setSearchOpen(false)}
        onHover={setHoveredSlug}
        bangla={bangla}
      />

      <nav className="mobile-tabbar" aria-label="Primary navigation">
        <button className={!selectedBranch && activeSection === "home" ? "tab-active" : ""} aria-current={!selectedBranch && activeSection === "home" ? "page" : undefined} type="button" onClick={goToTree}>
          <House size={19} aria-hidden="true" /><span>Home</span>
        </button>
        <button className={!selectedBranch && activeSection === "featured" ? "tab-active" : ""} aria-current={!selectedBranch && activeSection === "featured" ? "location" : undefined} type="button" onClick={() => goToSection("featured")}>
          <FolderKanban size={19} aria-hidden="true" /><span>Work</span>
        </button>
        <button className={!selectedBranch && activeSection === "journey" ? "tab-active" : ""} aria-current={!selectedBranch && activeSection === "journey" ? "location" : undefined} type="button" onClick={() => goToSection("journey")}>
          <Signpost size={19} aria-hidden="true" /><span>Journey</span>
        </button>
        <button className={!selectedBranch && activeSection === "writing" ? "tab-active" : ""} aria-current={!selectedBranch && activeSection === "writing" ? "location" : undefined} type="button" onClick={() => goToSection("writing")}>
          <PenLine size={19} aria-hidden="true" /><span>Writing</span>
        </button>
        <button
          ref={menuTriggerRef}
          aria-expanded={mobileMenuOpen}
          aria-controls="menu-sheet"
          type="button"
          onClick={openMenu}
        >
          <MenuIcon size={19} aria-hidden="true" /><span>Menu</span>
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeMenu();
            }}
          >
            <motion.section
              ref={mobileMenuRef}
              id="menu-sheet"
              className="mobile-menu-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="menu-sheet-title"
              onKeyDown={(event) => trapDialogFocus(event, mobileMenuRef.current)}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
            >
              <div className="menu-sheet-top">
                <div>
                  <span className="eyebrow-kicker">The orchard</span>
                  <h2 id="menu-sheet-title">Explore Ratul&apos;s work</h2>
                </div>
                <button className="icon-button" type="button" onClick={closeMenu} aria-label="Close menu">×</button>
              </div>
              <nav className="menu-sheet-links" aria-label="Portfolio sections">
                <button type="button" onClick={goToTree}>Home <span>Start here</span></button>
                <button type="button" onClick={() => goToSection("journey")}>Journey <span>2016 → today</span></button>
                <button type="button" onClick={() => goToSection("featured")}>Best work <span>Highlights</span></button>
                <button type="button" onClick={toggleListView}>{listView ? "Tree view" : "List view"} <span>Browse everything</span></button>
                <button type="button" onClick={() => goToSection("writing")}>Writing <span>Articles & notes</span></button>
                <button type="button" onClick={() => goToSection("education")}>Education <span>Degrees & research</span></button>
                <button type="button" onClick={() => goToSection("moments")}>Moments <span>Events & photos</span></button>
                <button type="button" onClick={() => openBranch("projects")}>All projects <span>Everything I&apos;ve built</span></button>
                <button type="button" onClick={() => openBranch("awards")}>Awards <span>Milestones</span></button>
                <button type="button" onClick={() => openBranch("communities")}>Community <span>People & roles</span></button>
                <button type="button" onClick={goToContact}>Contact <span>Get in touch</span></button>
              </nav>
              <div className="menu-sheet-actions">
                <a className="primary-action" href={profile.resume} download>Download résumé <span aria-hidden="true">↓</span></a>
                <Link className="text-action" href="/bn/">বাংলা portfolio <span aria-hidden="true">↗</span></Link>
              </div>
              <div className="menu-social-links" aria-label="Social profiles">
                {profile.sameAs.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">{profileLinkLabel(url)}</a>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {aboutOpen && (
          <motion.div
            className="about-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setAboutOpen(false);
            }}
          >
            <motion.section
              ref={aboutDialogRef}
              className="about-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="about-title"
              onKeyDown={(event) => trapDialogFocus(event, aboutDialogRef.current)}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
            >
              <button className="icon-button about-close" type="button" onClick={() => setAboutOpen(false)} aria-label="Close About card">×</button>
              <Image className="about-portrait" src={profile.portrait} alt="Ratul Hasan Ruhan" width={104} height={104} />
              <span className="eyebrow-kicker">About Ratul</span>
              <h2 id="about-title">{profile.name}</h2>
              <p className="about-role">{profile.title}</p>
              <p>{profile.description}</p>
              <p className="about-location">{profile.location}</p>
              <a className="primary-action" href={profile.resume} download>Download résumé <span aria-hidden="true">↓</span></a>
              <div className="menu-social-links" aria-label="Social profiles">
                {profile.sameAs.map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer">{profileLinkLabel(url)}</a>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      {toast && <motion.div className="toast-message" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{toast}</motion.div>}

      <button
        className="floating-search"
        type="button"
        onClick={openSearch}
        aria-label={bangla ? "গাছ খুঁজুন" : "Search portfolio"}
      >
        <span aria-hidden="true">⌕</span><span>{bangla ? "গাছ খুঁজুন" : "Search the tree"}</span>
      </button>

    </div>
    </MotionConfig>
  );
}

declare global {
  interface Window {
    __mangoSequence?: string;
  }
}

export const itemCollections = {
  awards,
  communities,
  experience,
  projects,
  researchItems,
  resumeLeaf,
};
