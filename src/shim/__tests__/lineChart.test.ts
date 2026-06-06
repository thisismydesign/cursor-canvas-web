import { describe, expect, it } from 'vitest';
import { reshapeLineChartData, type ChartSeries } from 'cursor/canvas';

describe('reshapeLineChartData', () => {
  it('reshapes parallel categories + series into row objects', () => {
    const categories = ['Mon', 'Tue', 'Wed'];
    const series: ChartSeries[] = [
      { name: 'Current', data: [10, 20, 30], tone: 'info' },
      { name: 'Previous', data: [5, 15, 25], tone: 'neutral' },
    ];

    expect(reshapeLineChartData(categories, series)).toEqual([
      { category: 'Mon', Current: 10, Previous: 5 },
      { category: 'Tue', Current: 20, Previous: 15 },
      { category: 'Wed', Current: 30, Previous: 25 },
    ]);
  });

  it('fills missing data points with 0', () => {
    const rows = reshapeLineChartData(['a', 'b'], [{ name: 'S', data: [7] }]);

    expect(rows).toEqual([
      { category: 'a', S: 7 },
      { category: 'b', S: 0 },
    ]);
  });
});
