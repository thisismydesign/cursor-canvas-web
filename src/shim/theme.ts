/**
 * Tone -> color mapping and host-theme tokens for the shim.
 *
 * The real `cursor/canvas` SDK uses several semantic tone vocabularies that all
 * draw from one shared palette so colors match across primitives (a
 * `Stat tone="success"` and a `ChartSeries tone="success"` render the same
 * green). We mirror that by mapping every tone name to a Mantine color.
 */

/** Union of every tone literal used across the SDK primitives we implement. */
export type SemanticTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral'
  | 'added'
  | 'deleted'
  | 'renamed';

/** Maps a semantic tone to a Mantine color name (for `color`/`c` props). */
export const toneColor: Record<SemanticTone, string> = {
  success: 'green',
  danger: 'red',
  warning: 'orange',
  info: 'blue',
  neutral: 'gray',
  added: 'green',
  deleted: 'red',
  renamed: 'blue',
};

/**
 * Palette used to auto-assign colors to chart series that don't specify a
 * `tone`, mirroring the SDK's "distinct color per series" behavior.
 */
export const chartPalette: string[] = [
  'blue',
  'grape',
  'teal',
  'orange',
  'red',
  'green',
  'cyan',
  'pink',
];

/**
 * Minimal stand-in for the SDK's `CanvasHostTheme`. Only the documented
 * semantic groups are provided; enough for canvases that read tokens for
 * custom inline styles. Not pixel-identical to the IDE host theme.
 */
export interface HostTheme {
  kind: 'light' | 'dark';
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    quaternary: string;
    link: string;
  };
  bg: { editor: string; chrome: string; elevated: string };
  accent: { primary: string; control: string };
}

export const hostTheme: HostTheme = {
  kind: 'light',
  text: {
    primary: '#1a1b1e',
    secondary: '#5c5f66',
    tertiary: '#868e96',
    quaternary: '#adb5bd',
    link: '#1c7ed6',
  },
  bg: { editor: '#ffffff', chrome: '#f8f9fa', elevated: '#ffffff' },
  accent: { primary: '#4c6ef5', control: '#4c6ef5' },
};
