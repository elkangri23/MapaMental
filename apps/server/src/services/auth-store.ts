import { getRecoveryIdentity, getSessionIdentity, hasRecentUserVerification, isValidSession, revokeAllProtectedSessions, type SessionMode } from './session.js';
import { randomUUID } from 'node:crypto';
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const authFile = join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'EspacioVisual', 'auth.json');
const issuerLimit = 2048;
const clientIdLimit = 256;
const subjectLimit = 512;

export interface AuthConfiguration {
  schemaVersion: 1;
  issuer: string;
  clientId: string;
  owner: { issuer: string; subject: string } | null;
  passkeys: StoredPasskey[];
}

export interface StoredPasskey {
  id: string;
  publicKey: string;
  counter: number;
  transports: string[];
  deviceType: 'singleDevice' | 'multiDevice';
  backedUp: boolean;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

let mutationQueue: Promise<void> = Promise.resolve();

function serializeMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(operation, operation);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function validateIssuer(value: unknown): value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > issuerLimit || value !== value.trim()) return false;
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
    const loopback = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    return !url.username && !url.password && !url.search && !url.hash
      && (url.protocol === 'https:' || (url.protocol === 'http:' && loopback));
  } catch { return false; }
}

function isAuthConfiguration(value: unknown): value is AuthConfiguration {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const config = value as Record<string, unknown>;
  if (config.schemaVersion !== 1 || !validateIssuer(config.issuer)
    || typeof config.clientId !== 'string' || !config.clientId.trim() || config.clientId !== config.clientId.trim() || config.clientId.length > clientIdLimit) return false;
  if (config.passkeys !== undefined && !Array.isArray(config.passkeys)) return false;
  if (config.owner === null) return !config.passkeys?.length;
  if (!config.owner || typeof config.owner !== 'object' || Array.isArray(config.owner)) return false;
  const owner = config.owner as Record<string, unknown>;
  const validOwner = owner.issuer === config.issuer && typeof owner.subject === 'string'
    && !!owner.subject.trim() && owner.subject.length <= subjectLimit;
  if (!validOwner) return false;
  if (config.passkeys === undefined) return true;
  if ((config.passkeys?.length ?? 0) > 10) return false;
  const ids = new Set<string>();
  return (config.passkeys ?? []).every((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const key = entry as Record<string, unknown>;
    if (typeof key.id !== 'string' || !/^[A-Za-z0-9_-]{20,2048}$/.test(key.id) || ids.has(key.id)
      || typeof key.publicKey !== 'string' || !/^[A-Za-z0-9_-]{20,4096}$/.test(key.publicKey)
      || !Number.isSafeInteger(key.counter) || (key.counter as number) < 0
      || !Array.isArray(key.transports) || key.transports.length > 8 || !key.transports.every((item) => typeof item === 'string' && item.length <= 32)
      || (key.deviceType !== 'singleDevice' && key.deviceType !== 'multiDevice') || typeof key.backedUp !== 'boolean'
      || typeof key.name !== 'string' || !key.name.trim() || key.name.length > 64
      || typeof key.createdAt !== 'string' || !Number.isFinite(Date.parse(key.createdAt))
      || !(key.lastUsedAt === null || (typeof key.lastUsedAt === 'string' && Number.isFinite(Date.parse(key.lastUsedAt))))) return false;
    ids.add(key.id);
    return true;
  });
}

export async function getAuthConfiguration(): Promise<AuthConfiguration | null> {
  let text: string;
  try { text = await readFile(authFile, 'utf8'); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
  if (Buffer.byteLength(text, 'utf8') > 64 * 1024) throw new Error('El perfil de autenticación local supera el tamaño permitido.');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('El perfil de autenticación local está dañado.'); }
  if (!isAuthConfiguration(value)) throw new Error('El perfil de autenticación local no supera la validación.');
  return { ...value, passkeys: value.passkeys ?? [] };
}

