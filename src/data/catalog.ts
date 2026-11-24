import projectsSnapshot from "./projects.snapshot.json";
import profileSnapshot from "./profile.snapshot.json";
import eventsSnapshot from "./events.snapshot.json";
import { toSlug } from "./slug";
import type {
  Award,
  BranchId,
  Community,
  EducationItem,
  PortfolioEvent,
  Experience,
  PortfolioItem,
  ProfileSkillGroup,
  Project,
  ProjectSnapshot,
  TimelineMilestone,
  Writing,
} from "./types";

type ProfileRecord = {
  name: string;
  jobTitle: string;
  email: string;
  telephone: string;
  description: string;
  sameAs: string[];
  address: { addressLocality: string; addressCountry: string };
  memberOf: {
    roleName: string;
    startDate: string;
    endDate?: string;
    description?: string;
    contactEmail?: string;
    memberOf: { name: string; url: string };
  }[];
  award: {
    name: string;
    dateReceived: string;
    receivedAt?: string;
    description: string;
    awardedBy?: { name: string };
  }[];
  additionalData?: {
    skills?: ProfileSkillGroup[];
  };
};

const profileData = profileSnapshot as ProfileRecord;

export const profile = {
  name: profileData.name,
  title: profileData.jobTitle,
  email: profileData.email,
  phone: profileData.telephone,
  location: `${profileData.address.addressLocality}, ${profileData.address.addressCountry}`,
  description: profileData.description,
  sameAs: profileData.sameAs,
  linkedin: "https://www.linkedin.com/in/ratul-hasan-ruhan/",
  github: "https://github.com/ratulhasanruhan",
  website: "https://ratulhasan.link",
  appibrium: "https://appibrium.com",
  whatsapp: "https://wa.me/8801789536985",
  booking:
    "https://calendar.google.com/calendar/appointments/schedules/AcZssZ01vVQ1tVn35qEWA91zEWLjB0OY56xiZE_gVIc58FSZojPLTSxfHnpbgNrCQudJHp1GyClOtSOs?gv=true",
  resume: "/assets/Ratul-Hasan-Ruhan-Resume.pdf",
  contactForm: "https://formspree.io/f/mkgrbazr",
  portrait: "/assets/images/portfolio/portrait.webp",
};

export const expertise = [
  {
    title: "Product & Systems Engineering",
    description: "End-to-end software systems across platforms, built with clean architecture.",
  },
  {
    title: "Mobile & Cross-Platform",
    description: "Performance-focused mobile applications for real users.",
  },
  {
    title: "Desktop & Core Systems",
    description: "Desktop software and foundational system components.",
  },
  {
    title: "AI / ML & Research",
    description: "Applied machine learning and system-level research exploration.",
  },
  {
    title: "Embedded & IoT",
    description: "Software for embedded devices and smart systems.",
  },
  {
    title: "DevOps & Cloud Infrastructure",
    description: "Build pipelines, deployments, and production tooling.",
  },
];

export const skillGroups = profileData.additionalData?.skills ?? [];

export const branches: {
  id: BranchId;
  label: string;
  bangla: string;
  short: string;
  description: string;
}[] = [
  {
    id: "projects",
    label: "Projects",
    bangla: "প্রকল্প",
    short: "Builds & experiments",
    description: "Things imagined, engineered, and set in motion.",
  },
  {
    id: "awards",
    label: "Awards",
    bangla: "পুরস্কার",
    short: "Milestones",
    description: "Recognition earned along the way.",
  },
  {
    id: "communities",
    label: "Communities",
    bangla: "সম্প্রদায়",
    short: "People & purpose",
    description: "Shared work with communities that make a difference.",
  },
  {
    id: "research",
    label: "Research",
    bangla: "গবেষণা",
    short: "Questions & ideas",
    description: "A study of how systems can work better for people.",
  },
  {
    id: "writing",
    label: "Writing",
    bangla: "লেখালেখি",
    short: "Notes from the field",
    description: "Practical notes from building software.",
  },
  {
    id: "experience",
    label: "Experience",
    bangla: "অভিজ্ঞতা",
    short: "Work & learning",
    description: "Roles, craft, and the roots beneath each new skill.",
  },
];

