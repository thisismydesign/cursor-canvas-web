/**
 * Design tokens + tone mappings for the shim.
 *
 * Mirrors the real `cursor/canvas` token surface (`canvasPaletteDark/Light`,
 * `canvasTokens`, `colorPalette`, `usageColorSequence`, `Color`) so canvases
 * that read tokens via `useHostTheme()` or import the palettes work unchanged.
 * Values are aligned with the Cursor dark/light themes from the SDK.
 */

export const canvasPaletteDark = {
  foreground: '#E4E4E4EB',
  foregroundSecondary: '#E4E4E48D',
  foregroundTertiary: '#E4E4E45E',
  foregroundQuaternary: '#E4E4E442',
  editor: '#181818',
  chrome: '#141414',
  sidebar: '#141414',
  elevated: '#181818',
  fillPrimary: '#E4E4E430',
  fillSecondary: '#E4E4E41E',
  fillTertiary: '#E4E4E411',
  fillQuaternary: '#E4E4E40A',
  strokePrimary: '#E4E4E433',
  strokeSecondary: '#E4E4E41F',
  strokeTertiary: '#E4E4E414',
  accent: '#599CE7',
  buttonBackground: '#599CE7',
  buttonForeground: '#191c22',
  buttonHoverBackground: '#6AABE9',
  link: '#87c3ff',
  diffInsertedLine: '#3FA26633',
  diffRemovedLine: '#B8004933',
  diffStripAdded: '#3FA2668F',
  diffStripRemoved: '#FC6B838F',
} as const;

export const canvasPaletteLight = {
  foreground: '#141414F0',
  foregroundSecondary: '#141414BD',
  foregroundTertiary: '#1414148A',
  foregroundQuaternary: '#1414145C',
  editor: '#FCFCFC',
  chrome: '#F8F8F8',
  sidebar: '#F3F3F3',
  elevated: '#FCFCFC',
  fillPrimary: '#14141433',
  fillSecondary: '#14141424',
  fillTertiary: '#14141414',
  fillQuaternary: '#1414140F',
  strokePrimary: '#14141433',
  strokeSecondary: '#1414141F',
  strokeTertiary: '#14141414',
  accent: '#3685BF',
  buttonBackground: '#3685BF',
  buttonForeground: '#FCFCFC',
  buttonHoverBackground: '#2E76AB',
  link: '#3685BF',
  diffInsertedLine: '#1F8A651F',
  diffRemovedLine: '#CF2D5614',
  diffStripAdded: '#1F8A65CC',
  diffStripRemoved: '#CF2D56CC',
} as const;

export interface CanvasPalette {
  readonly foreground: string;
  readonly foregroundSecondary: string;
  readonly foregroundTertiary: string;
  readonly foregroundQuaternary: string;
  readonly editor: string;
  readonly chrome: string;
  readonly sidebar: string;
  readonly elevated: string;
  readonly fillPrimary: string;
  readonly fillSecondary: string;
  readonly fillTertiary: string;
  readonly fillQuaternary: string;
  readonly strokePrimary: string;
  readonly strokeSecondary: string;
  readonly strokeTertiary: string;
  readonly accent: string;
  readonly buttonBackground: string;
  readonly buttonForeground: string;
  readonly buttonHoverBackground: string;
  readonly link: string;
  readonly diffInsertedLine: string;
  readonly diffRemovedLine: string;
  readonly diffStripAdded: string;
  readonly diffStripRemoved: string;
}

function buildTokens(palette: CanvasPalette) {
  return {
    bg: {
      editor: palette.editor,
      chrome: palette.chrome,
      elevated: palette.elevated,
    },
    text: {
      primary: palette.foreground,
      secondary: palette.foregroundSecondary,
      tertiary: palette.foregroundTertiary,
      quaternary: palette.foregroundQuaternary,
      link: palette.link,
      onAccent: palette.buttonForeground,
    },
    stroke: {
      primary: palette.strokePrimary,
      secondary: palette.strokeSecondary,
      tertiary: palette.strokeTertiary,
    },
    fill: {
      primary: palette.fillPrimary,
      secondary: palette.fillSecondary,
      tertiary: palette.fillTertiary,
      quaternary: palette.fillQuaternary,
    },
    accent: {
      primary: palette.accent,
      control: palette.buttonBackground,
      controlHover: palette.buttonHoverBackground,
    },
    diff: {
      insertedLine: palette.diffInsertedLine,
      removedLine: palette.diffRemovedLine,
      stripAdded: palette.diffStripAdded,
      stripRemoved: palette.diffStripRemoved,
    },
  };
}

export type CanvasTokens = ReturnType<typeof buildTokens>;

export const canvasTokens = buildTokens(canvasPaletteDark);
export const canvasTokensLight = buildTokens(canvasPaletteLight);

/** Shared 7-hue category palette for `Swatch`, `UsageBar`, etc. */
export const colorPalette = {
  gray: '#8888A8E0',
  purple: '#7B64B8F0',
  green: '#1F8A65E8',
  yellow: '#E8C030E0',
  pink: '#C85898E0',
  blue: '#2E79B5E0',
  orange: '#F0A040E0',
} as const;

export type Color = keyof typeof colorPalette;

/** Auto-color rotation for `UsageBar` segments without an explicit color. */
export const usageColorSequence: readonly Color[] = [
  'blue',
  'purple',
  'green',
  'yellow',
  'pink',
  'orange',
  'gray',
];

/** Ordered hues for automatic chart-series coloring. */
export const chartColorSequence: readonly string[] = [
  '#1F8A65E8',
  '#70B0D8E0',
  '#5A6CC0F0',
  '#F0A040E0',
  '#C06028E0',
  '#E8C030E0',
  '#C85898E0',
  '#F0A088E0',
  '#7B64B8F0',
  '#7DCAB0E0',
  '#8888A8E0',
  '#2A9A8AE0',
];

/**
 * Maps every semantic tone literal used across primitives to a hex color, so
 * a `Stat tone="success"` and a `ChartSeries tone="success"` match.
 */
export const toneHex: Record<string, string> = {
  success: '#1F8A65',
  danger: '#CF2D56',
  warning: '#E8A33D',
  info: '#2E79B5',
  neutral: '#8888A8',
  added: '#1F8A65',
  deleted: '#CF2D56',
  renamed: '#5A6CC0',
};

/** Maps a semantic tone to a Mantine color name (for components that use it). */
export const toneColor: Record<string, string> = {
  success: 'green',
  danger: 'red',
  warning: 'orange',
  info: 'blue',
  neutral: 'gray',
  added: 'green',
  deleted: 'red',
  renamed: 'indigo',
};

/** Host theme returned by `useHostTheme()`. Extends the token groups. */
export interface CanvasHostTheme extends CanvasTokens {
  readonly kind: string;
  readonly tokens: CanvasTokens;
  readonly palette: CanvasPalette;
}

export function buildHostTheme(kind: 'light' | 'dark'): CanvasHostTheme {
  const tokens = kind === 'dark' ? canvasTokens : canvasTokensLight;
  const palette = kind === 'dark' ? canvasPaletteDark : canvasPaletteLight;
  return { ...tokens, kind, tokens, palette };
}
