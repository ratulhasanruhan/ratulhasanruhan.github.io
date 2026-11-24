"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
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
import TreeScene, { crownLayout, DESKTOP_TREE_OFFSET_X, DESKTOP_TREE_SCALE_X } from "@/components/TreeScene";
import WeatherCanvas from "@/components/WeatherCanvas";
import WebMcp from "@/components/WebMcp";
import {
  awards,
  branches,
  communities,
  experience,
  getItemsForBranch,
  getTreeItems,
  mediaCoverage,
  profile,
  projects,
  researchItems,
  resumeLeaf,
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
    subcaption: "Twenty-nine projects, from Ojogor to tools and systems.",
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

function itemHref(item: PortfolioItem) {
  return `/${item.branch}/${item.slug}/`;
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
      </span>
      <span className="item-card-copy">
        <span className="item-card-eyebrow">
          {item.year ?? "Living work"}{item.kind === "certification" ? " · Certification" : ""}
        </span>
        <strong>{item.title}</strong>
        <span className="item-card-summary">{item.summary}</span>
      </span>
      <span className="item-card-arrow" aria-hidden="true">↗</span>
    </Link>
  );
}

function GrowthDial({
  years,
  selectedYear,
  onChange,
  onReset,
  bangla,
}: {
  years: number[];
  selectedYear: number | null;
  onChange: (year: number) => void;
  onReset: () => void;
  bangla: boolean;
}) {
  const displayedYear = selectedYear ?? years.at(-1) ?? new Date().getFullYear();

  return (
    <div className="growth-dial growth-dial-compact">
      <div className="rings-graphic" aria-hidden="true">
        <svg viewBox="0 0 104 104">
          {years.map((year, index) => (
            <circle
              key={year}
              className={selectedYear === year ? "ring-selected" : undefined}
              cx="52"
              cy="52"
              r={7 + index * 4.5}
            />
          ))}
          <circle className="ring-heartwood" cx="52" cy="52" r="4" />
        </svg>
      </div>
      <div className="rings-control">
        <div className="rings-label-row">
          <label htmlFor="year-ring">{bangla ? "বৃদ্ধির বলয়" : "Growth rings"}</label>
          <span className="ring-year">
            {selectedYear ? `${bangla ? "পর্যন্ত" : "Through"} ${displayedYear}` : bangla ? "সব বছর" : "All years"}
          </span>
        </div>
        <input
          id="year-ring"
          type="range"
          min={years[0]}
          max={years.at(-1)}
          step="1"
          value={displayedYear}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
          aria-label={bangla ? "বৃদ্ধির বলয়ের বছর নির্বাচন করুন" : "Select the latest growth-ring year to show"}
        />
        <div className="ring-range">
          <span>{years[0]}</span>
          <button type="button" onClick={onReset} aria-label={bangla ? "সব বছর দেখুন" : "Show every year"}>
            {bangla ? "সব বছর" : "All growth"}
          </button>
          <span>{years.at(-1)}</span>
        </div>
      </div>
    </div>
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

  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>(".panel-close")?.focus();
  }, []);

  function trapFocus(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;
    const controls = panelRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex="0"]',
    );
    if (!controls?.length) return;
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
        ref={panelRef}
        id="branch-panel"
        className="branch-panel"
        role="dialog"
        aria-modal="true"
        aria-label={`${bangla ? branchInfo?.bangla : branchInfo?.label ?? branch} branch items`}
        onKeyDown={trapFocus}
        initial={{ opacity: 0, x: 28, y: 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, x: 22, y: 0 }}
        transition={{ type: "spring", stiffness: 310, damping: 30 }}
      >
        <div className="panel-topline">
          <span><i /> {items.length} {bangla ? "টি পাতা" : "growing things"}</span>
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
        <div className="panel-items">
          {items.length ? (
            items.map((item) => (
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
  const [seasonOverride, setSeasonOverride] = useState<string | null>(null);
  const [nightOverride, setNightOverride] = useState<boolean | null>(null);
  const season = seasonOverride ?? automaticSeason;
  const night = nightOverride ?? automaticNight;
  const [bangla, setBangla] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchId | null>(
    initialBranch && initialBranch !== "contact" ? initialBranch : null,
  );
  const [focusedSlug, setFocusedSlug] = useState<string | null>(initialFocus ?? null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const storedListView = useSyncExternalStore(
    subscribeListView,
    getListViewSnapshot,
    getServerBooleanSnapshot,
  );
  const [listModeOverride, setListModeOverride] = useState<boolean | null>(null);
  const listView = listModeOverride ?? (initialBranch ? false : storedListView);
  const [growthSkipped, setGrowthSkipped] = useState(false);
  const growthComplete = growthSkipped || prefersReducedMotion;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [tourPaused, setTourPaused] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const ringYears = useMemo(
    () => Array.from({ length: Math.max(currentYear - 2019 + 1, 1) }, (_, index) => 2019 + index),
    [currentYear],
  );
  const allItems = useMemo(() => getTreeItems(writings), [writings]);
  const visibleItems = useMemo(
    () => allItems.filter((item) => selectedYear === null || item.year === null || item.year <= selectedYear),
    [allItems, selectedYear],
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
  const highlightedBranches = useMemo(
    () => new Set(matchedSearchResults.map((item) => item.branch)),
    [matchedSearchResults],
  );
  const freshBuds = useMemo(
    () => [
      ...[...writings]
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
        .slice(0, 3)
        .map((item) => ({ title: item.title, href: itemHref(item) })),
      ...repositories.slice(0, 6).map((repository) => ({
        title: repository.name,
        href: repository.url,
        external: true,
      })),
    ],
    [repositories, writings],
  );
  const focusedItem = visibleItems.find((item) => item.slug === (hoveredSlug ?? focusedSlug));
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
    if (prefersReducedMotion) return;
    const complete = () => setGrowthSkipped(true);
    const timeout = window.setTimeout(complete, 2500);
    window.addEventListener("pointerdown", complete, { once: true });
    window.addEventListener("keydown", complete, { once: true });
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("pointerdown", complete);
      window.removeEventListener("keydown", complete);
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (initialBranch === "contact") {
      window.setTimeout(() => document.getElementById("roots")?.scrollIntoView({ behavior: "smooth" }), 250);
    }
  }, [initialBranch]);

  useEffect(() => {
    if (tourIndex === null || tourPaused) return;
    const timeout = window.setTimeout(() => {
      if (tourIndex >= tourStops.length - 1) {
        setTourIndex(null);
        setSelectedBranch(null);
      } else {
        const nextIndex = tourIndex + 1;
        setTourIndex(nextIndex);
        setSelectedBranch(tourStops[nextIndex].branch);
      }
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [tourIndex, tourPaused]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === "Escape") {
        if (searchOpen) {
          setSearchOpen(false);
        } else if (selectedBranch) {
          setSelectedBranch(null);
          restoreFocusRef.current?.focus();
        } else if (tourIndex !== null) {
          setTourIndex(null);
          setTourPaused(false);
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
  }, [searchOpen, selectedBranch, tourIndex]);

  function openBranch(branch: BranchId) {
    setListModeOverride(false);
    saveListView(false);
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
    const next = !listView;
    setListModeOverride(next);
    setTourIndex(null);
    setTourPaused(false);
    saveListView(next);
  }

  function startTour() {
    setListModeOverride(false);
    saveListView(false);
    setFocusedSlug(null);
    setHoveredSlug(null);
    setSelectedBranch(tourStops[0].branch);
    setTourIndex(0);
    setTourPaused(false);
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
  }, []);

  const filterProjectsFromWebMcp = useCallback((filter: string) => {
    setListModeOverride(false);
    saveListView(false);
    setFocusedSlug(null);
    setHoveredSlug(null);
    setSelectedBranch("projects");
    setProjectFilter(filter.toLowerCase() === "all" ? "" : filter);
  }, []);

  const prefillContactFromWebMcp = useCallback(
    (values: { fullname: string; email: string; message: string }) => {
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
    [],
  );

  const branchButtons = branches.map((branch) => {
    const count = visibleItems.filter((item) => item.branch === branch.id).length;
    const isDimmed = selectedYear !== null && count === 0;
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

  const seasonLabel = (seasonName: string) =>
    bangla ? seasons.find((entry) => entry.name === seasonName)?.bengali ?? seasonName : seasonName;

  return (
    <MotionConfig reducedMotion="user">
    <div className={`portfolio-page${growthComplete ? " growth-complete" : " growth-playing"}${listView ? " list-view-mode" : ""}`} id="top">
      <header className="site-header">
        <Link className="brand" href="/" aria-label="Ratul Hasan Ruhan — home">
          <span className="brand-fruit" aria-hidden="true"><i /></span>
          <span><strong>Ratul Hasan Ruhan</strong><small>Software engineer · Dhaka</small></span>
        </Link>
        <nav className="header-links" aria-label="Site navigation">
          {branches.slice(0, 3).map((branch) => (
            <button type="button" key={branch.id} onClick={() => openBranch(branch.id)}>
              {bangla ? branch.bangla : branch.label}
            </button>
          ))}
          <button type="button" onClick={() => document.getElementById("roots")?.scrollIntoView({ behavior: "smooth" })}>
            {bangla ? "যোগাযোগ" : "Contact"}
          </button>
        </nav>
        <div className="header-actions">
          <button
            className="search-trigger"
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label={bangla ? "পোর্টফোলিও খুঁজুন" : "Search portfolio"}
          >
            <span aria-hidden="true">⌕</span><span>{bangla ? "খুঁজুন" : "Search"}</span><kbd>⌘ K</kbd>
          </button>
          <button className="icon-button share-trigger" type="button" onClick={sharePage} aria-label="Copy link to this page">
            ↗
          </button>
        </div>
      </header>

      <main>
        <section className="orchard-hero" aria-labelledby="hero-title">
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

          <div className="tree-stage">
            {!listView && (
              <>
                <WeatherCanvas season={season} night={night} />
                <TreeScene
                  season={season}
                  night={night}
                  focusBranch={selectedBranch}
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

            <div className="scene-caption scene-caption-right">
              <span>Dhaka, Bangladesh</span><span className="compass">N</span>
            </div>

            {!listView && (
              <div className="desktop-branch-labels" role="group" aria-label="Explore the six tree branches">
                {branchButtons}
              </div>
            )}

            {!listView && (
              <div className="growth-intro" aria-hidden={growthComplete}>
                <span className="growth-seed" />
                <span className="growth-intro-copy">A little growth first…</span>
                {!growthComplete && (
                  <button type="button" onClick={() => setGrowthSkipped(true)}>Skip growth</button>
                )}
              </div>
            )}
          </div>

          {!listView && (
            <div className="tree-control-dock">
              <div className="tree-toolbar">
                <div className="season-picker" role="group" aria-label="Choose one of Dhaka's six seasons">
                  {seasons.map((entry) => (
                    <button
                      type="button"
                      key={entry.name}
                      className={season === entry.name ? "season-active" : ""}
                      aria-pressed={season === entry.name}
                      title={bangla ? entry.noteBn : entry.note}
                      onClick={() => setSeasonOverride(entry.name)}
                    >
                      {seasonLabel(entry.name)}
                    </button>
                  ))}
                </div>
                <div className="tree-utilities">
                  <button className="quiet-toggle" type="button" onClick={() => setNightOverride(!night)} aria-pressed={night}>
                    <span aria-hidden="true">{night ? "☼" : "☾"}</span>
                    {bangla ? (night ? "দিন" : "রাত") : (night ? "Night" : "Day")}
                  </button>
                  <button className="quiet-toggle" type="button" onClick={() => setBangla((current) => !current)} aria-pressed={bangla}>
                    বাংলা
                  </button>
                  <button className="quiet-toggle" type="button" onClick={toggleListView} aria-pressed={listView}>
                    {bangla ? "তালিকা" : "List view"}
                  </button>
                </div>
              </div>
              <GrowthDial
                years={ringYears}
                selectedYear={selectedYear}
                onChange={setSelectedYear}
                onReset={() => setSelectedYear(null)}
                bangla={bangla}
              />
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

          <div className="tour-actions">
            <div className="tour-intro">
              <span className="tour-stamp">30<br />SEC</span>
              <span>
                <strong>{bangla ? "সময় কম?" : "Short on time?"}</strong>
                <small>{bangla ? "নির্দেশিত ভ্রমণটি দেখুন।" : "Take the guided walk."}</small>
              </span>
            </div>
            <div className="tour-buttons">
              {tourIndex === null ? (
                <button className="tour-start" type="button" onClick={startTour}>
                  {bangla ? "৩০ সেকেন্ডের ভ্রমণ" : "Start 30-second tour"} <span aria-hidden="true">→</span>
                </button>
              ) : (
                <>
                  <button className="tour-start" type="button" onClick={() => setTourPaused((current) => !current)}>
                    {bangla ? (tourPaused ? "চালু" : "বিরতি") : (tourPaused ? "Resume tour" : "Pause tour")}
                  </button>
                  <button className="text-action tour-exit" type="button" onClick={() => { setTourIndex(null); setTourPaused(false); }}>
                    {bangla ? "শেষ" : "Exit tour"}
                  </button>
                </>
              )}
            </div>
            <button className="share-leaf" type="button" onClick={sharePage}>
              {bangla ? "গাছটি শেয়ার করুন" : "Share this tree"} <span aria-hidden="true">↗</span>
            </button>
          </div>

          {currentTourStop && (
            <motion.div
              className="tour-caption"
              role="status"
              aria-live="polite"
              key={currentTourStop.branch}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="tour-caption-step">0{(tourIndex ?? 0) + 1} / 06</span>
              <div><strong>{currentTourStop.caption}</strong><p>{currentTourStop.subcaption}</p></div>
              {tourPaused && <span className="tour-paused">Paused</span>}
            </motion.div>
          )}
        </section>

        <section className="tree-guide" aria-label="How to explore the tree">
          <p><span className="guide-icon" aria-hidden="true">↗</span> Choose a branch to explore each collection.</p>
          <p><span className="guide-icon" aria-hidden="true">⌕</span> Search by title or story, even without accents.</p>
          <p><span className="guide-icon" aria-hidden="true">◉</span> Slide the rings to travel through the years.</p>
        </section>

        {children}

        {listView ? (
          <PlainList writings={writings} onOpenBranch={openBranch} onReturnToTree={toggleListView} />
        ) : (
          <FreshGarden writings={writings} repositories={repositories} />
        )}

        <ContactSoil bangla={bangla} />
      </main>

      {selectedBranch && !listView && (
        <BranchPanel
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

      {toast && <motion.div className="toast-message" role="status" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{toast}</motion.div>}

      <button
        className="floating-search"
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label={bangla ? "গাছ খুঁজুন" : "Search portfolio"}
      >
        <span aria-hidden="true">⌕</span><span>{bangla ? "গাছ খুঁজুন" : "Search the tree"}</span>
      </button>

      <WebMcp
        onNavigate={navigateFromWebMcp}
        onFilterProjects={filterProjectsFromWebMcp}
        onPrefillContact={prefillContactFromWebMcp}
      />
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
