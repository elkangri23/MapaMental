import type { ProjectDocument } from './project.js';

export interface AiContextNode { id: string; label: string; tone: string }
export interface AiContextRelation { from: string; to: string; sourceLabel: string; targetLabel: string }

const relatedSlideLimit = 20;
const relatedSlideExcerptLimit = 500;
const relatedSlideTotalLimit = 6000;
const summaryThemeLimit = 8;
const summaryThemeLabelLimit = 120;

function boundedLabel(label: string) {
  return label.trim().replace(/\s+/g, ' ').slice(0, summaryThemeLabelLimit);
}

function summarizeMap(projectName: string, nodes: AiContextNode[], edges: Array<{ source: string; target: string }>) {
  if (nodes.length === 0) return `El mapa de «${projectName}» todavía no tiene ideas.`;
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const incomingIds = new Set(edges.map((edge) => edge.target));
  const roots = nodes.filter((node) => !incomingIds.has(node.id));
  const root = nodesById.get('root') ?? roots[0] ?? nodes[0];
  const branchIds = root
    ? [...new Set(edges.filter((edge) => edge.source === root.id).map((edge) => edge.target))]
    : roots.map((node) => node.id);
  const branches = branchIds.flatMap((id) => {
    const node = nodesById.get(id);
    return node && node.id !== root?.id ? [node] : [];
  });
  const branchNames = branches.slice(0, summaryThemeLimit).map((node) => `«${boundedLabel(node.label)}»`);
  const omittedBranches = Math.max(0, branches.length - branchNames.length);

  if (root) {
    const central = boundedLabel(root.label);
    if (branchNames.length === 0) return `Idea central: «${central}». Aún no tiene ramas principales.`;
    return `Idea central: «${central}». Ramas principales: ${branchNames.join(', ')}${omittedBranches ? ` y ${omittedBranches} más` : ''}.`;
  }
  return `Ideas de partida: ${branchNames.join(', ')}${omittedBranches ? ` y ${omittedBranches} más` : ''}.`;
}

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
  let relatedSlideCharacters = 0;
  const relatedSlides = project.presentation.slides.flatMap((value) => {
    if (!value || typeof value !== 'object') return [];
    const slide = value as {
      title?: unknown; sourceNodeIds?: unknown; body?: unknown; bullets?: unknown;
      diagramSteps?: unknown; mockFields?: unknown; table?: unknown;
    };
    if (typeof slide.title !== 'string' || !Array.isArray(slide.sourceNodeIds)) return [];
    if (!slide.sourceNodeIds.some((id) => typeof id === 'string' && contextIds.has(id))) return [];
    const parts: string[] = [];
    const append = (value: unknown) => {
      if (typeof value === 'string' && value.trim()) parts.push(value.trim());
    };
    append(slide.body);
    if (Array.isArray(slide.bullets)) slide.bullets.forEach(append);
    if (Array.isArray(slide.diagramSteps)) slide.diagramSteps.forEach(append);
    if (Array.isArray(slide.mockFields)) for (const field of slide.mockFields) {
      if (!field || typeof field !== 'object') continue;
      const item = field as { label?: unknown; value?: unknown };
      append(item.label);
      append(item.value);
    }
    if (slide.table && typeof slide.table === 'object') {
      const table = slide.table as { headers?: unknown; rows?: unknown };
      if (Array.isArray(table.headers)) table.headers.forEach(append);
      if (Array.isArray(table.rows)) for (const row of table.rows) if (Array.isArray(row)) row.forEach(append);
    }
    const remaining = relatedSlideTotalLimit - relatedSlideCharacters;
    const excerpt = parts.join('\n').slice(0, Math.min(relatedSlideExcerptLimit, Math.max(0, remaining)));
    relatedSlideCharacters += excerpt.length;
    return [{ title: slide.title, excerpt }];
  }).slice(0, relatedSlideLimit);

  return {
    project: project.name,
    projectSummary: {
      narrative: summarizeMap(project.name, nodes, edges),
      ideaCount: nodes.length,
      connectionCount: edges.length,
      slideCount: project.presentation.slides.length,
    },
    map: { nodes: mapNodes(scopeIds), relations },
    ancestors: mapNodes(ancestors),
    relatedSlideTitles: [...new Set(relatedSlides.map((slide) => slide.title))].slice(0, relatedSlideLimit),
    relatedSlideExcerpts: relatedSlides.filter((slide) => slide.excerpt.length > 0),
    restOfMapCount: Math.max(0, nodes.length - contextIds.size),
    omittedAncestorCount: Math.max(0, allAncestors.length - ancestors.length),
  };
}