const projectSlugCounts = new Map<string, number>();

export const projects: Project[] = (projectsSnapshot as ProjectSnapshot[]).map((entry) => {
  const baseSlug = entry.slug ?? (toSlug(entry.title) || "project");
  const count = projectSlugCounts.get(baseSlug) ?? 0;
  projectSlugCounts.set(baseSlug, count + 1);
  const slug = count ? `${baseSlug}-${count + 1}` : baseSlug;

  return {
    slug,
    kind: "project",
    branch: "projects",
    title: entry.title,
    summary: entry.subtitle,
    description: entry.description ?? entry.subtitle,
    year: entry.year ?? null,
    category: entry.category,
    image: `/assets/projects/${entry.image}`,
    href: entry.url,
    ...(entry.period ? { period: entry.period } : {}),
    ...(entry.organization ? { organization: entry.organization } : {}),
    relatedSlugs:
      entry.relatedSlugs ??
      (slug === "ojogor"
        ? ["bangladesh-ict-innovation-award-2025"]
        : slug === "ishara"
          ? ["national-tech-award-2025"]
          : undefined),
  };
});

const awardImage = (
  src: string,
  alt: string,
): { src: string; alt: string } => ({ src: `/assets/images/awards/${src}`, alt });

export const awards: Award[] = profileData.award.map((sourceAward) => {
  const slug = toSlug(sourceAward.name);
  const imageSets: Record<string, { src: string; alt: string }[]> = {
    "national-ai-build-a-thon-trailblazer": [
      awardImage("ai_buildathon_award_ceremony.JPG", "National AI BUILD-A-THON – Trailblazer Award Ceremony"),
      awardImage("national_ai_buildathon.jpeg", "National AI BUILD-A-THON – Trailblazer"),
    ],
    "coding-fest-2026-1st-place": [
      awardImage("coding_fest_2026.jpg", "Coding Fest 2026 Award Ceremony"),
      awardImage("coding_fest_2026_certificate.jpg", "Coding Fest 2026 Certificate"),
    ],
    "bangladesh-ict-innovation-award-2025": [
      awardImage("winner_trophy.jpg", "Bangladesh ICT & Innovation Award 2025 Trophy"),
      awardImage(
        "award_ceremony.jpg",
        "Ratul Hasan Ruhan at the Bangladesh ICT & Innovation Award 2025 ceremony",
      ),
    ],
    "startup-world-cup-2025-regional-finalist": [
      awardImage("pitch_session.jpg", "Startup World Cup Pitch Session"),
      awardImage("showcase_session.jpg", "Startup World Cup Showcase Session"),
    ],
    "national-tech-award-2025": [awardImage("national_tech_award.jpg", "National Tech Award 2025")],
    "1st-place-programming-contest-dia-ict-fest-2025": [
      awardImage("1st_certificate_programming_contest.jpg", "1st Place Programming Contest Certificate"),
      awardImage("trophy.jpg", "Programming Contest Trophy"),
    ],
    "1st-place-project-showcasing-dia-ict-fest-2025": [
      awardImage("project_showcase.jpg", "Project Showcase Award"),
    ],
    "2nd-place-puzzle-hunt-dia-ict-fest-2025": [
      awardImage(
        "award_receiving.jpg",
        "Receiving the 2nd Place Puzzle Hunt award at DIA ICT Fest 2025",
      ),
    ],
  };

  return {
    slug,
    kind: "award",
    branch: "awards",
    title:
      slug === "startup-world-cup-2025-regional-finalist"
        ? "Startup World Cup — Regional Finalist (Bangladesh 2025)"
        : sourceAward.name,
    summary:
      slug === "startup-world-cup-2025-regional-finalist"
        ? "Regional Finalist (Bangladesh 2025)"
        : sourceAward.awardedBy?.name ?? sourceAward.description,
    description:
      slug === "startup-world-cup-2025-regional-finalist"
        ? "Reached the Bangladesh regional final in 2025."
        : sourceAward.description,
    year: slug === "national-tech-award-2025" ? 2025 : Number.parseInt(sourceAward.dateReceived, 10) || null,
    issuer: sourceAward.awardedBy?.name,
    images: imageSets[slug] ?? [],
    ...(sourceAward.receivedAt ? { receivedAt: sourceAward.receivedAt } : {}),
    ...(slug === "bangladesh-ict-innovation-award-2025"
      ? { relatedSlugs: ["ojogor", "ict-award-tbs-2025"] }
      : slug === "national-tech-award-2025"
        ? { relatedSlugs: ["ishara"] }
      : slug === "national-ai-build-a-thon-trailblazer"
        ? { relatedSlugs: ["national-ai-build-a-thon-prothom-alo"] }
        : {}),
  };
});

