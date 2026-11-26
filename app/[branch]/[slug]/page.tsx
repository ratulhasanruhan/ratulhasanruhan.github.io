import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PortfolioShell from "@/components/PortfolioShell";
import { getTreeItems } from "@/data/catalog";
import { getFreshContent } from "@/data/fresh-content";
import type { PortfolioItem } from "@/data/types";

const siteUrl = "https://ratulx.tech";

export const dynamicParams = false;

function itemImage(item: PortfolioItem) {
  if (item.kind === "project" || item.kind === "community") return item.image;
  if (item.kind === "award") return item.images[0]?.src;
  if (item.kind === "writing") return item.cover;
  return undefined;
}

async function resolveItem(branch: string, slug: string) {
  const { writings } = await getFreshContent();
  return getTreeItems(writings).find((item) => item.branch === branch && item.slug === slug);
}

export async function generateStaticParams() {
  const { writings } = await getFreshContent();
  return getTreeItems(writings).map((item) => ({ branch: item.branch, slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ branch: string; slug: string }>;
}): Promise<Metadata> {
  const { branch, slug } = await params;
  const item = await resolveItem(branch, slug);
  if (!item) return { title: "Leaf not found" };

  const description = item.description || item.summary;
  const image = itemImage(item) ?? "/assets/images/ratulhasan-avatar.png";
  const canonical = `${siteUrl}/${item.branch}/${item.slug}/`;

  return {
    title: item.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: item.title,
      description,
      url: canonical,
      images: [{ url: image, alt: item.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description,
      images: [image],
    },
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ branch: string; slug: string }>;
}) {
  const { branch, slug } = await params;
  const item = await resolveItem(branch, slug);
  if (!item) notFound();

  return <PortfolioShell initialBranch={item.branch} slug={item.slug} />;
}
