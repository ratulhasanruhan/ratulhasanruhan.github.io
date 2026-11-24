import { awards, branches, certifications, communities, experience, mediaCoverage, projects, researchItems } from "@/data/catalog";
import type { BranchId, Writing } from "@/data/types";
import { useSyncExternalStore, type CSSProperties } from "react";

const VIEWBOX_WIDTH = 1600;
const VIEWBOX_HEIGHT = 1040;
export const DESKTOP_TREE_SCALE_X = 0.82;
export const DESKTOP_TREE_OFFSET_X = 304;

function subscribeToViewport(callback: () => void) {
  window.addEventListener("resize", callback, { passive: true });
  return () => window.removeEventListener("resize", callback);
}

function getViewportWidth() {
  return window.innerWidth;
}

const getServerViewportWidth = () => 1440;

type Point = { x: number; y: number };
type TreeLobe = {
  id: BranchId;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  seed: number;
  label: Point;
  leader: { from: Point; to: Point };
  hit: { x: number; y: number; width: number; height: number };
};

export const crownLayout: Record<BranchId, TreeLobe> = {
  projects: {
    id: "projects",
    cx: 330,
    cy: 405,
    rx: 282,
    ry: 202,
    seed: 9103,
    label: { x: 102, y: 405 },
    leader: { from: { x: 65, y: 405 }, to: { x: 102, y: 405 } },
    hit: { x: 208, y: 335, width: 226, height: 145 },
  },
  awards: {
    id: "awards",
    cx: 1270,
    cy: 405,
    rx: 282,
    ry: 202,
    seed: 9811,
    label: { x: 1498, y: 405 },
    leader: { from: { x: 1535, y: 405 }, to: { x: 1498, y: 405 } },
    hit: { x: 1167, y: 335, width: 226, height: 145 },
  },
  communities: {
    id: "communities",
    cx: 470,
    cy: 610,
    rx: 255,
    ry: 184,
    seed: 10831,
    label: { x: 370, y: 772 },
    leader: { from: { x: 430, y: 780 }, to: { x: 370, y: 772 } },
    hit: { x: 374, y: 545, width: 192, height: 132 },
  },
  research: {
    id: "research",
    cx: 1130,
    cy: 610,
    rx: 255,
    ry: 184,
    seed: 11777,
    label: { x: 1230, y: 772 },
    leader: { from: { x: 1170, y: 780 }, to: { x: 1230, y: 772 } },
    hit: { x: 1034, y: 545, width: 192, height: 132 },
  },
  writing: {
    id: "writing",
    cx: 680,
    cy: 245,
    rx: 248,
    ry: 176,
    seed: 12721,
    label: { x: 720, y: 105 },
    leader: { from: { x: 690, y: 75 }, to: { x: 720, y: 105 } },
    hit: { x: 586, y: 183, width: 188, height: 124 },
  },
  experience: {
    id: "experience",
    cx: 920,
    cy: 245,
    rx: 248,
    ry: 176,
    seed: 13829,
    label: { x: 960, y: 105 },
    leader: { from: { x: 910, y: 75 }, to: { x: 960, y: 105 } },
    hit: { x: 826, y: 183, width: 188, height: 124 },
  },
};

const crownOrder: BranchId[] = [
  "writing",
  "experience",
  "projects",
  "awards",
  "communities",
  "research",
];

const branchLabel = new Map(branches.map((branch) => [branch.id, branch.label]));

function randomFactory(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function rounded(value: number) {
  return Math.round(value * 10) / 10;
}

function smoothClosedPath(points: Point[]) {
  const length = points.length;
  const first = points[0];
  let path = `M${rounded(first.x)} ${rounded(first.y)}`;

  for (let index = 0; index < length; index += 1) {
    const previous = points[(index + length - 1) % length];
    const current = points[index];
    const next = points[(index + 1) % length];
    const afterNext = points[(index + 2) % length];
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlTwo = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    };
    path += `C${rounded(controlOne.x)} ${rounded(controlOne.y)} ${rounded(controlTwo.x)} ${rounded(controlTwo.y)} ${rounded(next.x)} ${rounded(next.y)}`;
  }

  return `${path}Z`;
}

