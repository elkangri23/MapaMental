import type { ProjectDocument } from './project.js';

export interface AiContextNode { id: string; label: string; tone: string }
export interface AiContextRelation { from: string; to: string; sourceLabel: string; targetLabel: string }

/** Builds the bounded project context shared by the UI preview and AI routes. */
export function buildProjectAiContext(project: ProjectDocument, requestedScopeIds: string[]) {
  const nodes = project.map.nodes.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const node = value as { id?: unknown; data?: { label?: unknown; tone?: unknown } };
    return typeof node.id === 'string' && typeof node.data?.label === 'string'
      ? [{ id: node.id, label: node.data.label, tone: typeof node.data.tone === 'string' ? node.data.tone : 'blue' }]
      : [];
  });
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const edges = project.map.edges.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const edge = value as { source?: unknown; target?: unknown };
    return typeof edge.source === 'string' && typeof edge.target === 'string' ? [{ source: edge.source, target: edge.target }] : [];
  });
  const scopeIds = [...new Set(requestedScopeIds)].filter((id) => nodesById.has(id)).slice(0, 100);
  const scopeSet = new Set(scopeIds);
  const parentsByChild = new Map<string, string[]>();
  for (const edge of edges) {
    const parents = parentsByChild.get(edge.target);
    if (parents) parents.push(edge.source); else parentsByChild.set(edge.target, [edge.source]);
  }

  const allAncestors: string[] = [];
  const ancestorSet = new Set<string>();
  const pending = [...scopeIds];
  for (let cursor = 0; cursor < pending.length; cursor++) {
    for (const parentId of parentsByChild.get(pending[cursor]) ?? []) {
      if (scopeSet.has(parentId) || ancestorSet.has(parentId) || !nodesById.has(parentId)) continue;
      ancestorSet.add(parentId);
      allAncestors.push(parentId);
      pending.push(parentId);
    }
  }
  const ancestors = allAncestors.slice(0, 50);

  const contextIds = new Set([...scopeIds, ...ancestors]);
  const mapNodes = (ids: string[]): AiContextNode[] => ids.flatMap((id) => {
    const node = nodesById.get(id);
    return node ? [node] : [];
  });
  const relations: AiContextRelation[] = edges
    .filter((edge) => contextIds.has(edge.source) && contextIds.has(edge.target))
    .slice(0, 350)
    .flatMap((edge) => {
      const sourceLabel = nodesById.get(edge.source)?.label;
      const targetLabel = nodesById.get(edge.target)?.label;
      return sourceLabel && targetLabel ? [{ from: edge.source, to: edge.target, sourceLabel, targetLabel }] : [];
    });
  const relatedSlideTitles = project.presentation.slides.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const slide = value as { title?: unknown; sourceNodeIds?: unknown };
    if (typeof slide.title !== 'string' || !Array.isArray(slide.sourceNodeIds)) return [];
    return slide.sourceNodeIds.some((id) => typeof id === 'string' && contextIds.has(id)) ? [slide.title] : [];
  }).slice(0, 20);

  return {
    project: project.name,
    projectSummary: { ideaCount: nodes.length, connectionCount: edges.length, slideCount: project.presentation.slides.length },
    map: { nodes: mapNodes(scopeIds), relations },
    ancestors: mapNodes(ancestors),
    relatedSlideTitles: [...new Set(relatedSlideTitles)],
    restOfMapCount: Math.max(0, nodes.length - contextIds.size),
    omittedAncestorCount: Math.max(0, allAncestors.length - ancestors.length),
  };
}
