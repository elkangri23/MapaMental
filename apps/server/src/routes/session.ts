import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { clearOidcSecondFactorCookie, clearRecoveryCookie, clearSessionCookie, consumeLaunchNonce, consumeOidcSecondFactor, createOidcSecondFactorStep, createProtectedSession, createRecoverySession, exchangeOidcSecondFactorStep, expectedUiOrigin, getDevelopmentNonce, getOidcSecondFactorIdentity, getOidcSecondFactorToken, getRecoveryIdentity, getRecoverySessionId, getSessionIdentity, getValidSessionId, hasRecentUserVerification, isDevelopmentBootstrapEnabled, isExpectedHost, isExpectedOrigin, isSessionIdValid, isValidSession, requiredSessionMode, revokeAllProtectedSessions, revokeSession, setOidcSecondFactorCookie, setRecoveryCookie, setSessionCookie } from '../services/session.js';
import { bindAuthIdentity, getAuthConfiguration, saveAuthConfiguration } from '../services/auth-store.js';
import { beginOidcAuthorization, completeOidcAuthorization, consumeOidcTransaction } from '../services/oidc.js';
import { beginPasskeyAuthentication, beginPasskeyReauthentication, beginPasskeyRegistration, finishPasskeyAuthentication, finishPasskeyReauthentication, finishPasskeyRegistration, renamePasskey, revokePasskey } from '../services/passkeys.js';
import { beginTotpEnrollment, confirmTotpEnrollment, disableTotp, totpStatus, verifyTotpRecovery } from '../services/totp.js';
import { recordSecurityEvent, type SecurityEvent, type SecurityOutcome } from '../services/security-audit.js';
import { sendCaughtApiError } from '../services/api-errors.js';

function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }

async function audit(request: FastifyRequest, event: SecurityEvent, outcome: SecurityOutcome = 'success') {
  if (!await recordSecurityEvent(event, outcome, request.id)) request.log.warn({ reqId: request.id, event }, 'No se pudo guardar un evento local de seguridad.');
}

