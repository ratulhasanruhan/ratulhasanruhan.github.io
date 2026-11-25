# Authentication

**No authentication, registration, or API key is required.**

Everything on this site is public, read-only profile data. Agents can fetch any
of the endpoints below with a plain, unauthenticated request. There is no
OAuth server, no token endpoint, no protected resource, and no write API — so
there is nothing to register for.

## Endpoints

| Resource | URL | Content-Type |
|---|---|---|
| Profile (schema.org Person) | `https://also.ratulruhan.cv/ratul-hasan-ruhan.json` | `application/ld+json` |
| Projects | `https://also.ratulruhan.cv/assets/projects/projects.json` | `application/json` |
| Profile overview | `https://also.ratulruhan.cv/ratul-hasan-ruhan.md` | `text/markdown` |
| OpenAPI 3.1 description | `https://also.ratulruhan.cv/openapi.json` | `application/vnd.oai.openapi+json` |
| API catalog (RFC 9727) | `https://also.ratulruhan.cv/.well-known/api-catalog` | `application/linkset+json` |
| MCP server card | `https://also.ratulruhan.cv/.well-known/mcp.json` | `application/json` |
| MCP endpoint | `https://also.ratulruhan.cv/api/mcp` | Streamable HTTP; `POST` |
| LLM site guide | `https://also.ratulruhan.cv/llms.txt` | `text/plain` |
| Full LLM catalog | `https://also.ratulruhan.cv/llms-full.txt` | `text/plain` |
| Portfolio data | `https://also.ratulruhan.cv/agent/portfolio.json` | `application/json` |

The MCP endpoint is stateless and read-only. It supports `POST` and `OPTIONS`;
`GET` and `DELETE` return `405 Method Not Allowed`.

On the canonical Vercel host (`also.ratulruhan.cv`), HTML page routes
(`/`, `/projects/`, `/bn/`, …) also return the Markdown overview when requested
with `Accept: text/markdown`. Firebase Hosting and GitHub Pages serve static
files only, so prefer the direct `/ratul-hasan-ruhan.md` URL there. GitHub Pages
cannot set custom response headers; use the canonical Vercel host for
cross-origin access to `/agent/portfolio.json`.

## Usage terms

- Rate limits: none enforced; please cache (`Cache-Control` headers are set).
- CORS: `Access-Control-Allow-Origin: *` on the data endpoints.
- AI usage preferences are declared in [`/robots.txt`](https://also.ratulruhan.cv/robots.txt) (`Content-Signal`).
- Contact for anything else: ratulhasan1644@gmail.com
