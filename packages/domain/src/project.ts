import type { AiChatMessage } from './ai.js';

export const PROJECT_SCHEMA_VERSION = 3;
export const PROJECT_CHAT_MESSAGE_LIMIT = 500;
export const PROJECT_SLIDE_LIMIT = 100;
export const PROJECT_NODE_LIMIT = 10_000;

export interface LastAiUndo {
  appliedAtRevision: number;
  nodeIds: string[];
  edgeIds: string[];
  description: string;
}

export const SLIDE_TABLE_LIMITS = { columns: 4, rows: 6, cellLength: 120 };

export interface SlideTable {
  headers: string[];
  rows: string[][];
}

export interface PresentationSlide {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  sourceNodeIds: string[];
  diagramSteps?: string[];
  mockFields?: Array<{ label: string; value: string }>;
  table?: SlideTable | null;
}

export interface LastAiSlideUndo {
  appliedAtRevision: number;
  slide: PresentationSlide;
  created?: true;
  description: string;
}

export interface LastAiDeckUndo {
  appliedAtRevision: number;
  slides: PresentationSlide[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  schemaVersion: number;
  revision: number;
  createdAt: string;
  updatedAt: string;
  map: { nodes: unknown[]; edges: unknown[] };
  presentation: { slides: unknown[] };
  conversation: AiChatMessage[];
  suggestions: unknown[];
  lastAiUndo: LastAiUndo | null;
  lastAiSlideUndo?: LastAiSlideUndo | null;
  lastAiDeckUndo?: LastAiDeckUndo | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  revision: number;
  updatedAt: string;
  readOnly?: boolean;
  schemaVersion?: number;
}

export interface FutureProjectPreview {
  id: string;
  name: string;
  schemaVersion: number;
  revision: number;
  updatedAt: string;
  project: ProjectDocument | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function isValidNode(value: unknown) {
  if (!isRecord(value) || !isRecord(value.position) || !isRecord(value.data)) return false;
  const tone = value.data.tone;
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 128
    && (value.type === undefined || value.type === 'idea')
    && Number.isFinite(value.position.x) && Math.abs(Number(value.position.x)) <= 1_000_000
    && Number.isFinite(value.position.y) && Math.abs(Number(value.position.y)) <= 1_000_000
    && typeof value.data.label === 'string' && value.data.label.length > 0 && value.data.label.length <= 500
    && (tone === undefined || ['root', 'lavender', 'mint', 'peach', 'blue'].includes(String(tone)));
}

function isValidEdge(value: unknown) {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && value.id.length > 0 && value.id.length <= 128
    && typeof value.source === 'string' && value.source.length > 0 && value.source.length <= 128
    && typeof value.target === 'string' && value.target.length > 0 && value.target.length <= 128
    && (value.type === undefined || ['smoothstep', 'default', 'straight', 'step'].includes(String(value.type)))
    && (value.label === undefined || typeof value.label === 'string' && value.label.length <= 300);
}

function isValidUndo(value: unknown): value is LastAiUndo | null {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  return Number.isInteger(value.appliedAtRevision)
    && Array.isArray(value.nodeIds) && value.nodeIds.length >= 1 && value.nodeIds.length <= 12 && value.nodeIds.every((id) => typeof id === 'string' && id.length > 0 && id.length <= 128)
    && Array.isArray(value.edgeIds) && value.edgeIds.length === value.nodeIds.length && value.edgeIds.every((id) => typeof id === 'string' && id.length > 0 && id.length <= 128)
    && typeof value.description === 'string' && value.description.length <= 300;
}

export function isValidSlideTable(value: unknown): value is SlideTable {
  if (!isRecord(value) || !Array.isArray(value.headers) || !Array.isArray(value.rows)) return false;
  const columns = value.headers.length;
  const isCell = (cell: unknown) => typeof cell === 'string' && cell.length <= SLIDE_TABLE_LIMITS.cellLength;
  return columns >= 2 && columns <= SLIDE_TABLE_LIMITS.columns && value.headers.every(isCell)
    && value.rows.length >= 1 && value.rows.length <= SLIDE_TABLE_LIMITS.rows
    && value.rows.every((row) => Array.isArray(row) && row.length === columns && row.every(isCell));
}

function isValidSlide(value: unknown): value is PresentationSlide {
  return isRecord(value) && typeof value.id === 'string' && /^[a-f0-9-]{36}$/i.test(value.id)
    && typeof value.title === 'string' && value.title.length <= 180
    && typeof value.subtitle === 'string' && value.subtitle.length <= 300
    && typeof value.body === 'string' && value.body.length <= 2_000
    && Array.isArray(value.bullets) && value.bullets.length <= 12 && value.bullets.every((item) => typeof item === 'string' && item.length <= 300)
    && Array.isArray(value.sourceNodeIds) && value.sourceNodeIds.length <= 100 && value.sourceNodeIds.every((id) => typeof id === 'string' && id.length <= 128)
    && (value.table == null || isValidSlideTable(value.table))
    && (value.diagramSteps === undefined || Array.isArray(value.diagramSteps) && value.diagramSteps.length <= 8 && value.diagramSteps.every((step) => typeof step === 'string' && step.length <= 180))
    && (value.mockFields === undefined || Array.isArray(value.mockFields) && value.mockFields.length <= 8 && value.mockFields.every((field) => isRecord(field) && typeof field.label === 'string' && field.label.length <= 100 && typeof field.value === 'string' && field.value.length <= 160));
}

function isValidSlideUndo(value: unknown): value is LastAiSlideUndo | null | undefined {
  if (value === undefined || value === null) return true;
  return isRecord(value) && Number.isInteger(value.appliedAtRevision)
    && (value.created === undefined || value.created === true)
    && Number(value.appliedAtRevision) >= 1 && typeof value.description === 'string' && value.description.length <= 300
    && isValidSlide(value.slide);
}

function isValidDeckUndo(value: unknown): value is LastAiDeckUndo | null | undefined {
  if (value == null) return true;
  return isRecord(value) && Number.isInteger(value.appliedAtRevision)
    && Array.isArray(value.slides) && value.slides.length <= PROJECT_SLIDE_LIMIT
    && value.slides.every(isValidSlide)
    && new Set(value.slides.map((slide) => slide.id)).size === value.slides.length;
}

export function validateProject(value: unknown): value is ProjectDocument {
  if (!value || typeof value !== 'object') return false;
  const project = value as Partial<ProjectDocument>;
  if (!(typeof project.id === 'string' && /^[a-f0-9-]{36}$/i.test(project.id)
    && typeof project.name === 'string'
    && project.name.length <= 300
    && Number.isInteger(project.schemaVersion)
    && project.schemaVersion === PROJECT_SCHEMA_VERSION
    && Number.isInteger(project.revision)
    && Number(project.revision) >= 0
    && typeof project.createdAt === 'string' && project.createdAt.length <= 40
    && typeof project.updatedAt === 'string' && project.updatedAt.length <= 40
    && isRecord(project.map) && Array.isArray(project.map.nodes) && project.map.nodes.length <= PROJECT_NODE_LIMIT && project.map.nodes.every(isValidNode)
    && Array.isArray(project.map.edges) && project.map.edges.length <= 30_000 && project.map.edges.every(isValidEdge)
    && !!project.presentation && Array.isArray(project.presentation.slides) && project.presentation.slides.length <= PROJECT_SLIDE_LIMIT
    && project.presentation.slides.every(isValidSlide)
    && Array.isArray(project.conversation) && project.conversation.length <= PROJECT_CHAT_MESSAGE_LIMIT
    && project.conversation.every((entry) => isRecord(entry) && (entry.role === 'user' || entry.role === 'assistant') && typeof entry.content === 'string' && entry.content.length <= 10_000)
    && Array.isArray(project.suggestions) && project.suggestions.length <= 100
    && project.suggestions.every((entry) => isRecord(entry) && typeof entry.title === 'string' && entry.title.length <= 200 && typeof entry.prompt === 'string' && entry.prompt.length <= 2_000)
    && isValidUndo(project.lastAiUndo)
    && isValidSlideUndo(project.lastAiSlideUndo) && isValidDeckUndo(project.lastAiDeckUndo))) return false;
  const nodeIds = project.map!.nodes.map((node) => (node as { id: string }).id);
  const edgeIds = project.map!.edges.map((edge) => (edge as { id: string }).id);
  if (new Set(nodeIds).size !== nodeIds.length || new Set(edgeIds).size !== edgeIds.length) return false;
  const knownNodes = new Set(nodeIds);
  const slideIds = project.presentation!.slides.map((slide) => (slide as { id: string }).id);
  if (new Set(slideIds).size !== slideIds.length) return false;
  if (project.presentation!.slides.some((slide) => (slide as PresentationSlide).sourceNodeIds.some((id) => !knownNodes.has(id)))) return false;
  if (project.lastAiSlideUndo && (project.lastAiSlideUndo.appliedAtRevision !== Number(project.revision)
    || !slideIds.includes(project.lastAiSlideUndo.slide.id)
    || project.lastAiSlideUndo.slide.sourceNodeIds.some((id) => !knownNodes.has(id)))) return false;
  if (project.lastAiDeckUndo && (project.lastAiDeckUndo.appliedAtRevision !== project.revision
    || project.lastAiDeckUndo.slides.some((slide) => slide.sourceNodeIds.some((id) => !knownNodes.has(id))))) return false;
  if (project.map!.edges.some((edge) => {
    const relation = edge as { source: string; target: string };
    return !knownNodes.has(relation.source) || !knownNodes.has(relation.target);
  })) return false;
  if (project.lastAiUndo && (project.lastAiUndo.appliedAtRevision !== Number(project.revision)
    || new Set(project.lastAiUndo.nodeIds).size !== project.lastAiUndo.nodeIds.length
    || new Set(project.lastAiUndo.edgeIds).size !== project.lastAiUndo.edgeIds.length
    || project.lastAiUndo.nodeIds.some((id) => !id)
    || project.lastAiUndo.edgeIds.some((id) => !id)
    || project.lastAiUndo.nodeIds.some((id) => !/^ai-[a-f0-9-]{36}$/i.test(id))
    || project.lastAiUndo.edgeIds.some((id) => !/^ai-edge-[a-f0-9-]{36}$/i.test(id)))) return false;
  if (project.lastAiUndo) {
    const undoNodes = new Set(project.lastAiUndo.nodeIds);
    const undoEdges = new Set(project.lastAiUndo.edgeIds);
    const matchingEdges = project.map!.edges.filter((edge) => undoEdges.has((edge as { id: string }).id)) as Array<{ id: string; source: string; target: string }>;
    if (undoNodes.size !== matchingEdges.length || matchingEdges.length !== undoEdges.size
      || [...undoNodes].some((id) => !knownNodes.has(id))) return false;
    const parentIds = new Set<string>();
    const targets = new Set<string>();
    for (const edge of matchingEdges) {
      if (!undoNodes.has(edge.target) || undoNodes.has(edge.source) || targets.has(edge.target)) return false;
      parentIds.add(edge.source); targets.add(edge.target);
    }
    if (parentIds.size !== 1 || targets.size !== undoNodes.size || !knownNodes.has([...parentIds][0])) return false;
    if (project.map!.edges.some((edge) => {
      const relation = edge as { id: string; source: string; target: string };
      return (undoNodes.has(relation.source) || undoNodes.has(relation.target)) && !undoEdges.has(relation.id);
    })) return false;
  }
  return true;
}

export function migrateProjectDocument(value: unknown): ProjectDocument | null {
  if (!value || typeof value !== 'object') return null;
  const legacy = value as Partial<ProjectDocument>;
  if ((legacy.schemaVersion !== 0 && legacy.schemaVersion !== 1 && legacy.schemaVersion !== 2) || typeof legacy.id !== 'string' || typeof legacy.name !== 'string'
    || !Number.isInteger(legacy.revision) || typeof legacy.createdAt !== 'string' || typeof legacy.updatedAt !== 'string'
    || !legacy.map || !Array.isArray(legacy.map.nodes) || !Array.isArray(legacy.map.edges)) return null;
  const migrated: ProjectDocument = {
    ...legacy,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    presentation: legacy.presentation && Array.isArray(legacy.presentation.slides) ? legacy.presentation : { slides: [] },
    conversation: Array.isArray(legacy.conversation) ? legacy.conversation : [],
    suggestions: Array.isArray(legacy.suggestions) ? legacy.suggestions : [],
    lastAiUndo: legacy.schemaVersion === 2 && isValidUndo(legacy.lastAiUndo) && legacy.lastAiUndo?.appliedAtRevision === legacy.revision ? legacy.lastAiUndo : null,
    lastAiSlideUndo: null,
  } as ProjectDocument;
  return validateProject(migrated) ? migrated : null;
}

export function summarizeProject(project: ProjectDocument): ProjectSummary {
  return { id: project.id, name: project.name, revision: project.revision, updatedAt: project.updatedAt };
}
