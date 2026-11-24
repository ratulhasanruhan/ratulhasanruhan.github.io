import Parser from "rss-parser";
import githubSnapshot from "./github.snapshot.json";
import writingSnapshot from "./writings.snapshot.json";
import { makeWritingItem } from "./catalog";
import { toSlug } from "./slug";
import type { FreshContent, FreshRepository, Writing } from "./types";

const rssParser = new Parser();
const rssUrl = "https://ratulhasanruhan.hashnode.dev/rss.xml";
const reposUrl =
  "https://api.github.com/users/ratulhasanruhan/repos?sort=pushed&per_page=12";

type RssSnapshot = (typeof writingSnapshot)[number];

const fallbackWritings = (writingSnapshot as RssSnapshot[]).map((entry) =>
  makeWritingItem({
    slug: new URL(entry.url).pathname.split("/").filter(Boolean).at(-1) ?? toSlug(entry.title),
    title: entry.title,
    summary: entry.summary,
    publishedAt: entry.date,
    cover: entry.cover,
    href: entry.url,
  }),
);

const fallbackRepositories = githubSnapshot as FreshRepository[];
let freshContentPromise: Promise<FreshContent> | undefined;

async function readWritings(): Promise<Writing[]> {
  try {
    const response = await fetch(rssUrl, {
      cache: "force-cache",
      headers: {
        accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        referer: "https://ratulhasanruhan.hashnode.dev/",
        "user-agent": "Mozilla/5.0 (compatible; MangoTreePortfolio/1.0)",
      },
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) return fallbackWritings;

    const feed = await rssParser.parseString(await response.text());
    const current = feed.items.slice(0, 10).map((item) => {
      const href = item.link ?? "";
      const cover = item.enclosure?.url ?? item.itunes?.image;
      const publishedAt = item.pubDate ? new Date(item.pubDate).toISOString().slice(0, 10) : "";

      return makeWritingItem({
        slug: new URL(href).pathname.split("/").filter(Boolean).at(-1) ?? toSlug(item.title ?? ""),
        title: item.title ?? "",
        summary: item.contentSnippet ?? item.summary ?? item.content ?? "",
        publishedAt,
        cover,
        href,
      });
    }).filter((item) => item.title && item.href && item.publishedAt);

    return current.length ? current : fallbackWritings;
  } catch {
    return fallbackWritings;
  }
}

async function readRepositories(): Promise<FreshRepository[]> {
  try {
    const response = await fetch(reposUrl, {
      cache: "force-cache",
      headers: {
        accept: "application/vnd.github+json",
        "user-agent": "mango-tree-portfolio",
      },
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) return fallbackRepositories;

    const repos = (await response.json()) as {
      name: string;
      html_url: string;
      description: string | null;
      language: string | null;
      pushed_at: string;
      stargazers_count: number;
      fork: boolean;
    }[];

    const current = repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at))
      .slice(0, 6)
      .map((repo) => ({
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        updatedAt: repo.pushed_at,
        stars: repo.stargazers_count,
      }));

    return current.length ? current : fallbackRepositories;
  } catch {
    return fallbackRepositories;
  }
}

export function getFreshContent(): Promise<FreshContent> {
  freshContentPromise ??= Promise.all([readWritings(), readRepositories()]).then(
    ([writings, repositories]) => ({ writings, repositories }),
  );
  return freshContentPromise;
}
