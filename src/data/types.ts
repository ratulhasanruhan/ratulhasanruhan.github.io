export type BranchId = "projects" | "awards" | "communities" | "research" | "writing" | "experience";

export type ItemKind =
  | "project"
  | "award"
  | "community"
  | "experience"
  | "certification"
  | "publication"
  | "interest"
  | "writing";

export interface AwardImage {
  src: string;
  alt: string;
}

interface BaseItem<K extends ItemKind, B extends BranchId> {
  slug: string;
  kind: K;
  branch: B;
  title: string;
  summary: string;
  description: string;
  year: number | null;
  href?: string;
  relatedSlugs?: string[];
}

export interface Project extends BaseItem<"project", "projects"> {
  category: string;
  image: string;
  href: string;
}

export interface Award extends BaseItem<"award", "awards"> {
  issuer?: string;
  images: AwardImage[];
}

export interface Community extends BaseItem<"community", "communities"> {
  role: string;
  tenure: string;
  image: string;
  logoBackdrop: string;
  href: string;
}

export interface Experience extends BaseItem<"experience" | "certification", "experience"> {
  tenure?: string;
  role?: string;
  issuer?: string;
  isCertification?: boolean;
  href?: string;
}

export interface Writing extends BaseItem<"writing", "writing"> {
  publishedAt: string;
  cover?: string;
  href: string;
}

export interface ResearchItem extends BaseItem<"publication" | "interest", "research"> {
  href?: string;
}

export type PortfolioItem =
  | Project
  | Award
  | Community
  | Experience
  | Writing
  | ResearchItem;

export interface FreshRepository {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  stars: number;
}

export interface FreshContent {
  writings: Writing[];
  repositories: FreshRepository[];
}

export interface ProjectSnapshot {
  title: string;
  subtitle: string;
  category: string;
  image: string;
  url: string;
}