function lobePath(
  lobe: TreeLobe,
  scaleX = 1,
  scaleY = 1,
  offsetX = 0,
  offsetY = 0,
  seedOffset = 0,
) {
  const random = randomFactory(lobe.seed + seedOffset);
  const points = Array.from({ length: 28 }, (_, index) => {
    const angle = (index / 28) * Math.PI * 2;
    const undulation = 0.9 + random() * 0.18 + Math.sin(angle * 5 + lobe.seed) * 0.025;
    return {
      x: lobe.cx + offsetX + Math.cos(angle) * lobe.rx * scaleX * undulation,
      y: lobe.cy + offsetY + Math.sin(angle) * lobe.ry * scaleY * undulation,
    };
  });
  return smoothClosedPath(points);
}

function leafPath(x: number, y: number, length: number, width: number, angle: number) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const point = (along: number, across: number) => ({
    x: rounded(x + along * cosine - across * sine),
    y: rounded(y + along * sine + across * cosine),
  });
  const base = point(-length * 0.42, 0);
  const upper = point(length * 0.1, -width);
  const tip = point(length * 0.58, 0);
  const lower = point(length * 0.1, width);
  const vein = point(length * 0.48, 0);

  return {
    shape: `M${base.x} ${base.y}Q${upper.x} ${upper.y} ${tip.x} ${tip.y}Q${lower.x} ${lower.y} ${base.x} ${base.y}Z`,
    vein: `M${base.x} ${base.y}Q${rounded((base.x + vein.x) / 2)} ${rounded((base.y + vein.y) / 2)} ${vein.x} ${vein.y}`,
  };
}

const lobeLeaves = Object.fromEntries(
  crownOrder.map((branch) => {
    const lobe = crownLayout[branch];
    const random = randomFactory(lobe.seed + 401);
    const paths = ["back", "mid", "sun", "under"].map(() => [] as string[]);
    const veins = [] as string[];

    for (let index = 0; index < 270; index += 1) {
      const angle = random() * Math.PI * 2;
      const radius = Math.sqrt(random()) * 0.96;
      const x = lobe.cx + Math.cos(angle) * lobe.rx * radius;
      const y = lobe.cy + Math.sin(angle) * lobe.ry * radius;
      const shape = leafPath(
        x,
        y,
        13 + random() * 16,
        3.5 + random() * 3.6,
        random() * Math.PI * 2,
      );
      const tone = y < lobe.cy - lobe.ry * 0.2 && random() > 0.27
        ? 2
        : y > lobe.cy + lobe.ry * 0.42
          ? 3
          : Math.floor(random() * 2);
      paths[tone].push(shape.shape);
      if (tone < 3 && index % 3 === 0) veins.push(shape.vein);
    }

    return [
      branch,
      {
        paths: paths.map((batch) => batch.join("")),
        veins: veins.join(""),
      },
    ];
  }),
) as Record<BranchId, { paths: string[]; veins: string }>;

function pointForItem(branch: BranchId, index: number, count: number): Point {
  const lobe = crownLayout[branch];
  const random = randomFactory(lobe.seed + 70_001 + index * 137);
  const angle = index * 2.399963229728653 + random() * 0.22;
  const radius = Math.sqrt((index + 0.5) / Math.max(count, 1)) * 0.53;
  return {
    x: rounded(lobe.cx + Math.cos(angle) * lobe.rx * radius),
    y: rounded(lobe.cy + Math.sin(angle) * lobe.ry * radius),
  };
}

function cubicPoint(start: Point, first: Point, second: Point, end: Point, t: number): Point {
  const inverse = 1 - t;
  return {
    x: inverse ** 3 * start.x
      + 3 * inverse ** 2 * t * first.x
      + 3 * inverse * t ** 2 * second.x
      + t ** 3 * end.x,
    y: inverse ** 3 * start.y
      + 3 * inverse ** 2 * t * first.y
      + 3 * inverse * t ** 2 * second.y
      + t ** 3 * end.y,
  };
}

