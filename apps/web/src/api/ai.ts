import type { AiChatMessage, AiDeckProposal, AiGenerationEvent, AiGenerationStage, AiProposal, AiSlideDraft, AiSlideProposal, AiSuggestion, ProjectDocument } from '@espacio-visual/domain';
import { ensureApiSession, ProjectRequestError } from './projects.js';

export type GenerationOptions = { signal: AbortSignal; onStage: (stage: AiGenerationStage) => void };

async function readGeneration<T>(body: ReadableStream<Uint8Array>, options: GenerationOptions): Promise<T> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      const chunk = await reader.read();
      options.signal.throwIfAborted();
      if (chunk.done) throw new Error('Se interrumpió la generación antes de recibir el resultado. Vuelve a intentarlo.');
      buffer += decoder.decode(chunk.value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const data = frame.split(/\r?\n/).find((line) => line.startsWith('data:'));
        if (!data) continue;
        let event: AiGenerationEvent<T>;
        try { event = JSON.parse(data.slice(5)) as AiGenerationEvent<T>; }
        catch { throw new Error('El servidor devolvió un evento de generación no válido.'); }
        if (event?.type === 'stage') options.onStage(event.stage);
        if (event?.type === 'error') throw new Error(`${event.message} (referencia: ${event.correlationId})`);
        if (event?.type === 'result') return event.result;
      }
    }
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

async function request<T>(path: string, body: unknown, options?: GenerationOptions): Promise<T> {
  await ensureApiSession();
  const response = await fetch(path, {
    method: 'POST', credentials: 'same-origin', signal: options?.signal,
    headers: { 'content-type': 'application/json', accept: options ? 'text/event-stream' : 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1' },
    body: JSON.stringify(body),
  });
  if (options && response.ok && response.body && response.headers.get('content-type')?.startsWith('text/event-stream')) {
    return readGeneration<T>(response.body, options);
  }
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new ProjectRequestError(result.message ?? `Error ${response.status}`, response.status);
  return result;
}

export const aiApi = {
  chat: (id: string, message: string, history: AiChatMessage[], scopeNodeIds: string[], options: GenerationOptions) => request<{ message: string; suggestions: AiSuggestion[]; provider: string; contextNodeIds: string[] }>(`/api/projects/${id}/ai/chat`, { message, history, scopeNodeIds }, options),
  propose: (id: string, prompt: string, parentNodeId: string, scopeNodeIds: string[], options: GenerationOptions) => request<{ proposal: AiProposal; provider: string }>(`/api/projects/${id}/ai/proposals`, { prompt, parentNodeId, scopeNodeIds }, options),
  apply: (id: string, proposal: AiProposal, scopeNodeIds: string[]) => request<{ project: ProjectDocument }>(`/api/projects/${id}/ai-actions`, { expectedRevision: proposal.baseRevision, parentNodeId: proposal.parentNodeId, scopeNodeIds, ideas: proposal.ideas }),
  undo: (id: string, expectedRevision: number) => request<{ project: ProjectDocument }>(`/api/projects/${id}/undo-last-ai`, { expectedRevision }),
  proposeSlide: (id: string, slideId: string, prompt: string, options: GenerationOptions) => request<{ proposal: AiSlideProposal }>(`/api/projects/${id}/ai/slides/proposals`, { slideId, prompt }, options),
  proposeNewSlide: (id: string, sourceNodeId: string, scopeNodeIds: string[], prompt: string, format: AiSuggestion['format'], options: GenerationOptions) => request<{ proposal: AiSlideProposal }>(`/api/projects/${id}/ai/slides/proposals`, { sourceNodeId, scopeNodeIds, prompt, format }, options),
  applySlide: (id: string, proposal: AiSlideProposal) => request<{ project: ProjectDocument }>(`/api/projects/${id}/ai/slides/apply`, { expectedRevision: proposal.baseRevision, slideId: proposal.slideId, sourceNodeId: proposal.sourceNodeId, draft: proposal.draft }),
  undoSlide: (id: string, expectedRevision: number) => request<{ project: ProjectDocument }>(`/api/projects/${id}/undo-last-ai-slide`, { expectedRevision }),
  proposeDeck: (id: string, count: number | undefined, scopeNodeIds: string[], prompt: string, options: GenerationOptions) =>
    request<{ proposal: AiDeckProposal }>(`/api/projects/${id}/ai/deck/proposals`, { count, scopeNodeIds, prompt }, options),
  applyDeck: (id: string, proposal: AiDeckProposal, scopeNodeIds: string[]) =>
    request<{ project: ProjectDocument }>(`/api/projects/${id}/ai/deck/apply`, { expectedRevision: proposal.baseRevision, slides: proposal.slides, scopeNodeIds }),
  undoDeck: (id: string, expectedRevision: number) =>
    request<{ project: ProjectDocument }>(`/api/projects/${id}/undo-last-ai-deck`, { expectedRevision }),
};
