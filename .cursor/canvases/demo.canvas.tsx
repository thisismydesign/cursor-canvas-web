/**
 * Demo canvas — authored against `cursor/canvas` ONLY.
 *
 * This is the single source of truth. The web app imports it directly, and a
 * copy is placed in the IDE-managed canvases folder so Cursor renders the same
 * file. Nothing here knows about Mantine, Vite, or GitHub Pages: in the IDE
 * `cursor/canvas` is the real SDK; in the web build it is aliased to the shim.
 */
import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Grid,
  H1,
  LineChart,
  Pill,
  Row,
  Select,
  Spacer,
  Stack,
  Stat,
  Text,
  TextInput,
  useCanvasState,
  type ChartSeries,
  type StatTone,
} from 'cursor/canvas';

type RangeKey = '7d' | '30d' | '90d';

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

const POINTS: Record<RangeKey, number> = { '7d': 7, '30d': 10, '90d': 12 };

// Deterministic pseudo-data so the demo is stable across reloads/tests.
function seededSeries(seed: number, length: number, scale: number): number[] {
  const out: number[] = [];
  let value = seed;
  for (let i = 0; i < length; i += 1) {
    value = (value * 1103515245 + 12345) % 2 ** 31;
    out.push(Math.round((value / 2 ** 31) * scale + scale * 0.4));
  }
  return out;
}

function sum(values: number[]): number {
  return values.reduce((total, n) => total + n, 0);
}

export default function DemoCanvas() {
  const [range, setRange] = useCanvasState<RangeKey>('demo.range', '30d');
  const [project, setProject] = useCanvasState('demo.project', 'web-app');
  const [compare, setCompare] = useCanvasState('demo.compare', true);

  const length = POINTS[range];
  const categories = Array.from({ length }, (_, i) => `T-${length - i}`);

  const current = seededSeries(7, length, 1000);
  const previous = seededSeries(13, length, 900);

  const total = sum(current);
  const prevTotal = sum(previous);
  const change = prevTotal === 0 ? 0 : ((total - prevTotal) / prevTotal) * 100;
  const changeTone: StatTone = change >= 0 ? 'success' : 'danger';

  const series: ChartSeries[] = [
    { name: 'Current', data: current, tone: 'info' },
    ...(compare
      ? [{ name: 'Previous', data: previous, tone: 'neutral' as const }]
      : []),
  ];

  return (
    <Stack gap={16}>
      <Row gap={12}>
        <H1>Traffic Explorer</H1>
        <Spacer />
        <Pill tone="info">canvas PoC</Pill>
      </Row>

      <Text tone="secondary">
        A purpose-built demo canvas. State persists via useCanvasState across
        reloads.
      </Text>

      <Card>
        <CardHeader>Controls</CardHeader>
        <CardBody>
          <Stack gap={12}>
            <Grid columns={2} gap={16}>
              <Stack gap={6}>
                <Text size="small" tone="secondary" weight="medium">
                  Range
                </Text>
                <Select
                  value={range}
                  onChange={(value) => setRange(value as RangeKey)}
                  options={RANGE_OPTIONS}
                />
              </Stack>
              <Stack gap={6}>
                <Text size="small" tone="secondary" weight="medium">
                  Project
                </Text>
                <TextInput
                  value={project}
                  onChange={setProject}
                  placeholder="project name"
                />
              </Stack>
            </Grid>
            <Checkbox
              label="Compare with previous period"
              checked={compare}
              onChange={setCompare}
            />
          </Stack>
        </CardBody>
      </Card>

      <Grid columns={2} gap={16}>
        <Card>
          <CardBody>
            <Stat
              value={total.toLocaleString()}
              label="Total visits"
              tone={changeTone}
            />
            <Text size="small" tone="secondary" style={{ marginTop: 4 }}>
              {change >= 0 ? '+' : ''}
              {change.toFixed(1)}% vs previous period
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat value={project || '—'} label="Tracked project" />
            <Text size="small" tone="secondary" style={{ marginTop: 4 }}>
              {compare ? 'comparison on' : 'comparison off'}
            </Text>
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader>Visits over time</CardHeader>
        <CardBody>
          <LineChart categories={categories} series={series} />
        </CardBody>
      </Card>

      <Divider />

      <Callout title="How this works" tone="info">
        This canvas imports only from the cursor/canvas module. A Vite alias
        swaps that module for a Mantine-backed shim at build time, so the
        unchanged source renders both in the IDE and on GitHub Pages.
      </Callout>
    </Stack>
  );
}
