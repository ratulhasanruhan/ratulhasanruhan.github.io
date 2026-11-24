# Authentication

**No authentication, registration, or API key is required.**

Everything on this site is public, read-only profile data. Agents can fetch any
of the endpoints below with a plain, unauthenticated `GET` request. There is no
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

Any HTML page route (`/`, `/resume`, `/projects`, …) also returns the Markdown
overview when requested with `Accept: text/markdown`.

## Usage terms

- Rate limits: none enforced; please cache (`Cache-Control` headers are set).
- CORS: `Access-Control-Allow-Origin: *` on the data endpoints.
- AI usage preferences are declared in [`/robots.txt`](https://also.ratulruhan.cv/robots.txt) (`Content-Signal`).
- Contact for anything else: ratulhasan1644@gmail.com
