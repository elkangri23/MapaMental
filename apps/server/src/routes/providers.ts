import type { FastifyPluginAsync } from 'fastify';
import { deleteProviderProfile, getProviderConfiguration, saveProviderProfile, selectProviderProfile, testProviderConnection } from '../services/provider-store.js';
import type { ProviderProfileInput } from '@espacio-visual/domain';
import { isExpectedHost, isExpectedOrigin, isValidSession, requiredSessionMode } from '../services/session.js';

function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function invalid(message: string) { return Object.assign(new Error(message), { statusCode: 400 }); }
function providerId(value: unknown): value is string { return typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value); }

export const providerRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', async (request, reply) => {
    if (!isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client']) || !isValidSession(request.headers.cookie, requiredSessionMode())) {
      return reply.code(403).send({ message: 'La sesión local no es válida. Recarga la aplicación para iniciar una sesión nueva.' });
    }
    if (!['GET', 'HEAD'].includes(request.method) && request.headers['content-type']?.split(';')[0] !== 'application/json') return reply.code(415).send({ message: 'Esta acción requiere una petición JSON.' });
  });

  app.get('/providers', getProviderConfiguration);
  app.post<{ Body: ProviderProfileInput }>('/providers', async (request, reply) => {
    if (!isRecord(request.body) || typeof request.body.kind !== 'string' || typeof request.body.name !== 'string' || typeof request.body.model !== 'string'
      || typeof request.body.baseUrl !== 'string' || request.body.baseUrl.length > 2048
      || (request.body.apiKey !== undefined && typeof request.body.apiKey !== 'string')
      || (request.body.clearCredential !== undefined && typeof request.body.clearCredential !== 'boolean')) throw invalid('Los datos del proveedor no son válidos.');
    return reply.code(200).send({ profile: await saveProviderProfile(request.body as ProviderProfileInput) });
  });
  app.delete<{ Params: { id: string } }>('/providers/:id', async (request) => {
    if (!providerId(request.params.id)) throw invalid('Identificador de proveedor no válido.');
    await deleteProviderProfile(request.params.id); return { deleted: true };
  });
  app.put<{ Body: { id: string | null } }>('/providers/active', async (request) => {
    if (!isRecord(request.body) || request.body.id !== null && !providerId(request.body.id)) throw invalid('El proveedor activo no es válido.');
    return selectProviderProfile(request.body.id as string | null);
  });
  app.post<{ Params: { id: string } }>('/providers/:id/test', async (request) => {
    if (!providerId(request.params.id)) throw invalid('Identificador de proveedor no válido.');
    return testProviderConnection(request.params.id);
  });
};
