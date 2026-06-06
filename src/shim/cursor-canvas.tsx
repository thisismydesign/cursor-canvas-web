/**
 * Mantine-backed implementation of the `cursor/canvas` module.
 *
 * A canvas authored against the real Cursor SDK imports only from
 * `cursor/canvas`. A Vite alias + tsconfig path redirect that import here, so
 * the same untouched canvas source renders in a plain web app on GitHub Pages.
 *
 * This file is the PoC subset. To support more components, add them here and
 * keep the prop shapes stable — that is the contract canvases rely on.
 */
import { type ReactNode, useCallback, useState } from 'react';
import {
  Alert,
  Badge,
  Card as MantineCard,
  Checkbox as MantineCheckbox,
  Divider as MantineDivider,
  Group,
  SimpleGrid,
  Select as MantineSelect,
  Stack as MantineStack,
  Text as MantineText,
  TextInput as MantineTextInput,
  Title,
} from '@mantine/core';
import { LineChart as MantineLineChart } from '@mantine/charts';

import {
  hostTheme,
  toneToMantineColor,
  type HostTheme,
  type Tone,
} from './theme';

export type { Tone, HostTheme } from './theme';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/* ------------------------------------------------------------------ hooks */

export function useHostTheme(): HostTheme {
  return hostTheme;
}

/**
 * Like `useState`, but persisted to `localStorage` under `canvas:<key>`.
 * Mirrors the IDE behavior where canvas state survives reloads.
 */
export function useCanvasState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const storageKey = `canvas:${key}`;

  const [state, setState] = useState<T>(() => {
    if (typeof localStorage === 'undefined') return initialValue;
    try {
      const raw = localStorage.getItem(storageKey);
      return raw === null ? initialValue : (JSON.parse(raw) as T);
    } catch {
      return initialValue;
    }
  });

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next =
          typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
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

export function H1({ children }: { children: ReactNode }) {
  return <Title order={1}>{children}</Title>;
}

export function H2({ children }: { children: ReactNode }) {
  return <Title order={2}>{children}</Title>;
}

export function Text({
  children,
  tone,
  dimmed,
  size = 'md',
}: {
  children: ReactNode;
  tone?: Tone;
  dimmed?: boolean;
  size?: Size;
}) {
  return (
    <MantineText
      size={size}
      c={dimmed ? 'dimmed' : tone ? toneToMantineColor[tone] : undefined}
    >
      {children}
    </MantineText>
  );
}

/* ---------------------------------------------------------------- layout */

export function Stack({
  children,
  gap = 'md',
}: {
  children: ReactNode;
  gap?: Size;
}) {
  return <MantineStack gap={gap}>{children}</MantineStack>;
}

export function Row({
  children,
  gap = 'md',
  align = 'center',
  justify = 'flex-start',
}: {
  children: ReactNode;
  gap?: Size;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
}) {
  return (
    <Group gap={gap} align={align} justify={justify} wrap="nowrap">
      {children}
    </Group>
  );
}

/** Flexible filler that pushes siblings apart inside a `Row`. */
export function Spacer() {
  return <div style={{ flex: 1 }} />;
}

export function Grid({
  children,
  columns = 2,
}: {
  children: ReactNode;
  columns?: number;
}) {
  return (
    <SimpleGrid cols={{ base: 1, sm: columns }} spacing="md">
      {children}
    </SimpleGrid>
  );
}

export function Divider({ label }: { label?: string }) {
  return <MantineDivider label={label} labelPosition="center" />;
}

/* ------------------------------------------------------------------ card */

export function Card({ children }: { children: ReactNode }) {
  return (
    <MantineCard withBorder radius="md" padding="lg">
      {children}
    </MantineCard>
  );
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <MantineCard.Section withBorder inheritPadding py="sm">
      <Title order={3} size="h5">
        {children}
      </Title>
    </MantineCard.Section>
  );
}

export function CardBody({ children }: { children: ReactNode }) {
  return (
    <MantineCard.Section inheritPadding py="md">
      {children}
    </MantineCard.Section>
  );
}

/* --------------------------------------------------------------- display */

export function Stat({
  label,
  value,
  delta,
  tone = 'neutral',
}: {
  label: string;
  value: string | number;
  delta?: string | number;
  tone?: Tone;
}) {
  return (
    <MantineStack gap={2}>
      <MantineText size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </MantineText>
      <MantineText size="xl" fw={700}>
        {value}
      </MantineText>
      {delta !== undefined && (
        <MantineText size="sm" c={toneToMantineColor[tone]} fw={500}>
          {delta}
        </MantineText>
      )}
    </MantineStack>
  );
}

export function Pill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <Badge color={toneToMantineColor[tone]} variant="light">
      {children}
    </Badge>
  );
}

export function Callout({
  children,
  title,
  tone = 'info',
}: {
  children: ReactNode;
  title?: string;
  tone?: Tone;
}) {
  return (
    <Alert color={toneToMantineColor[tone]} title={title} variant="light">
      {children}
    </Alert>
  );
}

/* ------------------------------------------------------------------ form */

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <MantineSelect
      label={label}
      value={value}
      data={options}
      allowDeselect={false}
      onChange={(next) => onChange(next ?? value)}
    />
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <MantineCheckbox
      label={label}
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
    />
  );
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <MantineTextInput
      label={label}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}

/* ----------------------------------------------------------------- chart */

export interface LineChartSeries {
  name: string;
  data: number[];
  tone?: Tone;
}

export interface LineChartProps {
  categories: string[];
  series: LineChartSeries[];
  height?: number;
}

/**
 * The only non-trivial adapter: the canvas API describes a chart as parallel
 * `categories` + `series[]` arrays; Mantine/Recharts wants an array of row
 * objects plus a series descriptor. We reshape here and map tone -> color.
 */
export function reshapeLineChartData(
  categories: string[],
  series: LineChartSeries[],
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
}: LineChartProps) {
  const data = reshapeLineChartData(categories, series);
  const mantineSeries = series.map((s) => ({
    name: s.name,
    color: hostTheme.tone[s.tone ?? 'accent'],
  }));

  return (
    <MantineLineChart
      h={height}
      data={data}
      dataKey="category"
      series={mantineSeries}
      curveType="monotone"
      withLegend
    />
  );
}
