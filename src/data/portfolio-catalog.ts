import person from "./profile.snapshot.json";
import {
  branches,
  events,
  getTimelineMilestones,
  getTreeItems,
  profile,
  skillGroups,
} from "./catalog";
import { getFreshContent } from "./fresh-content";

export async function getPortfolioCatalog() {
  const { writings } = await getFreshContent();
  return {
    profile: person,
    branches,
    items: getTreeItems(writings),
    timeline: getTimelineMilestones(),
    events,
    skills: skillGroups,
    contact: {
      email: profile.email,
      telephone: profile.phone,
      location: profile.location,
      booking: profile.booking,
    },
    resume: profile.resume,
  };
}

export function toPortfolioMarkdown(
  portfolio: Awaited<ReturnType<typeof getPortfolioCatalog>>,
) {
  const lines = [
    `# ${portfolio.profile.name}`,
    "",
    portfolio.profile.description,
    "",
    "## Sections",
    ...portfolio.branches.map((branch) => `- [${branch.label}](https://also.ratulruhan.cv/${branch.id}/): ${branch.description}`),
    "",
    "## Portfolio items",
  ];
  for (const item of portfolio.items) {
    lines.push("", `### ${item.title}`, `Branch: ${item.branch} · Type: ${item.kind}${item.year ? ` · ${item.year}` : ""}`);
    if (item.organization) lines.push(`Organization: ${item.organization}`);
    lines.push("", item.summary);
    if (item.description !== item.summary) lines.push("", item.description);
    if (item.href) lines.push("", `Link: ${item.href}`);
  }
  lines.push("", "## Timeline", "");
  for (const milestone of portfolio.timeline) {
    lines.push(`- ${milestone.date}: ${milestone.title}${milestone.organization ? ` — ${milestone.organization}` : ""}`);
  }
  lines.push("", "## Events", "");
  for (const event of portfolio.events) {
    lines.push(`- ${event.date}: ${event.event} — ${event.caption}${event.status ? ` (${event.status})` : ""}`);
  }
  lines.push(
    "",
    "## Contact",
    `- Email: ${portfolio.contact.email}`,
    `- Booking: ${portfolio.contact.booking}`,
    `- Résumé: ${portfolio.resume}`,
  );
  return lines.join("\n");
}

export function toLlmsSummary(
  portfolio: Awaited<ReturnType<typeof getPortfolioCatalog>>,
) {
  const featured = portfolio.items
    .filter((item) => item.kind === "project" || item.kind === "award")
    .slice(0, 12);
  return [
    `# ${portfolio.profile.name}`,
    "",
    portfolio.profile.description,
    "",
    "## Key links",
    "- Portfolio: https://also.ratulruhan.cv/",
    "- Profile: https://also.ratulruhan.cv/ratul-hasan-ruhan.md",
    "- Résumé: https://also.ratulruhan.cv" + portfolio.resume,
    "- GitHub: https://github.com/ratulhasanruhan",
    "- LinkedIn: https://www.linkedin.com/in/ratul-hasan-ruhan/",
    "- Contact: mailto:" + portfolio.contact.email,
    "",
    "## Sections",
    ...portfolio.branches.map((branch) => `- [${branch.label}](https://also.ratulruhan.cv/${branch.id}/)`),
    "- [Events](https://also.ratulruhan.cv/#moments)",
    "- [Contact and FAQ](https://also.ratulruhan.cv/#contact)",
    "",
    "## Featured items",
    ...featured.map((item) => `- [${item.title}](https://also.ratulruhan.cv/${item.branch}/${item.slug}/): ${item.summary}`),
    "",
    "## MCP",
    "- Server endpoint: https://also.ratulruhan.cv/api/mcp",
    "- Server card: https://also.ratulruhan.cv/.well-known/mcp.json",
  ].join("\n");
}