const communityAssets: Record<string, string> = {
  "Hult Prize": "hult-prize.webp",
  "Amazon Web Services": "aws.webp",
  "Global Logic & Reasoning Challenge (GLRC)": "glrc.webp",
  "International Computer Science Competition (ICSC)": "icsc.webp",
  "Society for the Popularization of Science, Bangladesh (SPSB)": "spsb.webp",
  "Bangladesh Open Source Network (BdOSN)": "bdosn.webp",
};

const communityLogoBackdrops: Record<string, string> = {
  "Hult Prize": "#a52f45",
  "Amazon Web Services": "#242f40",
  "Global Logic & Reasoning Challenge (GLRC)": "#f4eedf",
  "International Computer Science Competition (ICSC)": "#274b82",
  "Society for the Popularization of Science, Bangladesh (SPSB)": "#493657",
  "Bangladesh Open Source Network (BdOSN)": "#e7f1e8",
};

const communityDescriptions: Record<string, string> = {
  "Hult Prize":
    'Leading the EF Hult Prize program on campus for the 2026–27 tenure. Organize the campus round, guide teams, and connect them with mentors and judges. Hult Prize, often called the "Nobel Prize for students", challenges students to build startups that solve real social problems.',
  "Amazon Web Services": "Building cloud skills in the Bangladeshi student community",
  "Global Logic & Reasoning Challenge (GLRC)":
    "Official Global Logic & Reasoning Challenge ambassador for Bangladesh. Promote logic and reasoning education, organise preparatory sessions, and grow national participation.",
  "International Computer Science Competition (ICSC)":
    "International Computer Science Competition — represent Bangladesh, raise awareness among students, and encourage national participation.",
  "Society for the Popularization of Science, Bangladesh (SPSB)": "Promoting science education",
  "Bangladesh Open Source Network (BdOSN)": "Contributing to open-source culture and digital literacy",
};

export const communities: Community[] = profileData.memberOf.map((membership) => {
  const org = membership.memberOf;
  const role = membership.roleName;
  const description = membership.description ?? communityDescriptions[org.name] ?? org.name;
  const formatDate = (value: string) => {
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) return value === "present" ? "Present" : value;
    return `${new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)).toLocaleString("en", { month: "short", timeZone: "UTC" })} ${match[1]}`;
  };
  const tenureEnd = membership.endDate ? ` – ${formatDate(membership.endDate)}` : " – Present";
  const year = Number.parseInt(membership.startDate, 10) || null;

  return {
    slug: toSlug(org.name.replace(/\s+\([^)]*\)/g, "")),
    kind: "community",
    branch: "communities",
    title: org.name,
    summary: role,
    description,
    year,
    href: org.url,
    role,
    tenure: `${formatDate(membership.startDate)}${tenureEnd}`,
    image: `/assets/images/communities/${communityAssets[org.name]}`,
    logoBackdrop: communityLogoBackdrops[org.name],
    ...(membership.contactEmail ? { contactEmail: membership.contactEmail } : {}),
  };
});

