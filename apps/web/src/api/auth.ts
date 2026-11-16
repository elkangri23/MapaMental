import { ensureApiSession } from './projects.js';
import type { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/browser';

export class OidcStepExpiredError extends Error {}

async function checkOidcStep(response: Response, headers: Record<string, string>) {
  if (response.status !== 401) return;
  const status = await fetch('/api/session/status', { headers, credentials: 'same-origin' }).catch(() => null);
  if (status?.status === 401) throw new OidcStepExpiredError('La verificación OIDC caducó. Vuelve a iniciar sesión.');
}

export interface OidcConfigurationView {
  issuer: string;
  clientId: string;
  identityLinked: boolean;
  passkeyCount?: number;
  mode?: 'local' | 'protected';
  passkeys?: PasskeyView[];
  totpEnabled?: boolean;
}

export interface PasskeyView { id: string; name: string; createdAt: string; lastUsedAt: string | null; deviceType: 'singleDevice' | 'multiDevice'; backedUp: boolean }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  await ensureApiSession();
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { 'content-type': 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1', ...init?.headers },
  });
  const result = await response.json().catch(() => ({})) as T & { message?: string };
  if (!response.ok) throw new Error(result.message ?? `Error ${response.status}`);
  return result;
}

async function reauthenticateWithPasskey() {
  const { startAuthentication } = await import('@simplewebauthn/browser');
  const options = await request<PublicKeyCredentialRequestOptionsJSON>('/api/session/passkeys/reauthentication/options', { method: 'POST', body: '{}' });
  const response = await startAuthentication({ optionsJSON: options });
  await request<{ verified: boolean }>('/api/session/passkeys/reauthentication/verify', { method: 'POST', body: JSON.stringify(response) });
}

export const authApi = {
  getOidcConfiguration: () => request<OidcConfigurationView>('/api/session/oidc-config'),
  saveOidcConfiguration: (config: Pick<OidcConfigurationView, 'issuer' | 'clientId'>) =>
    request<OidcConfigurationView>('/api/session/oidc-config', { method: 'PUT', body: JSON.stringify(config) }),
  beginOidcLink: async () => {
    await ensureApiSession();
    const response = await fetch('/api/session/oidc/start', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'content-type': 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1' },
      body: JSON.stringify({ purpose: 'link' }),
    });
    const result = await response.json().catch(() => ({})) as { authorizationUrl?: string; message?: string };
    if (!response.ok || !result.authorizationUrl) throw new Error(result.message ?? `Error ${response.status}`);
    return result.authorizationUrl;
  },
  registerPasskey: async (name: string) => {
    const { startRegistration } = await import('@simplewebauthn/browser');
    const options = await request<PublicKeyCredentialCreationOptionsJSON>('/api/session/passkeys/registration/options', {
      method: 'POST', body: JSON.stringify({ name }),
    });
    const response = await startRegistration({ optionsJSON: options });
    return request<{ passkeyCount: number }>('/api/session/passkeys/registration/verify', { method: 'POST', body: JSON.stringify(response) });
  },
  addPasskey: async (name: string) => {
    await reauthenticateWithPasskey();
    const result = await authApi.registerPasskey(name);
    return authApi.getOidcConfiguration().then((config) => ({ ...config, passkeyCount: result.passkeyCount }));
  },
  renamePasskey: async (id: string, name: string) => {
    await reauthenticateWithPasskey();
    return request<{ passkeys: PasskeyView[] }>('/api/session/passkeys/name', { method: 'PUT', body: JSON.stringify({ id, name }) });
  },
  revokePasskey: async (id: string) => {
    await reauthenticateWithPasskey();
    const result = await request<{ passkeys: PasskeyView[] }>('/api/session/passkeys/revoke', { method: 'POST', body: JSON.stringify({ id }) });
    window.location.replace(window.location.pathname);
    return result;
  },
  beginTotpEnrollment: async () => {
    await reauthenticateWithPasskey();
    return request<{ secret: string; otpauthUrl: string }>('/api/session/totp/enrollment/options', { method: 'POST', body: '{}' });
  },
  confirmTotpEnrollment: async (code: string) => {
    await request<{ enabled: boolean }>('/api/session/totp/enrollment/confirm', { method: 'POST', body: JSON.stringify({ code }) });
    return authApi.getOidcConfiguration();
  },
  disableTotp: async () => {
    await reauthenticateWithPasskey();
    await request<{ enabled: boolean }>('/api/session/totp/disable', { method: 'POST', body: '{}' });
    return authApi.getOidcConfiguration();
  },
  recoverWithTotp: async (code: string, name: string) => {
    const headers = { 'content-type': 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1' };
    const status = await fetch('/api/session/recovery/status', { credentials: 'same-origin', headers });
    const current = await status.json().catch(() => ({})) as { message?: string; active?: boolean };
    if (!status.ok) throw new Error(current.message ?? 'No se pudo comprobar la recuperación.');
    if (!current.active) {
      const verify = await fetch('/api/session/recovery/totp/verify', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify({ code }) });
      const verified = await verify.json().catch(() => ({})) as { message?: string; recovery?: boolean };
      if (!verify.ok || !verified.recovery) throw new Error(verified.message ?? 'No se pudo iniciar la recuperación.');
    }
    const optionsResponse = await fetch('/api/session/passkeys/registration/options', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify({ name }) });
    const options = await optionsResponse.json().catch(() => ({})) as PublicKeyCredentialCreationOptionsJSON & { message?: string };
    if (!optionsResponse.ok) throw new Error(options.message ?? 'No se pudo iniciar el alta de la nueva passkey.');
    const { startRegistration } = await import('@simplewebauthn/browser');
    const credential = await startRegistration({ optionsJSON: options });
    const result = await fetch('/api/session/passkeys/registration/verify', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(credential) });
    const output = await result.json().catch(() => ({})) as { message?: string; passkeyCount?: number };
    if (!result.ok) throw new Error(output.message ?? 'No se pudo registrar la passkey de recuperación.');
    return output;
  },
  hasRecoverySession: async () => {
    const response = await fetch('/api/session/recovery/status', {
      credentials: 'same-origin', headers: { 'x-espacio-visual-client': 'espacio-visual-ui-v1' },
    });
    const result = await response.json().catch(() => ({})) as { message?: string; active?: boolean };
    if (!response.ok) throw new Error(result.message ?? 'No se pudo comprobar la recuperación.');
    return !!result.active;
  },
  completePasskeyLogin: async () => {
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const headers = { 'content-type': 'application/json', 'x-espacio-visual-client': 'espacio-visual-ui-v1' };
    const optionsResponse = await fetch('/api/session/passkeys/authentication/options', { method: 'POST', credentials: 'same-origin', headers, body: '{}' });
    const optionsResult = await optionsResponse.json().catch(() => ({})) as { message?: string };
    await checkOidcStep(optionsResponse, headers);
    if (!optionsResponse.ok) throw new Error(optionsResult.message ?? 'No se pudieron cargar las opciones de passkey.');
    const credential = await startAuthentication({ optionsJSON: optionsResult as PublicKeyCredentialRequestOptionsJSON });
    const verify = await fetch('/api/session/passkeys/authentication/verify', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify(credential) });
    const result = await verify.json().catch(() => ({})) as { message?: string; authenticated?: boolean };
    await checkOidcStep(verify, headers);
    if (!verify.ok || !result.authenticated) throw new Error(result.message ?? 'No se pudo completar la verificación con passkey.');
  },
};