export const sessionRoutes: FastifyPluginAsync = async (app) => {
  app.get('/session/bootstrap', async (request, reply) => {
    if (requiredSessionMode() !== 'local' || !isDevelopmentBootstrapEnabled() || !isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])) {
      return reply.code(404).send({ message: 'No disponible.' });
    }
    const nonce = getDevelopmentNonce();
    if (!nonce) return reply.code(409).send({ message: 'El nonce de inicio ya se ha utilizado.' });
    reply.header('cache-control', 'no-store');
    return { nonce };
  });

  app.post<{ Body: { nonce?: string } }>('/session/exchange', async (request, reply) => {
    if (!isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client']) || request.headers['content-type']?.split(';')[0] !== 'application/json') {
      return reply.code(403).send({ message: 'Origen o tipo de petición no permitido.' });
    }
    if (requiredSessionMode() !== 'local') return reply.code(403).send({ message: 'El nonce local no inicia sesiones del modo protegido.' });
    const sessionId = isRecord(request.body) && typeof request.body.nonce === 'string' && request.body.nonce.length <= 128 ? consumeLaunchNonce(request.body.nonce) : null;
    if (!sessionId) return reply.code(401).send({ message: 'Nonce de inicio inválido o ya utilizado.' });
    reply.header('set-cookie', setSessionCookie(sessionId));
    reply.header('cache-control', 'no-store');
    return { authenticated: true };
  });

  app.get('/session/status', async (request, reply) => {
    if (!isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])) return reply.code(403).send({ message: 'Origen no permitido.' });
    reply.header('cache-control', 'no-store');
    const mode = requiredSessionMode();
    if (!isValidSession(request.headers.cookie, mode)) {
      if (mode === 'local') return reply.code(204).send();
      if (getRecoverySessionId(request.headers.cookie)) return reply.code(428).send({ mode, recovery: true, message: 'La recuperación está activa. Registra una passkey nueva para continuar.' });
      if (getOidcSecondFactorIdentity(request.headers.cookie)) return reply.code(428).send({ mode, message: 'La identidad OIDC está verificada. Completa ahora la passkey para abrir la aplicación.' });
      const config = await getAuthConfiguration();
      if (!config?.owner) return reply.code(403).send({ mode, message: 'Vuelve al modo local y vincula primero tu cuenta OIDC en Ajustes.' });
      return reply.code(401).send({ mode, message: 'Inicia sesión con tu proveedor OIDC.' });
    }
    return reply.code(200).send();
  });

  app.post('/session/logout', async (request, reply) => {
    const mode = requiredSessionMode();
    if (!isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])) {
      return reply.code(403).send({ message: 'Origen no permitido.' });
    }
    revokeSession(request.headers.cookie, mode);
    reply.header('set-cookie', clearSessionCookie(mode));
    reply.header('cache-control', 'no-store');
    await audit(request, 'session.logout');
    return { loggedOut: true };
  });

  app.get('/session/oidc-config', async (request, reply) => {
    const mode = requiredSessionMode();
    if (!isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || !isValidSession(request.headers.cookie, mode)) {
      return reply.code(403).send({ message: 'La configuración de identidad requiere una sesión válida.' });
    }
    const config = await getAuthConfiguration();
    reply.header('cache-control', 'no-store');
    return {
      issuer: config?.issuer ?? '', clientId: config?.clientId ?? '', identityLinked: !!config?.owner,
      passkeyCount: config?.passkeys.length ?? 0,
      passkeys: (config?.passkeys ?? []).map(({ id, name, createdAt, lastUsedAt, deviceType, backedUp }) => ({ id, name, createdAt, lastUsedAt, deviceType, backedUp })),
      totpEnabled: (await totpStatus()).enabled,
      mode,
    };
  });

  app.put<{ Body: { issuer?: string; clientId?: string } }>('/session/oidc-config', async (request, reply) => {
    if (requiredSessionMode() !== 'local' || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || !isValidSession(request.headers.cookie, 'local')) {
      return reply.code(403).send({ message: 'La configuración de identidad solo se puede gestionar desde una sesión local.' });
    }
    if (request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)
      || typeof request.body.issuer !== 'string' || request.body.issuer.length > 2048
      || typeof request.body.clientId !== 'string' || request.body.clientId.length > 256) {
      return reply.code(400).send({ message: 'Indica un issuer y un client ID válidos.' });
    }
    const config = await saveAuthConfiguration({ issuer: request.body.issuer, clientId: request.body.clientId });
    reply.header('cache-control', 'no-store');
    return { issuer: config.issuer, clientId: config.clientId, identityLinked: !!config.owner, passkeyCount: config.passkeys.length };
  });

  app.post<{ Body: { step?: string } }>('/session/oidc/step/exchange', async (request, reply) => {
    if (requiredSessionMode() !== 'protected' || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)
      || typeof request.body.step !== 'string' || !/^[A-Za-z0-9_-]{40,64}$/.test(request.body.step)) {
      return reply.code(403).send({ message: 'No se puede intercambiar el estado temporal de autenticación.' });
    }
    const step = exchangeOidcSecondFactorStep(request.body.step);
    if (!step) return reply.code(401).send({ message: 'La verificación OIDC caducó o ya se utilizó.' });
    reply.header('cache-control', 'no-store');
    reply.header('set-cookie', setOidcSecondFactorCookie(step));
    return { exchanged: true };
  });

  app.post<{ Body: { name?: string } }>('/session/passkeys/registration/options', async (request, reply) => {
    const mode = requiredSessionMode();
    const recoveryId = mode === 'protected' ? getRecoverySessionId(request.headers.cookie) : null;
    const sessionId = recoveryId ?? getValidSessionId(request.headers.cookie, mode);
    if (!sessionId || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)
      || typeof request.body.name !== 'string' || request.body.name.length > 64) {
      return reply.code(403).send({ message: 'El alta de passkey requiere una sesión válida y un origen permitido.' });
    }
    if (mode === 'protected' && !recoveryId && !hasRecentUserVerification(request.headers.cookie)) return reply.code(428).send({ message: 'Vuelve a verificar una passkey antes de añadir otra credencial.' });
    try {
      const options = await beginPasskeyRegistration(sessionId, request.body.name, mode === 'protected');
      reply.header('cache-control', 'no-store');
      return options;
    } catch (error) {
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post('/session/passkeys/registration/verify', async (request, reply) => {
    const mode = requiredSessionMode();
    const recoveryId = mode === 'protected' ? getRecoverySessionId(request.headers.cookie) : null;
    const recoveryIdentity = recoveryId ? getRecoveryIdentity(request.headers.cookie) : null;
    const sessionId = recoveryId ?? getValidSessionId(request.headers.cookie, mode);
    if (!sessionId || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)) {
      return reply.code(403).send({ message: 'El alta de passkey requiere una sesión válida y un origen permitido.' });
    }
    if (mode === 'protected' && !recoveryId && !hasRecentUserVerification(request.headers.cookie)) return reply.code(428).send({ message: 'Vuelve a verificar una passkey antes de añadir otra credencial.' });
    try {
      if (recoveryId) {
        const config = await getAuthConfiguration();
        const currentIdentity = config?.owner ? `${config.owner.issuer}\u0000${config.owner.subject}` : null;
        if (!recoveryIdentity || currentIdentity !== recoveryIdentity) return reply.code(401).send({ message: 'La identidad de recuperación ya no es válida.' });
      }
      const result = await finishPasskeyRegistration(sessionId, request.body as never, {
        mode: recoveryId ? 'recovery' : mode,
        cookie: request.headers.cookie,
      });
      if (recoveryId) {
        reply.header('set-cookie', [clearRecoveryCookie(), clearOidcSecondFactorCookie(), clearSessionCookie('protected')]);
      }
      await audit(request, 'passkey.register');
      reply.header('cache-control', 'no-store');
      return result;
    } catch (error) {
      await audit(request, 'passkey.register', 'failure');
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post('/session/totp/enrollment/options', async (request, reply) => {
    const sessionId = getValidSessionId(request.headers.cookie, 'protected');
    if (requiredSessionMode() !== 'protected' || !sessionId || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !hasRecentUserVerification(request.headers.cookie)) {
      return reply.code(428).send({ message: 'Verifica una passkey reciente antes de configurar la recuperación TOTP.' });
    }
    reply.header('cache-control', 'no-store');
    return beginTotpEnrollment(sessionId);
  });

  app.post('/session/totp/enrollment/confirm', async (request, reply) => {
    const sessionId = getValidSessionId(request.headers.cookie, 'protected');
    if (requiredSessionMode() !== 'protected' || !sessionId || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !hasRecentUserVerification(request.headers.cookie)
      || !isRecord(request.body) || typeof request.body.code !== 'string' || request.body.code.length > 16) {
      return reply.code(403).send({ message: 'Confirma el enrolamiento desde una sesión protegida y reautenticada.' });
    }
    try {
      const result = await confirmTotpEnrollment(sessionId, request.body.code);
      await audit(request, 'totp.enroll');
      reply.header('cache-control', 'no-store'); return result;
    } catch (error) { await audit(request, 'totp.enroll', 'failure'); return sendCaughtApiError(request, reply, error); }
  });

  app.post('/session/totp/disable', async (request, reply) => {
    if (requiredSessionMode() !== 'protected' || !getValidSessionId(request.headers.cookie, 'protected')
      || !isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !hasRecentUserVerification(request.headers.cookie)) {
      return reply.code(428).send({ message: 'Verifica una passkey reciente antes de desactivar la recuperación TOTP.' });
    }
    try {
      const result = await disableTotp();
      await audit(request, 'totp.disable');
      reply.header('cache-control', 'no-store');
      return result;
    } catch (error) {
      await audit(request, 'totp.disable', 'failure');
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post<{ Body: { code?: string } }>('/session/recovery/totp/verify', async (request, reply) => {
    const stepToken = getOidcSecondFactorToken(request.headers.cookie);
    const identityId = getOidcSecondFactorIdentity(request.headers.cookie);
    const existingRecoveryId = getRecoverySessionId(request.headers.cookie);
    const code = isRecord(request.body) && typeof request.body.code === 'string' && request.body.code.length <= 16 ? request.body.code : null;
    if (requiredSessionMode() !== 'protected' || (!existingRecoveryId && (!stepToken || !identityId)) || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)
      || (!existingRecoveryId && !code)) {
      return reply.code(403).send({ message: 'La recuperación necesita una verificación OIDC pendiente y un origen permitido.' });
    }
    try {
      if (existingRecoveryId) {
        reply.header('set-cookie', setRecoveryCookie(existingRecoveryId));
        reply.header('cache-control', 'no-store');
        return { recovery: true, resumed: true, scope: 'passkey-registration-only' };
      }
      if (!stepToken || !identityId || !code) return reply.code(403).send({ message: 'La recuperación necesita OIDC y un código TOTP válido.' });
      await verifyTotpRecovery(code);
      if (!consumeOidcSecondFactor(stepToken, identityId)) return reply.code(401).send({ message: 'La verificación OIDC caducó o ya se utilizó.' });
      const recoveryId = createRecoverySession(identityId);
      reply.header('set-cookie', [setRecoveryCookie(recoveryId), clearOidcSecondFactorCookie()]);
      reply.header('cache-control', 'no-store');
      await audit(request, 'totp.recovery');
      return { recovery: true, scope: 'passkey-registration-only' };
    } catch (error) { await audit(request, 'totp.recovery', 'failure'); return sendCaughtApiError(request, reply, error); }
  });

  app.get('/session/recovery/status', async (request, reply) => {
    if (requiredSessionMode() !== 'protected' || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])) {
      return reply.code(403).send({ message: 'El estado de recuperación no está disponible desde este origen.' });
    }
    reply.header('cache-control', 'no-store');
    return { active: !!getRecoverySessionId(request.headers.cookie) };
  });

  app.post('/session/passkeys/reauthentication/options', async (request, reply) => {
    const sessionId = getValidSessionId(request.headers.cookie, 'protected');
    if (requiredSessionMode() !== 'protected' || !sessionId || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)) {
      return reply.code(403).send({ message: 'La reautenticación requiere una sesión protegida y un origen permitido.' });
    }
    try {
      const options = await beginPasskeyReauthentication(sessionId);
      reply.header('cache-control', 'no-store');
      return options;
    } catch (error) {
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post('/session/passkeys/reauthentication/verify', async (request, reply) => {
    const sessionId = getValidSessionId(request.headers.cookie, 'protected');
    if (requiredSessionMode() !== 'protected' || !sessionId || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)) {
      return reply.code(403).send({ message: 'La reautenticación requiere una sesión protegida y un origen permitido.' });
    }
    try {
      const result = await finishPasskeyReauthentication(sessionId, request.body as never);
      await audit(request, 'passkey.reauthentication');
      reply.header('cache-control', 'no-store');
      return result;
    } catch (error) {
      await audit(request, 'passkey.reauthentication', 'failure');
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.put<{ Body: { id?: string; name?: string } }>('/session/passkeys/name', async (request, reply) => {
    if (requiredSessionMode() !== 'protected' || !getValidSessionId(request.headers.cookie, 'protected')
      || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])) {
      return reply.code(403).send({ message: 'Renombrar requiere una sesión protegida y un origen permitido.' });
    }
    if (!hasRecentUserVerification(request.headers.cookie)) return reply.code(428).send({ message: 'Vuelve a verificar una passkey antes de cambiar credenciales.' });
    if (request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)
      || typeof request.body.id !== 'string' || request.body.id.length > 2048
      || typeof request.body.name !== 'string' || request.body.name.length > 64) {
      return reply.code(400).send({ message: 'Indica un ID y un nombre de passkey válidos.' });
    }
    try {
      const passkeys = await renamePasskey(request.body.id, request.body.name, {
        cookie: request.headers.cookie,
        identityId: getSessionIdentity(request.headers.cookie, 'protected'),
      });
      await audit(request, 'passkey.rename');
      reply.header('cache-control', 'no-store');
      return { passkeys: passkeys.map(({ id, name, createdAt, lastUsedAt, deviceType, backedUp }) => ({ id, name, createdAt, lastUsedAt, deviceType, backedUp })) };
    } catch (error) {
      await audit(request, 'passkey.rename', 'failure');
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post<{ Body: { id?: string } }>('/session/passkeys/revoke', async (request, reply) => {
    if (requiredSessionMode() !== 'protected' || !getValidSessionId(request.headers.cookie, 'protected')
      || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])) {
      return reply.code(403).send({ message: 'Revocar requiere una sesión protegida y un origen permitido.' });
    }
    if (!hasRecentUserVerification(request.headers.cookie)) return reply.code(428).send({ message: 'Vuelve a verificar una passkey antes de cambiar credenciales.' });
    if (request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)
      || typeof request.body.id !== 'string' || request.body.id.length > 2048) {
      return reply.code(400).send({ message: 'Indica el ID de una passkey válida.' });
    }
    try {
      const passkeys = await revokePasskey(request.body.id, {
        cookie: request.headers.cookie,
        identityId: getSessionIdentity(request.headers.cookie, 'protected'),
      });
      revokeAllProtectedSessions();
      await audit(request, 'passkey.revoke');
      reply.header('set-cookie', [clearSessionCookie('protected'), clearOidcSecondFactorCookie()]);
      reply.header('cache-control', 'no-store');
      return { passkeys: passkeys.map(({ id, name, createdAt, lastUsedAt, deviceType, backedUp }) => ({ id, name, createdAt, lastUsedAt, deviceType, backedUp })) };
    } catch (error) {
      await audit(request, 'passkey.revoke', 'failure');
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post('/session/passkeys/authentication/options', async (request, reply) => {
    if (requiredSessionMode() !== 'protected' || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)) {
      return reply.code(403).send({ message: 'El inicio de sesión WebAuthn no está permitido en este origen o modo.' });
    }
    const stepToken = getOidcSecondFactorToken(request.headers.cookie);
    if (!stepToken) return reply.code(401).send({ message: 'La verificación OIDC caducó. Vuelve a iniciar sesión.' });
    try {
      const options = await beginPasskeyAuthentication(stepToken);
      reply.header('cache-control', 'no-store');
      return options;
    } catch (error) {
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post('/session/passkeys/authentication/verify', async (request, reply) => {
    if (requiredSessionMode() !== 'protected' || !isExpectedHost(request.headers.host)
      || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)) {
      return reply.code(403).send({ message: 'El inicio de sesión WebAuthn no está permitido en este origen o modo.' });
    }
    const stepToken = getOidcSecondFactorToken(request.headers.cookie);
    const identityId = getOidcSecondFactorIdentity(request.headers.cookie);
    if (!stepToken || !identityId) return reply.code(401).send({ message: 'La verificación OIDC caducó. Vuelve a iniciar sesión.' });
    try {
      const result = await finishPasskeyAuthentication(stepToken, request.body as never);
      if (result.identityId !== identityId || !consumeOidcSecondFactor(stepToken, identityId)) {
        return reply.code(401).send({ message: 'La verificación de identidad caducó o ya se utilizó.' });
      }
      const sessionId = createProtectedSession(identityId);
      reply.header('set-cookie', [setSessionCookie(sessionId), clearOidcSecondFactorCookie()]);
      reply.header('cache-control', 'no-store');
      await audit(request, 'passkey.login');
      return { authenticated: true };
    } catch (error) {
      await audit(request, 'passkey.login', 'failure');
      return sendCaughtApiError(request, reply, error);
    }
  });

  app.post<{ Body: { purpose?: string } }>('/session/oidc/start', async (request, reply) => {
    const mode = requiredSessionMode();
    if (!isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || request.headers['content-type']?.split(';')[0] !== 'application/json' || !isRecord(request.body)) {
      return reply.code(403).send({ message: 'Origen o tipo de petición no permitido.' });
    }
    let purpose: 'link' | 'login';
    let localSessionId: string | undefined;
    if (mode === 'local' && request.body.purpose === 'link') {
      localSessionId = getValidSessionId(request.headers.cookie, 'local') ?? undefined;
      if (!localSessionId) return reply.code(403).send({ message: 'La vinculación inicial requiere una sesión local.' });
      purpose = 'link';
    } else if (mode === 'protected' && request.body.purpose === 'login') {
      if (isValidSession(request.headers.cookie, 'protected') || getOidcSecondFactorIdentity(request.headers.cookie)) {
        return reply.code(409).send({ message: 'Ya hay una sesión o verificación de identidad en curso.' });
      }
      purpose = 'login';
    } else {
      return reply.code(403).send({ message: 'El propósito de autenticación no corresponde al modo activo.' });
    }
    try {
      const authorizationUrl = await beginOidcAuthorization({ purpose, localSessionId });
      reply.header('cache-control', 'no-store');
      return { authorizationUrl };
    } catch (error) {
      const failure = error as Error & { statusCode?: number };
      return reply.code(failure.statusCode ?? 502).send({ message: failure.statusCode ? failure.message : 'No se pudo contactar con el proveedor OIDC.' });
    }
  });

  app.get('/session/oidc/callback', async (request, reply) => {
    reply.header('cache-control', 'no-store');
    reply.header('referrer-policy', 'no-referrer');
    const callback = new URL(request.url, 'http://127.0.0.1');
    const stateValues = callback.searchParams.getAll('state');
    if (!isExpectedHost(request.headers.host) || stateValues.length !== 1 || !stateValues[0]) {
      return reply.code(400).type('text/plain; charset=utf-8').send('No se pudo validar la respuesta de inicio de sesión.');
    }
    const transaction = consumeOidcTransaction(stateValues[0]);
    if (!transaction) return reply.code(400).type('text/plain; charset=utf-8').send('El inicio de sesión caducó o ya se utilizó. Vuelve a intentarlo desde la aplicación.');

    const appUrl = new URL('/', expectedUiOrigin());
    if (callback.searchParams.has('error')) {
      await audit(request, transaction.purpose === 'link' ? 'oidc.link' : 'oidc.login', 'failure');
      appUrl.searchParams.set('auth', 'cancelled');
      return reply.redirect(appUrl.href, 303);
    }
    const codeValues = callback.searchParams.getAll('code');
    if (codeValues.length !== 1 || !codeValues[0] || codeValues[0].length > 4096) {
      return reply.code(400).type('text/plain; charset=utf-8').send('El proveedor no devolvió un código de autorización válido.');
    }
    if (transaction.purpose === 'link') {
      if (requiredSessionMode() !== 'local' || !isSessionIdValid(transaction.localSessionId, 'local')) {
        return reply.code(403).type('text/plain; charset=utf-8').send('La sesión local caducó. Vuelve a la aplicación e inténtalo de nuevo.');
      }
    } else if (requiredSessionMode() !== 'protected') {
      return reply.code(403).type('text/plain; charset=utf-8').send('El modo de autenticación cambió durante el inicio de sesión.');
    }

    try {
      const callbackUrl = new URL(transaction.redirectUri);
      callbackUrl.search = callback.search;
      const identity = await completeOidcAuthorization(transaction, callbackUrl);
      const owner = await bindAuthIdentity(identity.issuer, identity.subject);
      const identityId = `${owner.issuer}\u0000${owner.subject}`;
      await audit(request, transaction.purpose === 'link' ? 'oidc.link' : 'oidc.login');
      if (transaction.purpose === 'link') {
        appUrl.searchParams.set('auth', 'identity-linked');
      } else {
        const step = createOidcSecondFactorStep(identityId);
        appUrl.searchParams.set('auth', 'second-factor');
        appUrl.hash = new URLSearchParams({ 'oidc-step': step }).toString();
      }
      return reply.redirect(appUrl.href, 303);
    } catch (error) {
      await audit(request, transaction.purpose === 'link' ? 'oidc.link' : 'oidc.login', 'failure');
      request.log.warn({ reqId: request.id, name: (error as Error).name }, 'Falló la validación OIDC; se omite el detalle para no registrar datos de identidad.');
      appUrl.searchParams.set('auth', 'failed');
      return reply.redirect(appUrl.href, 303);
    }
  });
};
