export type BranchId = "projects" | "awards" | "communities" | "research" | "writing" | "experience";

export type ItemKind =
  | "project"
  | "award"
  | "community"
  | "experience"
  | "education"
  | "certification"
  | "publication"
  | "interest"
  | "writing"
  | "event";

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
  organization?: string;
}

export interface Project extends BaseItem<"project", "projects"> {
  category: string;
  image: string;
  href: string;
  period?: string;
}

export interface Award extends BaseItem<"award", "awards"> {
  issuer?: string;
  images: AwardImage[];
  receivedAt?: string;
}

export interface Community extends BaseItem<"community", "communities"> {
  role: string;
  tenure: string;
  image: string;
  logoBackdrop: string;
  href: string;
  contactEmail?: string;
}

export interface Experience extends BaseItem<"experience" | "certification", "experience"> {
  tenure?: string;
  role?: string;
  issuer?: string;
  isCertification?: boolean;
  href?: string;
}

export interface EducationItem extends BaseItem<"education", "experience"> {
  organization: string;
  tenure: string;
  status?: string;
}

export interface Writing extends BaseItem<"writing", "writing"> {
  publishedAt: string;
  cover?: string;
  href: string;
}

export interface ResearchItem extends BaseItem<"publication" | "interest", "research"> {
  href?: string;
}

export interface EventPhoto {
  file: string;
  width: number;
  height: number;
}

export interface PortfolioEvent {
  slug: string;
  event: string;
  date: string;
  caption: string;
  postUrl?: string;
  photos: EventPhoto[];
  relatedItems: { branch: BranchId; slug: string }[];
  status?: "announced";
}

export interface TimelineMilestone {
  slug: string;
  title: string;
  date: string;
  year: number;
  category: "education" | "experience" | "community" | "award" | "project" | "research" | "certification";
  organization?: string;
  href?: string;
  item: { branch: BranchId; slug: string };
}

export interface ProfileSkillGroup {
  category: string;
  technologies: string[];
  description: string;
}

export type PortfolioItem =
  | Project
  | Award
  | Community
  | Experience
  | EducationItem
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
  slug?: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  url: string;
  year?: number | null;
  period?: string;
  description?: string;
  organization?: string;
  relatedSlugs?: string[];
}
