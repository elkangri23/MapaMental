import type { SlideTable } from './project.js';
import type { ApiErrorResponse } from './api.js';

export type AiGenerationStage = 'preparing' | 'waiting-for-provider' | 'validating';

export type AiGenerationEvent<T> =
  | { type: 'stage'; stage: AiGenerationStage }
  | { type: 'result'; result: T }
  | ({ type: 'error' } & ApiErrorResponse);

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiSuggestion {
  title: string;
  prompt: string;
  kind: 'explore' | 'expand' | 'create-slide';
  targetNodeId?: string;
  format?: 'table' | 'diagram' | 'mock-form';
}

export interface AiIdeaProposal {
  id: string;
  label: string;
  tone: 'lavender' | 'mint' | 'peach' | 'blue';
  position: { x: number; y: number };
}

export interface AiProposal {
  baseRevision: number;
  parentNodeId: string;
  message: string;
  ideas: AiIdeaProposal[];
}

export interface AiSlideDraft {
  title: string;
  subtitle: string;
  body: string;
  bullets: string[];
  diagramSteps?: string[];
  mockFields?: Array<{ label: string; value: string }>;
  table?: SlideTable | null;
}

export interface AiSlideProposal {
  baseRevision: number;
  slideId: string;
  sourceNodeId?: string;
  message: string;
  draft: AiSlideDraft;
  provider: string;
}

export const AI_DECK_SLIDE_LIMIT = 12;

export interface AiDeckSlide extends AiSlideDraft {
  sourceNodeIds: string[];
}

export interface AiDeckProposal {
  baseRevision: number;
  message: string;
  provider: string;
  slides: AiDeckSlide[];
}
