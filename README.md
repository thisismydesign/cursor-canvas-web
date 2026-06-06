# Mantine Canvas PoC

Prove that a file written as a real **Cursor canvas** (importing only from
`cursor/canvas`) can be hosted on **GitHub Pages** by swapping the
`cursor/canvas` module for a **Mantine-backed shim** at build time — with **no
changes to the canvas source**.

## The idea: a module shim, not a converter

The canvas stays a normal `.tsx` React component. The only bridge is one module
that re-exports the `cursor/canvas` API implemented with Mantine. A Vite alias
(and a matching tsconfig path) resolves `cursor/canvas` to that shim. There is
no parser, AST, or registry.

```
demo.canvas.tsx           Vite alias +          src/shim/cursor-canvas.tsx
imports "cursor/canvas" -> tsconfig paths    -> Mantine core + @mantine/charts
                                             -> Vite build -> GitHub Pages
```

## Layout

| Path                               | Role                                              |
| ---------------------------------- | ------------------------------------------------- |
| `.cursor/canvases/demo.canvas.tsx` | The PoC canvas; imports **only** `cursor/canvas`. |
| `src/shim/cursor-canvas.tsx`       | Mantine implementation matching the real SDK API. |
| `src/shim/theme.ts`                | Tone→color map + host-theme tokens.               |
| `src/runtime/index.tsx`            | Web host glue (`CanvasRoot`, `mountCanvas`).      |
| `src/main.tsx`                     | Mounts React inside `MantineProvider`.            |
| `vite.config.ts`                   | `resolve.alias` for `cursor/canvas` + Pages base. |
| `vite.lib.config.ts`               | Library build (shim + runtime) for publishing.    |
| `tsconfig.json`                    | `paths` maps `cursor/canvas` to the shim.         |

The canvas lives under `.cursor/canvases/` (the repo-owned, versioned source of
truth) and the web app imports it directly. The same file is also copied into
the IDE-managed canvases folder so Cursor renders the identical source. Because
the shim mirrors the real SDK API, the canvas compiles and renders unchanged in
both places.

## Getting started

Tool versions (Node, pnpm) are pinned in [`.tool-versions`](./.tool-versions)
and managed with [mise](https://mise.jdx.dev/).

```bash
mise install        # install Node + pnpm from .tool-versions
pnpm install
pnpm dev            # start the dev server
```

Other scripts:

```bash
pnpm typecheck      # tsc --noEmit (validation gate)
pnpm lint           # eslint
pnpm test           # vitest run
pnpm build          # typecheck + vite build -> dist/
```

## How `cursor/canvas` resolves to the shim

Two coordinated settings, runtime and types:

```ts
// vite.config.ts — runtime
resolve: {
  alias: {
    'cursor/canvas': '/src/shim/cursor-canvas.tsx',
  },
}
```

```jsonc
// tsconfig.json — types
"paths": { "cursor/canvas": ["./src/shim/cursor-canvas.tsx"] }
```

For PoC simplicity the shim's own types are the contract. A stricter future
option is to vendor the official `cursor/canvas` `.d.ts` files as the type
source and alias only the runtime, guaranteeing the shim stays API-compatible
with the real SDK.

## Extending the shim

The PoC implements the subset the demo uses: `H1`, `H2`, `Text`, `Stack`,
`Row`, `Spacer`, `Grid`, `Divider`, `Card`/`CardHeader`/`CardBody`, `Stat`,
`Pill`, `Callout`, `Select`, `Checkbox`, `TextInput`, `LineChart`, plus
`useCanvasState` and `useHostTheme`.

To support more of the canvas API:

1. Add the export to `src/shim/cursor-canvas.tsx`, implemented with Mantine.
2. Keep prop shapes stable — they are the contract canvases rely on.
3. If it carries semantic color, map `tone` via `toneColor` in
   `src/shim/theme.ts`, using the SDK's tone vocabulary for that primitive
   (`StatTone`, `PillTone`, `CalloutTone`, `ChartTone`).
4. Add a test under `src/shim/__tests__/`.

The only non-trivial adapter so far is `LineChart`, which reshapes parallel
`categories` + `series[]` arrays into Mantine's array-of-row-objects `data` and
maps each series `tone` to a color (`reshapeLineChartData`).

## Use it in another project

The shim is published as a library so other apps can render their own canvases
on the web. Two entry points:

| Import                                      | Provides                                      |
| ------------------------------------------- | --------------------------------------------- |
| `@thisismydesign/cursor-canvas-web`         | The `cursor/canvas` shim (components, hooks). |
| `@thisismydesign/cursor-canvas-web/runtime` | `CanvasRoot` + `mountCanvas` web host glue.   |

```bash
pnpm add @thisismydesign/cursor-canvas-web
# peer deps the host app must supply itself:
pnpm add react react-dom @mantine/core @mantine/charts recharts
```

Point the bare `cursor/canvas` specifier at the package so your canvas sources
stay pure (the same two-setting alias this repo uses, but resolving to the
published package instead of a local file):

```ts
// vite.config.ts — runtime
resolve: {
  alias: {
    'cursor/canvas': '@thisismydesign/cursor-canvas-web',
  },
}
```

```jsonc
// tsconfig.json — types
"paths": {
  "cursor/canvas": ["./node_modules/@thisismydesign/cursor-canvas-web"]
}
```

Mount a canvas with the runtime helper (it wraps `MantineProvider` for you):

```tsx
// src/main.tsx
import { mountCanvas } from '@thisismydesign/cursor-canvas-web/runtime';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import MyCanvas from '../.cursor/canvases/my.canvas';

mountCanvas('root', <MyCanvas />);
```

Or, if you manage your own React root, wrap the tree with `CanvasRoot`:

```tsx
import { CanvasRoot } from '@thisismydesign/cursor-canvas-web/runtime';
import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';

createRoot(el).render(
  <CanvasRoot defaultColorScheme="auto">
    <MyCanvas />
  </CanvasRoot>,
);
```

The canvas file itself never changes — it still imports only from
`cursor/canvas`, so it renders identically in the Cursor IDE.

## Publishing

`prepublishOnly` runs `typecheck`, `test`, and `build:lib` automatically, so a
publish only needs:

```bash
npm login
npm publish --access public
```

`--access public` is required for the scoped package. Publishing needs 2FA
(WebAuthn/passkey) on your npm account; `npm publish` opens a browser to
complete the passkey prompt.

## Deployment

`deploy.yml` builds and publishes to GitHub Pages on push to `main` via
`configure-pages` / `upload-pages-artifact` / `deploy-pages`. The Vite `base`
defaults to `/cursor-canvas-web/` (project Page); override with the `BASE_PATH`
env var if the repo is renamed.

## Out of scope (PoC)

Full coverage of all canvas components; `DiffView`, `computeDAGLayout`,
`TodoList`, `useCanvasAction` (IDE-only); pixel-identical Cursor styling. The
shim reproduces look and behavior, not the exact renderer.
