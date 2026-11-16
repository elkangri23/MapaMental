import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { Entry } from '@napi-rs/keyring';

const entry = () => new Entry('EspacioVisual', 'auth:totp-recovery');
const stepSeconds = 30;
const pendingTtlMs = 10 * 60 * 1000;
const maxFailures = 5;
const lockMs = 15 * 60 * 1000;
type RecordData = { secret: string; enabled: boolean; lastStep: number; failures: number; lockedUntil: number };
const pending = new Map<string, { secret: string; expiresAt: number; failures: number }>();
let mutationQueue: Promise<void> = Promise.resolve();

function serialize<T>(action: () => T | Promise<T>): Promise<T> {
  const result = mutationQueue.then(action, action);
  mutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function read(): RecordData | null {
  try {
    const text = entry().getPassword();
    if (!text || text.length > 4096) return null;
    const value = JSON.parse(text) as RecordData;
    if (typeof value.secret !== 'string' || !/^[A-Z2-7]{32}$/.test(value.secret) || typeof value.enabled !== 'boolean'
      || !Number.isSafeInteger(value.lastStep) || value.lastStep < -1 || !Number.isSafeInteger(value.failures) || value.failures < 0 || value.failures >= maxFailures
      || !Number.isSafeInteger(value.lockedUntil) || value.lockedUntil < 0) return null;
    return value;
  } catch { return null; }
}

function write(value: RecordData) { entry().setPassword(JSON.stringify(value)); }
function encodeBase32(bytes: Buffer) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0; let value = 0; let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { output += alphabet[(value >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits) output += alphabet[(value << (5 - bits)) & 31];
  return output;
}
function decodeBase32(secret: string) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0; let value = 0; const output: number[] = [];
  for (const char of secret) { value = (value << 5) | alphabet.indexOf(char); bits += 5; if (bits >= 8) { output.push((value >>> (bits - 8)) & 255); bits -= 8; } }
  return Buffer.from(output);
}
function codeFor(secret: string, counter: number) {
  const counterBytes = Buffer.alloc(8); counterBytes.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac('sha1', decodeBase32(secret)).update(counterBytes).digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = ((digest[offset] & 127) << 24) | ((digest[offset + 1] & 255) << 16) | ((digest[offset + 2] & 255) << 8) | (digest[offset + 3] & 255);
  return String(binary % 1_000_000).padStart(6, '0');
}
function matchingStep(secret: string, code: string) {
  if (!/^\d{6}$/.test(code)) return null;
  const now = Math.floor(Date.now() / 1000 / stepSeconds);
  for (const candidate of [now - 1, now, now + 1]) {
    const expected = Buffer.from(codeFor(secret, candidate));
    if (timingSafeEqual(expected, Buffer.from(code))) return candidate;
  }
  return null;
}
function checkLockout(record: RecordData) {
  if (record.lockedUntil > Date.now()) throw Object.assign(new Error('Demasiados intentos. Espera 15 minutos antes de volver a intentarlo.'), { statusCode: 429 });
}
async function validateAndConsume(code: string) {
  return serialize(() => {
    const record = read();
    if (!record?.enabled) throw Object.assign(new Error('La recuperación TOTP no está configurada.'), { statusCode: 409 });
    checkLockout(record);
    const step = matchingStep(record.secret, code);
    if (step === null || step <= record.lastStep) {
      const failures = record.failures + 1;
      write({ ...record, failures: failures >= maxFailures ? 0 : failures, lockedUntil: failures >= maxFailures ? Date.now() + lockMs : record.lockedUntil });
      throw Object.assign(new Error('El código no es válido o ya se utilizó.'), { statusCode: failures >= maxFailures ? 429 : 401 });
    }
    write({ ...record, lastStep: step, failures: 0, lockedUntil: 0 });
  });
}

export async function totpStatus() { return { enabled: !!read()?.enabled }; }

export async function beginTotpEnrollment(sessionId: string) {
  if (!sessionId) throw Object.assign(new Error('Se requiere una sesión protegida.'), { statusCode: 403 });
  const now = Date.now();
  for (const [id, item] of pending) if (item.expiresAt <= now) pending.delete(id);
  pending.delete(sessionId);
  if (pending.size >= 32) throw Object.assign(new Error('Hay demasiados enrolamientos TOTP pendientes.'), { statusCode: 429 });
  const secret = encodeBase32(randomBytes(20));
  pending.set(sessionId, { secret, expiresAt: now + pendingTtlMs, failures: 0 });
  const label = encodeURIComponent('Espacio Visual');
  const issuer = encodeURIComponent('Espacio Visual');
  return { secret, otpauthUrl: `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=${stepSeconds}` };
}

export async function confirmTotpEnrollment(sessionId: string, code: string) {
  return serialize(() => {
    const setup = pending.get(sessionId);
    if (!setup || setup.expiresAt <= Date.now()) {
      pending.delete(sessionId);
      throw Object.assign(new Error('El enrolamiento TOTP caducó. Vuelve a iniciarlo.'), { statusCode: 401 });
    }
    const step = matchingStep(setup.secret, code);
    if (step === null) {
      if (setup.failures + 1 >= maxFailures) pending.delete(sessionId);
      else pending.set(sessionId, { ...setup, failures: setup.failures + 1 });
      throw Object.assign(new Error(setup.failures + 1 >= maxFailures
        ? 'Se alcanzó el límite de cinco intentos. Inicia de nuevo el enrolamiento.'
        : `Código incorrecto. Quedan ${maxFailures - setup.failures - 1} intentos.`), { statusCode: 401 });
    }
    pending.delete(sessionId);
    write({ secret: setup.secret, enabled: true, lastStep: step, failures: 0, lockedUntil: 0 });
    return { enabled: true };
  });
}

export async function verifyTotpRecovery(code: string) { await validateAndConsume(code); }

export async function disableTotp() {
  return serialize(() => { try { entry().deletePassword(); } catch { /* Already absent. */ } pending.clear(); return { enabled: false }; });
}
