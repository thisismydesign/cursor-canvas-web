/**
 * Token object returned by `useHostTheme()`.
 *
 * In a real Cursor canvas these tokens are supplied by the IDE host so that a
 * canvas matches the editor's theme. Here we provide a static, Mantine-aligned
 * approximation. Keep this shape stable: it is part of the shim's public
 * contract that canvases may read from.
 */

export type Tone =
  | 'neutral'
  | 'accent'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'info';

export interface HostTheme {
  /** Hex color per semantic tone, used by Stat/Pill/Callout/LineChart. */
  tone: Record<Tone, string>;
  /** Spacing scale (px) mirroring Mantine's t-shirt sizes. */
  space: { xs: number; sm: number; md: number; lg: number; xl: number };
  /** Corner radii (px). */
  radius: { sm: number; md: number; lg: number };
}

export const hostTheme: HostTheme = {
  tone: {
    neutral: '#868e96',
    accent: '#4c6ef5',
    positive: '#2f9e44',
    negative: '#e03131',
    warning: '#f08c00',
    info: '#1098ad',
  },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 16 },
};

/** Maps a semantic tone to its Mantine color name (for `color` props). */
export const toneToMantineColor: Record<Tone, string> = {
  neutral: 'gray',
  accent: 'indigo',
  positive: 'green',
  negative: 'red',
  warning: 'orange',
  info: 'cyan',
};
