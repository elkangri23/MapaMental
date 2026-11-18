import { createHash } from 'node:crypto';
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type RegistrationResponseJSON,
} from '@simplewebauthn/server';
import { addStoredPasskey, getAuthConfiguration, removeStoredPasskey, renameStoredPasskey, updateStoredPasskey, type PasskeyRegistrationAccess, type StoredPasskey } from './auth-store.js';
import { expectedUiOrigin, markSessionUserVerified } from './session.js';

const rpID = 'localhost';
const lifetimeMs = 5 * 60 * 1000;
const maxChallenges = 32;
const supportedAlgorithmIDs = [-7, -257];
type Ceremony = { kind: 'registration' | 'authentication' | 'reauthentication'; challenge: string; identityId: string; expiresAt: number; name?: string; sessionId?: string; stepToken?: string };
const ceremonies = new Map<string, Ceremony>();

function identityId(owner: { issuer: string; subject: string }) { return `${owner.issuer}\u0000${owner.subject}`; }
function userId(owner: { issuer: string; subject: string }) { return createHash('sha256').update(identityId(owner)).digest(); }

function makeRoom() {
  const now = Date.now();
  for (const [id, item] of ceremonies) if (item.expiresAt <= now) ceremonies.delete(id);
  if (ceremonies.size >= maxChallenges) throw Object.assign(new Error('Hay demasiadas verificaciones WebAuthn pendientes.'), { statusCode: 429 });
}

function saveCeremony(key: string, item: Ceremony) {
  makeRoom();
  ceremonies.set(key, item);
}

export async function beginPasskeyRegistration(sessionId: string, name: string, allowAdditional = false) {
  const config = await getAuthConfiguration();
  if (!config?.owner) throw Object.assign(new Error('Vincula primero una identidad OIDC.'), { statusCode: 409 });
  if (config.passkeys.length > 0 && !allowAdditional) throw Object.assign(new Error('Para añadir otra passkey, entra en modo protegido y vuelve a verificar una passkey existente.'), { statusCode: 409 });
  if (!name.trim() || name.length > 64) throw Object.assign(new Error('El nombre de la passkey debe tener entre 1 y 64 caracteres.'), { statusCode: 400 });
  const options = await generateRegistrationOptions({
    rpName: 'Espacio Visual', rpID, userID: userId(config.owner), userName: config.owner.subject,
    userDisplayName: 'Usuario local', timeout: lifetimeMs, attestationType: 'none', supportedAlgorithmIDs,
    authenticatorSelection: { residentKey: 'preferred', userVerification: 'required' },
    excludeCredentials: config.passkeys.map(({ id, transports }) => ({ id, transports })),
  });
  saveCeremony(`register:${sessionId}`, { kind: 'registration', challenge: options.challenge, identityId: identityId(config.owner), expiresAt: Date.now() + lifetimeMs, name: name.trim(), sessionId });
  return options;
}

