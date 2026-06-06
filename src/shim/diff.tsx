/**
 * Diff primitives. `DiffView` renders a unified diff body (colored line
 * backgrounds, gutter, accent strip); `DiffStats` is the `+N`/`-N` glyph pair.
 *
 * Syntax highlighting from the real SDK (Shiki) is intentionally omitted — the
 * plain-text fallback is an explicitly supported mode. `path`/`language` are
 * accepted for API parity but do not colorize tokens here.
 */
import type { CSSProperties } from 'react';
import { useHostTheme } from './use-tokens';
import { toneHex } from './theme';

export type DiffStatsProps = {
  additions?: number;
  deletions?: number;
  style?: CSSProperties;
};

export function DiffStats({
  additions = 0,
  deletions = 0,
  style,
}: DiffStatsProps) {
  if (additions === 0 && deletions === 0) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        gap: 8,
        fontVariantNumeric: 'tabular-nums',
        fontSize: 12,
        fontWeight: 600,
        ...style,
      }}
    >
      {additions > 0 && (
        <span style={{ color: toneHex.added }}>+{additions}</span>
      )}
      {deletions > 0 && (
        <span style={{ color: toneHex.deleted }}>-{deletions}</span>
      )}
    </span>
  );
}

export type DiffLineType = 'added' | 'removed' | 'unchanged';
export type DiffLineData = {
  type: DiffLineType;
  content: string;
  lineNumber?: number;
};

export type DiffViewProps = {
  lines: DiffLineData[];
  path?: string;
  language?: string;
  showLineNumbers?: boolean;
  coloredLineNumbers?: boolean;
  showAccentStrip?: boolean;
  style?: CSSProperties;
};

const SIGN: Record<DiffLineType, string> = {
  added: '+',
  removed: '-',
  unchanged: ' ',
};

export function DiffView({
  lines,
  showLineNumbers = true,
  coloredLineNumbers = true,
  showAccentStrip = true,
  style,
}: DiffViewProps) {
  const theme = useHostTheme();

  const lineBg = (type: DiffLineType) =>
    type === 'added'
      ? theme.diff.insertedLine
      : type === 'removed'
        ? theme.diff.removedLine
        : 'transparent';

  const stripColor = (type: DiffLineType) =>
    type === 'added'
      ? theme.diff.stripAdded
      : type === 'removed'
        ? theme.diff.stripRemoved
        : 'transparent';

  const numberColor = (type: DiffLineType) => {
    if (coloredLineNumbers && type === 'added') return toneHex.added;
    if (coloredLineNumbers && type === 'removed') return toneHex.deleted;
    return theme.text.tertiary;
  };

  return (
    <div
      style={{
        fontFamily:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, "Cascadia Code", monospace',
        fontSize: 12.5,
        lineHeight: '18px',
        color: theme.text.primary,
        overflowX: 'auto',
        ...style,
      }}
    >
      {lines.map((line, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'stretch',
            background: lineBg(line.type),
            borderLeft: showAccentStrip
              ? `3px solid ${stripColor(line.type)}`
              : undefined,
          }}
        >
          {showLineNumbers && (
            <span
              style={{
                flex: '0 0 auto',
                width: 40,
                textAlign: 'right',
                paddingRight: 10,
                userSelect: 'none',
                color: numberColor(line.type),
              }}
            >
              {line.lineNumber ?? ''}
            </span>
          )}
          <span
            style={{
              flex: '0 0 auto',
              width: 14,
              textAlign: 'center',
              userSelect: 'none',
              color: numberColor(line.type),
            }}
          >
            {SIGN[line.type]}
          </span>
          <pre
            style={{
              margin: 0,
              padding: '0 8px',
              whiteSpace: 'pre',
              fontFamily: 'inherit',
            }}
          >
            {line.content}
          </pre>
        </div>
      ))}
    </div>
  );
}
