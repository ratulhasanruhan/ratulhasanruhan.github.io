import fallbackProfile from "../public/ratul-hasan-ruhan.json" with { type: "json" };
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

let portfolioPromise;
let markdownPromise;

function header(req, name) {
  const value = req.headers[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function ownOrigin(req) {
  const forwardedHost = header(req, "x-forwarded-host");
  const host = (forwardedHost || header(req, "host") || "").split(",")[0].trim();
  const forwardedProto = (header(req, "x-forwarded-proto") || "").split(",")[0].trim();
  if (!host || !/^[a-z0-9.-]+(?::\d{1,5})?$/i.test(host)) return null;
  const hostname = new URL(`http://${host}`).hostname.toLowerCase();
  const local = !process.env.VERCEL && ["localhost", "127.0.0.1"].includes(hostname);
  const protocol = forwardedProto === "https" ? "https" :
    forwardedProto === "http" && !process.env.VERCEL ? "http" :
      local ? "http" : "https";
  const deployment = hostname === "also.ratulruhan.cv" ||
    hostname.endsWith(".ratulruhan.cv") ||
    hostname.endsWith(".vercel.app") ||
    local;
  return deployment ? `${protocol}://${host}` : null;
}

async function fallbackPortfolio() {
  const profile = fallbackProfile;
  return {
    profile,
    branches: [],
    items: [],
    events: [],
    timeline: [],
    skills: profile.additionalData?.skills ?? [],
    contact: {
      email: profile.email,
      telephone: profile.telephone,
      location: profile.address?.addressLocality,
      booking: "https://also.ratulruhan.cv/#contact",
    },
    resume: "/assets/Ratul-Hasan-Ruhan-Resume.pdf",
  };
}

async function getPortfolio(req) {
  if (portfolioPromise) return portfolioPromise;
  const origin = ownOrigin(req);
  if (!origin) return fallbackPortfolio();

  const request = fetch(`${origin}/agent/portfolio.json`, {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(3500),
  }).then((response) => {
    if (!response.ok) throw new Error(`Portfolio fetch failed with ${response.status}.`);
    return response.json();
  });
  portfolioPromise = request;
  try {
    return await request;
  } catch {
    if (portfolioPromise === request) portfolioPromise = undefined;
    return fallbackPortfolio();
  }
}

async function getProfileMarkdown(req, origin) {
  if (markdownPromise) return markdownPromise;
  if (!origin) {
    const { profile } = await getPortfolio(req);
    return `# ${profile.name}\n\n${profile.description}\n`;
  }

  const request = (async () => {
    const response = await fetch(`${origin}/ratul-hasan-ruhan.md`, {
      headers: { accept: "text/markdown" },
      signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) throw new Error(`Profile Markdown fetch failed with ${response.status}.`);
    return await response.text();
  })();
  markdownPromise = request;
  try {
    return await request;
  } catch {
    if (markdownPromise === request) markdownPromise = undefined;
    const { profile } = await getPortfolio(req);
    return `# ${profile.name}\n\n${profile.description}\n`;
  }
}

function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase();
}

function createServer(portfolio, markdown) {
  const server = new McpServer({ name: "Ratul Hasan Ruhan Portfolio", version: "1.0.0" });
  const readOnly = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };

  server.registerTool("get_profile", {
    title: "Get profile",
    description: "Return Ratul Hasan Ruhan's public profile record.",
    annotations: readOnly,
  }, async () => textResult(portfolio.profile));

  server.registerTool("search_portfolio", {
    title: "Search portfolio",
    description: "Search portfolio items by title, summary, description, organization, or category. Accents are ignored.",
    inputSchema: {
      query: z.string().min(1),
      limit: z.number().int().min(1).max(50).optional(),
    },
    annotations: readOnly,
  }, async ({ query, limit = 10 }) => {
    const term = normalize(query.trim());
    const results = (portfolio.items ?? []).filter((item) =>
      normalize([
        item.title,
        item.summary,
        item.description,
        item.organization,
        item.category,
      ].join(" ")).includes(term),
    ).slice(0, limit);
    return textResult(results);
  });

  server.registerTool("list_items", {
    title: "List portfolio items",
    description: "List read-only portfolio items by branch and optional year.",
    inputSchema: {
      branch: z.enum(["projects", "awards", "communities", "research", "writing", "experience"]),
      year: z.number().int().optional(),
    },
    annotations: readOnly,
  }, async ({ branch, year }) => textResult(
    (portfolio.items ?? []).filter((item) =>
      item.branch === branch && (year === undefined || item.year === year),
    ),
  ));

  server.registerTool("get_item", {
    title: "Get portfolio item",
    description: "Return one portfolio item by branch and slug.",
    inputSchema: {
      branch: z.enum(["projects", "awards", "communities", "research", "writing", "experience"]),
      slug: z.string().min(1),
    },
    annotations: readOnly,
  }, async ({ branch, slug }) => {
    const item = (portfolio.items ?? []).find((entry) => entry.branch === branch && entry.slug === slug);
    return item ? textResult(item) : textResult({ error: "Item not found", branch, slug });
  });

  server.registerTool("get_timeline", {
    title: "Get timeline",
    description: "Return education, experience, community, award, project, research, and certification milestones.",
    annotations: readOnly,
  }, async () => textResult(portfolio.timeline ?? []));

  server.registerTool("get_events", {
    title: "Get events",
    description: "Return public event records and related item links.",
    annotations: readOnly,
  }, async () => textResult(portfolio.events ?? []));

  server.registerTool("get_contact_info", {
    title: "Get contact information",
    description: "Return public contact and booking information.",
    annotations: readOnly,
  }, async () => textResult(portfolio.contact ?? {}));

  server.registerTool("get_resume", {
    title: "Get résumé",
    description: "Return the public résumé download URL.",
    annotations: readOnly,
  }, async () => textResult({ url: portfolio.resume }));

  server.registerResource(
    "profile-markdown",
    "portfolio://profile",
    { title: "Profile in Markdown", description: "Public profile overview.", mimeType: "text/markdown" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "text/markdown", text: markdown }] }),
  );
  server.registerResource(
    "portfolio-json",
    "portfolio://catalog",
    { title: "Portfolio catalog", description: "Public portfolio items, events, and timeline.", mimeType: "application/json" },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: "application/json", text: JSON.stringify(portfolio) }] }),
  );
  return server;
}

async function readBody(req) {
  if (req.body !== undefined) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("Request body exceeds 1 MB.");
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : undefined;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, MCP-Protocol-Version, MCP-Session-Id, Last-Event-ID");
  res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id, MCP-Protocol-Version");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  try {
    const origin = ownOrigin(req);
    const [portfolio, markdown, body] = await Promise.all([
      getPortfolio(req),
      getProfileMarkdown(req, origin),
      readBody(req),
    ]);
    const server = createServer(portfolio, markdown);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (error) {
    console.error("MCP request failed:", error);
    if (res.headersSent) return;
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : "MCP request failed." }));
  }
}
