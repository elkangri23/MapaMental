import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import type { ProviderRates, ProviderUsage } from '@espacio-visual/domain';

const usageFile = join(process.env.LOCALAPPDATA ?? join(homedir(), 'AppData', 'Local'), 'EspacioVisual', 'provider-usage.json');
const microsPerEur = 1_000_000;
const running = new Set<string>();
let writes = Promise.resolve();
const unsaved = new Map<string, UsageEntry>();

type UsageEntry = { costMicros: number; inputTokens: number; outputTokens: number; incompleteRequests: number };
type Tokens = { input?: number; output?: number };
type UsageLedger = Record<string, UsageEntry>;

function monthOf(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function emptyEntry(): UsageEntry {
  return { costMicros: 0, inputTokens: 0, outputTokens: 0, incompleteRequests: 0 };
}

async function readLedger(): Promise<UsageLedger> {
  try {
    const raw = await readFile(usageFile, 'utf8');
    const parsed = JSON.parse(raw) as UsageLedger;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)
      || Object.entries(parsed).some(([key, entry]) => !/^[a-f0-9-]{36}:\d{4}-\d{2}$/i.test(key)
        || !entry || ['costMicros', 'inputTokens', 'outputTokens', 'incompleteRequests'].some((field) => {
          const value = entry[field as keyof UsageEntry];
          return !Number.isSafeInteger(value) || value < 0;
        }))) throw new Error('Registro de uso no válido.');
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw error;
  }
}

function add(left: UsageEntry, right: UsageEntry): UsageEntry {
  return {
    costMicros: left.costMicros + right.costMicros,
    inputTokens: left.inputTokens + right.inputTokens,
    outputTokens: left.outputTokens + right.outputTokens,
    incompleteRequests: left.incompleteRequests + right.incompleteRequests,
  };
}

function persistUsage(key: string, delta: UsageEntry) {
  const operation = writes.then(async () => {
    unsaved.set(key, add(unsaved.get(key) ?? emptyEntry(), delta));
    const ledger = await readLedger();
    for (const [id, entry] of unsaved) ledger[id] = add(ledger[id] ?? emptyEntry(), entry);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 12, 1);
    for (const id of Object.keys(ledger)) if (id.slice(-7) < monthOf(cutoff)) delete ledger[id];
    await mkdir(dirname(usageFile), { recursive: true });
    const temp = `${usageFile}.${crypto.randomUUID()}.tmp`;
    try {
      await writeFile(temp, JSON.stringify(ledger), { flag: 'wx', flush: true });
      await rename(temp, usageFile);
      unsaved.clear();
    } finally {
      await rm(temp, { force: true }).catch(() => undefined);
    }
  });
  writes = operation.catch(() => undefined);
  return operation;
}

export async function getProviderUsage(id: string, now = new Date()): Promise<ProviderUsage> {
  await writes;
  const month = monthOf(now);
  const key = `${id}:${month}`;
  const entry = add((await readLedger())[key] ?? emptyEntry(), unsaved.get(key) ?? emptyEntry());
  return { month, estimatedEur: entry.costMicros / microsPerEur, incompleteRequests: entry.incompleteRequests, recordingPending: unsaved.has(key) };
}

export async function withRemoteUsage<T>(
  profile: { id: string; monthlyBudgetEur?: number | null },
  rates: ProviderRates | undefined,
  request: (reportUsage: (tokens: Tokens) => void) => Promise<T>,
  signal?: AbortSignal,
) {
  if (running.has(profile.id)) throw Object.assign(new Error('Ya hay una generación en curso para este proveedor. Espera a que termine.'), { statusCode: 429 });
  running.add(profile.id);
  try {
    const now = new Date();
    const usage = await getProviderUsage(profile.id, now).catch(() => undefined);
    if (!usage && profile.monthlyBudgetEur != null) {
      throw Object.assign(new Error('No se pudo leer el registro de uso. Revisa el registro o quita el presupuesto en Ajustes.'), { statusCode: 409 });
    }
    if (usage && profile.monthlyBudgetEur != null && usage.estimatedEur >= profile.monthlyBudgetEur) {
      throw Object.assign(new Error('Este proveedor ha alcanzado el presupuesto mensual estimado. Puedes ajustarlo o quitarlo en Ajustes.'), { statusCode: 429 });
    }
    signal?.throwIfAborted();
    let tokens: Tokens = {};
    try { return await request((reported) => { tokens = reported; }); }
    finally {
      const input = tokens.input ?? 0;
      const output = tokens.output ?? 0;
      await persistUsage(`${profile.id}:${monthOf(now)}`, {
        costMicros: rates ? Math.round(input * rates.inputEurPerMillion + output * rates.outputEurPerMillion) : 0,
        inputTokens: input,
        outputTokens: output,
        incompleteRequests: rates && tokens.input !== undefined && tokens.output !== undefined ? 0 : 1,
      }).catch(() => undefined);
    }
  } finally { running.delete(profile.id); }
}
