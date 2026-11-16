import type { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { isExpectedHost, isExpectedOrigin, isValidSession, requiredSessionMode } from '../services/session.js';

const profilePath = join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), 'EspacioVisual', 'profile.json');

function parseProfile(value: unknown) {
  if (!value || typeof value !== 'object' || !('name' in value) || !('email' in value)
    || typeof value.name !== 'string' || typeof value.email !== 'string') return null;
  const name = value.name.trim();
  const email = value.email.trim();
  if (name.length > 120 || /[\p{Cc}]/u.test(name)
    || email.length > 254 || (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(email))
    || /[\p{Cc}]/u.test(email)) return null;
  return { name, email };
}

export const profileRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', async (request, reply) => {
    reply.header('cache-control', 'no-store');
    const { host, origin, cookie } = request.headers;
    if (!isExpectedHost(host)
      || !isExpectedOrigin(origin, request.headers['sec-fetch-site'], request.headers['x-espacio-visual-client'])
      || !isValidSession(cookie, requiredSessionMode())) {
      return reply.code(403).send({ message: 'Necesitas una sesión válida para acceder al perfil.' });
    }
    if (request.method === 'PUT' && request.headers['content-type']?.split(';')[0] !== 'application/json') {
      return reply.code(415).send({ message: 'El perfil requiere una petición JSON.' });
    }
  });

  app.get('/profile', async () => {
    let raw: string;
    try {
      raw = await readFile(profilePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { profile: { name: '', email: '' } };
      throw error;
    }
    const profile = parseProfile(JSON.parse(raw));
    if (!profile) throw new Error('El archivo de perfil no tiene un formato válido.');
    return { profile };
  });

  app.put('/profile', { bodyLimit: 4096 }, async (request, reply) => {
    const profile = parseProfile(request.body);
    if (!profile) return reply.code(400).send({ message: 'Revisa el nombre y el correo antes de guardar.' });
    const temporaryPath = profilePath + '.' + randomUUID() + '.tmp';
    await mkdir(dirname(profilePath), { recursive: true });
    try {
      await writeFile(temporaryPath, JSON.stringify(profile), { flag: 'wx', mode: 0o600 });
      await rename(temporaryPath, profilePath);
    } finally {
      await rm(temporaryPath, { force: true }).catch(() => undefined);
    }
    return { profile };
  });
};
