import { constants } from 'node:fs';
import { mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { parseEnv } from 'node:util';
import { Entry } from '@napi-rs/keyring';
import { Agent, fetch as undiciFetch } from 'undici';
import type { CustomFetch } from 'openid-client';
import { isLocalProviderUrl, type ProviderConfiguration, type ProviderKind, type ProviderProfile, type ProviderProfileInput, type ProviderRates } from '@espacio-visual/domain';
import { getProviderUsage, withRemoteUsage } from './provider-usage.js';

const serviceName = 'EspacioVisual';
const configFile = join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'EspacioVisual', 'providers.json');
const defaults: Record<ProviderKind, { name: string; baseUrl: string }> = {
  openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com' },
  anthropic: { name: 'Anthropic', baseUrl: 'https://api.anthropic.com' },
  ollama: { name: 'Ollama', baseUrl: 'http://127.0.0.1:11434' },
  lmstudio: { name: 'LM Studio', baseUrl: 'http://127.0.0.1:1234' },
  'openai-compatible': { name: 'Proveedor compatible', baseUrl: '' },
};

type StoredProfile = Omit<ProviderProfile, 'credentialConfigured' | 'usage' | 'usageUnavailable'>;
type StoredConfiguration = { activeId: string | null; profiles: StoredProfile[] };
const maxModelRates = 16;

function validMoney(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100_000;
}

function validRates(value: unknown): value is ProviderRates {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && validMoney((value as ProviderRates).inputEurPerMillion) && validMoney((value as ProviderRates).outputEurPerMillion);
}

// Provider profiles share one JSON file. Serialize read-modify-write operations
// so two quick edits cannot overwrite each other's profile or active selection.
let providerMutationQueue: Promise<void> = Promise.resolve();
function serializeProviderMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = providerMutationQueue.then(operation, operation);
  providerMutationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function isKind(value: unknown): value is ProviderKind {
  return value === 'openai' || value === 'anthropic' || value === 'ollama' || value === 'lmstudio' || value === 'openai-compatible';
}

function credentialEntry(id: string) { return new Entry(serviceName, `provider:${id}`); }

const freeLlmEnvFile = new URL('../../../../.env', import.meta.url);
const freeLlmBaseUrl = 'http://127.0.0.1:31415/v1';

async function readProviderKey(profile: StoredProfile): Promise<string | undefined> {
  if (profile.kind === 'openai-compatible' && profile.baseUrl === freeLlmBaseUrl) {
    try {
      const key = parseEnv(await readFile(freeLlmEnvFile, 'utf8')).FREELLMAPI_API_KEY?.trim();
      if (key) return key;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw Object.assign(new Error('No se pudo leer el archivo .env de FreeLLMAPI.'), { statusCode: 409 });
      }
    }
  }
  try { return credentialEntry(profile.id).getPassword() ?? undefined; }
  catch { return undefined; }
}

async function readConfiguration(): Promise<StoredConfiguration> {
  try {
    const text = await readFile(configFile, 'utf8');
    if (Buffer.byteLength(text, 'utf8') > 1024 * 1024) return { activeId: null, profiles: [] };
    const value = JSON.parse(text) as StoredConfiguration;
    if (!Array.isArray(value.profiles) || value.profiles.length > 50) return { activeId: null, profiles: [] };
    const profiles = value.profiles.flatMap((item) => {
      try {
        if (!item || typeof item.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(item.id) || !isKind(item.kind)
          || typeof item.name !== 'string' || item.name.length > 80 || typeof item.model !== 'string' || item.model.length > 160) return [];
        const rates = Object.entries(item.ratesByModel ?? {})
          .filter(([model, rate]) => model && model.length <= 160 && validRates(rate)).slice(0, maxModelRates)
          .map(([model, rate]) => [model, { inputEurPerMillion: rate.inputEurPerMillion, outputEurPerMillion: rate.outputEurPerMillion }] as const);
        return [{
          id: item.id, name: item.name, model: item.model, kind: item.kind, baseUrl: validatedBaseUrl(item.kind, item.baseUrl),
          monthlyBudgetEur: validMoney(item.monthlyBudgetEur) ? item.monthlyBudgetEur : null,
          ratesByModel: Object.fromEntries(rates),
        }];
      } catch { return []; }
    });
    return { activeId: typeof value.activeId === 'string' && profiles.some((profile) => profile.id === value.activeId) ? value.activeId : null, profiles };
  } catch { return { activeId: null, profiles: [] }; }
}