const experienceEntries = [
  {
    title: "Appibrium — Founder & Full-Stack Mobile Architect",
    tenure: "Oct 2025 – Present",
    description:
      "On-site, Dhaka · Designing and building end-to-end mobile systems, from UI to backend infrastructure, with DevOps and ML integration.",
    year: 2025,
    href: "https://appibrium.com",
  },
  {
    title: "Solution Explorer — Software Engineer",
    tenure: "Aug 2025 – Oct 2025",
    description:
      "Remote (MaryLand, US) · Developed cross-platform applications for mobile and desktop, focusing on performance, usability, and scalable architecture.",
    year: 2025,
  },
  {
    title: "Sydrix AI — Mobile Application Developer",
    tenure: "May 2025 – Jul 2025",
    description:
      "Remote (Dhaka, BD) · Built Sydrix AI – Study Smart, an AI-powered study-management mobile app, and contributed to early-stage product prototyping.",
    year: 2025,
  },
  {
    title: "BdCalling IT Ltd. — Flutter Developer",
    tenure: "Apr 2025 – May 2025",
    description:
      "On-site, Dhaka · Implemented real-time features using Socket.io and integrated audio/video calling for iOS and Android apps.",
    year: 2025,
  },
  {
    title: "Emerge AI — Mobile Application Developer",
    tenure: "Aug 2024 – Mar 2025",
    description:
      "Remote (Beijing, CN) · Developed Flutter-based mobile applications and integrated AI-driven features for health and food platforms.",
    year: 2024,
  },
  {
    title: "Infolook — Mobile Application Developer",
    tenure: "Jul 2023 – Aug 2024",
    description:
      "Hybrid (Dhaka, BD) · Delivered cross-platform mobile applications with Flutter, collaborating closely with design and backend teams.",
    year: 2023,
  },
  {
    title: "Spotlight Creative — Android Developer (Freelance)",
    tenure: "Nov 2019 – Dec 2022",
    description: "Developed and maintained enterprise-level Android applications using Java and XML.",
    year: 2019,
  },
];

const certificationEntries = [
  {
    title: "Data Literacy Certification",
    issuer: "DataCamp",
    tenure: "Jun 2026",
    year: 2026,
    href: "https://www.datacamp.com/skill-verification/DL0038378814287",
  },
  {
    title: "Computer Architecture Course",
    issuer: "Codecademy",
    tenure: "Mar 2026",
    year: 2026,
    href: "https://www.codecademy.com/profiles/ratulhasan.ruhan/certificates/dee8cc79cfe5e46834989e0d0ec1d2d5",
  },
  {
    title: "Cisco CCNA 200-301 + Python Network Automation",
    issuer: "Udemy",
    tenure: "2024",
    year: 2024,
    href: "https://www.udemy.com/certificate/UC-42719966-3bd8-47f3-b0ca-d3f67775cfd8/",
  },
];

export const experience: Experience[] = experienceEntries.map((entry) => ({
  slug: toSlug(entry.title),
  kind: "experience",
  branch: "experience",
  title: entry.title,
  summary: entry.tenure,
  description: entry.description,
  year: entry.year,
  tenure: entry.tenure,
  role: entry.title.split("—").at(-1)?.trim(),
  ...("href" in entry ? { href: entry.href } : {}),
}));

export const certifications: Experience[] = certificationEntries.map((entry) => ({
  slug: toSlug(entry.title),
  kind: "certification",
  branch: "experience",
  title: entry.title,
  summary: `${entry.issuer} · ${entry.tenure}`,
  description: `${entry.issuer} · ${entry.tenure}`,
  year: entry.year,
  tenure: entry.tenure,
  href: entry.href,
  isCertification: true,
}));

export const resumeLeaf: PortfolioItem = {
  slug: "resume",
  kind: "experience",
  branch: "experience",
  title: "Résumé",
  summary: "A concise overview of my work, research, and experience.",
  description: "A concise overview of my work, research, and experience.",
  year: null,
  href: profile.resume,
};

