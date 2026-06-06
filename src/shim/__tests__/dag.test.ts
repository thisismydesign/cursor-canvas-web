import { describe, expect, it } from 'vitest';
import { computeDAGLayout } from 'cursor/canvas';

describe('computeDAGLayout', () => {
  it('ranks a linear chain by longest path', () => {
    const layout = computeDAGLayout({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
      ],
    });
    const rankOf = (id: string) => layout.nodes.find((n) => n.id === id)?.rank;

    expect(rankOf('a')).toBe(0);
    expect(rankOf('b')).toBe(1);
    expect(rankOf('c')).toBe(2);
    expect(layout.width).toBeGreaterThan(0);
    expect(layout.height).toBeGreaterThan(0);
    expect(layout.edges.every((e) => !e.isBackEdge)).toBe(true);
  });

  it('detects a back-edge in a cycle and excludes it from ranking', () => {
    const layout = computeDAGLayout({
      nodes: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
      edges: [
        { from: 'a', to: 'b' },
        { from: 'b', to: 'c' },
        { from: 'c', to: 'a' },
      ],
    });

    const back = layout.edges.find((e) => e.from === 'c' && e.to === 'a');
    expect(back?.isBackEdge).toBe(true);
    expect(layout.edges.filter((e) => e.isBackEdge)).toHaveLength(1);
    // Ranking still proceeds over the remaining DAG.
    expect(layout.nodes.find((n) => n.id === 'c')?.rank).toBe(2);
  });

  it('lays out horizontally when requested', () => {
    const layout = computeDAGLayout({
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ from: 'a', to: 'b' }],
      direction: 'horizontal',
    });
    expect(layout.direction).toBe('horizontal');
    expect(layout.width).toBeGreaterThan(layout.height);
  });
});
