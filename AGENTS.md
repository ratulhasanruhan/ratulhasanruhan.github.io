<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Portfolio constraints

- Static export: `next.config.ts` sets `output: "export"` and `trailingSlash: true` so Firebase Hosting and GitHub Pages can serve `out/`.
- Next.js Proxy / Middleware is unsupported with static export. Markdown `Accept` negotiation on Vercel lives in `vercel.json` `routes` (before `handle: filesystem`). Firebase and GitHub Pages cannot negotiate; agents should fetch `/ratul-hasan-ruhan.md` directly there.
- Run `npm ci` before typecheck/build. Prefer `npm run typecheck`, `npm run lint`, and `npm run build`.
- Portfolio data: UI catalog is `src/data/*` (typed modules + `*.snapshot.json`). Keep `public/assets/projects/projects.json` and `public/ratul-hasan-ruhan.*` in sync when catalog facts change.
- Bangla page at `public/bn/index.html` is still the legacy static surface; English experience is the Next app under `app/` + `src/components/`.
