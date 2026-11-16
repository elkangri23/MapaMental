import { appendFile, mkdir, open, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';

const auditFile = join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'EspacioVisual', 'security-events.jsonl');
const retentionMs = 30 * 24 * 60 * 60 * 1000;
const maxBytes = 1024 * 1024;
const maxRecords = 5000;
const maxReadBytes = maxBytes * 2;
const pruneIntervalMs = 24 * 60 * 60 * 1000;
export type SecurityEvent = 'service.start' | 'oidc.link' | 'oidc.login' | 'passkey.login' | 'passkey.reauthentication' | 'passkey.register' | 'passkey.rename' | 'passkey.revoke' | 'totp.enroll' | 'totp.recovery' | 'totp.disable' | 'session.logout';
export type SecurityOutcome = 'success' | 'failure';
interface AuditRecord { timestamp: string; event: SecurityEvent; outcome: SecurityOutcome; requestId: string }

let auditQueue: Promise<void> = Promise.resolve();
let lastPrunedAt = 0;

function serialize<T>(operation: () => Promise<T>) {
  const result = auditQueue.then(operation, operation);
  auditQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function existingText() {
  try {
    const info = await stat(auditFile);
    if (info.size <= maxReadBytes) return await readFile(auditFile, 'utf8');
    const handle = await open(auditFile, 'r');
    try {
      const length = maxReadBytes;
      const buffer = Buffer.alloc(length);
      const { bytesRead } = await handle.read(buffer, 0, length, info.size - length);
      const tail = buffer.subarray(0, bytesRead).toString('utf8');
      const firstNewline = tail.indexOf('\n');
      return firstNewline >= 0 ? tail.slice(firstNewline + 1) : '';
    } finally { await handle.close(); }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return '';
    throw error;
  }
}

function parseRecord(line: string): AuditRecord | null {
  try {
    const value = JSON.parse(line) as Partial<AuditRecord>;
    if (typeof value.timestamp !== 'string' || !Number.isFinite(Date.parse(value.timestamp))
      || typeof value.event !== 'string' || !['service.start', 'oidc.link', 'oidc.login', 'passkey.login', 'passkey.reauthentication', 'passkey.register', 'passkey.rename', 'passkey.revoke', 'totp.enroll', 'totp.recovery', 'totp.disable', 'session.logout'].includes(value.event)
      || (value.outcome !== 'success' && value.outcome !== 'failure')
      || typeof value.requestId !== 'string' || value.requestId.length > 128) return null;
    return value as AuditRecord;
  } catch { return null; }
}

async function replaceWithRecentRecords(now: number) {
  const cutoff = now - retentionMs;
  const records = (await existingText()).split('\n').map(parseRecord).filter((record): record is AuditRecord => !!record && Date.parse(record.timestamp) >= cutoff).slice(-maxRecords);
  while (records.length && Buffer.byteLength(`${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8') > maxBytes) records.shift();
  const temp = `${auditFile}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temp, records.length ? `${records.map((record) => JSON.stringify(record)).join('\n')}\n` : '', { encoding: 'utf8', flag: 'wx' });
    await rename(temp, auditFile);
  } catch (error) {
    await rm(temp, { force: true }).catch(() => undefined);
    throw error;
  }
  lastPrunedAt = now;
}

export async function pruneSecurityEvents() {
  try {
    await serialize(async () => {
      try { await stat(auditFile); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') { lastPrunedAt = Date.now(); return; } throw error; }
      await replaceWithRecentRecords(Date.now());
    });
    return true;
  } catch { return false; }
}

export async function recordSecurityEvent(event: SecurityEvent, outcome: SecurityOutcome, requestId: string) {
  const record: AuditRecord = {
    timestamp: new Date().toISOString(), event, outcome,
    requestId: requestId.replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64) || 'unknown',
  };
  try {
    await serialize(async () => {
      await mkdir(dirname(auditFile), { recursive: true });
      const now = Date.now();
      let size = 0;
      try { size = (await stat(auditFile)).size; } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      if (now - lastPrunedAt >= pruneIntervalMs || size >= maxBytes) await replaceWithRecentRecords(now);
      await appendFile(auditFile, `${JSON.stringify(record)}\n`, { encoding: 'utf8', flag: 'a' });
      if ((await stat(auditFile)).size > maxBytes) await replaceWithRecentRecords(Date.now());
    });
    return true;
  } catch { return false; }
}
