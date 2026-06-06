/**
 * Pure layered DAG layout, matching the SDK's `computeDAGLayout` contract.
 *
 * Back-edges (cycles) are detected via DFS, excluded from ranking, and flagged
 * in the output so callers can render them differently. Rendering is the
 * caller's responsibility — this returns only coordinates and anchor points.
 */

export type DAGLayoutOptions = {
  nodes: Array<{ id: string }>;
  edges: Array<{ from: string; to: string }>;
  direction?: 'vertical' | 'horizontal';
  nodeWidth?: number;
  nodeHeight?: number;
  rankGap?: number;
  nodeGap?: number;
  padding?: number;
};

export type DAGLayoutNode = {
  id: string;
  x: number;
  y: number;
  rank: number;
  order: number;
};

export type DAGLayoutEdge = {
  from: string;
  to: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isBackEdge: boolean;
};

export type DAGLayoutRank = {
  rank: number;
  x: number;
  y: number;
  width: number;
  height: number;
  nodeIds: string[];
};

export type DAGLayoutResult = {
  nodes: DAGLayoutNode[];
  edges: DAGLayoutEdge[];
  ranks: DAGLayoutRank[];
  direction: 'vertical' | 'horizontal';
  width: number;
  height: number;
};

export function computeDAGLayout(options: DAGLayoutOptions): DAGLayoutResult {
  const {
    nodes,
    edges,
    direction = 'vertical',
    nodeWidth = 160,
    nodeHeight = 40,
    rankGap = 64,
    nodeGap = 48,
    padding = 24,
  } = options;

  const ids = nodes.map((n) => n.id);
  const idSet = new Set(ids);
  const adjacency = new Map<string, string[]>();
  for (const id of ids) adjacency.set(id, []);
  for (const e of edges) {
    if (idSet.has(e.from) && idSet.has(e.to)) {
      adjacency.get(e.from)!.push(e.to);
    }
  }

  // Detect back-edges with a white/gray/black DFS.
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const state = new Map<string, number>(ids.map((id) => [id, WHITE]));
  const backEdges = new Set<string>();
  const edgeKey = (from: string, to: string) => `${from}\u0000${to}`;

  const visit = (id: string) => {
    state.set(id, GRAY);
    for (const to of adjacency.get(id) ?? []) {
      const s = state.get(to);
      if (s === GRAY) backEdges.add(edgeKey(id, to));
      else if (s === WHITE) visit(to);
    }
    state.set(id, BLACK);
  };
  for (const id of ids) if (state.get(id) === WHITE) visit(id);

  // Longest-path ranking over the DAG (back-edges removed).
  const forwardEdges = edges.filter(
    (e) =>
      idSet.has(e.from) &&
      idSet.has(e.to) &&
      !backEdges.has(edgeKey(e.from, e.to)),
  );
  const indegree = new Map<string, number>(ids.map((id) => [id, 0]));
  const forwardAdj = new Map<string, string[]>(ids.map((id) => [id, []]));
  for (const e of forwardEdges) {
    forwardAdj.get(e.from)!.push(e.to);
    indegree.set(e.to, (indegree.get(e.to) ?? 0) + 1);
  }
  const rank = new Map<string, number>(ids.map((id) => [id, 0]));
  const queue = ids.filter((id) => (indegree.get(id) ?? 0) === 0);
  while (queue.length > 0) {
    const id = queue.shift()!;
    const r = rank.get(id)!;
    for (const to of forwardAdj.get(id)!) {
      rank.set(to, Math.max(rank.get(to)!, r + 1));
      indegree.set(to, indegree.get(to)! - 1);
      if (indegree.get(to) === 0) queue.push(to);
    }
  }

  // Group by rank, preserving input order within each rank.
  const byRank = new Map<number, string[]>();
  for (const id of ids) {
    const r = rank.get(id)!;
    if (!byRank.has(r)) byRank.set(r, []);
    byRank.get(r)!.push(id);
  }
  const rankIndices = [...byRank.keys()].sort((a, b) => a - b);

  const isVertical = direction === 'vertical';
  // Cross-axis span (px) of a rank with `count` nodes.
  const span = (count: number) =>
    count * (isVertical ? nodeWidth : nodeHeight) +
    Math.max(0, count - 1) * nodeGap;
  const maxSpan = Math.max(
    0,
    ...rankIndices.map((r) => span(byRank.get(r)!.length)),
  );

  const nodeOut = new Map<string, DAGLayoutNode>();
  const ranksOut: DAGLayoutRank[] = [];

  rankIndices.forEach((r, rankPos) => {
    const rankNodes = byRank.get(r)!;
    const rankSpan = span(rankNodes.length);
    const crossStart = padding + (maxSpan - rankSpan) / 2;
    const mainPos =
      padding + rankPos * ((isVertical ? nodeHeight : nodeWidth) + rankGap);

    rankNodes.forEach((id, order) => {
      const crossPos =
        crossStart + order * ((isVertical ? nodeWidth : nodeHeight) + nodeGap);
      const x = isVertical ? crossPos : mainPos;
      const y = isVertical ? mainPos : crossPos;
      nodeOut.set(id, { id, x, y, rank: r, order });
    });

    ranksOut.push({
      rank: r,
      x: isVertical ? crossStart : mainPos,
      y: isVertical ? mainPos : crossStart,
      width: isVertical ? rankSpan : nodeWidth,
      height: isVertical ? nodeHeight : rankSpan,
      nodeIds: rankNodes,
    });
  });

  const anchor = (
    node: DAGLayoutNode | undefined,
    role: 'source' | 'target',
  ) => {
    if (!node) return { x: 0, y: 0 };
    if (isVertical) {
      return {
        x: node.x + nodeWidth / 2,
        y: role === 'source' ? node.y + nodeHeight : node.y,
      };
    }
    return {
      x: role === 'source' ? node.x + nodeWidth : node.x,
      y: node.y + nodeHeight / 2,
    };
  };

  const edgesOut: DAGLayoutEdge[] = edges
    .filter((e) => idSet.has(e.from) && idSet.has(e.to))
    .map((e) => {
      const source = anchor(nodeOut.get(e.from), 'source');
      const target = anchor(nodeOut.get(e.to), 'target');
      return {
        from: e.from,
        to: e.to,
        sourceX: source.x,
        sourceY: source.y,
        targetX: target.x,
        targetY: target.y,
        isBackEdge: backEdges.has(edgeKey(e.from, e.to)),
      };
    });

  const totalMain =
    padding * 2 +
    rankIndices.length * (isVertical ? nodeHeight : nodeWidth) +
    Math.max(0, rankIndices.length - 1) * rankGap;
  const totalCross = padding * 2 + maxSpan;

  return {
    nodes: [...nodeOut.values()],
    edges: edgesOut,
    ranks: ranksOut,
    direction,
    width: isVertical ? totalCross : totalMain,
    height: isVertical ? totalMain : totalCross,
  };
}
