import { randomBytes } from 'node:crypto';

const lifetimeMs = 12 * 60 * 60 * 1000;
const cookieNames = { local: 'ev_local_session', protected: 'ev_protected_session' } as const;
const clientHeaderValue = 'espacio-visual-ui-v1';
export type SessionMode = keyof typeof cookieNames;
interface SessionRecord { expiresAt: number; mode: SessionMode; identityId?: string; lastUvAt?: number }
const sessions = new Map<string, SessionRecord>();
const oidcSteps = new Map<string, { expiresAt: number; identityId: string }>();
const recoverySessions = new Map<string, { expiresAt: number; identityId: string }>();
const inheritedNonce = process.env.ESPACIO_VISUAL_SESSION_NONCE;
delete process.env.ESPACIO_VISUAL_SESSION_NONCE;
let launchNonce: string | null = inheritedNonce ?? randomBytes(32).toString('base64url');

export function requiredSessionMode(): SessionMode {
  const mode = process.env.MYMAP_AUTH_MODE ?? 'local';
  if (mode !== 'local' && mode !== 'protected') throw new Error('MYMAP_AUTH_MODE debe ser local o protected.');
  return mode;
}

export function expectedUiOrigin() {
  return process.env.ESPACIO_VISUAL_UI_ORIGIN ?? 'http://localhost:5173';
}

export function isExpectedOrigin(origin: string | undefined, fetchSite?: string, clientHeader?: string | string[]) {
  if (origin) return origin === expectedUiOrigin();
  const hasUiMarker = clientHeader === clientHeaderValue || (Array.isArray(clientHeader) && clientHeader.length === 1 && clientHeader[0] === clientHeaderValue);
  return fetchSite === 'same-origin' && hasUiMarker;
}

export function isExpectedHost(host: string | undefined) {
  if (!host) return false;
  const uiUrl = new URL(expectedUiOrigin());
  const servicePort = String(process.env.MYMAP_LOCAL_PORT ?? 3180);
  return host.toLowerCase() === uiUrl.host.toLowerCase()
    || host.toLowerCase() === `127.0.0.1:${servicePort}`
    || host.toLowerCase() === `[::1]:${servicePort}`;
}

export function consumeLaunchNonce(nonce: string) {
  if (!launchNonce || nonce.length < 32 || nonce !== launchNonce) return null;
  launchNonce = null;
  return createSession('local');
}

/** Call only after both the configured OIDC identity and WebAuthn step have been verified. */
export function createProtectedSession(identityId: string) {
  if (!identityId || identityId.length > 2600) throw new Error('La identidad protegida no es válida.');
  return createSession('protected', identityId);
}

export function isSessionIdValid(sessionId: string | undefined, mode: SessionMode) {
  if (!sessionId || !/^[A-Za-z0-9_-]{40,64}$/.test(sessionId)) return false;
  const session = sessions.get(sessionId);
  if (!session) return false;
  if (session.expiresAt <= Date.now()) { sessions.delete(sessionId); return false; }
  return session.mode === mode;
}

export function createOidcSecondFactorStep(identityId: string) {
  const now = Date.now();
  for (const [token, step] of oidcSteps) if (step.expiresAt <= now) oidcSteps.delete(token);
  if (oidcSteps.size >= 8) throw Object.assign(new Error('Hay demasiadas verificaciones de identidad pendientes.'), { statusCode: 429 });
  const token = randomBytes(32).toString('base64url');
  oidcSteps.set(token, { identityId, expiresAt: now + 5 * 60 * 1000 });
  return token;
}

export function getOidcSecondFactorIdentity(requestCookie: string | undefined) {
  const step = getOidcSecondFactorStep(requestCookie);
  return step?.identityId ?? null;
}

export function getOidcSecondFactorToken(requestCookie: string | undefined) {
  return getOidcSecondFactorStep(requestCookie)?.token ?? null;
}

function getOidcSecondFactorStep(requestCookie: string | undefined) {
  const cookieName = 'ev_oidc_step';
  const token = requestCookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!token || !/^[A-Za-z0-9_-]{40,64}$/.test(token)) return null;
  const step = oidcSteps.get(token);
  if (!step) return null;
  if (step.expiresAt <= Date.now()) { oidcSteps.delete(token); return null; }
  return { token, ...step };
}

export function consumeOidcSecondFactor(token: string, identityId: string) {
  const step = oidcSteps.get(token);
  if (!step || step.expiresAt <= Date.now() || step.identityId !== identityId) return false;
  oidcSteps.delete(token);
  return true;
}

/** A recovery token can authorize only passkey registration and expires after five minutes. */
export function createRecoverySession(identityId: string) {
  const now = Date.now();
  for (const [token, session] of recoverySessions) if (session.expiresAt <= now) recoverySessions.delete(token);
  if (!identityId || recoverySessions.size >= 4) throw Object.assign(new Error('No se puede iniciar otra recuperación ahora.'), { statusCode: 429 });
  const token = randomBytes(32).toString('base64url');
  recoverySessions.set(token, { identityId, expiresAt: now + 5 * 60 * 1000 });
  return token;
}

