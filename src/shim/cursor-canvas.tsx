/**
 * Mantine-backed implementation of the `cursor/canvas` module.
 *
 * A canvas authored against the real Cursor SDK imports only from
 * `cursor/canvas`. A Vite alias + tsconfig path redirect that import here, so
 * the same untouched canvas source renders in a plain web app on GitHub Pages.
 *
 * IMPORTANT: this shim must stay API-compatible with the real SDK declarations
 * at `~/.cursor/skills-cursor/canvas/sdk/*.d.ts` — same component props, tone
 * vocabularies, and hook signatures — so a canvas that renders in the IDE also
 * builds here unchanged. This is the PoC subset; extend it as canvases need.
 */
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useState,
} from 'react';
import {
  Alert,
  Badge,
  Card as MantineCard,
  Checkbox as MantineCheckbox,
  Divider as MantineDivider,
  Group,
  Select as MantineSelect,
  Stack as MantineStack,
  Text as MantineText,
  TextInput as MantineTextInput,
  Title,
} from '@mantine/core';
import { LineChart as MantineLineChart } from '@mantine/charts';

import { chartPalette, hostTheme, toneColor, type HostTheme } from './theme';

export type { HostTheme } from './theme';

/* ------------------------------------------------------------------ hooks */

export type SetCanvasState<T> = (action: T | ((prev: T) => T)) => void;

export function useHostTheme(): HostTheme {
  return hostTheme;
}

/**
 * Persistent state hook. The real SDK stores values in a `.canvas.data.json`
 * sidecar; on the web we persist to `localStorage` under `canvas:<key>`.
 */
export function useCanvasState<T>(
  key: string,
  defaultValue: T,
): [T, SetCanvasState<T>] {
  const storageKey = `canvas:${key}`;

  const [state, setState] = useState<T>(() => {
    if (typeof localStorage === 'undefined') return defaultValue;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? defaultValue : (JSON.parse(raw) as T);
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback<SetCanvasState<T>>(
    (action) => {
      setState((prev) => {
        const next =
          typeof action === 'function'
            ? (action as (prev: T) => T)(prev)
            : action;
        try {
          localStorage?.setItem(storageKey, JSON.stringify(next));
        } catch {
          // Ignore quota / unavailable storage; state still updates in memory.
        }
        return next;
      });
    },
    [storageKey],
  );

  return [state, set];
}

/* ------------------------------------------------------------- typography */

export interface H1Props {
  children?: ReactNode;
  style?: CSSProperties;
}
export function H1({ children, style }: H1Props) {
  return (
    <Title order={1} fz={24} style={style}>
      {children}
    </Title>
  );
}

export interface H2Props {
  children?: ReactNode;
  style?: CSSProperties;
}
export function H2({ children, style }: H2Props) {
  return (
    <Title order={2} fz={18} style={style}>
      {children}
    </Title>
  );
}

export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextTone = 'primary' | 'secondary' | 'tertiary' | 'quaternary';
export interface TextProps {
  children?: ReactNode;
  tone?: TextTone;
  size?: 'body' | 'small';
  as?: 'p' | 'span';
  weight?: TextWeight;
  italic?: boolean;
  truncate?: boolean | 'start' | 'end';
  style?: CSSProperties;
}

const TEXT_WEIGHT: Record<TextWeight, number> = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export function Text({
  children,
  tone = 'primary',
  size = 'body',
  as = 'p',
  weight = 'normal',
  italic,
  truncate,
  style,
}: TextProps) {
  return (
    <MantineText
      component={as}
      size={size === 'small' ? 'xs' : 'sm'}
      fw={TEXT_WEIGHT[weight]}
      c={tone === 'primary' ? undefined : hostTheme.text[tone]}
      truncate={truncate}
      style={{ fontStyle: italic ? 'italic' : undefined, ...style }}
    >
      {children}
    </MantineText>
  );
}

/* ---------------------------------------------------------------- layout */

export interface StackProps {
  children?: ReactNode;
  gap?: number;
  style?: CSSProperties;
}
export function Stack({ children, gap, style }: StackProps) {
  return (
    <MantineStack gap={gap} style={style}>
      {children}
    </MantineStack>
  );
}

export interface RowProps {
  children?: ReactNode;
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between';
  wrap?: boolean;
  style?: CSSProperties;
}
const FLEX: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  'space-between': 'space-between',
};
export function Row({
  children,
  gap,
  align = 'center',
  justify = 'start',
  wrap = false,
  style,
}: RowProps) {
  return (
    <Group
      gap={gap}
      align={FLEX[align]}
      justify={FLEX[justify]}
      wrap={wrap ? 'wrap' : 'nowrap'}
      style={style}
    >
      {children}
    </Group>
  );
}

/** Flexible filler that pushes siblings apart inside a `Row`. */
export function Spacer() {
  return <div style={{ flex: 1 }} />;
}

export interface GridProps {
  children?: ReactNode;
  columns: number | string;
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  style?: CSSProperties;
}
export function Grid({ children, columns, gap = 16, align, style }: GridProps) {
  const gridTemplateColumns =
    typeof columns === 'number'
      ? `repeat(${columns}, minmax(0, 1fr))`
      : columns;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns,
        gap,
        alignItems: align,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface DividerProps {
  style?: CSSProperties;
}
export function Divider({ style }: DividerProps) {
  return <MantineDivider style={style} />;
}

/* ------------------------------------------------------------------ card */

export type CardVariant = 'default' | 'borderless';
export type CardSize = 'base' | 'lg';
export interface CardProps {
  children?: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  stickyHeader?: boolean;
  collapsible?: boolean;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  style?: CSSProperties;
}
export function Card({ children, variant = 'default', style }: CardProps) {
  return (
    <MantineCard
      withBorder={variant !== 'borderless'}
      radius="md"
      padding={0}
      style={style}
    >
      {children}
    </MantineCard>
  );
}

export interface CardHeaderProps {
  children?: ReactNode;
  trailing?: ReactNode;
  style?: CSSProperties;
}
export function CardHeader({ children, trailing, style }: CardHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '8px 14px',
        borderBottom: '1px solid var(--mantine-color-default-border)',
        fontSize: 12,
        fontWeight: 600,
        color: hostTheme.text.secondary,
        ...style,
      }}
    >
      <span>{children}</span>
      {trailing != null && <span>{trailing}</span>}
    </div>
  );
}

