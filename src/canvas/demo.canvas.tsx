/**
 * Demo canvas — authored against `cursor/canvas` ONLY.
 *
 * Nothing in this file knows about Mantine, Vite, or GitHub Pages. The exact
 * same source would render inside the Cursor IDE; here the `cursor/canvas`
 * import is aliased to the Mantine shim at build time.
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
  type Tone,
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
  const changeTone: Tone = change >= 0 ? 'positive' : 'negative';

  const series = [
    { name: 'Current', data: current, tone: 'accent' as Tone },
    ...(compare
      ? [{ name: 'Previous', data: previous, tone: 'neutral' as Tone }]
      : []),
  ];

  return (
    <Stack gap="lg">
      <Row>
        <H1>Traffic Explorer</H1>
        <Spacer />
        <Pill tone="info">canvas PoC</Pill>
      </Row>

      <Text dimmed>
        A purpose-built demo canvas wired to a Mantine shim. State persists via
        useCanvasState across reloads.
      </Text>

      <Card>
        <CardHeader>Controls</CardHeader>
        <CardBody>
          <Stack gap="md">
            <Grid columns={2}>
              <Select
                label="Range"
                value={range}
                onChange={(value) => setRange(value as RangeKey)}
                options={RANGE_OPTIONS}
              />
              <TextInput
                label="Project"
                value={project}
                onChange={setProject}
                placeholder="project name"
              />
            </Grid>
            <Checkbox
              label="Compare with previous period"
              checked={compare}
              onChange={setCompare}
            />
          </Stack>
        </CardBody>
      </Card>

      <Grid columns={2}>
        <Card>
          <CardBody>
            <Stat
              label={`Total visits (${range})`}
              value={total.toLocaleString()}
              delta={`${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs previous`}
              tone={changeTone}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              label="Tracked project"
              value={project || '—'}
              delta={compare ? 'comparison on' : 'comparison off'}
              tone={compare ? 'info' : 'neutral'}
            />
          </CardBody>
        </Card>
      </Grid>

      <Card>
        <CardHeader>Visits over time</CardHeader>
        <CardBody>
          <LineChart categories={categories} series={series} />
        </CardBody>
      </Card>

      <Divider label="Notes" />

      <Callout title="How this works" tone="info">
        This canvas imports only from the cursor/canvas module. A Vite alias
        swaps that module for a Mantine-backed shim at build time, so the
        unchanged source renders both in the IDE and on GitHub Pages.
      </Callout>
    </Stack>
  );
}