export const publication: PortfolioItem = {
  slug: "caller-collision-resolution-protocol",
  kind: "publication",
  branch: "research",
  title: "Caller Collision Resolution Protocol (CCRP): Bridging Simultaneous Call Attempts in Real-World Telephony",
  summary: "Preprint, October 2025 · DOI: 10.13140/RG.2.2.26499.98081",
  description:
    "Caller Collision Resolution Protocol (CCRP): Bridging Simultaneous Call Attempts in Real-World Telephony. Ratul Hasan Ruhan — Preprint, October 2025.",
  year: 2025,
  href: "https://www.researchgate.net/publication/397017372_Caller_Collision_Resolution_Protocol_CCRP_Bridging_Simultaneous_Call_Attempts_in_Real-World_Telephony",
};

export const researchInterests: PortfolioItem[] = [
  "Computer systems and software architecture",
  "Applied AI / ML in real-world systems",
  "Human-centered and localized computing",
  "Programming languages and developer tooling",
].map((title) => ({
  slug: toSlug(title),
  kind: "interest",
  branch: "research",
  title,
  summary: title,
  description: title,
  year: null,
}));

export const researchItems = [publication, ...researchInterests];

export const education: {
  title: string;
  organization: string;
  tenure: string;
  year: number;
  status: string;
  href?: string;
}[] = [
  {
    title: "BSc (Hons) Computing",
    organization: "University of Greenwich (NCC Pathway)",
    tenure: "2025 – present (expected 2028)",
    year: 2025,
    status: "Ongoing · expected 2028",
    href: "https://www.gre.ac.uk/",
  },
  {
    title: "BSc. in Computer Science & Engineering",
    organization: "Daffodil International University",
    tenure: "Jan 2024 - Jan 2025",
    year: 2024,
    status: "Completed",
    href: "https://daffodilvarsity.edu.bd/",
  },
  {
    title: "Higher Secondary Certificate (Science)",
    organization: "Shariatpur Govt. College",
    tenure: "Jan 2021 - Jun 2023",
    year: 2021,
    status: "Completed",
    href: "https://sgc.college.gov.bd/",
  },
  {
    title: "Secondary School Certificate (Science)",
    organization: "PTGD Govt. High School",
    tenure: "Jan 2016 - Dec 2020",
    year: 2016,
    status: "Completed",
  },
];

export const educationItems: EducationItem[] = education.map((entry) => ({
  slug: toSlug(entry.title),
  kind: "education",
  branch: "experience",
  title: entry.title,
  summary: `${entry.organization} · ${entry.tenure}`,
  description: `${entry.title} at ${entry.organization}.`,
  year: entry.year,
  organization: entry.organization,
  tenure: entry.tenure,
  status: entry.status,
  ...(entry.href ? { href: entry.href } : {}),
}));

export const events: PortfolioEvent[] = eventsSnapshot as PortfolioEvent[];

export function getEventsForItem(item: Pick<PortfolioItem, "branch" | "slug">) {
  return events.filter((event) =>
    event.relatedItems.some((related) => related.branch === item.branch && related.slug === item.slug),
  );
}

