import { awards, certifications, communities, mediaCoverage, projects, researchItems } from "@/data/catalog";
import type { BranchId } from "@/data/types";
import { memo, type CSSProperties } from "react";

const clusters = [
  { x: 800, y: 257, rx: 218, ry: 144 },
  { x: 568, y: 369, rx: 248, ry: 170 },
  { x: 1034, y: 370, rx: 250, ry: 174 },
  { x: 386, y: 527, rx: 205, ry: 158 },
  { x: 1214, y: 523, rx: 205, ry: 164 },
  { x: 595, y: 623, rx: 228, ry: 151 },
  { x: 1004, y: 633, rx: 228, ry: 154 },
];

function randomFactory(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const random = randomFactory(43192);
const leaves = Array.from({ length: 430 }, (_, index) => {
  const cluster = clusters[index % clusters.length];
  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(random());
  const x = cluster.x + Math.cos(angle) * cluster.rx * radius;
  const y = cluster.y + Math.sin(angle) * cluster.ry * radius;
  const angleDeg = Math.round(random() * 150 - 75);
  const scale = 0.55 + random() * 0.68;

  return {
    id: index,
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    angle: angleDeg,
    scale: Math.round(scale * 100) / 100,
    tone: index % 4,
  };
});

const fruitPoints = Array.from({ length: 22 }, (_, index) => {
  const point = leaves[(index * 17 + 29) % leaves.length];
  return { x: point.x, y: point.y, size: 10 + (index % 4) * 1.6, id: index };
});

const branchAnchors: Record<BranchId, { x: number; y: number }> = {
  projects: { x: 380, y: 540 },
  awards: { x: 1220, y: 520 },
  communities: { x: 420, y: 750 },
  research: { x: 1180, y: 750 },
  writing: { x: 800, y: 245 },
  experience: { x: 800, y: 905 },
};

export interface TreeSceneProps {
  season: string;
  night: boolean;
  focusBranch?: BranchId | null;
  highlightedBranches: Set<BranchId>;
  freshBuds: { title: string; href: string; external?: boolean }[];
}

function TreeScene({
  season,
  night,
  focusBranch,
  highlightedBranches,
  freshBuds,
}: TreeSceneProps) {
  const focus = focusBranch ? branchAnchors[focusBranch] : null;
  const zoom = focus ? 1.16 : 1;
  const camera = focus
    ? `matrix(${zoom} 0 0 ${zoom} ${Math.round(focus.x * (1 - zoom))} ${Math.round(
        focus.y * (1 - zoom),
      )})`
    : undefined;

  return (
    <div
      className="tree-illustration"
      data-season={season}
      data-night={night ? "true" : "false"}
      data-focused={focusBranch ? "true" : "false"}
    >
      <svg
        className="mango-tree-svg"
        viewBox="0 0 1600 1350"
        role="group"
        aria-labelledby="tree-title tree-description"
        preserveAspectRatio="xMidYMid meet"
      >
        <title id="tree-title">A living mango tree in a Bangladesh paddy field</title>
        <desc id="tree-description">
          A richly layered mango tree represents Ratul Hasan Ruhan&apos;s projects, awards, communities,
          research, writing, and experience. Its roots hold four stages of education.
        </desc>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#cfe7d7" />
            <stop offset="0.53" stopColor="#f6e8c7" />
            <stop offset="1" stopColor="#f2c994" />
          </linearGradient>
          <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#59412e" />
            <stop offset="0.34" stopColor="#3e3025" />
            <stop offset="1" stopColor="#211f19" />
          </linearGradient>
          <linearGradient id="bark" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0" stopColor="#9a6340" />
            <stop offset="0.2" stopColor="#765037" />
            <stop offset="0.5" stopColor="#bd8150" />
            <stop offset="0.74" stopColor="#70452f" />
            <stop offset="1" stopColor="#4f3428" />
          </linearGradient>
          <linearGradient id="branch-bark" x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor="#a8724b" />
            <stop offset="0.52" stopColor="#70482f" />
            <stop offset="1" stopColor="#4d3528" />
          </linearGradient>
          <linearGradient id="canopy-gradient" x1="0.2" y1="0" x2="0.85" y2="1">
            <stop offset="0" stopColor="#8da965" />
            <stop offset="0.3" stopColor="#72934f" />
            <stop offset="0.68" stopColor="#5e8045" />
            <stop offset="1" stopColor="#3f603b" />
          </linearGradient>
          <linearGradient id="mango-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe68a" />
            <stop offset="0.5" stopColor="#f3aa45" />
            <stop offset="1" stopColor="#d77435" />
          </linearGradient>
          <radialGradient id="canopy-light">
            <stop offset="0" stopColor="#f2d794" stopOpacity=".76" />
            <stop offset="1" stopColor="#f2d794" stopOpacity="0" />
          </radialGradient>
          <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id="fruit-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <clipPath id="leaf-image-window">
            <path d="M4-2c5-9 17-13 29-11-5 11-17 15-29 11Z" />
          </clipPath>
        </defs>

        <rect width="1600" height="1350" fill="url(#sky)" />
        <circle className="sky-glow" cx="1230" cy="192" r="214" fill="url(#canopy-light)" />
        <circle className="sun-or-moon" cx="1246" cy="194" r="54" />
        <path
          className="cloud cloud-a"
          d="M180 246c-36 0-59-20-59-47 0-24 22-43 52-45 8-44 44-74 89-74 42 0 74 25 88 62 41-4 70 18 70 51 0 30-29 53-67 53H180Z"
        />
        <path
          className="cloud cloud-b"
          d="M1112 316c-34 0-57-18-57-42 0-21 20-39 46-41 7-39 39-66 78-66 36 0 66 23 77 56 36-3 61 16 61 45 0 27-26 48-59 48h-146Z"
        />
        <path className="distant-hill" d="M0 777c190-65 345-70 541-20 209 53 372 40 560-17 174-53 331-44 499 5v206H0Z" />
        <path className="far-paddy" d="M0 849c230-47 445-34 664 10 237 48 455 34 936-27v222H0Z" />
        <path className="middle-paddy" d="M0 914c321-26 521 50 771 42 277-10 542-93 829-66v183H0Z" />
        <path className="near-paddy" d="M0 974c202-26 387 10 577 69 219 67 616 56 1023-14v202H0Z" />
        <g className="paddy-lines" fill="none" strokeLinecap="round">
          <path d="M24 946c204-37 364-4 535 58M106 1004c207-27 345 10 498 58M1174 932c134-40 268-61 398-52M941 1006c183-28 372-18 581 20" />
          <path d="M41 1091c225-58 433-27 596 35M822 1097c239-55 479-58 726-18M136 1154c178-38 350-16 509 33M980 1157c196-45 371-41 572-4" />
        </g>
        <g className="field-stalks">
          {Array.from({ length: 36 }, (_, index) => {
            const x = 22 + index * 45;
            const y = 945 + (index % 4) * 36;
            return (
              <path
                key={index}
                d={`M${x} ${y + 18}q-8-25-16-27m16 27q4-29 13-34m-13 34q-2-22 3-28`}
              />
            );
          })}
        </g>

        <g className="tree-camera" transform={camera}>
          <ellipse className="tree-shadow" cx="807" cy="1055" rx="347" ry="44" />
          <g className="kash-flowers">
            {Array.from({ length: 16 }, (_, index) => {
              const x = 116 + index * 86;
              const height = 57 + (index % 4) * 11;
              return (
                <g key={index} transform={`translate(${x} ${934 - (index % 3) * 20})`}>
                  <path d={`M0 0Q-4-${height / 2} 0-${height}`} />
                  <path className="kash-plume" d={`M0 ${-height}q-10-7-15-2m15 2q8-10 16-7m-16 7q-7-10-13-12`} />
                </g>
              );
            })}
          </g>

          <g className="roots">
            <path d="M778 1040c-44 28-102 59-169 65-52 4-90-4-151 16 65-7 103 16 158 19 72 4 125-27 176-62" />
            <path d="M810 1044c-13 43-52 79-99 103-55 28-100 33-145 74 57-27 94-21 151-38 64-19 105-63 133-111" />
            <path d="M837 1040c35 38 69 70 132 88 58 17 103 12 159 47-66-18-103-4-162-8-72-5-116-49-151-100" />
            <path d="M842 1040c48 22 102 47 170 48 54 1 91-12 153-1-64 9-94 37-148 52-68 18-123-4-183-43" />
            <path d="M792 1046c-29 57-34 91-20 137 11 35 37 59 38 108-25-39-58-53-75-91-23-51-7-103 28-159" />
            <path d="M823 1042c15 46 25 85 12 134-11 39-32 64-32 115 23-43 56-59 70-100 19-55 1-103-29-149" />
          </g>

          <g className="canopy">
            <ellipse className="canopy-underpaint" cx="804" cy="474" rx="637" ry="342" />
            <ellipse className="canopy-halo" cx="805" cy="430" rx="549" ry="330" />
            <path
              className="canopy-heart"
              d="M168 480c-10-55 23-103 82-121-9-58 40-107 102-96 22-64 100-89 163-56 43-75 147-85 205-20 70-68 175-54 206 26 82-33 170 7 182 79 82-7 146 56 126 122 59 32 78 105 27 153-9 59-66 94-135 78-27 70-104 97-170 63-52 61-148 55-195-11-65 56-168 39-201-37-76 32-163-8-176-77-71 24-151-11-161-69-49 7-89-19-91-57Z"
            />
            {leaves.map((leaf) => (
              <path
                key={leaf.id}
                className={`mango-leaf leaf-tone-${leaf.tone}`}
                d="M0 0c8-15 25-22 42-21-8 16-25 25-42 21Zm2-2 36-17"
                transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(${leaf.scale})`}
                style={{ "--leaf-index": leaf.id } as CSSProperties}
              />
            ))}
            <g className="project-canopy-leaves">
              {projects.map((project, index) => {
                const leaf = leaves[(index * 13 + 7) % leaves.length];
                return (
                  <a
                    key={project.slug}
                    href={`/projects/${project.slug}/`}
                    aria-label={`Project: ${project.title}`}
                  >
                    <g transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(.72)`}>
                      <path className="project-leaf-frame" d="M0 0c8-15 25-22 42-21-8 16-25 25-42 21Zm2-2 36-17" />
                      <image
                        className="project-leaf-image"
                        href={project.image}
                        x="4"
                        y="-15"
                        width="29"
                        height="13"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#leaf-image-window)"
                      />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="spring-blossoms">
              {leaves.filter((_, index) => index % 8 === 0).map((leaf) => (
                <g key={leaf.id} transform={`translate(${leaf.x} ${leaf.y})`}>
                  <circle cx="0" cy="0" r="4" />
                  <circle cx="-5" cy="-2" r="3" />
                  <circle cx="5" cy="-2" r="3" />
                  <circle cx="-2" cy="5" r="3" />
                  <circle cx="3" cy="5" r="3" />
                </g>
              ))}
            </g>
            <g className="community-blossoms">
              {communities.map((community, index) => {
                const leaf = leaves[(index * 47 + 21) % leaves.length];
                return (
                  <a
                    key={community.slug}
                    href={`/communities/${community.slug}/`}
                    aria-label={`Community: ${community.title}, ${community.role}`}
                  >
                    <g transform={`translate(${leaf.x} ${leaf.y})`}>
                      <circle className="community-petal" cx="0" cy="-7" r="6" />
                      <circle className="community-petal" cx="7" cy="0" r="6" />
                      <circle className="community-petal" cx="0" cy="7" r="6" />
                      <circle className="community-petal" cx="-7" cy="0" r="6" />
                      <circle className="community-flower-core" r="6.5" />
                      <image
                        className="community-logo"
                        href={community.image}
                        x="-5"
                        y="-5"
                        width="10"
                        height="10"
                        preserveAspectRatio="xMidYMid meet"
                      />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="research-leaves">
              {researchItems.map((item, index) => {
                const leaf = leaves[(index * 59 + 38) % leaves.length];
                return (
                  <a
                    key={item.slug}
                    href={`/research/${item.slug}/`}
                    aria-label={`Research: ${item.title}`}
                  >
                    <g transform={`translate(${leaf.x} ${leaf.y})`}>
                      <circle className="research-leaf" r="7" />
                      <path className="research-leaf-mark" d="M-3-2h6M-3 1h6M-3 4h4" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="fresh-growth-buds">
              {freshBuds.map((bud, index) => {
                const leaf = leaves[(index * 31 + 11) % leaves.length];
                return (
                  <a
                    key={`${bud.href}-${index}`}
                    href={bud.href}
                    target={bud.external ? "_blank" : undefined}
                    rel={bud.external ? "noopener noreferrer" : undefined}
                    aria-label={`New growth: ${bud.title}`}
                  >
                    <g transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle})`}>
                      <path className="fresh-bud-leaf" d="M0 0c7-14 22-17 31-14-5 13-17 20-31 14Zm2-2 26-10" />
                      <circle className="fresh-bud-glint" cx="15" cy="-11" r="3" />
                    </g>
                  </a>
                );
              })}
            </g>
            <g className="mango-fruit">
              {awards.map((award, index) => {
                const fruit = fruitPoints[index];
                return (
                  <a
                    key={award.slug}
                    href={`/awards/${award.slug}/`}
                    aria-label={`Award: ${award.title}`}
                  >
                    <g transform={`translate(${fruit.x} ${fruit.y + 20})`}>
                      <ellipse cx="4" cy="8" rx={fruit.size * 0.7} ry={fruit.size * 0.42} filter="url(#fruit-shadow)" />
                      <path
                        d={`M0 0c${fruit.size * 0.9}-${fruit.size * 0.9} ${fruit.size * 1.8} ${fruit.size * 0.1} ${fruit.size * 0.9} ${fruit.size * 1.55}C${fruit.size * 0.3} ${fruit.size * 2.5}-${fruit.size * 0.9} ${fruit.size * 0.75} 0 0Z`}
                      />
                      <path d="M0 0q2-8 8-10" />
                    </g>
                  </a>
                );
              })}
            </g>
            <path className="canopy-light-dapple" d="M215 515c119-185 247-235 354-219 83 12 126 75 194 68 96-10 164-146 304-126 119 17 196 114 229 239-72-85-139-106-214-61-98 60-132 144-251 121-101-19-135-95-237-71-103 24-203 122-379 49Z" />
          </g>
          <path
            className="tree-trunk-main"
            d="M747 1064c13-61 4-113 13-165 11-62 43-101 37-162-5-55-33-105-18-162 12-46 49-82 51-133l12-18 15 18c1 52 38 89 52 136 17 59-13 108-17 163-4 62 28 104 38 166 9 54-2 106 14 157-62 24-129 28-197 0Z"
          />
          <g className="tree-limbs">
            <path d="M806 1077c-10-113 29-202-5-308-29-91-72-161-51-278 16-93 81-157 66-265" />
            <path d="M776 772c-92-35-171-99-267-117-92-17-159 2-247-49-48-28-75-62-111-105" />
            <path d="M750 681c-110-18-170-56-253-119-76-58-122-112-216-120" />
            <path d="M816 701c87-43 154-115 250-132 86-15 163 6 244-39 46-26 83-64 118-103" />
            <path d="M830 598c116-38 177-94 252-160 69-61 128-104 225-111" />
            <path d="M787 542c-31-103-108-165-102-262 5-77 49-128 60-189" />
            <path d="M816 492c37-88 116-150 123-243 5-62-16-109-26-155" />
            <path d="M738 861c-100-12-162-54-245-35-63 14-113 54-179 68" />
            <path d="M864 835c101-21 162-60 250-46 58 9 115 49 179 57" />
          </g>
          <g className="branch-gloss">
            <path d="M806 1077c-10-113 29-202-5-308-29-91-72-161-51-278 16-93 81-157 66-265" />
            <path d="M776 772c-92-35-171-99-267-117-92-17-159 2-247-49-48-28-75-62-111-105" />
            <path d="M816 701c87-43 154-115 250-132 86-15 163 6 244-39 46-26 83-64 118-103" />
            <path d="M787 542c-31-103-108-165-102-262 5-77 49-128 60-189" />
          </g>
          <g className="trunk-ridges" fill="none" strokeLinecap="round">
            <path d="M785 1024c-6-80 42-133 32-209-10-80-44-142-27-215 13-54 48-88 54-152" />
            <path d="M818 1018c-20-65 8-111 24-165 20-67 0-112-18-172-18-65 12-115 28-171" />
            <path d="M751 887c30-50 25-95 6-148-18-50-14-99 11-141" />
            <path d="M842 902c-38-54-38-96-14-155 21-54 5-111-12-157" />
            <path d="M772 1019c24-16 44-21 69-16m-80-74c27 8 46 4 68-11m-66-94c24 12 45 10 63-2m-46-112c20 8 39 4 54-9" />
          </g>
          <g className="certification-buds">
            {certifications.map((item, index) => {
              const x = 753 + index * 46;
              const y = 822 - index * 17;
              return (
                <a
                  key={item.slug}
                  href={`/experience/${item.slug}/`}
                  aria-label={`Certification: ${item.title}`}
                >
                  <path className="certification-bud" d={`M${x} ${y}c-18-16-15-35 3-42 18 8 21 26 3 42-2 2-4 2-6 0Z`} />
                  <path className="certification-bud-stem" d={`M${x + 2} ${y - 2}q7-11 13-20`} />
                </a>
              );
            })}
          </g>
        </g>

        <path className="soil-cut" d="M0 1072c212-20 374 21 548 19 211-3 406-47 596-38 168 9 294 32 456 5v242H0Z" />
        <path className="soil-surface" d="M0 1072c212-20 374 21 548 19 211-3 406-47 596-38 168 9 294 32 456 5" />
        <g className="soil-grain" fill="none">
          {Array.from({ length: 90 }, (_, index) => {
            const x = (index * 137) % 1580;
            const y = 1104 + ((index * 43) % 172);
            const width = 3 + (index % 5) * 1.2;
            return <path key={index} d={`M${x} ${y}l${width} -1`} />;
          })}
        </g>
        <g className="tree-camera" transform={camera}>
          <g className="roots-highlight">
            <path d="M778 1040c-44 28-102 59-169 65-52 4-90-4-151 16" />
            <path d="M810 1044c-13 43-52 79-99 103-55 28-100 33-145 74" />
            <path d="M837 1040c35 38 69 70 132 88 58 17 103 12 159 47" />
            <path d="M842 1040c48 22 102 47 170 48 54 1 91-12 153-1" />
          </g>
        </g>

        <g className="thread-markers" aria-hidden="true">
          {Array.from(highlightedBranches).map((branch) => {
            const anchor = branchAnchors[branch];
            return (
              <g key={branch} transform={`translate(${anchor.x} ${anchor.y})`}>
                <circle r="42" />
                <circle r="26" />
              </g>
            );
          })}
        </g>

        <g className="press-birds">
          {mediaCoverage.map((story, index) => {
            const x = 368 + ((index * 191) % 855);
            const y = 320 + ((index * 73) % 425);
            return (
              <a
                key={story.slug}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open media story: ${story.title}`}
              >
                <circle className="bird-hit-area" cx={x} cy={y} r="24" />
                <path
                  className="bird-shape"
                  d={`M${x - 9} ${y}q8-13 18 0-8-4-13 6-3-4-10-2 3-3 5-4Zm8 4q-5 8-10 6 6-1 8-7`}
                />
                <circle className="bird-eye" cx={x + 5} cy={y - 1} r="1.5" />
              </a>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default memo(TreeScene);
