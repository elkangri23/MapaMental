export interface IdeaLayoutNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string; tone?: string };
}

export interface IdeaPosition {
  x: number;
  y: number;
}

const verticalGap = 34;
const coordinateLimit = 1_000_000;

export function estimateIdeaHeight(label: string, isRoot = false) {
  const charactersPerLine = isRoot ? 29 : 24;
  const lineHeight = isRoot ? 20 : 17;
  const fixedHeight = isRoot ? 58 : 45;
  return Math.max(isRoot ? 110 : 104, fixedHeight + Math.ceil(Math.max(1, label.length) / charactersPerLine) * lineHeight);
}

export function placeIdeaGroup(
  parent: Pick<IdeaLayoutNode, 'position' | 'data'>,
  ideas: Array<{ label: string; isRoot?: boolean }>,
  existingNodes: IdeaLayoutNode[],
): IdeaPosition[] {
  if (ideas.length === 0) return [];
  const x = parent.position.x > coordinateLimit - 300 ? parent.position.x - 300 : parent.position.x + 300;
  const heights = ideas.map((idea) => estimateIdeaHeight(idea.label, idea.isRoot));
  const offsets: number[] = [];
  let groupHeight = 0;
  for (const height of heights) {
    offsets.push(groupHeight);
    groupHeight += height + verticalGap;
  }
  groupHeight -= verticalGap;

  const relevant = existingNodes.flatMap((node) => {
    const height = estimateIdeaHeight(node.data.label, node.data.tone === 'root');
    const width = node.data.tone === 'root' ? 240 : 200;
    return Math.abs(node.position.x - x) < (width + 200) / 2 + verticalGap
      ? [{ node, height, width }]
      : [];
  });

  let top = Math.max(-coordinateLimit + groupHeight / 2, Math.min(coordinateLimit - groupHeight / 2, parent.position.y - groupHeight / 2));
  for (let attempt = 0; attempt <= relevant.length; attempt += 1) {
    let nextTop = top;
    for (let index = 0; index < ideas.length; index += 1) {
      const center = top + offsets[index] + heights[index] / 2;
      for (const { node, height, width } of relevant) {
        const horizontalClearance = (200 + width) / 2 + verticalGap;
        if (Math.abs(node.position.x - x) >= horizontalClearance) continue;
        const verticalClearance = (heights[index] + height) / 2 + verticalGap;
        if (Math.abs(node.position.y - center) < verticalClearance) {
          nextTop = Math.max(nextTop, node.position.y + verticalClearance - offsets[index] - heights[index] / 2);
        }
      }
    }
    if (nextTop === top) break;
    top = nextTop <= coordinateLimit - groupHeight ? nextTop : -coordinateLimit;
  }

  return heights.map((height, index) => ({ x, y: top + offsets[index] + height / 2 }));
}

export function avoidIdeaOverlaps(nodes: IdeaLayoutNode[], positions: Map<string, IdeaPosition>) {
  const columns = new Map<number, IdeaLayoutNode[]>();
  for (const node of nodes) {
    const x = positions.get(node.id)?.x ?? node.position.x;
    const column = columns.get(x);
    if (column) column.push(node);
    else columns.set(x, [node]);
  }

  for (const [x, column] of columns) {
    column.sort((left, right) => (positions.get(left.id)?.y ?? left.position.y) - (positions.get(right.id)?.y ?? right.position.y));
    const desired = column.map((node) => positions.get(node.id)?.y ?? node.position.y);
    const laidOut: number[] = [];
    for (let index = 0; index < column.length; index += 1) {
      const height = estimateIdeaHeight(column[index].data.label, column[index].data.tone === 'root');
      const previous = index === 0 ? undefined : column[index - 1];
      const previousHeight = previous ? estimateIdeaHeight(previous.data.label, previous.data.tone === 'root') : 0;
      laidOut.push(previous ? Math.max(desired[index], laidOut[index - 1] + (previousHeight + height) / 2 + verticalGap) : desired[index]);
    }
    const beforeCenter = (desired[0] + desired[desired.length - 1]) / 2;
    const afterCenter = (laidOut[0] + laidOut[laidOut.length - 1]) / 2;
    const recenter = beforeCenter - afterCenter;
    column.forEach((node, index) => positions.set(node.id, { x, y: laidOut[index] + recenter }));
  }
}
