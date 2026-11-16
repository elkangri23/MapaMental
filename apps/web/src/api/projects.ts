import type { FutureProjectPreview, ProjectDocument, ProjectSummary } from '@espacio-visual/domain';

let sessionPromise: Promise<void> | null = null;
const initialOidcResult = new URLSearchParams(window.location.search).get('auth');

let oidcRetryMessage: string | null = null;

function requireOidcRetry(message: string): never {
  oidcRetryMessage = message;
  window.dispatchEvent(new CustomEvent('espacio-visual:oidc-retry-required', { detail: message }));
  throw new Error(message);
}

async function ensureSession() {
  if (sessionPromise) return sessionPromise;
  sessionPromise = (async () => {
    const headers = { 'content-type': 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1' };
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const oidcStep = fragment.get('oidc-step');
    if (oidcStep) {
      fragment.delete('oidc-step');
      const nextHash = fragment.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ''}`);
      const exchange = await fetch('/api/session/oidc/step/exchange', {
        method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify({ step: oidcStep }),
      }).catch(() => requireOidcRetry('No se pudo conectar con el servicio local para completar el acceso.'));
      const result = await exchange.json().catch(() => ({})) as { message?: string };
      if (!exchange.ok) requireOidcRetry(result.message ?? 'No se pudo completar el paso temporal de autenticación.');
    }
    const status = await fetch('/api/session/status', { headers, credentials: 'same-origin' });
    if (status.status === 200) return;
    if (status.status === 401) {
      if (oidcRetryMessage) requireOidcRetry(oidcRetryMessage);
      if (initialOidcResult === 'cancelled' || initialOidcResult === 'failed') {
        requireOidcRetry(initialOidcResult === 'cancelled'
          ? 'Se canceló el acceso con el proveedor de identidad.'
          : 'No se pudo validar la respuesta OIDC.');
      }
      if (initialOidcResult === 'second-factor') {
        requireOidcRetry('El paso temporal de autenticación ya no está disponible.');
      }
      const start = await fetch('/api/session/oidc/start', {
        method: 'POST', headers, credentials: 'same-origin', body: JSON.stringify({ purpose: 'login' }),
      }).catch(() => requireOidcRetry('No se pudo conectar con el servicio local para iniciar sesión.'));
      const result = await start.json().catch(() => ({})) as { authorizationUrl?: string; message?: string };
      if (!start.ok || !result.authorizationUrl) requireOidcRetry(result.message ?? 'No se pudo iniciar el acceso OIDC.');
      window.location.assign(result.authorizationUrl);
      return new Promise<void>(() => undefined);
    }
    if (status.status === 428 || status.status === 403) {
      const result = await status.json().catch(() => ({})) as { message?: string; recovery?: boolean };
      if (status.status === 428) {
        oidcRetryMessage = null;
        window.dispatchEvent(new CustomEvent('espacio-visual:passkey-required', { detail: { recovery: result.recovery === true } }));
      }
      throw new Error(result.message ?? 'La autenticación protegida necesita atención.');
    }
    if (status.status !== 204) throw new Error('No se pudo comprobar la sesión local. Cierra y vuelve a abrir la aplicación.');

    const launchFragment = new URLSearchParams(window.location.hash.slice(1));
    let nonce = launchFragment.get('session');
    if (nonce) {
      launchFragment.delete('session');
      const nextHash = launchFragment.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ''}`);
    } else {
      const bootstrap = await fetch('/api/session/bootstrap', { headers, credentials: 'same-origin' });
      if (!bootstrap.ok) throw new Error('No se pudo iniciar la sesión local. Cierra y vuelve a abrir la aplicación.');
      nonce = (await bootstrap.json() as { nonce: string }).nonce;
    }
    const exchange = await fetch('/api/session/exchange', {
      method: 'POST', credentials: 'same-origin', headers,
      body: JSON.stringify({ nonce }),
    });
    if (!exchange.ok) throw new Error('La sesión local caducó o ya se utilizó. Reinicia la aplicación para crear otra sesión.');
  })().catch((error) => { sessionPromise = null; throw error; });
  return sessionPromise;
}

export async function ensureApiSession() { await ensureSession(); }

export class ProjectRequestError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureSession();
  const response = await fetch(path, { credentials: 'same-origin', ...init, headers: { 'content-type': 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1', ...init?.headers } });
  const result = await response.json().catch(() => ({})) as T & { message?: string; error?: string };
  if (!response.ok) throw new ProjectRequestError(result.message ?? result.error ?? `Error ${response.status}`, response.status);
  return result;
}

export const projectsApi = {
  list: () => request<{ projects: ProjectSummary[] }>('/api/projects'),
  get: (id: string) => request<{ project: ProjectDocument; readOnlyProject?: never } | { readOnlyProject: FutureProjectPreview; project?: never }>(`/api/projects/${id}`),
  create: (name: string, project?: ProjectDocument) => request<{ project: ProjectDocument }>('/api/projects', { method: 'POST', body: JSON.stringify({ name, project }) }),
  save: (project: ProjectDocument, expectedRevision: number) => request<{ project: ProjectDocument }>(`/api/projects/${project.id}`, { method: 'PUT', body: JSON.stringify({ expectedRevision, project }) }),
  backups: (id: string) => request<{ backups: Array<{ file: string; revision: number; updatedAt: string }> }>(`/api/projects/${id}/backups`),
  restore: (id: string, file: string, expectedRevision: number) => request<{ project: ProjectDocument }>(`/api/projects/${id}/restore`, { method: 'POST', body: JSON.stringify({ file, expectedRevision }) }),
};

export interface PersonalProfile {
  name: string;
  email: string;
}

export const profileApi = {
  get: () => request<{ profile: PersonalProfile }>('/api/profile'),
  save: (profile: PersonalProfile) => request<{ profile: PersonalProfile }>('/api/profile', {
    method: 'PUT', body: JSON.stringify(profile),
  }),
};
