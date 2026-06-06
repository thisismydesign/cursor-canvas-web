# AGENTS.md

Guidance for AI agents working in this repo.

## What this project is

A PoC that runs a **Cursor canvas** as a static web app. A canvas is a normal
React `.tsx` that imports **only** from `cursor/canvas`. At build time a Vite
alias + tsconfig path redirect `cursor/canvas` to a Mantine-backed shim, so the
unchanged canvas source renders on GitHub Pages.

## Golden rules

- **Never** import Mantine, Vite, or browser APIs inside `src/canvas/**`. A
  canvas may import from `cursor/canvas` only. Keeping this pure is the whole
  point of the PoC.
- All adaptation lives in `src/shim/cursor-canvas.tsx`. Add new canvas API
  surface there, implemented with Mantine, with **stable prop shapes**.
- Semantic colors go through `tone` → `src/shim/theme.ts`
  (`toneToMantineColor`, `hostTheme`), never hard-coded in components.
- Two settings must stay in sync when changing the alias: `resolve.alias` in
  `vite.config.ts` and `paths` in `tsconfig.json`.

## Environment

Node + pnpm are pinned in `.tool-versions` (managed by mise). Run
`mise install` then `pnpm install`.

## Validation gate (run before finishing changes)

```bash
pnpm typecheck   # tsc --noEmit, strict
pnpm lint        # eslint flat config
pnpm test        # vitest run
pnpm build       # full static build
```

CI (`.github/workflows/ci.yml`) runs typecheck + lint + test on every push/PR.
`deploy.yml` publishes `dist/` to GitHub Pages on push to `main`.

## Conventions

- TypeScript strict; no `any`.
- Prettier: single quotes, trailing commas, semicolons, 80 cols.
- Tests live in `src/shim/__tests__/`. Cover new shim helpers, hook behavior,
  and a smoke render of any new canvas.
- Comments explain intent/trade-offs, not what the code obviously does.
