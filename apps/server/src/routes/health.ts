import type { FastifyPluginAsync } from 'fastify';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const manifestPath = fileURLToPath(new URL('../../../../package.json', import.meta.url));
const version = (() => {
  try {
    const manifest: unknown = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest && typeof manifest === 'object' && 'version' in manifest && typeof manifest.version === 'string') {
      return manifest.version;
    }
  } catch {
    // El endpoint de salud debe seguir disponible si no se puede leer el manifiesto.
  }
  return 'unknown';
})();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({
    status: 'ok',
    service: 'espacio-visual-local',
    version,
  }));
};
