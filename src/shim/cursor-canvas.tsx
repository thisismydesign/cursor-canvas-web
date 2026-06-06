/**
 * Mantine-backed implementation of the `cursor/canvas` module.
 *
 * A canvas authored against the real Cursor SDK imports only from
 * `cursor/canvas`. A Vite alias + tsconfig path redirect that import here, so
 * the same untouched canvas source renders in a plain web app on GitHub Pages.
 *
 * This barrel implements the UI/form/rich primitives + hooks and re-exports the
 * chart, diff, dag, and todo modules. It must stay API-compatible with the real
 * SDK declarations at `~/.cursor/skills-cursor/canvas/sdk/*.d.ts` — same props,
 * tone vocabularies, and signatures — so a canvas renders unchanged in both the
 * IDE and the web build.
 */
import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button as MantineButton,
  Card as MantineCard,
  Checkbox as MantineCheckbox,
  Divider as MantineDivider,
  Group,
  Select as MantineSelect,
  Stack as MantineStack,
  Switch,
  Table as MantineTable,
  Text as MantineText,
  Textarea as MantineTextarea,
  TextInput as MantineTextInput,
  Title,
} from '@mantine/core';

import {
  colorPalette,
  toneColor,
  usageColorSequence,
  type Color,
} from './theme';
import { useHostTheme } from './use-tokens';

/* --------------------------------------------------------------- re-exports */

export {
  canvasPaletteDark,
  canvasPaletteLight,
  canvasTokens,
  canvasTokensLight,
  colorPalette,
  usageColorSequence,
} from './theme';
export type {
  CanvasPalette,
  CanvasTokens,
  CanvasHostTheme,
  Color,
} from './theme';
export { BarChart, LineChart, PieChart, reshapeLineChartData } from './charts';
export type {
  BarChartProps,
  ChartDataPoint,
  ChartSeries,
  ChartTone,
  LineChartProps,
  PieChartProps,
} from './charts';
export { DiffStats, DiffView } from './diff';
export type {
  DiffLineData,
  DiffLineType,
  DiffStatsProps,
  DiffViewProps,
} from './diff';
export { computeDAGLayout } from './dag';
export type {
  DAGLayoutEdge,
  DAGLayoutNode,
  DAGLayoutOptions,
  DAGLayoutRank,
  DAGLayoutResult,
} from './dag';
export { TodoList, TodoListCard } from './todo';
export type {
  TodoItem,
  TodoListCardProps,
  TodoListProps,
  TodoStatus,
} from './todo';
export { useHostTheme } from './use-tokens';

/* ------------------------------------------------------------------ hooks */

export type SetCanvasState<T> = (action: T | ((prev: T) => T)) => void;

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

export type CanvasAction =
  | { type: 'openAgent'; agentId: string }
  | { type: 'newComposerChat'; userPrompt?: string };

/**
 * IDE actions are not available on the web host, so the returned dispatch is a
 * no-op (it logs in dev). Exists for API parity with the real SDK.
 */
export function useCanvasAction(): (action: CanvasAction) => void {
  return useCallback((action: CanvasAction) => {
    if (import.meta.env?.DEV) {
      console.info(
        '[cursor/canvas shim] useCanvasAction (no-op on web):',
        action,
      );
    }
  }, []);
}

/** Shallow-merge two style objects, `override` winning. */
export function mergeStyle(
  base: CSSProperties,
  override?: CSSProperties,
): CSSProperties {
  return { ...base, ...override };
}

/* ------------------------------------------------------------- typography */

export interface H1Props {
  children?: ReactNode;
  style?: CSSProperties;
}
export function H1({ children, style }: H1Props) {
  return (
    <Title order={1} fz={24} lh="30px" style={style}>
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
    <Title order={2} fz={18} lh="24px" style={style}>
      {children}
    </Title>
  );
}