export interface CardBodyProps {
  children?: ReactNode;
  style?: CSSProperties;
}
export function CardBody({ children, style }: CardBodyProps) {
  return <div style={{ padding: 14, ...style }}>{children}</div>;
}

/* --------------------------------------------------------------- display */

export type StatTone = 'success' | 'danger' | 'warning' | 'info';
export interface StatProps {
  value: ReactNode;
  label: string;
  tone?: StatTone;
  style?: CSSProperties;
}
export function Stat({ value, label, tone, style }: StatProps) {
  return (
    <div style={style}>
      <MantineText
        fz={22}
        fw={700}
        lh={1.2}
        c={tone ? `${toneColor[tone]}.6` : undefined}
      >
        {value}
      </MantineText>
      <MantineText fz={12} c={hostTheme.text.secondary}>
        {label}
      </MantineText>
    </div>
  );
}

export type PillTone =
  | 'neutral'
  | 'added'
  | 'deleted'
  | 'renamed'
  | 'success'
  | 'warning'
  | 'info';
export type PillSize = 'sm' | 'md';
export interface PillProps {
  children?: ReactNode;
  active?: boolean;
  tone?: PillTone;
  size?: PillSize;
  leadingContent?: ReactNode;
  keyboardHint?: string;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
  onClick?: () => void;
}
export function Pill({
  children,
  active,
  tone = 'neutral',
  size = 'md',
  leadingContent,
  keyboardHint,
  title,
  style,
  onClick,
}: PillProps) {
  return (
    <Badge
      color={toneColor[tone]}
      variant={active ? 'filled' : 'light'}
      size={size === 'sm' ? 'sm' : 'md'}
      leftSection={leadingContent}
      rightSection={keyboardHint}
      title={title}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined, ...style }}
    >
      {children}
    </Badge>
  );
}

export type CalloutTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';
export interface CalloutProps {
  children?: ReactNode;
  tone?: CalloutTone;
  title?: ReactNode;
  icon?: ReactNode;
  style?: CSSProperties;
}
export function Callout({
  children,
  tone = 'neutral',
  title,
  icon,
  style,
}: CalloutProps) {
  return (
    <Alert
      color={toneColor[tone]}
      title={title}
      icon={icon}
      variant="light"
      style={style}
    >
      {children}
    </Alert>
  );
}

/* ------------------------------------------------------------------ form */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface SelectProps {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
}
export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  style,
}: SelectProps) {
  return (
    <MantineSelect
      value={value}
      data={options}
      placeholder={placeholder}
      disabled={disabled}
      allowDeselect={false}
      onChange={(next) => {
        if (next !== null) onChange?.(next);
      }}
      style={style}
    />
  );
}

export interface CheckboxProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: ReactNode;
  style?: CSSProperties;
}
export function Checkbox({
  checked,
  onChange,
  disabled,
  label,
  style,
}: CheckboxProps) {
  return (
    <MantineCheckbox
      checked={checked}
      disabled={disabled}
      label={label}
      onChange={(event) => onChange?.(event.currentTarget.checked)}
      style={style}
    />
  );
}

export interface TextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'url' | 'search';
  style?: CSSProperties;
}
export function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
  type,
  style,
}: TextInputProps) {
  return (
    <MantineTextInput
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      type={type}
      onChange={(event) => onChange?.(event.currentTarget.value)}
      style={style}
    />
  );
}

/* ----------------------------------------------------------------- chart */

export type ChartTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';
export interface ChartSeries {
  name: string;
  data: number[];
  tone?: ChartTone;
}
export interface LineChartProps {
  categories: string[];
  series: ChartSeries[];
  height?: number;
  fill?: boolean;
  valueSuffix?: string;
  style?: CSSProperties;
}

/**
 * The only non-trivial adapter: the canvas API describes a chart as parallel
 * `categories` + `series[]` arrays; Mantine/Recharts wants an array of row
 * objects plus a series descriptor. We reshape here and map tone -> color.
 */
export function reshapeLineChartData(
  categories: string[],
  series: ChartSeries[],
): Record<string, string | number>[] {
  return categories.map((category, index) => {
    const row: Record<string, string | number> = { category };
    for (const s of series) {
      row[s.name] = s.data[index] ?? 0;
    }
    return row;
  });
}

export function LineChart({
  categories,
  series,
  height = 240,
  fill,
  valueSuffix,
  style,
}: LineChartProps) {
  const data = reshapeLineChartData(categories, series);
  const mantineSeries = series.map((s, index) => ({
    name: s.name,
    color: `${s.tone ? toneColor[s.tone] : chartPalette[index % chartPalette.length]}.6`,
  }));

  return (
    <MantineLineChart
      h={height}
      data={data}
      dataKey="category"
      series={mantineSeries}
      curveType="monotone"
      withLegend={series.length > 1}
      type={fill ? 'gradient' : 'default'}
      valueFormatter={
        valueSuffix ? (value) => `${value}${valueSuffix}` : undefined
      }
      style={style}
    />
  );
}