export async function saveAuthConfiguration(input: unknown) {
  return serializeMutation(async () => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw Object.assign(new Error('La configuración OIDC no es válida.'), { statusCode: 400 });
    }
    const value = input as Record<string, unknown>;
    if (!validateIssuer(value.issuer) || typeof value.clientId !== 'string'
      || !value.clientId.trim() || value.clientId.length > clientIdLimit) {
      throw Object.assign(new Error('La configuración OIDC no es válida.'), { statusCode: 400 });
    }
    const current = await getAuthConfiguration();
    if (current?.owner && (current.issuer !== value.issuer || current.clientId !== value.clientId.trim())) {
      throw Object.assign(new Error('No se puede cambiar el issuer o client ID mientras hay una identidad vinculada.'), { statusCode: 409 });
    }
    const next: AuthConfiguration = {
      schemaVersion: 1,
      issuer: value.issuer,
      clientId: value.clientId.trim(),
      owner: current?.owner ?? null,
      passkeys: current?.passkeys ?? [],
    };
    await writeConfiguration(next);
    return next;
  });
}

export type PasskeyRegistrationAccess = { mode: SessionMode | 'recovery'; cookie: string | undefined };

export async function addStoredPasskey(passkey: StoredPasskey, expectedIdentity: string, access: PasskeyRegistrationAccess) {
  return serializeMutation(async () => {
    const current = await getAuthConfiguration();
    if (!current?.owner) throw Object.assign(new Error('Vincula primero una identidad OIDC.'), { statusCode: 409 });
    if (expectedIdentity !== current.owner.issuer + '\u0000' + current.owner.subject) {
      throw Object.assign(new Error('La identidad ya no es válida.'), { statusCode: 401 });
    }
    const { mode, cookie } = access;
    const recovering = mode === 'recovery';
    if (mode === 'recovery') {
      if (getRecoveryIdentity(cookie) !== expectedIdentity) {
        throw Object.assign(new Error('La recuperación ya no es válida.'), { statusCode: 401 });
      }
    } else {
      if (!isValidSession(cookie, mode) || (mode === 'protected' && getSessionIdentity(cookie, mode) !== expectedIdentity)) {
        throw Object.assign(new Error('La sesión caducó o fue revocada.'), { statusCode: 401 });
      }
      if (mode === 'protected' && !hasRecentUserVerification(cookie)) {
        throw Object.assign(new Error('Vuelve a verificar una passkey antes de añadir otra credencial.'), { statusCode: 428 });
      }
      if (mode === 'local' && current.passkeys.length > 0) {
        throw Object.assign(new Error('Entra en modo protegido para añadir otra passkey.'), { statusCode: 409 });
      }
    }
    if (current.passkeys.some((item) => item.id === passkey.id)) throw Object.assign(new Error('Esta passkey ya está registrada.'), { statusCode: 409 });
    if (!recovering && current.passkeys.some((item) => item.name.toLocaleLowerCase() === passkey.name.toLocaleLowerCase())) throw Object.assign(new Error('Ya existe una passkey con ese nombre.'), { statusCode: 409 });
    if (!recovering && current.passkeys.length >= 10) throw Object.assign(new Error('Se alcanzó el máximo de diez passkeys.'), { statusCode: 409 });
    const next = { ...current, passkeys: recovering ? [passkey] : [...current.passkeys, passkey] };
    await writeConfiguration(next);
    if (recovering) revokeAllProtectedSessions();
    return next.passkeys;
  });
}

export async function updateStoredPasskey(id: string, counter: number, lastUsedAt: string) {
  return serializeMutation(async () => {
    const current = await getAuthConfiguration();
    if (!current) throw Object.assign(new Error('No existe una configuración OIDC.'), { statusCode: 409 });
    const index = current.passkeys.findIndex((item) => item.id === id);
    if (index < 0) throw Object.assign(new Error('La passkey ya no está registrada.'), { statusCode: 404 });
    const nextPasskeys = current.passkeys.slice();
    nextPasskeys[index] = { ...nextPasskeys[index], counter, lastUsedAt };
    await writeConfiguration({ ...current, passkeys: nextPasskeys });
    return current.owner;
  });
}