async function writeConfiguration(value: StoredConfiguration) {
  await mkdir(dirname(configFile), { recursive: true });
  const temp = `${configFile}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await writeFile(temp, JSON.stringify(value, null, 2), { encoding: 'utf8', flag: 'wx' });
    const file = await open(temp, 'r+');
    try { await file.sync(); } finally { await file.close(); }
    await rename(temp, configFile);
  } catch (error) { await rm(temp, { force: true }).catch(() => undefined); throw error; }
}

async function publicProfile(profile: StoredConfiguration['profiles'][number]): Promise<ProviderProfile> {
  const credentialConfigured = Boolean(await readProviderKey(profile).catch(() => undefined));
  const tracksUsage = !isLocalProviderUrl(profile.baseUrl) || profile.monthlyBudgetEur != null
    || Object.hasOwn(profile.ratesByModel ?? {}, profile.model);
  const usage = tracksUsage ? await getProviderUsage(profile.id).catch(() => undefined) : undefined;
  return { ...profile, credentialConfigured, usage, usageUnavailable: tracksUsage && !usage };
}

export async function getProviderConfiguration(): Promise<ProviderConfiguration> {
  const stored = await readConfiguration();
  return { activeId: stored.activeId, profiles: await Promise.all(stored.profiles.map(publicProfile)) };
}

export async function getActiveProviderForRequest() {
  const stored = await readConfiguration();
  const profile = stored.profiles.find((item) => item.id === stored.activeId);
  if (!profile) throw Object.assign(new Error('Selecciona un proveedor en Ajustes antes de usar el chat.'), { statusCode: 409 });
  if (!profile.model) throw Object.assign(new Error('Elige un modelo en Ajustes antes de usar el chat.'), { statusCode: 409 });
  const apiKey = await readProviderKey(profile);
  if ((profile.kind === 'openai' || profile.kind === 'anthropic') && !apiKey) throw Object.assign(new Error('Guarda la clave API de este proveedor en Ajustes antes de continuar.'), { statusCode: 409 });
  return { profile, apiKey };
}

function validatedBaseUrl(kind: ProviderKind, value: string | undefined) {
  const baseUrl = (value?.trim() || defaults[kind].baseUrl).replace(/\/+$/, '');
  if (!baseUrl) throw Object.assign(new Error('Indica la URL base del proveedor.'), { statusCode: 400 });
  let url: URL;
  try { url = new URL(baseUrl); } catch { throw Object.assign(new Error('La URL base no es válida.'), { statusCode: 400 }); }
  if (url.username || url.password || url.search || url.hash) throw Object.assign(new Error('La URL base no puede incluir credenciales, parámetros ni fragmentos.'), { statusCode: 400 });
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const isLoopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLoopback)) throw Object.assign(new Error('Usa HTTPS para servicios remotos; HTTP solo se permite en localhost.'), { statusCode: 400 });
  if (!isLoopback && isBlockedRemoteHost(host)) throw Object.assign(new Error('La URL remota no puede apuntar a una dirección local o privada.'), { statusCode: 400 });
  return baseUrl;
}

function isBlockedRemoteHost(hostname: string) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host === '::1' || host === '::') return true;
  if (isIP(host) === 6) {
    if (host.startsWith('::ffff:')) return true;
    const segments = host.split(':');
    const firstSegment = Number.parseInt(segments[0] || '0', 16);
    const secondSegment = Number.parseInt(segments[1] || '0', 16);
    // Only global unicast 2000::/3 is allowed; mapped, link-local, unique-local,
    // multicast, transition and special-use ranges are excluded as well. The
    // WHATWG URL parser compresses forms like 2001:0::1 to 2001::1, so identify
    // IANA special-purpose blocks by their numeric prefix, not textual form.
    return (firstSegment & 0xe000) !== 0x2000
      || (firstSegment === 0x2001 && secondSegment <= 0x01ff)
      || host.startsWith('2001:db8:')
      || firstSegment === 0x2002
      || (firstSegment === 0x3fff && secondSegment <= 0x0fff);
  }
  const octets = host.split('.').map(Number);
  if (octets.length === 4 && octets.every((part) => Number.isInteger(part) && part >= 0 && part <= 255)) {
    const [a, b] = octets;
    return a === 0 || a === 10 || a === 127 || a >= 224
      || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
      || (a === 192 && (b === 0 || b === 88 || b === 168))
      || (a === 198 && (b === 18 || b === 19 || b === 51))
      || (a === 203 && b === 0 && octets[2] === 113)
      || (a === 100 && b >= 64 && b <= 127);
  }
  return false;
}

async function resolveSafeProviderTarget(url: URL, signal: AbortSignal) {
  signal.throwIfAborted();
  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const localLiteral = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  if (!localLiteral && isBlockedRemoteHost(hostname)) throw Object.assign(new Error('La URL del proveedor apunta a una dirección local o privada.'), { statusCode: 400 });
  if (isIP(hostname)) return [hostname];
  if (localLiteral) return [hostname === 'localhost' ? '127.0.0.1' : hostname];
  let addresses: Array<{ address: string; family: number }>;
  let abort: (() => void) | undefined;
  const abortLookup = new Promise<never>((_resolve, reject) => {
    abort = () => reject(signal.reason);
    signal.addEventListener('abort', abort, { once: true });
  });
  try {
    addresses = await Promise.race([lookup(hostname, { all: true, verbatim: true }), abortLookup]);
  } catch {
    signal.throwIfAborted();
    throw Object.assign(new Error('No se pudo resolver el host del proveedor.'), { statusCode: 400 });
  } finally {
    if (abort) signal.removeEventListener('abort', abort);
  }
  if (!addresses.length || addresses.some(({ address }) => isBlockedRemoteHost(address))) {
    throw Object.assign(new Error('La URL del proveedor resuelve a una dirección local o privada.'), { statusCode: 400 });
  }
  return addresses.map(({ address }) => address);
}

/** Create the socket resolver from the addresses validated before the request. */
export function createPinnedProviderLookup(originalHostname: string, addresses: readonly string[]) {
  const expectedHostname = originalHostname.replace(/^\[|\]$/g, '').toLowerCase();
  const pinnedAddresses = addresses.map((address) => ({ address, family: isIP(address) }));
  return (hostname: string, options: { all?: boolean }, callback: (...args: unknown[]) => void) => {
    if (hostname.replace(/^\[|\]$/g, '').toLowerCase() !== expectedHostname) return callback(new Error('Destino de conexión inesperado.'));
    if (!pinnedAddresses.length) return callback(new Error('No hay direcciones DNS fijadas para el proveedor.'));
    if (options.all) return callback(null, pinnedAddresses);
    return callback(null, pinnedAddresses[0].address, pinnedAddresses[0].family);
  };
}

async function fetchBounded(url: URL, init: RequestInit, timeoutMs: number, maxBytes: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const signal = init.signal ? AbortSignal.any([controller.signal, init.signal]) : controller.signal;
  let agent: Agent | undefined;
  let bodyRead = false;
  try {
    const addresses = await resolveSafeProviderTarget(url, signal);
    signal.throwIfAborted();
    const originalHostname = url.hostname.replace(/^\[|\]$/g, '');
    const destination = new URL(url);
    destination.hostname = isIP(originalHostname) === 6 ? `[${originalHostname}]` : originalHostname;
    agent = new Agent({
      maxResponseSize: maxBytes,
      headersTimeout: timeoutMs,
      bodyTimeout: timeoutMs,
      connect: {
        // Pin TLS identity to the configured DNS name while lookup is pinned
        // to the addresses already checked for SSRF. IP literals use IP SANs
        // and must not be sent as a DNS SNI name.
        ...(isIP(originalHostname) === 0 ? { servername: originalHostname } : {}),
        rejectUnauthorized: true,
        lookup: createPinnedProviderLookup(originalHostname, addresses) as never,
      },
      connections: 1,
      maxOrigins: 1,
    });
    const response = await undiciFetch(destination, { ...init, dispatcher: agent, signal, redirect: 'error' } as never);
    const declared = Number(response.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > maxBytes) throw Object.assign(new Error('El proveedor devolvió una respuesta demasiado grande.'), { statusCode: 502 });
    const text = await response.text();
    bodyRead = true;
    if (Buffer.byteLength(text, 'utf8') > maxBytes) throw Object.assign(new Error('El proveedor devolvió una respuesta demasiado grande.'), { statusCode: 502 });
    return { response, text };
  } finally {
    clearTimeout(timer);
    if (agent) await (bodyRead ? agent.close() : agent.destroy()).catch(() => undefined);
  }
}

/** OIDC discovery, keys and token requests use the same DNS-pinned egress policy as LLM providers. */
export const safeOidcFetch: CustomFetch = async (url, options) => {
  const { response, text } = await fetchBounded(new URL(url), options as RequestInit, 10_000, 1024 * 1024);
  const headers = new Headers();
  const contentType = response.headers.get('content-type');
  const authenticate = response.headers.get('www-authenticate');
  if (contentType) headers.set('content-type', contentType);
  if (authenticate) headers.set('www-authenticate', authenticate);
  return new Response(text || null, { status: response.status, statusText: response.statusText, headers });
};

export function saveProviderProfile(input: ProviderProfileInput) {
  return serializeProviderMutation(async () => {
  if (!input || !isKind(input.kind) || typeof input.name !== 'string' || !input.name.trim() || typeof input.model !== 'string') {
    throw Object.assign(new Error('Completa el nombre y tipo del proveedor.'), { statusCode: 400 });
  }
  const id = input.id && /^[a-f0-9-]{36}$/i.test(input.id) ? input.id : crypto.randomUUID();
  if (typeof input.apiKey === 'string' && input.apiKey.length > 4096) throw Object.assign(new Error('La credencial supera el tamaño permitido.'), { statusCode: 400 });
  if (input.monthlyBudgetEur != null && !validMoney(input.monthlyBudgetEur)) {
    throw Object.assign(new Error('El presupuesto debe estar entre 0 y 100.000 EUR o quedar vacío.'), { statusCode: 400 });
  }
  if (input.modelRates != null && !validRates(input.modelRates)) {
    throw Object.assign(new Error('Indica ambas tarifas por millón de tokens, entre 0 y 100.000 EUR.'), { statusCode: 400 });
  }
  const stored = await readConfiguration();
  const index = stored.profiles.findIndex((item) => item.id === id);
  if (index < 0 && stored.profiles.length >= 50) throw Object.assign(new Error('Se alcanzó el límite de 50 perfiles de proveedor.'), { statusCode: 400 });
  const previous = stored.profiles[index];
  const model = input.model.trim().slice(0, 160);
  const ratesByModel = new Map(Object.entries(previous?.ratesByModel ?? {}));
  if (input.modelRates !== undefined && model) {
    if (input.modelRates === null) ratesByModel.delete(model);
    else {
      if (!ratesByModel.has(model) && ratesByModel.size >= maxModelRates) throw Object.assign(new Error('Quita una tarifa anterior antes de configurar otro modelo.'), { statusCode: 400 });
      const { inputEurPerMillion, outputEurPerMillion } = input.modelRates;
      ratesByModel.set(model, { inputEurPerMillion, outputEurPerMillion });
    }
  }
  const profile: StoredProfile = {
    id, name: input.name.trim().slice(0, 80), kind: input.kind, baseUrl: validatedBaseUrl(input.kind, input.baseUrl), model,
    monthlyBudgetEur: input.monthlyBudgetEur === undefined ? previous?.monthlyBudgetEur ?? null : input.monthlyBudgetEur,
    ratesByModel: Object.fromEntries(ratesByModel),
  };
  if (index < 0) stored.profiles.push(profile); else stored.profiles[index] = profile;
  if (typeof input.apiKey === 'string' && input.apiKey.trim()) credentialEntry(id).setPassword(input.apiKey.trim());
  else if (input.clearCredential) { try { credentialEntry(id).deletePassword(); } catch { /* Credential was not present. */ } }
  await writeConfiguration(stored);
  return publicProfile(profile);
  });
}

export function deleteProviderProfile(id: string) {
  return serializeProviderMutation(async () => {
  const stored = await readConfiguration();
  stored.profiles = stored.profiles.filter((item) => item.id !== id);
  if (stored.activeId === id) stored.activeId = null;
  try { credentialEntry(id).deletePassword(); } catch { /* Credential was not present. */ }
  await writeConfiguration(stored);
  });
}

export function selectProviderProfile(id: string | null) {
  return serializeProviderMutation(async () => {
  const stored = await readConfiguration();
  if (id !== null && !stored.profiles.some((item) => item.id === id)) throw Object.assign(new Error('No existe ese perfil de proveedor.'), { statusCode: 404 });
  stored.activeId = id;
  await writeConfiguration(stored);
  return getProviderConfiguration();
  });
}

function modelEndpoint(baseUrl: string, kind: ProviderKind) {
  const url = new URL(baseUrl);
  if (kind === 'ollama') url.pathname = `${url.pathname.replace(/\/$/, '')}/api/tags`.replace(/^\/api\/api\//, '/api/');
  else if (kind === 'anthropic') { url.pathname = `${url.pathname.replace(/\/$/, '')}/v1/models`.replace(/^\/v1\/v1\//, '/v1/'); url.searchParams.set('limit', '1'); }
  else url.pathname = `${url.pathname.replace(/\/$/, '')}/v1/models`.replace(/^\/v1\/v1\//, '/v1/');
  return url;
}

export async function testProviderConnection(id: string) {
  const stored = await readConfiguration();
  const profile = stored.profiles.find((item) => item.id === id);
  if (!profile) throw Object.assign(new Error('No existe ese perfil de proveedor.'), { statusCode: 404 });
  const apiKey = await readProviderKey(profile);
  if (profile.kind === 'anthropic' && !apiKey) throw Object.assign(new Error('Guarda una clave de API para probar Anthropic.'), { statusCode: 400 });
  const safeProfile = { ...profile, baseUrl: validatedBaseUrl(profile.kind, profile.baseUrl) };
  const url = modelEndpoint(safeProfile.baseUrl, safeProfile.kind);
  const headers: Record<string, string> = { accept: 'application/json' };
  if (apiKey && profile.kind === 'anthropic') { headers['x-api-key'] = apiKey; headers['anthropic-version'] = '2023-06-01'; }
  else if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  try {
    const { response, text } = await fetchBounded(url, { headers }, 8000, 1024 * 1024);
    if (!response.ok) throw Object.assign(new Error(`El proveedor respondió HTTP ${response.status}. Revisa URL, credencial y permisos.`), { statusCode: 502 });
    const result = JSON.parse(text) as { data?: unknown[]; models?: unknown[] };
    const entries = Array.isArray(result.data) ? result.data : Array.isArray(result.models) ? result.models : [];
    const models = entries.flatMap((item) => item && typeof item === 'object' && typeof (item as { id?: unknown; name?: unknown }).id === 'string' ? [(item as { id: string }).id] : item && typeof item === 'object' && typeof (item as { name?: unknown }).name === 'string' ? [(item as { name: string }).name] : []);
    return { connected: true, models };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    if ((error as { name?: string }).name === 'AbortError') throw Object.assign(new Error('Se agotó el tiempo de espera al conectar con el proveedor.'), { statusCode: 504 });
    throw Object.assign(new Error('No se pudo conectar. Comprueba que el servicio esté activo y que la URL sea correcta.'), { statusCode: 502 });
  }
}

function tokenCount(value: unknown) {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= 1_000_000_000 ? value : undefined;
}

function reportedUsage(kind: ProviderKind, value: unknown) {
  const usage = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  if (kind !== 'anthropic') return { input: tokenCount(usage.prompt_tokens), output: tokenCount(usage.completion_tokens) };
  const input = tokenCount(usage.input_tokens);
  return {
    input: input === undefined ? undefined : input + (tokenCount(usage.cache_read_input_tokens) ?? 0) + (tokenCount(usage.cache_creation_input_tokens) ?? 0),
    output: tokenCount(usage.output_tokens),
  };
}

export async function generateProviderText(
  profile: StoredConfiguration['profiles'][number],
  apiKey: string | undefined,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  system: string,
  requestSignal?: AbortSignal,
  maxOutputTokens = 1800,
) {
  const baseUrl = validatedBaseUrl(profile.kind, profile.baseUrl);
  const request = (report?: (tokens: ReturnType<typeof reportedUsage>) => void) =>
    requestProviderText(profile, baseUrl, apiKey, messages, system, maxOutputTokens, requestSignal, report);
  const rates = profile.ratesByModel && Object.hasOwn(profile.ratesByModel, profile.model) ? profile.ratesByModel[profile.model] : undefined;
  if (isLocalProviderUrl(baseUrl) && profile.monthlyBudgetEur == null && !rates) return request();
  return withRemoteUsage(profile, rates, request, requestSignal);
}

async function requestProviderText(
  profile: StoredProfile, baseUrl: string, apiKey: string | undefined,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>, system: string, maxOutputTokens: number,
  requestSignal?: AbortSignal, report?: (tokens: ReturnType<typeof reportedUsage>) => void,
) {
  const base = new URL(baseUrl);
  const path = base.pathname.replace(/\/$/, '');
  const url = profile.kind === 'ollama'
    ? new URL(`${path}/api/chat`.replace(/^\/api\/api\//, '/api/'), base)
    : profile.kind === 'anthropic'
      ? new URL(`${path}/v1/messages`.replace(/^\/v1\/v1\//, '/v1/'), base)
      : new URL(`${path}/v1/chat/completions`.replace(/^\/v1\/v1\//, '/v1/'), base);
  const headers: Record<string, string> = { 'content-type': 'application/json', accept: 'application/json' };
  let body: unknown;
  if (profile.kind === 'anthropic') {
    if (!apiKey) throw Object.assign(new Error('Guarda la clave API de Anthropic en Ajustes.'), { statusCode: 409 });
    headers['x-api-key'] = apiKey; headers['anthropic-version'] = '2023-06-01';
    body = { model: profile.model, max_tokens: maxOutputTokens, system, messages };
  } else if (profile.kind === 'ollama') {
    body = { model: profile.model, stream: false, format: 'json', messages: [{ role: 'system', content: system }, ...messages] };
    if (apiKey) headers.authorization = `Bearer ${apiKey}`;
  } else {
    if (apiKey) headers.authorization = `Bearer ${apiKey}`;
    body = { model: profile.model, stream: false, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, ...messages] };
  }
  try {
    const { response, text: responseText } = await fetchBounded(url, { method: 'POST', headers, body: JSON.stringify(body), signal: requestSignal }, 90_000, 1024 * 1024);
    const result = JSON.parse(responseText) as Record<string, unknown> | null;
    report?.(reportedUsage(profile.kind, result?.usage));
    if (!response.ok || !result) throw Object.assign(new Error(`El proveedor respondió HTTP ${response.status}. Revisa el modelo y la conexión.`), { statusCode: 502 });
    let content: string | undefined;
    if (profile.kind === 'anthropic') {
      const blocks = Array.isArray(result.content) ? result.content as Array<{ type?: string; text?: string }> : [];
      content = blocks.filter((block) => block.type === 'text').map((block) => block.text ?? '').join('\n');
    } else if (profile.kind === 'ollama') {
      const message = result.message as { content?: unknown } | undefined;
      content = typeof message?.content === 'string' ? message.content : undefined;
    } else {
      const choices = Array.isArray(result.choices) ? result.choices as Array<{ message?: { content?: unknown } }> : [];
      const value = choices[0]?.message?.content;
      content = typeof value === 'string' ? value : undefined;
    }
    if (!content || content.length > 30_000) throw Object.assign(new Error('El proveedor devolvió una respuesta vacía o demasiado grande.'), { statusCode: 502 });
    return content;
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    if (requestSignal?.aborted) throw Object.assign(new Error('La petición se canceló desde la aplicación.'), { statusCode: 499 });
    if ((error as { name?: string }).name === 'AbortError') throw Object.assign(new Error('La petición superó los 90 segundos.'), { statusCode: 504 });
    throw Object.assign(new Error('No se pudo obtener una respuesta del proveedor. Revisa la URL y el protocolo del perfil.'), { statusCode: 502 });
  }
}
