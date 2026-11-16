import type { ProviderConfiguration, ProviderProfile, ProviderProfileInput } from '@espacio-visual/domain';
import { ensureApiSession } from './projects.js';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureApiSession();
  const response = await fetch(path, { credentials: 'same-origin', ...init, headers: { 'content-type': 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1', ...init?.headers } });
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(result.message ?? `Error ${response.status}`);
  return result;
}

export const providersApi = {
  get: () => request<ProviderConfiguration>('/api/providers'),
  save: (profile: ProviderProfileInput) => request<{ profile: ProviderProfile }>('/api/providers', { method: 'POST', body: JSON.stringify(profile) }),
  select: (id: string | null) => request<ProviderConfiguration>('/api/providers/active', { method: 'PUT', body: JSON.stringify({ id }) }),
  remove: (id: string) => request<{ deleted: boolean }>(`/api/providers/${id}`, { method: 'DELETE', body: '{}' }),
  test: (id: string) => request<{ connected: boolean; models: string[] }>(`/api/providers/${id}/test`, { method: 'POST', body: '{}' }),
};