export async function renameStoredPasskey(id: string, name: string, access: { cookie: string | undefined; identityId: string | null }) {
  return serializeMutation(async () => {
    if (!access.identityId || !isValidSession(access.cookie, 'protected')
      || getSessionIdentity(access.cookie, 'protected') !== access.identityId || !hasRecentUserVerification(access.cookie)) {
      throw Object.assign(new Error('La sesión protegida o la reautenticación ya no es válida.'), { statusCode: 428 });
    }
    const current = await getAuthConfiguration();
    if (!current || !name.trim() || name.length > 64) throw Object.assign(new Error('El nombre de passkey no es válido.'), { statusCode: 400 });
    const index = current.passkeys.findIndex((item) => item.id === id);
    if (index < 0) throw Object.assign(new Error('La passkey ya no está registrada.'), { statusCode: 404 });
    if (current.passkeys.some((item, itemIndex) => itemIndex !== index && item.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase())) {
      throw Object.assign(new Error('Ya existe una passkey con ese nombre.'), { statusCode: 409 });
    }
    const nextPasskeys = current.passkeys.slice();
    nextPasskeys[index] = { ...nextPasskeys[index], name: name.trim() };
    await writeConfiguration({ ...current, passkeys: nextPasskeys });
    return nextPasskeys;
  });
}

export async function removeStoredPasskey(id: string, access: { cookie: string | undefined; identityId: string | null }) {
  return serializeMutation(async () => {
    if (!access.identityId || !isValidSession(access.cookie, 'protected')
      || getSessionIdentity(access.cookie, 'protected') !== access.identityId || !hasRecentUserVerification(access.cookie)) {
      throw Object.assign(new Error('La sesión protegida o la reautenticación ya no es válida.'), { statusCode: 428 });
    }
    const current = await getAuthConfiguration();
    if (!current) throw Object.assign(new Error('No existe una configuración OIDC.'), { statusCode: 409 });
    if (current.passkeys.length <= 1) throw Object.assign(new Error('No puedes revocar la última passkey hasta configurar y probar un método de recuperación.'), { statusCode: 409 });
    const nextPasskeys = current.passkeys.filter((item) => item.id !== id);
    if (nextPasskeys.length === current.passkeys.length) throw Object.assign(new Error('La passkey ya no está registrada.'), { statusCode: 404 });
    await writeConfiguration({ ...current, passkeys: nextPasskeys });
    return nextPasskeys;
  });
}

/** Binds the first OIDC subject once; subsequent identities fail closed. */
export async function bindAuthIdentity(issuer: string, subject: string) {
  return serializeMutation(async () => {
    if (!validateIssuer(issuer) || typeof subject !== 'string' || !subject.trim() || subject.length > subjectLimit) {
      throw Object.assign(new Error('La identidad OIDC no es válida.'), { statusCode: 400 });
    }
    const current = await getAuthConfiguration();
    if (!current || current.issuer !== issuer) throw Object.assign(new Error('El issuer OIDC no coincide con la configuración local.'), { statusCode: 403 });
    if (current.owner) {
      if (current.owner.issuer !== issuer || current.owner.subject !== subject) {
        throw Object.assign(new Error('Ya hay otra identidad vinculada a esta instalación.'), { statusCode: 403 });
      }
      return current.owner;
    }
    const owner = { issuer, subject };
    await writeConfiguration({ ...current, owner });
    return owner;
  });
}

async function writeConfiguration(value: AuthConfiguration) {
  await mkdir(dirname(authFile), { recursive: true });
  const temporary = `${authFile}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, JSON.stringify(value, null, 2), { encoding: 'utf8', flag: 'wx' });
    const file = await open(temporary, 'r+');
    try { await file.sync(); } finally { await file.close(); }
    await rename(temporary, authFile);
  } catch (error) {
    await rm(temporary, { force: true }).catch(() => undefined);
    throw error;
  }
}
