import { describe, expect, it } from 'vitest';
import type { ReactNode } from 'react';
import { render, renderHook } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import {
  Swatch,
  UsageBar,
  canvasTokens,
  canvasTokensLight,
  categoryPaletteDark,
  categoryPaletteLight,
  colorPalette,
  useHostTheme,
  type CategoryPalette,
  type Color,
} from 'cursor/canvas';

/** Every hue in the real SDK's `Color` union, in canonical order. */
const HUES: readonly Color[] = [
  'gray',
  'purple',
  'green',
  'yellow',
  'cyan',
  'pink',
  'blue',
  'orange',
  'red',
];

const HEX = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;

const inScheme =
  (scheme: 'light' | 'dark') =>
  ({ children }: { children: ReactNode }) => (
    <MantineProvider forceColorScheme={scheme}>{children}</MantineProvider>
  );

const themeIn = (scheme: 'light' | 'dark') =>
  renderHook(() => useHostTheme(), { wrapper: inScheme(scheme) }).result
    .current;

// Issue #2: a canvas written against the real SDK reads
// `useHostTheme().category.<hue>`. The shim returned `undefined` there, which
// React silently drops from `style`, so the colour just vanished.
describe('useHostTheme().category (issue #2)', () => {
  it('exposes a category group at the top level and under tokens', () => {
    const theme = themeIn('dark');
    expect(Object.keys(theme)).toContain('category');
    expect(theme.tokens.category).toBe(theme.category);
  });

  it.each(HUES)('resolves theme.category.%s to a colour', (hue) => {
    expect(themeIn('dark').category[hue]).toMatch(HEX);
    expect(themeIn('light').category[hue]).toMatch(HEX);
  });

  it('flips the category table with the host theme kind', () => {
    const dark = themeIn('dark');
    const light = themeIn('light');
    expect(dark.kind).toBe('dark');
    expect(light.kind).toBe('light');
    expect(dark.category).toBe(categoryPaletteDark);
    expect(light.category).toBe(categoryPaletteLight);
    expect(dark.category).not.toEqual(light.category);
  });

  it('has the shape the SDK declares (CategoryPalette = Record<Color, string>)', () => {
    const theme = themeIn('light');
    // Compile-time assertions: these lines fail `tsc` if the shape regresses.
    const table: CategoryPalette = theme.category;
    const yellow: string = theme.category.yellow;
    expect(table.yellow).toBe(yellow);
  });
});

describe('category palette exports', () => {
  it('ships per-theme tables keyed in canonical Color order', () => {
    expect(Object.keys(categoryPaletteDark)).toEqual(HUES);
    expect(Object.keys(categoryPaletteLight)).toEqual(HUES);
  });

  it('keeps colorPalette as the SDK back-compat alias for the dark table', () => {
    expect(colorPalette).toBe(categoryPaletteDark);
  });

  it('bakes category into the static token sets too', () => {
    expect(canvasTokens.category).toBe(categoryPaletteDark);
    expect(canvasTokensLight.category).toBe(categoryPaletteLight);
  });
});

describe('primitives read the themed category table', () => {
  const swatchBackground = (scheme: 'light' | 'dark') => {
    const { container, unmount } = render(<Swatch color="gray" />, {
      wrapper: inScheme(scheme),
    });
    const bg = container.querySelector('span')?.style.background;
    unmount();
    return bg;
  };

  it('Swatch follows the active theme, not the static palette', () => {
    const dark = swatchBackground('dark');
    const light = swatchBackground('light');
    expect(dark).toBeTruthy();
    expect(light).toBeTruthy();
    expect(dark).not.toBe(light);
  });

  it('UsageBar segments and Swatch agree on the same hue', () => {
    const { container } = render(
      <>
        <Swatch color="purple" />
        <UsageBar
          total={1}
          segments={[{ id: 'a', value: 1, color: 'purple' }]}
        />
      </>,
      { wrapper: inScheme('dark') },
    );
    const swatch = container.querySelector('span')?.style.background;
    // The segment is the only div that carries an inline background.
    const segment = Array.from(
      container.querySelectorAll<HTMLElement>('div'),
    ).find((el) => el.style.background !== '')?.style.background;
    expect(swatch).toBeTruthy();
    expect(segment).toBe(swatch);
  });
});