function taperedLimbPath(start: Point, first: Point, second: Point, end: Point, base: number, tip: number) {
  const left: Point[] = [];
  const right: Point[] = [];
  const segments = 18;

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;
    const point = cubicPoint(start, first, second, end, t);
    const next = cubicPoint(start, first, second, end, Math.min(t + 0.01, 1));
    const previous = cubicPoint(start, first, second, end, Math.max(t - 0.01, 0));
    const dx = next.x - previous.x;
    const dy = next.y - previous.y;
    const magnitude = Math.hypot(dx, dy) || 1;
    const width = tip + (base - tip) * (1 - t) ** 0.8;
    const normalX = -dy / magnitude;
    const normalY = dx / magnitude;
    left.push({ x: point.x + normalX * width * 0.5, y: point.y + normalY * width * 0.5 });
    right.push({ x: point.x - normalX * width * 0.5, y: point.y - normalY * width * 0.5 });
  }

  const outline = [...left, ...right.reverse()];
  return `${outline.map((point, index) => `${index === 0 ? "M" : "L"}${rounded(point.x)} ${rounded(point.y)}`).join("")}Z`;
}

const limbs = [
  {
    id: "projects",
    start: { x: 738, y: 790 },
    first: { x: 648, y: 718 },
    second: { x: 470, y: 555 },
    end: { x: 330, y: 405 },
    base: 66,
    tip: 12,
  },
  {
    id: "communities",
    start: { x: 758, y: 840 },
    first: { x: 680, y: 830 },
    second: { x: 575, y: 714 },
    end: { x: 470, y: 610 },
    base: 58,
    tip: 11,
  },
  {
    id: "writing",
    start: { x: 766, y: 716 },
    first: { x: 736, y: 595 },
    second: { x: 682, y: 475 },
    end: { x: 680, y: 245 },
    base: 62,
    tip: 13,
  },
  {
    id: "experience",
    start: { x: 834, y: 716 },
    first: { x: 864, y: 595 },
    second: { x: 918, y: 475 },
    end: { x: 920, y: 245 },
    base: 62,
    tip: 13,
  },
  {
    id: "awards",
    start: { x: 862, y: 790 },
    first: { x: 952, y: 718 },
    second: { x: 1130, y: 555 },
    end: { x: 1270, y: 405 },
    base: 66,
    tip: 12,
  },
  {
    id: "research",
    start: { x: 842, y: 840 },
    first: { x: 920, y: 830 },
    second: { x: 1025, y: 714 },
    end: { x: 1130, y: 610 },
    base: 58,
    tip: 11,
  },
] as const;

const branchArt = limbs.map((limb, index) => ({
  id: limb.id,
  path: taperedLimbPath(limb.start, limb.first, limb.second, limb.end, limb.base, limb.tip),
  delay: `${index * 90}ms`,
}));

const seasonalFlowerPoints = crownOrder.flatMap((branch) => {
  const lobe = crownLayout[branch];
  return Array.from({ length: 7 }, (_, index) => {
    const angle = (index / 7) * Math.PI * 2 + lobe.seed;
    const radius = index % 2 === 0 ? 0.56 : 0.72;
    return {
      x: rounded(lobe.cx + Math.cos(angle) * lobe.rx * radius),
      y: rounded(lobe.cy + Math.sin(angle) * lobe.ry * radius),
      id: `${branch}-${index}`,
    };
  });
});

const rootPaths = [
  "M780 918C712 946 658 968 581 966c-56-2-91 9-145 32 62-15 106 4 157-2 82-9 132-37 192-66",
  "M803 920c-16 47-69 84-125 100-57 17-101 12-152 45 58-15 102-7 153-26 69-26 111-64 145-111",
  "M828 920c28 44 78 78 142 87 60 8 101 0 161 25-64-5-105 14-164 14-75 0-123-39-155-83",
  "M846 917c51 30 107 59 180 52 54-5 91-24 153-18-62 17-87 48-141 70-73 30-135 14-196-26",
  "M784 923c-31 47-42 93-26 142 12 38 35 66 42 107-28-38-61-49-81-91-27-57-10-112 39-158",
  "M819 923c25 48 35 91 22 141-10 39-32 71-27 108 20-41 52-57 69-101 22-58 2-109-34-153",
];

const soilGrain = Array.from({ length: 58 }, (_, index) => {
  const x = (index * 137) % 1580;
  const y = 952 + ((index * 43) % 82);
  return `M${x} ${y}l${3 + (index % 5) * 1.2} -1`;
}).join("");

