import type { FastifyPluginAsync } from 'fastify';
import { createProject, getFutureProjectPreview, getProject, listProjects, listRecoverableBackups, restoreProjectBackup, saveProject } from '../services/project-store.js';
import { isExpectedHost, isExpectedOrigin, isValidSession, requiredSessionMode } from '../services/session.js';

function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function invalid(message: string) { return Object.assign(new Error(message), { statusCode: 400 }); }
function projectId(value: unknown): value is string { return typeof value === 'string' && /^[a-f0-9-]{36}$/i.test(value); }

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', async (request, reply) => {
    if (!isExpectedHost(request.headers.host) || !isExpectedOrigin(request.headers.origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client']) || !isValidSession(request.headers.cookie, requiredSessionMode())) {
      return reply.code(403).send({ message: 'La sesión local no es válida. Recarga la aplicación para iniciar una sesión nueva.' });
    }
    if (!['GET', 'HEAD'].includes(request.method) && request.headers['content-type']?.split(';')[0] !== 'application/json') {
      return reply.code(415).send({ message: 'Esta acción requiere una petición JSON.' });
    }
  });

  app.get('/projects', async () => ({ projects: await listProjects() }));
  app.post<{ Body: { name?: string; project?: Parameters<typeof createProject>[0]['project'] } }>('/projects', async (request, reply) => {
    if (!isRecord(request.body)) throw invalid('El cuerpo de creación del proyecto no es válido.');
    if (request.body.name !== undefined && (typeof request.body.name !== 'string' || request.body.name.length > 300)) throw invalid('El nombre del proyecto debe tener como máximo 300 caracteres.');
    const project = await createProject(request.body as Parameters<typeof createProject>[0]);
    return reply.code(201).send({ project });
  });
  app.get<{ Params: { id: string } }>('/projects/:id', async (request) => {
    if (!projectId(request.params.id)) throw invalid('Identificador de proyecto no válido.');
    try { return { project: await getProject(request.params.id) }; }
    catch (error) {
      if ((error as { code?: string }).code === 'PROJECT_FUTURE_SCHEMA') {
        const readOnlyProject = await getFutureProjectPreview(request.params.id);
        if (readOnlyProject) return { readOnlyProject };
      }
      throw error;
    }
  });
  app.put<{ Params: { id: string }; Body: { expectedRevision?: number; project?: Parameters<typeof saveProject>[1]['project'] } }>('/projects/:id', async (request) => {
    if (!projectId(request.params.id) || !isRecord(request.body) || !Number.isInteger(request.body.expectedRevision) || !isRecord(request.body.project)) throw invalid('El documento o la revisión del proyecto no son válidos.');
    return { project: await saveProject(request.params.id, { expectedRevision: request.body.expectedRevision, project: request.body.project }) };
  });
  app.get<{ Params: { id: string } }>('/projects/:id/backups', async (request) => {
    if (!projectId(request.params.id)) throw invalid('Identificador de proyecto no válido.');
    return { backups: await listRecoverableBackups(request.params.id) };
  });
  app.post<{ Params: { id: string }; Body: { file: string; expectedRevision: number } }>('/projects/:id/restore', async (request) => {
    if (!projectId(request.params.id) || !isRecord(request.body) || typeof request.body.file !== 'string' || request.body.file.length > 180 || !Number.isInteger(request.body.expectedRevision)) throw invalid('Los datos de restauración no son válidos.');
    return { project: await restoreProjectBackup(request.params.id, request.body.file, request.body.expectedRevision as number) };
  });
};