const timelineItems: TimelineMilestone[] = [
  ...educationItems.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.tenure,
    year: item.year ?? 0,
    category: "education" as const,
    organization: item.organization,
    href: item.href,
    item: { branch: item.branch, slug: item.slug },
  })),
  ...experience.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.tenure ?? String(item.year ?? ""),
    year: item.year ?? 0,
    category: "experience" as const,
    item: { branch: item.branch, slug: item.slug },
  })),
  ...certifications.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.tenure ?? String(item.year ?? ""),
    year: item.year ?? 0,
    category: "certification" as const,
    organization: item.issuer,
    href: item.href,
    item: { branch: item.branch, slug: item.slug },
  })),
  ...communities.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.tenure,
    year: item.year ?? 0,
    category: "community" as const,
    organization: item.title,
    href: item.href,
    item: { branch: item.branch, slug: item.slug },
  })),
  ...awards.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.receivedAt ?? String(item.year ?? ""),
    year: item.year ?? 0,
    category: "award" as const,
    organization: item.issuer,
    item: { branch: item.branch, slug: item.slug },
  })),
  ...projects.map((item) => ({
    slug: item.slug,
    title: item.title,
    date: item.period ?? String(item.year ?? ""),
    year: item.year ?? (Number.parseInt(item.period?.slice(0, 4) ?? "", 10) || 0),
    category: "project" as const,
    organization: item.organization,
    href: item.href,
    item: { branch: item.branch, slug: item.slug },
  })),
  ...researchItems
    .filter((item) => item.kind === "publication")
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      date: String(item.year ?? ""),
      year: item.year ?? 0,
      category: "research" as const,
      href: item.href,
      item: { branch: item.branch, slug: item.slug },
    })),
];