export interface TreeSceneProps {
  season: string;
  night: boolean;
  focusBranch?: BranchId | null;
  expandedBranch?: BranchId | null;
  focusedSlug?: string | null;
  highlightedBranches: Set<BranchId>;
  writings: Writing[];
  freshBuds: { title: string; href: string; external?: boolean }[];
  onSelectBranch: (branch: BranchId) => void;
  onItemHover: (slug: string | null) => void;
}

function TreeScene({
  season,
  night,
  focusBranch,
  expandedBranch,
  focusedSlug,
  highlightedBranches,
  writings,
  freshBuds,
  onSelectBranch,
  onItemHover,
}: TreeSceneProps) {
  const viewportWidth = useSyncExternalStore(
    subscribeToViewport,
    getViewportWidth,
    getServerViewportWidth,
  );
  const isMobileScene = viewportWidth <= 640;
  const preserveAspectRatio = "none";
  const focus = focusBranch ? crownLayout[focusBranch] : null;
  const zoom = focus ? 1.12 : 1;
  const camera = focus
    ? `matrix(${(isMobileScene ? 1 : DESKTOP_TREE_SCALE_X) * zoom} 0 0 ${zoom} ${rounded(
        (isMobileScene ? 0 : DESKTOP_TREE_OFFSET_X)
          + (isMobileScene ? 1 : DESKTOP_TREE_SCALE_X) * focus.cx * (1 - zoom),
      )} ${rounded(focus.cy * (1 - zoom))})`
    : isMobileScene
      ? undefined
      : `matrix(${DESKTOP_TREE_SCALE_X} 0 0 1 ${DESKTOP_TREE_OFFSET_X} 0)`;
  const treeExperience = [...experience, ...certifications];

  function itemEvents(slug: string) {
    return {
      onMouseEnter: () => onItemHover(slug),
      onMouseLeave: () => onItemHover(null),
      onFocus: () => onItemHover(slug),
      onBlur: () => onItemHover(null),
    };
  }

  return (
    <div
      className="tree-illustration"
      data-season={season}
      data-night={night ? "true" : "false"}
      data-focused={focusBranch ? "true" : "false"}
    >
      <svg
        className="mango-tree-svg"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="group"
        aria-labelledby="tree-title tree-description"
        preserveAspectRatio={preserveAspectRatio}
      >
        <title id="tree-title">A living mango tree in a Bangladesh paddy field</title>
        <desc id="tree-description">
          Six living crowns represent projects, awards, communities, research, writing, and experience.
          The mango tree stands in the seasons of Bangladesh, with its roots beneath the field.
        </desc>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cce5d3" />
            <stop offset="0.54" stopColor="#f3e7c9" />
            <stop offset="1" stopColor="#e9c592" />
          </linearGradient>
          <linearGradient id="bark" x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0" stopColor="#503528" />
            <stop offset="0.2" stopColor="#956141" />
            <stop offset="0.46" stopColor="#bd8352" />
            <stop offset="0.7" stopColor="#805338" />
            <stop offset="1" stopColor="#503629" />
          </linearGradient>
          <linearGradient id="limb-bark" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#c18a5c" />
            <stop offset="0.32" stopColor="#986545" />
            <stop offset="0.68" stopColor="#724a32" />
            <stop offset="1" stopColor="#50372a" />
          </linearGradient>
          <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#58432f" />
            <stop offset="1" stopColor="#27231e" />
          </linearGradient>
          <linearGradient id="crown-back" x1="0" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="var(--leaf-back-light)" />
            <stop offset="1" stopColor="var(--leaf-back)" />
          </linearGradient>
          <linearGradient id="crown-mid" x1="0.1" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="var(--leaf-mid-light)" />
            <stop offset="1" stopColor="var(--leaf-mid)" />
          </linearGradient>
          <linearGradient id="crown-sunlit" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0" stopColor="var(--leaf-sun-light)" stopOpacity="0.95" />
            <stop offset="1" stopColor="var(--leaf-sun)" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id="crown-underside" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--leaf-under)" stopOpacity="0" />
            <stop offset="1" stopColor="var(--leaf-under)" stopOpacity="0.64" />
          </linearGradient>
          <linearGradient id="mango-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fff0a0" />
            <stop offset="0.46" stopColor="#f3b146" />
            <stop offset="1" stopColor="#d97132" />
          </linearGradient>
          <radialGradient id="canopy-glow">
            <stop offset="0" stopColor="#f8d997" stopOpacity="0.78" />
            <stop offset="1" stopColor="#f8d997" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="fruit-glow">
            <stop offset="0" stopColor="#ffe98d" stopOpacity="0.8" />
            <stop offset="1" stopColor="#ffe98d" stopOpacity="0" />
          </radialGradient>
          <filter id="ground-blur" x="-30%" y="-200%" width="160%" height="500%">
            <feGaussianBlur stdDeviation="24" />
          </filter>
          <filter id="fruit-glow-filter" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <clipPath id="community-disc">
            <circle r="17" />
          </clipPath>
        </defs>

        <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#sky)" />
        <circle className="sky-glow" cx="1280" cy="135" r="285" fill="url(#canopy-glow)" />
        <circle className="sun-or-moon" cx="1290" cy="145" r="46" />
        <path className="cloud cloud-a" d="M145 225c-39 0-63-19-63-47 0-25 23-44 54-46 9-43 45-71 87-71 43 0 73 25 86 61 39-4 67 18 67 51 0 30-26 52-65 52H145Z" />
        <path className="cloud cloud-b" d="M1180 292c-34 0-56-17-56-40 0-21 20-37 46-40 7-37 38-62 74-62 36 0 64 21 75 53 34-3 58 16 58 43 0 26-24 46-57 46h-140Z" />

        <path className="distant-hill" d="M0 726c214-57 393-68 578-27 218 48 408 40 611-18 162-46 289-41 411-2v143H0Z" />
        <path className="far-paddy" d="M0 785c234-36 429-25 649 14 228 41 480 29 951-32v151H0Z" />
        <path className="middle-paddy" d="M0 839c258-28 481 21 704 34 305 17 575-73 896-54v131H0Z" />
        <path className="near-paddy" d="M0 898c226-21 401 10 602 47 233 43 581 37 998-21v116H0Z" />
        <path className="field-water" d="M0 914c232-21 430 24 633 40 291 22 551-54 967-25" />
        <g className="paddy-lines">
          <path d="M30 855c181-26 316-2 484 31m119 18c196 29 379 8 581-28m88 43c93-21 179-26 266-14M130 941c178-14 319 21 472 44m129-5c231-28 394-34 612-1" />
        </g>
        <g className="field-stalks">
          {Array.from({ length: 29 }, (_, index) => {
            const x = 20 + index * 55;
            const y = 839 + (index % 4) * 24;
            return <path key={index} d={`M${x} ${y + 28}q-7-25-15-28m15 28q4-30 13-35m-13 35q-2-20 3-27`} />;
          })}
        </g>

        <g className="soil-cut">
          <path d="M0 927c207-20 399 17 585 20 242 3 428-47 633-40 163 6 255 31 382 5v128H0Z" />
        </g>
        <path className="soil-surface" d="M0 927c207-20 399 17 585 20 242 3 428-47 633-40 163 6 255 31 382 5" />
        <path className="soil-grain" d={soilGrain} />

        <g className="tree-camera" transform={camera}>
          <ellipse className="canopy-ground-shadow" cx="800" cy="815" rx="570" ry="62" />
          <ellipse className="tree-shadow" cx="800" cy="922" rx="255" ry="30" />
          <g className="kash-flowers">
            {Array.from({ length: 14 }, (_, index) => {
              const x = 85 + index * 111;
              const height = 48 + (index % 4) * 10;
              return (
                <g key={index} transform={`translate(${x} 893)`}>
                  <path d={`M0 0Q-4-${height / 2} 0-${height}`} />
                  <path className="kash-plume" d={`M0 ${-height}q-10-7-15-2m15 2q8-10 16-7m-16 7q-7-10-13-12`} />
                </g>
              );
            })}
          </g>

          <g className="tree-limbs">
            {branchArt.map((branch) => (
              <g key={branch.id} style={{ "--branch-delay": branch.delay } as CSSProperties}>
                <path className="tree-limb" d={branch.path} />
                <path className="tree-limb-sheen" d={branch.path} />
              </g>
            ))}
            <path className="sub-limb" d={taperedLimbPath({ x: 585, y: 655 }, { x: 520, y: 585 }, { x: 480, y: 510 }, { x: 433, y: 463 }, 18, 5)} />
            <path className="sub-limb" d={taperedLimbPath({ x: 1015, y: 655 }, { x: 1080, y: 585 }, { x: 1120, y: 510 }, { x: 1167, y: 463 }, 18, 5)} />
            <path className="sub-limb" d={taperedLimbPath({ x: 688, y: 530 }, { x: 650, y: 474 }, { x: 630, y: 427 }, { x: 611, y: 385 }, 13, 4)} />
            <path className="sub-limb" d={taperedLimbPath({ x: 912, y: 530 }, { x: 950, y: 474 }, { x: 970, y: 427 }, { x: 989, y: 385 }, 13, 4)} />
          </g>

          <path className="tree-trunk" d="M715 944c17-83 15-158 19-234 4-84 11-153 29-223 12-49 27-88 36-133 10-53 8-94-1-137 21-16 49-20 72-5-8 51-10 91 0 142 10 45 27 85 42 134 21 67 29 142 31 222 2 81 7 153 26 234-74 26-181 26-254 0Z" />
          <path className="trunk-shade" d="M846 242c20 55 18 108 34 168 18 67 39 112 44 184 6 91-5 198 18 333-35 15-70 23-110 26 24-167 8-270 1-359-7-88-26-145-12-217 9-48 20-89 25-135Z" />
          <g className="trunk-ridges">
            <path d="M755 906c-3-104 30-186 35-265 6-83-18-144 15-224 15-36 34-74 40-125" />
            <path d="M790 922c-20-72 3-136 20-202 18-71 7-117-5-184-13-72 7-119 25-178" />
            <path d="M836 909c-6-92 19-155 17-232-2-63-23-124-1-188 13-40 33-69 39-112" />
            <path d="M730 842c30-14 51-16 78-8m-70-100c27 10 54 8 81-7m-58-112c26 8 47 5 70-10m-29-105c22 6 39 1 56-12" />
          </g>
          <g className="roots">
            {rootPaths.map((path, index) => <path key={index} d={path} />)}
          </g>

          <g className="crown-forest">
            {crownOrder.map((branch, index) => {
              const lobe = crownLayout[branch];
              const foliage = lobeLeaves[branch];
              const label = branchLabel.get(branch) ?? branch;
              const back = lobePath(lobe, 1, 1, 0, 0, 17);
              const mid = lobePath(lobe, 0.93, 0.86, -lobe.rx * 0.015, -lobe.ry * 0.015, 29);
              const sun = lobePath(lobe, 0.73, 0.57, -lobe.rx * 0.12, -lobe.ry * 0.2, 41);
              const underside = lobePath(lobe, 0.91, 0.46, 0, lobe.ry * 0.31, 53);

              return (
                <g className="crown-cluster" key={branch} data-branch={branch}>
                  <g
                    className="crown-lift"
                    style={{ "--crown-delay": `${index * 120}ms` } as CSSProperties}
                  >
                    <g
                      className="crown-sway"
                      style={{ animationDelay: `${index * -0.65}s` }}
                    >
                      <path className="crown-back" d={back} />
                      <path className="crown-mid" d={mid} />
                      <path className="crown-sunlit" d={sun} />
                      <path className="crown-underside" d={underside} />
                      {foliage.paths.map((path, tone) => (
                        <path
                          className={`crown-leaves crown-leaves-${tone}`}
                          d={path}
                          key={tone}
                        />
                      ))}
                      <path className="crown-leaf-veins" d={foliage.veins} />
                    </g>
                  </g>
                  <foreignObject
                    className="crown-hit-area"
                    x={lobe.hit.x}
                    y={lobe.hit.y}
                    width={lobe.hit.width}
                    height={lobe.hit.height}
                  >
                    <button
                      className="crown-hit"
                      type="button"
                      aria-label={`Explore ${label} branch`}
                      aria-expanded={expandedBranch === branch}
                      aria-controls="branch-panel"
                      onClick={() => onSelectBranch(branch)}
                    />
                  </foreignObject>
                </g>
              );
            })}
          </g>

          <g className="season-blossoms">
            {seasonalFlowerPoints.map((flower) => (
              <g key={flower.id} transform={`translate(${flower.x} ${flower.y})`}>
                <circle cx="0" cy="-5" r="4" />
                <circle cx="5" cy="0" r="4" />
                <circle cx="0" cy="5" r="4" />
                <circle cx="-5" cy="0" r="4" />
                <circle className="flower-core" r="2.5" />
              </g>
            ))}
          </g>

          <g className="branch-leader-lines" aria-hidden="true">
            {crownOrder.map((branch) => {
              const { from, to } = crownLayout[branch].leader;
              return <path key={branch} d={`M${from.x} ${from.y}Q${(from.x + to.x) / 2} ${(from.y + to.y) / 2} ${to.x} ${to.y}`} />;
            })}
          </g>

          <g className="tree-items">
            <g className="project-tokens">
              {projects.map((project, index) => {
                const point = pointForItem("projects", index, projects.length);
                return (
                  <a
                    key={project.slug}
                    className={focusedSlug === project.slug ? "tree-item-focused" : undefined}
                    href={`/projects/${project.slug}/`}
                    aria-label={`Project: ${project.title}`}
                    title={project.title}
                    {...itemEvents(project.slug)}
                  >
                    <g className="tree-token-project" transform={`translate(${point.x} ${point.y}) rotate(${(index * 37) % 70 - 35})`}>
                      <path className="token-leaf" d="M-18 0Q-8-16 17-8Q10 11-18 0Z" />
                      <path className="token-vein" d="M-15 0Q0-2 14-7" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="award-tokens">
              {awards.map((award, index) => {
                const point = pointForItem("awards", index, awards.length);
                return (
                  <a
                    key={award.slug}
                    className={focusedSlug === award.slug ? "tree-item-focused" : undefined}
                    href={`/awards/${award.slug}/`}
                    aria-label={`Award: ${award.title}`}
                    title={award.title}
                    {...itemEvents(award.slug)}
                  >
                    <g className="tree-token-award" transform={`translate(${point.x} ${point.y}) scale(.68)`}>
                      <circle className="award-glow" r="25" />
                      <path className="mango-stem" d="M0-18q2-10 10-12m-7 5q8-6 13-1" />
                      <path className="mango-fruit" d="M-1-17C-18-27-24-7-12 12-4 26 9 24 16 12 29-12 13-29-1-17Z" />
                      <path className="mango-glint" d="M-8-12q-6 11 1 22" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="community-tokens">
              {communities.map((community, index) => {
                const point = pointForItem("communities", index, communities.length);
                return (
                  <a
                    key={community.slug}
                    className={focusedSlug === community.slug ? "tree-item-focused" : undefined}
                    href={`/communities/${community.slug}/`}
                    aria-label={`Community: ${community.title}, ${community.role}`}
                    title={`${community.title} — ${community.role}`}
                    {...itemEvents(community.slug)}
                  >
                    <g className="tree-token-community" transform={`translate(${point.x} ${point.y})`}>
                      <circle className="community-halo" r="25" />
                      <circle
                        className="community-disc"
                        r="22"
                        style={{ "--community-backdrop": community.logoBackdrop } as CSSProperties}
                      />
                      <image
                        href={community.image}
                        x="-17"
                        y="-17"
                        width="34"
                        height="34"
                        preserveAspectRatio="xMidYMid meet"
                        clipPath="url(#community-disc)"
                      />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="research-tokens">
              {researchItems.map((item, index) => {
                const point = pointForItem("research", index, researchItems.length);
                return (
                  <a
                    key={item.slug}
                    className={focusedSlug === item.slug ? "tree-item-focused" : undefined}
                    href={`/research/${item.slug}/`}
                    aria-label={`Research: ${item.title}`}
                    title={item.title}
                    {...itemEvents(item.slug)}
                  >
                    <g className="tree-token-research" transform={`translate(${point.x} ${point.y}) rotate(${(index * 41) % 60 - 30})`}>
                      <path className="token-leaf" d="M-18 0Q-8-16 17-8Q10 11-18 0Z" />
                      <path className="research-vein" d="M-15 0Q0-2 14-7m-7 3 3 5m-8-3 3 5" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="writing-tokens">
              {writings.map((writing, index) => {
                const point = pointForItem("writing", index, writings.length);
                return (
                  <a
                    key={writing.slug}
                    className={focusedSlug === writing.slug ? "tree-item-focused" : undefined}
                    href={`/writing/${writing.slug}/`}
                    aria-label={`Writing: ${writing.title}`}
                    title={writing.title}
                    {...itemEvents(writing.slug)}
                  >
                    <g className="tree-token-writing" transform={`translate(${point.x} ${point.y}) rotate(${(index * 31) % 54 - 27})`}>
                      <path className="token-leaf" d="M-18 0Q-8-16 17-8Q10 11-18 0Z" />
                      <path className="token-vein" d="M-15 0Q0-2 14-7" />
                      <circle className="writing-bud" cx="10" cy="-7" r="3" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="experience-tokens">
              {treeExperience.map((item, index) => {
                const point = pointForItem("experience", index, treeExperience.length);
                return (
                  <a
                    key={item.slug}
                    className={focusedSlug === item.slug ? "tree-item-focused" : undefined}
                    href={`/experience/${item.slug}/`}
                    aria-label={`${item.kind === "certification" ? "Certification" : "Experience"}: ${item.title}`}
                    title={item.title}
                    {...itemEvents(item.slug)}
                  >
                    <g className="tree-token-experience" transform={`translate(${point.x} ${point.y}) rotate(${(index * 29) % 58 - 29})`}>
                      <path className="token-bud" d="M-14 2Q-10-14 1-17 13-13 12-2 10 10-2 15-13 11-14 2Z" />
                      <path className="token-vein" d="M-10 3Q0-3 9-9" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="fresh-growth-buds">
              {freshBuds.map((bud, index) => {
                const point = pointForItem("writing", index + writings.length, writings.length + freshBuds.length);
                return (
                  <a
                    key={`${bud.href}-${index}`}
                    href={bud.href}
                    target={bud.external ? "_blank" : undefined}
                    rel={bud.external ? "noopener noreferrer" : undefined}
                    aria-label={`New growth: ${bud.title}`}
                    title={bud.title}
                  >
                    <g className="tree-token-fresh" transform={`translate(${point.x} ${point.y}) rotate(${(index * 33) % 60 - 30})`}>
                      <path className="token-bud" d="M-13 2Q-10-13 1-16 13-12 12-1 10 10-2 14-12 10-13 2Z" />
                      <path className="token-vein" d="M-9 3Q0-3 8-8" />
                      <circle className="fresh-glint" cx="8" cy="-9" r="3" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="press-birds">
              {mediaCoverage.slice(0, 4).map((story, index) => {
                const points = [
                  { x: 545, y: 302 },
                  { x: 1055, y: 302 },
                  { x: 392, y: 536 },
                  { x: 1208, y: 535 },
                ];
                const point = points[index];
                return (
                  <a
                    key={story.slug}
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open media story: ${story.title}`}
                    title={story.title}
                  >
                    <g className="press-bird" transform={`translate(${point.x} ${point.y}) scale(${0.9 + (index % 2) * 0.13})`}>
                      <path className="bird-shape" d="M-15 4q5-19 18-15 8 2 11 13-8-6-14-3-5 3-8 11l-12 2q8-5 5-8Zm8 4q-3 9-12 8 8-4 10-11" />
                      <circle className="bird-eye" cx="5" cy="-6" r="1.5" />
                      <path className="bird-beak" d="m12-8 10 2-9 3Z" />
                    </g>
                  </a>
                );
              })}
            </g>
          </g>

          <g className="thread-markers" aria-hidden="true">
            {Array.from(highlightedBranches).map((branch) => {
              const lobe = crownLayout[branch];
              return (
                <g key={branch} transform={`translate(${lobe.cx} ${lobe.cy})`}>
                  <circle r="47" />
                  <circle r="31" />
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}

export default TreeScene;
