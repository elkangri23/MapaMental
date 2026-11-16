import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { healthRoutes } from './routes/health.js';
import { projectRoutes } from './routes/projects.js';
import { providerRoutes } from './routes/providers.js';
import { aiRoutes } from './routes/ai.js';
import { sessionRoutes } from './routes/session.js';
import { requiredSessionMode } from './services/session.js';
import { pruneSecurityEvents, recordSecurityEvent } from './services/security-audit.js';

requiredSessionMode();

const app = Fastify({
  bodyLimit: 8 * 1024 * 1024,
  routerOptions: { maxParamLength: 128 },
  requestTimeout: 30_000,
  connectionTimeout: 10_000,
  logger: {
    redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers.x-api-key'],
    serializers: {
      req: (request) => ({
        method: request.method,
        url: typeof request.url === 'string' ? request.url.split('?', 1)[0] : '',
        hostname: request.hostname,
        remoteAddress: request.ip,
        remotePort: request.socket?.remotePort,
      }),
    },
  },
});

app.setErrorHandler((error, request, reply) => {
  const failure = error as Error & { statusCode?: number; code?: string };
  const statusCode = Number.isInteger(failure.statusCode) && failure.statusCode! >= 400 && failure.statusCode! < 600 ? failure.statusCode! : 500;
  if (statusCode >= 500) request.log.error({ reqId: request.id, code: failure.code, name: failure.name }, 'Error de petición; detalle omitido para no registrar datos del proyecto.');
  const message = statusCode >= 500
    ? 'No se pudo completar la petición. Revisa el estado del servicio e inténtalo de nuevo.'
    : failure.message;
  return reply.code(statusCode).send({ message });
});

app.addHook('onSend', async (_request, reply, payload) => {
  reply.header('referrer-policy', 'no-referrer');
  reply.header('x-content-type-options', 'nosniff');
  reply.header('x-frame-options', 'DENY');
  reply.header('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  reply.header('cross-origin-resource-policy', 'same-origin');
  reply.header('cross-origin-opener-policy', 'same-origin');
  if (process.env.NODE_ENV === 'production') {
    reply.header('content-security-policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'");
  }
  return payload;
});

await app.register(healthRoutes, { prefix: '/api' });
await app.register(sessionRoutes, { prefix: '/api' });
await app.register(projectRoutes, { prefix: '/api' });
await app.register(providerRoutes, { prefix: '/api' });
await app.register(aiRoutes, { prefix: '/api' });

if (!await pruneSecurityEvents()) app.log.warn('No se pudo depurar el registro local de eventos de seguridad.');
if (!await recordSecurityEvent('service.start', 'success', 'service-start')) app.log.warn('No se pudo registrar el inicio del servicio en el registro de seguridad.');
const securityAuditPruneTimer = setInterval(() => {
  void pruneSecurityEvents().then((pruned) => { if (!pruned) app.log.warn('No se pudo aplicar la retención del registro de seguridad.'); });
}, 24 * 60 * 60 * 1000);
securityAuditPruneTimer.unref();

if (process.env.NODE_ENV === 'production') {
  const webDist = resolve(dirname(fileURLToPath(import.meta.url)), '../../web/dist');
  if (!existsSync(resolve(webDist, 'index.html'))) throw new Error(`No se encontró la interfaz compilada en ${webDist}`);
  await app.register(async (webApp) => {
    await webApp.register(fastifyStatic, { root: webDist, wildcard: false, index: ['index.html'] });
    webApp.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api/')) return reply.code(404).send({ message: 'Ruta API no encontrada.' });
      if (!request.headers.accept?.includes('text/html') || /\.[a-z0-9]{2,8}(?:\?|$)/i.test(request.url)) {
        return reply.code(404).send({ message: 'Recurso no encontrado.' });
      }
      reply.header('referrer-policy', 'same-origin');
      reply.header('cache-control', 'no-store');
      return reply.type('text/html').sendFile('index.html', { maxAge: 0, immutable: false });
    });
  });
}

const port = Number(process.env.MYMAP_LOCAL_PORT ?? 3180);
await app.listen({ host: '::1', port });

app.log.info(`Servicio local disponible en http://[::1]:${port}`);

const close = async () => {
  await app.close();
  process.exit(0);
};

process.once('SIGINT', close);
process.once('SIGTERM', close);
