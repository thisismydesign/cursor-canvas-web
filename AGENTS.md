# AGENTS.md

Guidance for AI agents working in this repo.

## What this project is

A PoC that runs a **Cursor canvas** as a static web app. A canvas is a normal
React `.tsx` that imports **only** from `cursor/canvas`. At build time a Vite
alias + tsconfig path redirect `cursor/canvas` to a Mantine-backed shim, so the
unchanged canvas source renders on GitHub Pages.

The repo-owned canvas at `.cursor/canvases/demo.canvas.tsx` is the **single
source of truth**: the web app imports it directly, and the same file is copied
into the IDE-managed canvases folder so it renders in Cursor too.

## Golden rules

- **Never** import Mantine, Vite, or browser APIs inside `.cursor/canvases/**`.
  A canvas may import from `cursor/canvas` only. Keeping this pure is the whole
  point of the PoC.
- The shim **must stay API-compatible with the real SDK**. The authoritative
  contract is the official declarations at
  `~/.cursor/skills-cursor/canvas/sdk/*.d.ts` (components, props, tones, hook
  signatures). A canvas that compiles here must also compile/render unchanged
  in the IDE — so match prop shapes and the real tone vocabularies
  (`StatTone`, `PillTone`, `CalloutTone`, `ChartTone`, `Text` tones). Do not
  invent exports (e.g. a generic `Tone`) that the real SDK lacks.
- All adaptation lives in `src/shim/cursor-canvas.tsx`. Add new canvas API
  surface there, implemented with Mantine, mirroring the SDK declarations.
- Semantic colors go through `tone` → `src/shim/theme.ts` (`toneColor`), never
  hard-coded in components.
- Two settings must stay in sync when changing the alias: `resolve.alias` in
  `vite.config.ts` and `paths` in `tsconfig.json`.

## Canvases

Repo-owned canvases live at `.cursor/canvases/<name>.canvas.tsx` — versioned
source of truth, edit here. The IDE renders only from
`~/.cursor/projects/<workspace>/canvases/`, so after editing, `cp` the repo copy
over the managed one. Live UI edits persist to a managed-folder
`*.canvas.data.json` sidecar (not versioned); fold meaningful values into the
repo defaults. Skills reference their canvas by name and keep it current.
Authoring rules: `canvas` skill.

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
  and a smoke render of any canvas.
- After editing `.cursor/canvases/*.canvas.tsx`, copy it into the managed
  folder so the IDE picks up the change.
- Comments explain intent/trade-offs, not what the code obviously does.
