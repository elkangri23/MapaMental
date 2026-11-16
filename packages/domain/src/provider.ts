export type ProviderKind = 'openai' | 'anthropic' | 'ollama' | 'lmstudio' | 'openai-compatible';

export interface ProviderRates {
  inputEurPerMillion: number;
  outputEurPerMillion: number;
}

export interface ProviderUsage {
  month: string;
  estimatedEur: number;
  incompleteRequests: number;
  recordingPending?: boolean;
}

export function isLocalProviderUrl(baseUrl: string) {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  } catch { return false; }
}

export interface ProviderProfile {
  id: string;
  name: string;
  kind: ProviderKind;
  baseUrl: string;
  model: string;
  credentialConfigured: boolean;
  monthlyBudgetEur?: number | null;
  ratesByModel?: Record<string, ProviderRates>;
  usage?: ProviderUsage;
  usageUnavailable?: boolean;
}

export interface ProviderProfileInput {
  id?: string;
  name: string;
  kind: ProviderKind;
  baseUrl?: string;
  model: string;
  apiKey?: string;
  clearCredential?: boolean;
  monthlyBudgetEur?: number | null;
  modelRates?: ProviderRates | null;
}

export interface ProviderConfiguration {
  activeId: string | null;
  profiles: ProviderProfile[];
}
