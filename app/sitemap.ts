import type { MetadataRoute } from "next";
import { branches, getTreeItems } from "@/data/catalog";
import { getFreshContent } from "@/data/fresh-content";

export const dynamic = "force-static";

const siteUrl = "https://ratulx.tech";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { writings } = await getFreshContent();
  const items = getTreeItems(writings);
  const branchPages = [
    { url: `${siteUrl}/`, priority: 1, changeFrequency: "weekly" as const },
    ...branches.map((branch) => ({
      url: `${siteUrl}/${branch.id}/`,
      priority: 0.8,
      changeFrequency: "monthly" as const,
    })),
    { url: `${siteUrl}/contact/`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${siteUrl}/bn/`, priority: 0.8, changeFrequency: "monthly" as const },
  ];
  const detailPages = items.map((item) => ({
    url: `${siteUrl}/${item.branch}/${item.slug}/`,
    priority: item.kind === "project" || item.kind === "writing" ? 0.7 : 0.6,
    changeFrequency: "monthly" as const,
  }));
  const machineReadableFiles = [
    "/ratul-hasan-ruhan.json",
    "/ratul-hasan-ruhan.md",
    "/openapi.json",
    "/auth.md",
    "/.well-known/api-catalog",
    "/assets/projects/projects.json",
    "/agent/portfolio.json",
    "/llms.txt",
    "/llms-full.txt",
    "/.well-known/mcp.json",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    priority: 0.4,
    changeFrequency: "monthly" as const,
  }));

  return [...branchPages, ...detailPages, ...machineReadableFiles];
}