export function getTimelineMilestones(options: {
  fromYear?: number;
  toYear?: number;
  category?: TimelineMilestone["category"];
} = {}) {
  return timelineItems
    .filter((milestone) => {
      if (!milestone.year) return false;
      if (options.fromYear !== undefined && milestone.year < options.fromYear) return false;
      if (options.toYear !== undefined && milestone.year > options.toYear) return false;
      return !options.category || milestone.category === options.category;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.title.localeCompare(a.title));
}

export const mediaCoverage = [
  {
    slug: "ojogor-introduces-bangla-syntax-to-programming-tbs",
    title: "Ojogor introduces Bangla syntax to programming — The Business Standard",
    url: "https://tbsgraduates.net/writeup/programming-made-easy-diu-students-ojogor-introduces-bangla-syntax-to-python/",
    year: null,
    relatedSlugs: ["ojogor", "bangladesh-ict-innovation-award-2025"],
  },
  {
    slug: "ojogor-protidiner-bangladesh",
    title: "বাংলায় প্রথম প্রোগ্রামিং ভাষা রুহানের ‘অজগর’ — Protidiner Bangladesh",
    url: "https://protidinerbangladesh.com/technology/132975/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A7%9F-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A5%E0%A6%AE-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A7%8B%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%AE%E0%A6%BF%E0%A6%82-%E0%A6%AD%E0%A6%BE%E0%A6%B7%E0%A6%BE-%E0%A6%B0%E0%A7%81%E0%A6%B9%E0%A6%BE%E0%A6%A8%E0%A7%87%E0%A6%B0-%E0%A6%85%E0%A6%9C%E0%A6%97%E0%A6%B0",
    year: null,
    relatedSlugs: ["ojogor", "bangladesh-ict-innovation-award-2025"],
  },
  {
    slug: "ojogor-business-standard-linkedin",
    title: "Student creates Python in Bangla to help others learn — The Business Standard (LinkedIn)",
    url: "https://www.linkedin.com/posts/the-business-standard_programming-made-easy-diu-students-ojogor-activity-7308421903390572544-BvIZ/",
    year: null,
    relatedSlugs: ["ojogor"],
  },
  {
    slug: "ojogor-daily-blurb",
    title: "Ojogor — First Bengali Programming Language — Daily Blurb",
    url: "https://www.instagram.com/p/DG7yqCVyWCO/",
    year: null,
    relatedSlugs: ["ojogor"],
  },
  {
    slug: "ojogor-infogrambd",
    title: "Ojogor Programming Language — InfogramBD",
    url: "https://www.facebook.com/infogrambd/posts/more-details-in-the-comments-section/657991090072772/",
    year: null,
    relatedSlugs: ["ojogor"],
  },
  {
    slug: "ojogor-bongowiki",
    title: "Ojogor — First Bengali Programming Language — BongoWiki",
    url: "https://www.facebook.com/share/p/1Kmhp2zus2/",
    year: null,
    relatedSlugs: ["ojogor"],
  },
  {
    slug: "ict-award-tbs-2025",
    title: "Bangladesh ICT and Innovation Network recognises nation's top innovators — The Business Standard",
    url: "https://www.tbsnews.net/bangladesh/bangladesh-ict-and-innovation-network-recognises-nations-top-innovators-1265456#:~:text=Ojogor%20from%20Daffodil%20International%20University%20(DIU)",
    year: 2025,
    relatedSlugs: ["bangladesh-ict-innovation-award-2025", "ojogor"],
  },
  {
    slug: "ict-award-techworld-bangladesh",
    title: "BIIN honours country's top innovators — TechWorld Bangladesh",
    url: "https://en.techworldbd.com/news/98#:~:text=Daffodil%20International%20University%E2%80%94DIU%20(Ajogor)",
    year: 2025,
    relatedSlugs: ["bangladesh-ict-innovation-award-2025", "ojogor"],
  },
  {
    slug: "ict-award-dhaka-tribune",
    title: "Bangladesh ICT and Innovation Network honors the country's top innovators — Dhaka Tribune",
    url: "https://www.dhakatribune.com/bangladesh/event/394357/bangladesh-ict-and-innovation-network-honors-the#:~:text=Fraud%20Shield%20(AIUB)%2C-,Ojogor%20(DIU),-%2C%20and%20Sohopathi%20AI",
    year: 2025,
    relatedSlugs: ["bangladesh-ict-innovation-award-2025", "ojogor"],
  },
  {
    slug: "dia-ict-fest-tbs",
    title: "Daffodil International Academy ICT Fest 2025 inaugurated — The Business Standard",
    url: "https://www.tbsnews.net/economy/corporates/daffodil-international-academy-ict-fest-2025-inaugurated-1075236",
    year: 2025,
    relatedSlugs: ["1st-place-programming-contest-dia-ict-fest-2025"],
  },
  {
    slug: "national-ai-build-a-thon-prothom-alo",
    title: "ন্যাশনাল এআই বিল্ড-এ-থনে বিজয়ী ৫ দল পেল ল্যাপটপ ও অর্থ পুরস্কার — Prothom Alo",
    url: "https://www.prothomalo.com/technology/hqdxhziscj",
    year: 2026,
    relatedSlugs: ["national-ai-build-a-thon-trailblazer"],
  },
  {
    slug: "national-ai-build-a-thon-a1news24",
    title: "ন্যাশনাল এআই বিল্ড-এ-থন — A1News24",
    url: "https://www.a1news24.com/%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%A7%E0%A6%BE%E0%A6%A8%E0%A7%80%E0%A6%A4%E0%A7%87-%E0%A6%86%E0%A6%AF%E0%A6%BC%E0%A7%8B%E0%A6%9C%E0%A6%BF%E0%A6%A4-%E0%A6%B9%E0%A6%B2-%E0%A6%A8%E0%A7%8D%E0%A6%AF/",
    year: 2026,
    relatedSlugs: ["national-ai-build-a-thon-trailblazer"],
  },
].map((story) => ({
  ...story,
  branch: "awards" as BranchId,
  summary: story.title,
}));

export function makeWritingItem(
  writing: Pick<Writing, "slug" | "title" | "summary" | "publishedAt" | "cover" | "href">,
): Writing {
  return {
    ...writing,
    kind: "writing",
    branch: "writing",
    description: writing.summary,
    year: Number.parseInt(writing.publishedAt.slice(0, 4), 10) || null,
  };
}

export function getTreeItems(writings: Writing[]): PortfolioItem[] {
  return [
    ...projects,
    ...awards,
    ...communities,
    ...researchItems,
    ...writings,
    ...experience,
    ...certifications,
    ...educationItems,
    resumeLeaf,
  ];
}

export function getItemsForBranch(branch: BranchId, writings: Writing[]): PortfolioItem[] {
  return getTreeItems(writings).filter((item) => item.branch === branch);
}
