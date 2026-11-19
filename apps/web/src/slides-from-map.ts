import { PROJECT_SLIDE_LIMIT, type PresentationSlide } from '@espacio-visual/domain';

type Idea = { id: string; data: { label: string } };
type Relation = { source: string; target: string };

export function suggestedSlideCount(ideaCount: number) {
  return Math.min(7, ideaCount, Math.max(3, Math.ceil(ideaCount / 3)));
}

export function slidesFromMap(title: string, nodes: Idea[], edges: Relation[], count: number): PresentationSlide[] {
  if (!nodes.length || !Number.isInteger(count) || count < 1 || count > PROJECT_SLIDE_LIMIT) {
    throw new RangeError('La cantidad de diapositivas no es válida.');
  }

  const root = nodes.find((node) => node.id === 'root') ?? nodes[0];
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const children = new Map<string, string[]>();
  const parent = new Map<string, string>();
  for (const edge of edges) {
    if (!nodesById.has(edge.target)) continue;
    const siblings = children.get(edge.source) ?? [];
    siblings.push(edge.target);
    children.set(edge.source, siblings);
    if (!parent.has(edge.target) && nodesById.has(edge.source)) parent.set(edge.target, edge.source);
  }
  const ordered: Idea[] = [];
  const seen = new Set<string>();
  // Keep a branch together when possible and visit disconnected ideas too.
  for (const start of [root, ...nodes]) {
    if (seen.has(start.id)) continue;
    const pending = [start.id];
    while (pending.length) {
      const id = pending.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      ordered.push(nodesById.get(id)!);
      const next = children.get(id) ?? [];
      for (let index = next.length - 1; index >= 0; index--) pending.push(next[index]);
    }
  }

  const branches = ordered.slice(1);
  const headings = (children.get(root.id) ?? [])
    .filter((id) => id !== root.id).map((id) => nodesById.get(id)!);
  const overview = count === 1 ? branches : headings.length ? headings : branches;
  const overviewTitle = title.trim() || root.data.label;
  const createSlide = (heading: string, options: { subtitle?: string; body?: string; bullets?: string[]; sources?: string[] } = {}): PresentationSlide => ({
    id: crypto.randomUUID(), title: heading.slice(0, 180), subtitle: options.subtitle?.slice(0, 300) ?? '',
    body: options.body?.slice(0, 2000) ?? '', bullets: options.bullets?.slice(0, 12).map((label) => label.slice(0, 300)) ?? [],
    sourceNodeIds: [...new Set(options.sources)].slice(0, 100),
  });
  const slides = [createSlide(overviewTitle, {
    subtitle: root.data.label === overviewTitle ? 'Resumen del mapa' : root.data.label,
    body: `El mapa reúne ${branches.length} ideas alrededor de «${root.data.label}».`,
    bullets: overview.map((idea) => idea.data.label),
    sources: [root.id, ...overview.map((idea) => idea.id)],
  })];

  const groups = Math.min(count - 1, branches.length);
  for (let index = 0; index < groups; index++) {
    const start = Math.floor(index * branches.length / groups);
    const end = Math.floor((index + 1) * branches.length / groups);
    const group = branches.slice(start, end);
    const [heading, ...details] = group;
    const parentId = parent.get(heading.id);
    const parentLabel = parentId ? nodesById.get(parentId)?.data.label : undefined;
    const sources = [...(parentId ? [parentId] : []), ...group.map((idea) => idea.id)];
    slides.push(createSlide(heading.data.label, {
      subtitle: parentLabel ? `Dentro de ${parentLabel}` : 'Idea relacionada del mapa',
      body: details.length
        ? `Esta parte del mapa reúne ${group.length} ideas en torno a «${heading.data.label}».`
        : `El mapa señala «${heading.data.label}» como una línea de trabajo por desarrollar.`,
      bullets: details.map((idea) => idea.data.label),
      sources,
    }));
  }
  while (slides.length < count) {
    const number = slides.length + 1;
    slides.push(createSlide(`Continuación ${number}`, {
      subtitle: root.data.label,
      body: `Continúa el desarrollo de «${root.data.label}». Añade ideas al mapa para completar esta diapositiva.`,
      sources: [root.id],
    }));
  }
  return slides;
}
