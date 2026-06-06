/**
 * Chart primitives mapped onto `@mantine/charts`.
 *
 * The SDK describes charts as parallel `categories` + `series[]` arrays (or a
 * flat `data` array for pie); Mantine wants an array of row objects plus a
 * series descriptor. We reshape here and map `tone` -> color.
 */
import type { CSSProperties } from 'react';
import {
  AreaChart,
  BarChart as MantineBarChart,
  LineChart as MantineLineChart,
  PieChart as MantinePieChart,
  DonutChart,
} from '@mantine/charts';

import { chartColorSequence, toneHex } from './theme';

export type ChartTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

export type ChartDataPoint = { label: string; value: number };

export type ChartSeries = {
  name: string;
  data: number[];
  tone?: ChartTone;
};

export type BarChartProps = {
  categories: string[];
  series: ChartSeries[];
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  normalized?: boolean;
  valueSuffix?: string;
  style?: CSSProperties;
};

export type LineChartProps = {
  categories: string[];
  series: ChartSeries[];
  height?: number;
  fill?: boolean;
  valueSuffix?: string;
  style?: CSSProperties;
};

export type PieChartProps = {
  data: Array<ChartDataPoint & { tone?: ChartTone }>;
  size?: number;
  donut?: boolean;
  style?: CSSProperties;
};

function seriesColor(tone: ChartTone | undefined, index: number): string {
  return tone
    ? toneHex[tone]
    : chartColorSequence[index % chartColorSequence.length];
}

/** Reshape parallel `categories` + `series[]` into Mantine row objects. */
export function reshapeLineChartData(
  categories: string[],
  series: ChartSeries[],
): Record<string, string | number>[] {
  return categories.map((category, index) => {
    const row: Record<string, string | number> = { category };
    for (const s of series) row[s.name] = s.data[index] ?? 0;
    return row;
  });
}

function toMantineSeries(series: ChartSeries[]) {
  return series.map((s, index) => ({
    name: s.name,
    color: seriesColor(s.tone, index),
  }));
}

function suffixFormatter(valueSuffix?: string) {
  return valueSuffix ? (value: number) => `${value}${valueSuffix}` : undefined;
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
  const mantineSeries = toMantineSeries(series);
  const common = {
    h: height,
    data,
    dataKey: 'category',
    series: mantineSeries,
    curveType: 'monotone' as const,
    withLegend: series.length > 1,
    valueFormatter: suffixFormatter(valueSuffix),
    style,
  };
  return fill ? <AreaChart {...common} /> : <MantineLineChart {...common} />;
}

export function BarChart({
  categories,
  series,
  height = 240,
  stacked,
  horizontal,
  normalized,
  valueSuffix,
  style,
}: BarChartProps) {
  const data = reshapeLineChartData(categories, series);
  const type = normalized ? 'percent' : stacked ? 'stacked' : 'default';
  return (
    <MantineBarChart
      h={height}
      data={data}
      dataKey="category"
      series={toMantineSeries(series)}
      type={type}
      orientation={horizontal ? 'vertical' : 'horizontal'}
      withLegend={series.length > 1}
      valueFormatter={suffixFormatter(valueSuffix)}
      style={style}
    />
  );
}

export function PieChart({ data, size = 180, donut, style }: PieChartProps) {
  const mantineData = data.map((point, index) => ({
    name: point.label,
    value: point.value,
    color: seriesColor(point.tone, index),
  }));
  const common = {
    data: mantineData,
    size,
    withTooltip: true as const,
    style,
  };
  return donut ? (
    <DonutChart {...common} />
  ) : (
    <MantinePieChart {...common} withLabelsLine={false} />
  );
}