export interface H3Props {
  children?: ReactNode;
  style?: CSSProperties;
}
export function H3({ children, style }: H3Props) {
  return (
    <Title order={3} fz={16} lh="22px" style={style}>
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
  const theme = useHostTheme();
  return (
    <MantineText
      component={as}
      size={size === 'small' ? 'xs' : 'sm'}
      fw={TEXT_WEIGHT[weight]}
      c={tone === 'primary' ? undefined : theme.text[tone]}
      truncate={truncate}
      style={{ fontStyle: italic ? 'italic' : undefined, ...style }}
    >
      {children}
    </MantineText>
  );
}

export interface CodeProps {
  children?: ReactNode;
  style?: CSSProperties;
}
export function Code({ children, style }: CodeProps) {
  return (
    <code
      style={{
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Code", monospace',
        fontSize: '0.92em',
        background: 'var(--mantine-color-default-hover)',
        borderRadius: 4,
        padding: '1px 4px',
        ...style,
      }}
    >
      {children}
    </code>
  );
}

export interface LinkProps {
  children?: ReactNode;
  href: string;
  style?: CSSProperties;
}
export function Link({ children, href, style }: LinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      style={{ color: 'var(--mantine-color-anchor)', ...style }}
    >
      {children}
    </a>
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

const FLEX: Record<string, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  'space-between': 'space-between',
};

export interface RowProps {
  children?: ReactNode;
  gap?: number;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between';
  wrap?: boolean;
  style?: CSSProperties;
}
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

const CardContext = createContext<{
  collapsible: boolean;
  open: boolean;
  toggle: () => void;
}>({
  collapsible: false,
  open: true,
  toggle: () => {},
});

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
export function Card({
  children,
  variant = 'default',
  collapsible = false,
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  style,
}: CardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = openProp ?? internalOpen;
  const toggle = useCallback(() => {
    const next = !open;
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [open, openProp, onOpenChange]);

  return (
    <MantineCard
      withBorder={variant !== 'borderless'}
      radius="md"
      padding={0}
      style={style}
    >
      <CardContext.Provider value={{ collapsible, open, toggle }}>
        {children}
      </CardContext.Provider>
    </MantineCard>
  );
}

export interface CardHeaderProps {
  children?: ReactNode;
  trailing?: ReactNode;
  style?: CSSProperties;
}
export function CardHeader({ children, trailing, style }: CardHeaderProps) {
  const { collapsible, open, toggle } = useContext(CardContext);
  return (
    <div
      onClick={collapsible ? toggle : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        padding: '8px 14px',
        borderBottom: '1px solid var(--mantine-color-default-border)',
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--mantine-color-dimmed)',
        cursor: collapsible ? 'pointer' : undefined,
        userSelect: collapsible ? 'none' : undefined,
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        {collapsible && <Chevron expanded={open} />}
        {children}
      </span>
      {trailing != null && <span>{trailing}</span>}
    </div>
  );
}

export interface CardBodyProps {
  children?: ReactNode;
  style?: CSSProperties;
}
export function CardBody({ children, style }: CardBodyProps) {
  const { collapsible, open } = useContext(CardContext);
  if (collapsible && !open) return null;
  return <div style={{ padding: 14, ...style }}>{children}</div>;
}

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 12 12"
      fill="none"
      style={{
        transform: expanded ? 'rotate(90deg)' : 'none',
        transition: 'transform 120ms',
      }}
      aria-hidden
    >
      <path
        d="M4 2.5L8 6l-4 3.5"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
      <MantineText fz={12} c="dimmed">
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
      style={{
        cursor: onClick ? 'pointer' : undefined,
        textTransform: 'none',
        ...style,
      }}
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

/* ------------------------------------------------------------------ table */

export type TableColumnAlign = 'left' | 'center' | 'right';
export type TableRowTone =
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'neutral';
export interface TableProps {
  headers: ReactNode[];
  rows: ReactNode[][];
  columnAlign?: Array<TableColumnAlign | undefined>;
  rowTone?: Array<TableRowTone | undefined>;
  framed?: boolean;
  striped?: boolean;
  stickyHeader?: boolean;
  style?: CSSProperties;
  emptyMessage?: ReactNode;
}
const ROW_TONE_BG: Record<TableRowTone, string> = {
  success: 'rgba(31,138,101,0.12)',
  danger: 'rgba(207,45,86,0.12)',
  warning: 'rgba(232,163,61,0.14)',
  info: 'rgba(46,121,181,0.12)',
  neutral: 'rgba(136,136,168,0.12)',
};
export function Table({
  headers,
  rows,
  columnAlign,
  rowTone,
  framed = true,
  striped,
  stickyHeader,
  style,
  emptyMessage,
}: TableProps) {
  return (
    <MantineTable
      withTableBorder={framed}
      withColumnBorders={false}
      striped={striped}
      stickyHeader={stickyHeader}
      highlightOnHover
      style={style}
    >
      <MantineTable.Thead>
        <MantineTable.Tr>
          {headers.map((header, index) => (
            <MantineTable.Th key={index} ta={columnAlign?.[index] ?? 'left'}>
              {header}
            </MantineTable.Th>
          ))}
        </MantineTable.Tr>
      </MantineTable.Thead>
      <MantineTable.Tbody>
        {rows.length === 0 ? (
          <MantineTable.Tr>
            <MantineTable.Td colSpan={headers.length} ta="center" c="dimmed">
              {emptyMessage ?? 'No data'}
            </MantineTable.Td>
          </MantineTable.Tr>
        ) : (
          rows.map((row, rowIndex) => {
            const tone = rowTone?.[rowIndex];
            return (
              <MantineTable.Tr
                key={rowIndex}
                style={tone ? { background: ROW_TONE_BG[tone] } : undefined}
              >
                {headers.map((_, colIndex) => (
                  <MantineTable.Td
                    key={colIndex}
                    ta={columnAlign?.[colIndex] ?? 'left'}
                  >
                    {row[colIndex]}
                  </MantineTable.Td>
                ))}
              </MantineTable.Tr>
            );
          })
        )}
      </MantineTable.Tbody>
    </MantineTable>
  );
}

/* ----------------------------------------------------------------- actions */

export interface ButtonProps {
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
  onClick?: () => void;
}
const BUTTON_VARIANT = {
  primary: 'filled',
  secondary: 'default',
  ghost: 'subtle',
} as const;
export function Button({
  children,
  variant = 'secondary',
  disabled,
  type = 'button',
  style,
  onClick,
}: ButtonProps) {
  return (
    <MantineButton
      variant={BUTTON_VARIANT[variant]}
      size="xs"
      disabled={disabled}
      type={type}
      onClick={onClick}
      style={style}
    >
      {children}
    </MantineButton>
  );
}

export interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  variant?: 'default' | 'circle';
  size?: 'sm' | 'md';
  style?: CSSProperties;
}
export function IconButton({
  children,
  onClick,
  disabled,
  title,
  variant = 'default',
  size = 'md',
  style,
}: IconButtonProps) {
  return (
    <ActionIcon
      variant={variant === 'circle' ? 'light' : 'subtle'}
      radius={variant === 'circle' ? 'xl' : 'sm'}
      size={size === 'sm' ? 'sm' : 'md'}
      color="gray"
      disabled={disabled}
      title={title}
      aria-label={title}
      onClick={onClick}
      style={style}
    >
      {children}
    </ActionIcon>
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

export interface ToggleProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  style?: CSSProperties;
}
export function Toggle({
  checked,
  onChange,
  disabled,
  size = 'sm',
  style,
}: ToggleProps) {
  return (
    <Switch
      checked={checked}
      disabled={disabled}
      size={size === 'sm' ? 'sm' : 'md'}
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

export interface TextAreaProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
  style?: CSSProperties;
}
export function TextArea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
  style,
}: TextAreaProps) {
  return (
    <MantineTextarea
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      autosize
      minRows={rows}
      onChange={(event) => onChange?.(event.currentTarget.value)}
      style={style}
    />
  );
}

/* -------------------------------------------------------- rich primitives */

export interface SwatchProps {
  color: Color;
  style?: CSSProperties;
}
export function Swatch({ color, style }: SwatchProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        borderRadius: 4,
        background: colorPalette[color],
        flex: '0 0 auto',
        ...style,
      }}
    />
  );
}