function recoveryToken(cookie: string | undefined) {
  const token = cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('ev_recovery_step='))?.slice('ev_recovery_step='.length);
  if (!token || !/^[A-Za-z0-9_-]{40,64}$/.test(token)) return null;
  const session = recoverySessions.get(token);
  if (!session || session.expiresAt <= Date.now()) { recoverySessions.delete(token); return null; }
  return { token, ...session };
}

export function getRecoverySessionId(cookie: string | undefined) { return recoveryToken(cookie)?.token ?? null; }
export function getRecoveryIdentity(cookie: string | undefined) { return recoveryToken(cookie)?.identityId ?? null; }
export function consumeRecoverySession(token: string) { return recoverySessions.delete(token); }
export function setRecoveryCookie(token: string) {
  const session = recoverySessions.get(token);
  if (!session || session.expiresAt <= Date.now()) throw new Error('La sesión de recuperación caducó.');
  return `ev_recovery_step=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${Math.floor((session.expiresAt - Date.now()) / 1000)}`;
}
export function clearRecoveryCookie() { return 'ev_recovery_step=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0'; }

export function exchangeOidcSecondFactorStep(token: string) {
  const step = oidcSteps.get(token);
  if (!step || step.expiresAt <= Date.now()) { oidcSteps.delete(token); return null; }
  oidcSteps.delete(token);
  const nextToken = randomBytes(32).toString('base64url');
  oidcSteps.set(nextToken, step);
  return nextToken;
}

export function clearOidcSecondFactorCookie() {
  return 'ev_oidc_step=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0';
}

export function setOidcSecondFactorCookie(token: string) {
  const step = oidcSteps.get(token);
  if (!step || step.expiresAt <= Date.now()) throw new Error('No se puede emitir la cookie temporal de autenticación.');
  return `ev_oidc_step=${token}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${Math.floor((step.expiresAt - Date.now()) / 1000)}`;
}

function createSession(mode: SessionMode, identityId?: string) {
  const now = Date.now();
  for (const [id, session] of sessions) if (session.expiresAt <= now) sessions.delete(id);
  if (sessions.size >= 128) throw Object.assign(new Error('Se alcanzó el límite de sesiones activas.'), { statusCode: 429 });
  const sessionId = randomBytes(32).toString('base64url');
  sessions.set(sessionId, { expiresAt: now + lifetimeMs, mode, identityId, ...(mode === 'protected' ? { lastUvAt: now } : {}) });
  return sessionId;
}

function sessionFromCookie(requestCookie: string | undefined, mode: SessionMode) {
  if (!requestCookie) return null;
  const cookieName = cookieNames[mode];
  const sessionId = requestCookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!sessionId || !/^[A-Za-z0-9_-]{40,64}$/.test(sessionId)) return null;
  const record = sessions.get(sessionId);
  if (!record) return null;
  if (record.expiresAt <= Date.now()) { sessions.delete(sessionId); return null; }
  return record.mode === mode ? { sessionId, record } : null;
}

export function isValidSession(requestCookie: string | undefined, mode: SessionMode = 'local') {
  return sessionFromCookie(requestCookie, mode) !== null;
}

export function getValidSessionId(requestCookie: string | undefined, mode: SessionMode = 'local') {
  return sessionFromCookie(requestCookie, mode)?.sessionId ?? null;
}

const userVerificationFreshnessMs = 5 * 60 * 1000;

export function hasRecentUserVerification(requestCookie: string | undefined, mode: SessionMode = 'protected') {
  const record = sessionFromCookie(requestCookie, mode)?.record;
  return !!record?.lastUvAt && record.lastUvAt + userVerificationFreshnessMs > Date.now();
}

export function markSessionUserVerified(sessionId: string, mode: SessionMode = 'protected') {
  const record = sessions.get(sessionId);
  if (!record || record.mode !== mode || record.expiresAt <= Date.now()) return false;
  record.lastUvAt = Date.now();
  return true;
}

export function revokeSession(requestCookie: string | undefined, mode: SessionMode = 'local') {
  const session = sessionFromCookie(requestCookie, mode);
  if (!session) return false;
  return sessions.delete(session.sessionId);
}

export function revokeAllProtectedSessions() {
  for (const [id, session] of sessions) if (session.mode === 'protected') sessions.delete(id);
  oidcSteps.clear();
  recoverySessions.clear();
}

export function getSessionIdentity(requestCookie: string | undefined, mode: SessionMode = 'local') {
  return sessionFromCookie(requestCookie, mode)?.record.identityId ?? null;
}

export function setSessionCookie(sessionId: string) {
  const record = sessions.get(sessionId);
  if (!record || record.expiresAt <= Date.now()) throw new Error('No se puede emitir una cookie para una sesión inexistente.');
  const cookieName = cookieNames[record.mode];
  return `${cookieName}=${sessionId}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${Math.floor((record.expiresAt - Date.now()) / 1000)}`;
}

export function clearSessionCookie(mode: SessionMode = 'local') {
  return `${cookieNames[mode]}=; Path=/api; HttpOnly; SameSite=Strict; Max-Age=0`;
}

export function isDevelopmentBootstrapEnabled() {
  return process.env.NODE_ENV !== 'production' && process.env.ESPACIO_VISUAL_DISABLE_DEV_BOOTSTRAP !== '1';
}

export function getDevelopmentNonce() {
  return launchNonce;
}