export async function finishPasskeyRegistration(sessionId: string, response: RegistrationResponseJSON, access: PasskeyRegistrationAccess) {
  const key = `register:${sessionId}`;
  const ceremony = ceremonies.get(key);
  ceremonies.delete(key);
  const config = await getAuthConfiguration();
  if (!ceremony || ceremony.expiresAt <= Date.now() || ceremony.kind !== 'registration' || !config?.owner
    || ceremony.identityId !== identityId(config.owner) || !ceremony.name) {
    throw Object.assign(new Error('El registro WebAuthn caducó o ya se utilizó.'), { statusCode: 400 });
  }
  const verification = await verifyRegistrationResponse({
    response, expectedChallenge: ceremony.challenge, expectedOrigin: expectedUiOrigin(), expectedRPID: rpID,
    requireUserVerification: true, supportedAlgorithmIDs,
  });
  if (!verification.verified || !verification.registrationInfo.userVerified) throw Object.assign(new Error('El autenticador no completó una verificación de usuario válida.'), { statusCode: 401 });
  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
  const passkey: StoredPasskey = {
    id: credential.id,
    publicKey: Buffer.from(credential.publicKey).toString('base64url'),
    counter: credential.counter,
    transports: credential.transports ?? [],
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    name: ceremony.name,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
  const passkeys = await addStoredPasskey(passkey, ceremony.identityId, access);
  return { passkeyCount: passkeys.length, credentialId: passkey.id };
}

export async function beginPasskeyReauthentication(sessionId: string) {
  const config = await getAuthConfiguration();
  if (!config?.owner || config.passkeys.length === 0) throw Object.assign(new Error('No hay passkeys registradas.'), { statusCode: 409 });
  const options = await generateAuthenticationOptions({
    rpID, timeout: lifetimeMs, userVerification: 'required',
    allowCredentials: config.passkeys.map(({ id, transports }) => ({ id, transports })),
  });
  saveCeremony(`reauthenticate:${sessionId}`, { kind: 'reauthentication', challenge: options.challenge, identityId: identityId(config.owner), expiresAt: Date.now() + lifetimeMs, sessionId });
  return options;
}

export async function finishPasskeyReauthentication(sessionId: string, response: AuthenticationResponseJSON) {
  const key = `reauthenticate:${sessionId}`;
  const ceremony = ceremonies.get(key);
  ceremonies.delete(key);
  const config = await getAuthConfiguration();
  if (!ceremony || ceremony.expiresAt <= Date.now() || ceremony.kind !== 'reauthentication' || ceremony.sessionId !== sessionId
    || !config?.owner || ceremony.identityId !== identityId(config.owner)) {
    throw Object.assign(new Error('La reautenticación WebAuthn caducó o ya se utilizó.'), { statusCode: 400 });
  }
  const passkey = config.passkeys.find((item) => item.id === response.id);
  if (!passkey) throw Object.assign(new Error('La credencial no está registrada en esta instalación.'), { statusCode: 401 });
  const verification = await verifyAuthenticationResponse({
    response, expectedChallenge: ceremony.challenge, expectedOrigin: expectedUiOrigin(), expectedRPID: rpID,
    requireUserVerification: true,
    credential: { id: passkey.id, publicKey: Buffer.from(passkey.publicKey, 'base64url'), counter: passkey.counter, transports: passkey.transports },
  });
  if (!verification.verified || !verification.authenticationInfo.userVerified) throw Object.assign(new Error('La passkey no completó una reautenticación válida.'), { statusCode: 401 });
  await updateStoredPasskey(passkey.id, verification.authenticationInfo.newCounter, new Date().toISOString());
  if (!markSessionUserVerified(sessionId, 'protected')) throw Object.assign(new Error('La sesión protegida caducó.'), { statusCode: 401 });
  return { verified: true };
}

export async function renamePasskey(id: string, name: string, access: { cookie: string | undefined; identityId: string | null }) {
  return renameStoredPasskey(id, name, access);
}

export async function revokePasskey(id: string, access: { cookie: string | undefined; identityId: string | null }) {
  return removeStoredPasskey(id, access);
}

export async function beginPasskeyAuthentication(stepToken: string) {
  const config = await getAuthConfiguration();
  if (!config?.owner || config.passkeys.length === 0) throw Object.assign(new Error('No hay passkeys registradas. Inicia en modo local, vincula tu identidad y registra la passkey desde Ajustes.'), { statusCode: 409 });
  const options = await generateAuthenticationOptions({
    rpID, timeout: lifetimeMs, userVerification: 'required',
    allowCredentials: config.passkeys.map(({ id, transports }) => ({ id, transports })),
  });
  saveCeremony(`authenticate:${stepToken}`, { kind: 'authentication', challenge: options.challenge, identityId: identityId(config.owner), expiresAt: Date.now() + lifetimeMs, stepToken });
  return options;
}

export async function finishPasskeyAuthentication(stepToken: string, response: AuthenticationResponseJSON) {
  const key = `authenticate:${stepToken}`;
  const ceremony = ceremonies.get(key);
  ceremonies.delete(key);
  const config = await getAuthConfiguration();
  if (!ceremony || ceremony.expiresAt <= Date.now() || ceremony.kind !== 'authentication' || !config?.owner
    || ceremony.identityId !== identityId(config.owner) || ceremony.stepToken !== stepToken) {
    throw Object.assign(new Error('La autenticación WebAuthn caducó o ya se utilizó.'), { statusCode: 400 });
  }
  const passkey = config.passkeys.find((item) => item.id === response.id);
  if (!passkey) throw Object.assign(new Error('La credencial no está registrada en esta instalación.'), { statusCode: 401 });
  const verification = await verifyAuthenticationResponse({
    response, expectedChallenge: ceremony.challenge, expectedOrigin: expectedUiOrigin(), expectedRPID: rpID,
    requireUserVerification: true,
    credential: { id: passkey.id, publicKey: Buffer.from(passkey.publicKey, 'base64url'), counter: passkey.counter, transports: passkey.transports },
  });
  if (!verification.verified || !verification.authenticationInfo.userVerified) throw Object.assign(new Error('La passkey no completó una verificación de usuario válida.'), { statusCode: 401 });
  const lastUsedAt = new Date().toISOString();
  await updateStoredPasskey(passkey.id, verification.authenticationInfo.newCounter, lastUsedAt);
  return { identityId: ceremony.identityId };
}
