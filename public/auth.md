# Authentication

**No authentication, registration, or API key is required.**

Everything on this site is public, read-only profile data. Agents can fetch any
of the endpoints below with a plain, unauthenticated request. There is no
OAuth server, no token endpoint, no protected resource, and no write API — so
there is nothing to register for.

## Endpoints

| Resource | URL | Content-Type |
|---|---|---|
| Profile (schema.org Person) | `https://ratulx.tech/ratul-hasan-ruhan.json` | `application/ld+json` |
| Projects | `https://ratulx.tech/assets/projects/projects.json` | `application/json` |
| Profile overview | `https://ratulx.tech/ratul-hasan-ruhan.md` | `text/markdown` |
| OpenAPI 3.1 description | `https://ratulx.tech/openapi.json` | `application/vnd.oai.openapi+json` |
| API catalog (RFC 9727) | `https://ratulx.tech/.well-known/api-catalog` | `application/linkset+json` |
| MCP server card | `https://ratulx.tech/.well-known/mcp.json` | `application/json` |
| MCP endpoint | `https://ratulx.tech/api/mcp` | Streamable HTTP; `POST` |
| LLM site guide | `https://ratulx.tech/llms.txt` | `text/plain` |
| Full LLM catalog | `https://ratulx.tech/llms-full.txt` | `text/plain` |
| Portfolio data | `https://ratulx.tech/agent/portfolio.json` | `application/json` |

The MCP endpoint is stateless and read-only. It supports `POST` and `OPTIONS`;
`GET` and `DELETE` return `405 Method Not Allowed`.

On the canonical Vercel host (`ratulx.tech`), HTML page routes
(`/`, `/projects/`, `/bn/`, …) also return the Markdown overview when requested
with `Accept: text/markdown`. Firebase Hosting and GitHub Pages serve static
files only, so prefer the direct `/ratul-hasan-ruhan.md` URL there. GitHub Pages
cannot set custom response headers; use the canonical Vercel host for
cross-origin access to `/agent/portfolio.json`.

## Usage terms

- Rate limits: none enforced; please cache (`Cache-Control` headers are set).
- CORS: `Access-Control-Allow-Origin: *` on the data endpoints.
- AI usage preferences are declared in [`/robots.txt`](https://ratulx.tech/robots.txt) (`Content-Signal`).
- Contact for anything else: ratulhasan1644@gmail.com