export interface UsageBarSegment {
  readonly id: string;
  readonly value: number;
  readonly color?: Color;
}
export interface UsageBarProps {
  readonly segments: readonly UsageBarSegment[];
  readonly total: number;
  readonly topLeftLabel?: ReactNode;
  readonly topRightLabel?: ReactNode;
  readonly style?: CSSProperties;
}
export function UsageBar({
  segments,
  total,
  topLeftLabel,
  topRightLabel,
  style,
}: UsageBarProps) {
  const theme = useHostTheme();
  const safeTotal = total > 0 ? total : 1;
  const used = segments.reduce(
    (sum, s) => sum + (Number.isFinite(s.value) && s.value > 0 ? s.value : 0),
    0,
  );
  const remainder = Math.max(0, safeTotal - used);
  return (
    <div style={style}>
      {(topLeftLabel != null || topRightLabel != null) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: theme.text.secondary,
            marginBottom: 6,
          }}
        >
          <span>{topLeftLabel}</span>
          <span>{topRightLabel}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: 2, height: 8 }}>
        {segments.map((segment, index) => {
          const value =
            Number.isFinite(segment.value) && segment.value > 0
              ? segment.value
              : 0;
          const color =
            colorPalette[
              segment.color ??
                usageColorSequence[index % usageColorSequence.length]
            ];
          return (
            <div
              key={segment.id}
              style={{
                width: `${(value / safeTotal) * 100}%`,
                background: color,
                borderRadius: 3,
              }}
            />
          );
        })}
        {remainder > 0 && (
          <div
            style={{
              width: `${(remainder / safeTotal) * 100}%`,
              background: theme.fill.tertiary,
              borderRadius: 3,
            }}
          />
        )}
      </div>
    </div>
  );
}

export interface CollapsibleSectionProps {
  title: string;
  leading?: ReactNode;
  count?: number;
  trailing?: ReactNode;
  children?: ReactNode;
  defaultOpen?: boolean;
  style?: CSSProperties;
}
export function CollapsibleSection({
  title,
  leading,
  count,
  trailing,
  children,
  defaultOpen = false,
  style,
}: CollapsibleSectionProps) {
  const theme = useHostTheme();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={style}>
      <div
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 0',
          cursor: 'pointer',
          userSelect: 'none',
          color: theme.text.primary,
          fontSize: 14,
        }}
      >
        <Chevron expanded={open} />
        {leading}
        <span style={{ fontWeight: 500 }}>{title}</span>
        {count != null && (
          <span style={{ color: theme.text.tertiary, fontSize: 12 }}>
            {count}
          </span>
        )}
        <span style={{ flex: 1 }} />
        {trailing != null && (
          <span style={{ color: theme.text.tertiary }}>{trailing}</span>
        )}
      </div>
      {open && (
        <div style={{ paddingLeft: 18, paddingBottom: 4 }}>{children}</div>
      )}
    </div>
  );
}
