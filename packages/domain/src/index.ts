export type NodeTone = 'root' | 'lavender' | 'mint' | 'peach' | 'blue';

export interface IdeaNodeData extends Record<string, unknown> {
  label: string;
  tone?: NodeTone;
}

export * from './project.js';
export * from './api.js';
export * from './ai-context.js';
export * from './provider.js';
export * from './ai.js';

