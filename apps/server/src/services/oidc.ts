import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  customFetch,
  discovery,
  None,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
  type Configuration,
} from 'openid-client';
import { getAuthConfiguration, type AuthConfiguration } from './auth-store.js';
import { safeOidcFetch } from './provider-store.js';

const transactionLifetimeMs = 5 * 60 * 1000;
type OidcPurpose = 'link' | 'login';
interface OidcTransaction {
  purpose: OidcPurpose;
  state: string;
  nonce: string;
  codeVerifier: string;
  redirectUri: string;
  issuer: string;
  clientId: string;
  localSessionId?: string;
  expiresAt: number;
}

const transactions = new Map<string, OidcTransaction>();
let cachedClient: { key: string; config: Configuration } | null = null;

async function configuredClient(auth: AuthConfiguration) {
  const key = `${auth.issuer}\u0000${auth.clientId}`;
  if (cachedClient?.key === key) return cachedClient.config;
  const config = await discovery(new URL(auth.issuer), auth.clientId, undefined, None(), {
    [customFetch]: safeOidcFetch,
    timeout: 10,
  });
  if (config.serverMetadata().issuer !== auth.issuer || !config.serverMetadata().supportsPKCE('S256')) {
    throw Object.assign(new Error('El issuer no publica metadatos OIDC válidos o no admite PKCE S256.'), { statusCode: 400 });
  }
  cachedClient = { key, config };
  return config;
}

function callbackUri() {
  const port = Number(process.env.MYMAP_LOCAL_PORT ?? 3180);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('El puerto local no es válido para el callback OIDC.');
  return `http://[::1]:${port}/api/session/oidc/callback`;
}

export async function beginOidcAuthorization(input: { purpose: OidcPurpose; localSessionId?: string }) {
  const auth = await getAuthConfiguration();
  if (!auth) throw Object.assign(new Error('Configura primero el issuer OIDC y el client ID.'), { statusCode: 409 });
  if (input.purpose === 'login' && !auth.owner) throw Object.assign(new Error('Vincula primero una identidad OIDC desde el modo local.'), { statusCode: 409 });
  if (input.purpose === 'link' && (!input.localSessionId || auth.owner)) {
    throw Object.assign(new Error('La vinculación inicial requiere una sesión local y una instalación sin identidad vinculada.'), { statusCode: 403 });
  }

  const now = Date.now();
  for (const [state, transaction] of transactions) if (transaction.expiresAt <= now) transactions.delete(state);
  if (transactions.size >= 8) throw Object.assign(new Error('Hay demasiados inicios de sesión pendientes. Espera unos minutos e inténtalo otra vez.'), { statusCode: 429 });

  const config = await configuredClient(auth);
  const codeVerifier = randomPKCECodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const state = randomState();
  const nonce = randomNonce();
  const redirectUri = callbackUri();
  const authorizationUrl = buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: 'openid',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });
  transactions.set(state, {
    purpose: input.purpose,
    state,
    nonce,
    codeVerifier,
    redirectUri,
    issuer: auth.issuer,
    clientId: auth.clientId,
    localSessionId: input.localSessionId,
    expiresAt: now + transactionLifetimeMs,
  });
  return authorizationUrl.href;
}

export function consumeOidcTransaction(state: string) {
  const transaction = transactions.get(state);
  transactions.delete(state);
  if (!transaction || transaction.expiresAt <= Date.now()) return null;
  return transaction;
}

export async function completeOidcAuthorization(transaction: OidcTransaction, callbackUrl: URL) {
  const auth = await getAuthConfiguration();
  if (!auth || auth.issuer !== transaction.issuer || auth.clientId !== transaction.clientId) {
    throw Object.assign(new Error('La configuración OIDC cambió durante el inicio de sesión.'), { statusCode: 409 });
  }
  const config = await configuredClient(auth);
  const tokenResponse = await authorizationCodeGrant(config, callbackUrl, {
    expectedState: transaction.state,
    expectedNonce: transaction.nonce,
    pkceCodeVerifier: transaction.codeVerifier,
  });
  const claims = tokenResponse.claims();
  if (!claims) throw Object.assign(new Error('El proveedor no devolvió un ID Token.'), { statusCode: 401 });
  if (claims.iss !== transaction.issuer || typeof claims.sub !== 'string' || !claims.sub.trim() || claims.sub.length > 512) {
    throw Object.assign(new Error('El proveedor no devolvió una identidad OIDC válida.'), { statusCode: 401 });
  }
  return { issuer: claims.iss, subject: claims.sub, purpose: transaction.purpose, localSessionId: transaction.localSessionId };
}
