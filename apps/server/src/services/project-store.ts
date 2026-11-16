import { constants } from 'node:fs';
import { copyFile, mkdir, open, readFile, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execFile } from 'node:child_process';
import { isDeepStrictEqual, promisify } from 'node:util';
import { migrateProjectDocument, PROJECT_SCHEMA_VERSION, summarizeProject, validateProject, type FutureProjectPreview, type ProjectDocument } from '@espacio-visual/domain';

const root = resolve(process.env.ESPACIO_VISUAL_PROJECTS_DIR ?? join(homedir(), 'Documents', 'EspacioVisual', 'Proyectos'));
const execFileAsync = promisify(execFile);
const backupLimit = 20;
const projectMutationQueues = new Map<string, Promise<unknown>>();

/** Fail closed on Windows unless the resolved storage volume is fixed and local. */
export async function validateProjectStorageRoot() {
  if (process.platform !== 'win32') return;
  if (root.startsWith('\\\\')) throw Object.assign(new Error('La carpeta de proyectos no puede estar en una ruta UNC o de red.'), { code: 'PROJECT_STORAGE_VOLUME_INVALID' });

  const probe = `
$ErrorActionPreference = 'Stop'
try {
  $probePath = $env:ESPACIO_VISUAL_VOLUME_PATH
  while (!(Test-Path -LiteralPath $probePath)) {
    $parentPath = Split-Path -Parent $probePath
    if (!$parentPath -or $parentPath -eq $probePath) { throw 'No existe un directorio padre accesible.' }
    $probePath = $parentPath
  }
  $volumes = @(Get-Volume -FilePath $probePath -ErrorAction Stop)
  if ($volumes.Count -ne 1 -or $volumes[0].DriveType -ne 'Fixed') { [Console]::Out.Write('REJECTED'); exit 0 }
  $partitions = @(Get-Partition -Volume $volumes[0] -ErrorAction Stop)
  if ($partitions.Count -eq 0) { throw 'No se pudo asociar el volumen a un disco local.' }
  $disks = @($partitions | ForEach-Object { Get-Disk -Number $_.DiskNumber -ErrorAction Stop } | Sort-Object Number -Unique)
  $localBusTypes = @('SCSI', 'ATAPI', 'ATA', 'RAID', 'SAS', 'SATA', 'Virtual', 'File Backed Virtual', 'Spaces', 'NVMe', 'SCM')
  if ($disks.Count -eq 0 -or @($disks | Where-Object { $localBusTypes -notcontains $_.BusType }).Count -gt 0) {
    [Console]::Out.Write('REJECTED'); exit 0
  }
  [Console]::Out.Write('FIXED')
  exit 0
} catch {
  [Console]::Error.Write('No se pudo comprobar el volumen de proyectos.')
  exit 1
}`;
  let stdout: string;
  try {
    ({ stdout } = await execFileAsync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', probe], {
      windowsHide: true,
      timeout: 15_000,
      maxBuffer: 64 * 1024,
      env: { ...process.env, ESPACIO_VISUAL_VOLUME_PATH: root },
    }));
  } catch {
    throw Object.assign(new Error('No se pudo comprobar que la carpeta de proyectos esté en un volumen local fijo.'), { code: 'PROJECT_STORAGE_VOLUME_INVALID' });
  }
  if (stdout.trim() !== 'FIXED') throw Object.assign(new Error('La carpeta de proyectos debe estar en un volumen local fijo; no se admiten unidades de red, extraíbles ni desconocidas.'), { code: 'PROJECT_STORAGE_VOLUME_INVALID' });
}

function serializeProjectMutation<T>(id: string, action: () => Promise<T>): Promise<T> {
  const previous = projectMutationQueues.get(id) ?? Promise.resolve();
  const operation = previous.catch(() => undefined).then(action);
  projectMutationQueues.set(id, operation);
  return operation.finally(() => {
    if (projectMutationQueues.get(id) === operation) projectMutationQueues.delete(id);
  });
}

function projectDirectory(id: string) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw Object.assign(new Error('Identificador de proyecto no válido.'), { statusCode: 400 });
  return join(root, id);
}

async function readProject(id: string): Promise<ProjectDocument> {
  const file = join(projectDirectory(id), 'project.json');
  let parsed: unknown;
  try { parsed = JSON.parse(await readFile(file, 'utf8')); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw Object.assign(new Error('No existe ese proyecto.'), { statusCode: 404 });
    throw Object.assign(new Error('El archivo principal no se puede leer; revisa si hay copias recuperables.'), { statusCode: 409, code: 'PROJECT_CORRUPT' });
  }
  if (!validateProject(parsed)) {
    if (parsed && typeof parsed === 'object' && Number((parsed as { schemaVersion?: unknown }).schemaVersion) > PROJECT_SCHEMA_VERSION) {
      throw Object.assign(new Error('Este proyecto usa una versión más nueva de Espacio Visual y esta versión no puede editarlo.'), { statusCode: 409, code: 'PROJECT_FUTURE_SCHEMA' });
    }
    const migrated = migrateProjectDocument(parsed);
    if (!migrated || migrated.id !== id) throw Object.assign(new Error('El proyecto está dañado o usa una versión incompatible.'), { statusCode: 409, code: 'PROJECT_CORRUPT' });
    const backupDirectory = join(projectDirectory(id), 'backups');
    await mkdir(backupDirectory, { recursive: true });
    const backup = join(backupDirectory, `pre-migration-${Date.now()}-${crypto.randomUUID()}.json`);
    await copyFile(file, backup, constants.COPYFILE_EXCL);
    const original = await readFile(file);
    const copied = await readFile(backup);
    if (!original.equals(copied)) { await rm(backup, { force: true }); throw new Error('No se pudo verificar la copia previa a migración.'); }
    migrated.updatedAt = new Date().toISOString();
    await durableWrite(file, JSON.stringify(migrated, null, 2));
    await pruneProjectBackups(backupDirectory, id).catch(() => undefined);
    return migrated;
  }
  if (parsed.id !== id) throw Object.assign(new Error('El ID del documento no coincide con su carpeta.'), { statusCode: 409 });
  return parsed;
}

async function readFutureProjectPreviewUnlocked(id: string): Promise<FutureProjectPreview | null> {
  let raw: unknown;
  try { raw = JSON.parse(await readFile(join(projectDirectory(id), 'project.json'), 'utf8')); }
  catch { return null; }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  const version = Number(value.schemaVersion);
  if (!Number.isInteger(version) || version <= PROJECT_SCHEMA_VERSION || value.id !== id) return null;
  const metadata = {
    id,
    name: typeof value.name === 'string' && value.name.length <= 300 ? value.name : 'Proyecto de versión futura',
    schemaVersion: version,
    revision: Number.isSafeInteger(value.revision) && Number(value.revision) >= 0 ? Number(value.revision) : 0,
    updatedAt: typeof value.updatedAt === 'string' && value.updatedAt.length <= 40 ? value.updatedAt : new Date(0).toISOString(),
  };
  const map = value.map && typeof value.map === 'object' && !Array.isArray(value.map) ? value.map as Record<string, unknown> : null;
  const presentation = value.presentation && typeof value.presentation === 'object' && !Array.isArray(value.presentation) ? value.presentation as Record<string, unknown> : null;
  if (!map || !Array.isArray(map.nodes) || !Array.isArray(map.edges) || !presentation || !Array.isArray(presentation.slides)
    || !Array.isArray(value.conversation) || !Array.isArray(value.suggestions)) return { ...metadata, project: null };
  const rawNodes = Array.isArray(map?.nodes) ? map.nodes : [];
  if (rawNodes.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) return { ...metadata, project: null };
  const nodes = rawNodes.map((item) => {
    const node = item as Record<string, unknown>;
    const position = node.position && typeof node.position === 'object' && !Array.isArray(node.position) ? node.position as Record<string, unknown> : null;
    const data = node.data && typeof node.data === 'object' && !Array.isArray(node.data) ? node.data as Record<string, unknown> : null;
    if (!position || !data) return null;
    return { id: node.id, type: node.type, position: { x: position.x, y: position.y }, data: { label: data.label, tone: data.tone } };
  });
  if (nodes.some((node) => node === null)) return { ...metadata, project: null };
  const rawEdges = Array.isArray(map?.edges) ? map.edges : [];
  if (rawEdges.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) return { ...metadata, project: null };
  const edges = rawEdges.map((item) => {
    const edge = item as Record<string, unknown>;
    return { id: edge.id, source: edge.source, target: edge.target, type: edge.type, label: edge.label };
  });
  const rawSlides = Array.isArray(presentation?.slides) ? presentation.slides : [];
  if (rawSlides.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) return { ...metadata, project: null };
  const slides = rawSlides.map((item) => {
    const slide = item as Record<string, unknown>;
    return { id: slide.id, title: slide.title, subtitle: slide.subtitle, body: slide.body, bullets: slide.bullets,
      sourceNodeIds: slide.sourceNodeIds, diagramSteps: slide.diagramSteps, mockFields: slide.mockFields, table: slide.table };
  });
  const projection = {
    ...metadata,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : '',
    map: { nodes, edges },
    presentation: { slides },
    conversation: Array.isArray(value.conversation) ? value.conversation : [],
    suggestions: Array.isArray(value.suggestions) ? value.suggestions : [],
    lastAiUndo: null,
    lastAiSlideUndo: null,
    lastAiDeckUndo: null,
  };
  const project = validateProject(projection) ? { ...projection, schemaVersion: version } as ProjectDocument : null;
  return { ...metadata, project };
}

async function durableWrite(file: string, content: string) {
  await mkdir(dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await writeFile(temp, content, { encoding: 'utf8', flag: 'wx' });
    const handle = await open(temp, 'r+');
    try { await handle.sync(); } finally { await handle.close(); }
    const check = JSON.parse(await readFile(temp, 'utf8'));
    if (!validateProject(check)) throw new Error('La validación del archivo temporal falló.');
    await rename(temp, file);
  } catch (error) {
    await rm(temp, { force: true }).catch(() => undefined);
    throw error;
  }
}

async function pruneProjectBackups(backupDirectory: string, id: string) {
  const backupNames = (await readdir(backupDirectory)).filter((name) => name.endsWith('.json'));
  const dated = (await Promise.all(backupNames.map(async (name) => {
    try {
      const content = JSON.parse(await readFile(join(backupDirectory, name), 'utf8')) as unknown;
      const valid = validateProject(content) ? content : migrateProjectDocument(content);
      if (!valid || valid.id !== id) return null;
      return { name, time: (await stat(join(backupDirectory, name))).mtimeMs };
    } catch { return null; }
  }))).filter((item): item is { name: string; time: number } => item !== null);
  dated.sort((a, b) => b.time - a.time);
  await Promise.all(dated.slice(backupLimit).map(({ name }) => rm(join(backupDirectory, name), { force: true })));
}

export async function listProjects() {
  await mkdir(root, { recursive: true });
  const entries = await readdir(root, { withFileTypes: true });
  const projects: ReturnType<typeof summarizeProject>[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    try { projects.push(summarizeProject(await serializeProjectMutation(entry.name, () => readProject(entry.name)))); }
    catch (error) {
      if (/^[a-f0-9-]{36}$/i.test(entry.name)) {
        const info = await stat(join(root, entry.name));
        const isFuture = (error as { code?: string }).code === 'PROJECT_FUTURE_SCHEMA';
        const future = isFuture ? await readFutureProjectPreviewUnlocked(entry.name) : null;
        projects.push(future
          ? { id: future.id, name: future.name, revision: future.revision, updatedAt: future.updatedAt, readOnly: true, schemaVersion: future.schemaVersion }
          : { id: entry.name, name: isFuture ? 'Proyecto de versión más nueva · incompatible' : 'Proyecto dañado · recuperar copia', revision: 0, updatedAt: info.mtime.toISOString(), ...(isFuture ? { readOnly: true } : {}) });
      }
    }
  }
  return projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string) {
  // Reading a legacy project may migrate and replace its file. Keep that write
  // in the same per-project queue as saves/restores so it cannot race them.
  return serializeProjectMutation(id, () => readProject(id));
}

export function getFutureProjectPreview(id: string) {
  return serializeProjectMutation(id, () => readFutureProjectPreviewUnlocked(id));
}

export async function createProject(input: { name?: string; project?: ProjectDocument }) {
  await mkdir(root, { recursive: true });
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const initialProject = input.project ? (validateProject(input.project) ? input.project : migrateProjectDocument(input.project)) : undefined;
  if (input.project && !initialProject) throw Object.assign(new Error('El contenido inicial del proyecto no es válido.'), { statusCode: 400 });
  const project: ProjectDocument = input.project
    ? { ...initialProject!, id, name: input.name?.trim() || initialProject!.name || 'Proyecto sin título', schemaVersion: PROJECT_SCHEMA_VERSION, revision: 1, createdAt: now, updatedAt: now, lastAiUndo: null, lastAiSlideUndo: null, lastAiDeckUndo: null }
    : {
        id, name: input.name?.trim() || 'Proyecto sin título', schemaVersion: PROJECT_SCHEMA_VERSION, revision: 1,
        createdAt: now, updatedAt: now,
        map: { nodes: [], edges: [] }, presentation: { slides: [] }, conversation: [], suggestions: [], lastAiUndo: null,
      };
  await durableWrite(join(projectDirectory(id), 'project.json'), JSON.stringify(project, null, 2));
  return project;
}

export async function listRecoverableBackups(id: string) {
  const backupDirectory = join(projectDirectory(id), 'backups');
  try {
    const current = JSON.parse(await readFile(join(projectDirectory(id), 'project.json'), 'utf8')) as { schemaVersion?: unknown };
    if (Number(current?.schemaVersion) > PROJECT_SCHEMA_VERSION) return [];
  } catch { /* Missing or corrupt current documents can still be recovered from a valid backup. */ }
  let names: string[];
  try { names = await readdir(backupDirectory); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
  const backups: Array<{ file: string; revision: number; updatedAt: string }> = [];
  for (const name of names.filter((item) => item.endsWith('.json'))) {
    try {
      const content = JSON.parse(await readFile(join(backupDirectory, name), 'utf8'));
      const project = validateProject(content) ? content : migrateProjectDocument(content);
      if (project && project.id === id) backups.push({ file: name, revision: project.revision, updatedAt: project.updatedAt });
    } catch { /* Corrupt backups are excluded from the recovery list. */ }
  }
  return backups.sort((a, b) => b.revision - a.revision);
}

async function restoreProjectBackupUnlocked(id: string, fileName: string, expectedRevision: number) {
  if (!fileName.endsWith('.json') || fileName.includes('/') || fileName.includes('\\')) throw Object.assign(new Error('Nombre de copia no válido.'), { statusCode: 400 });
  let current: ProjectDocument | null = null;
  try { current = await readProject(id); }
  catch (error) {
    const failure = error as { code?: string; statusCode?: number };
    if ((failure.code !== 'PROJECT_CORRUPT' && failure.statusCode !== 404) || expectedRevision !== 0) throw error;
  }
  if (current && current.revision !== expectedRevision) throw Object.assign(new Error('El proyecto cambió desde que se abrió. Recárgalo antes de restaurar.'), { statusCode: 409 });
  const backupPath = join(projectDirectory(id), 'backups', fileName);
  const backupContent = JSON.parse(await readFile(backupPath, 'utf8')) as unknown;
  const backup = validateProject(backupContent) ? backupContent : migrateProjectDocument(backupContent);
  if (!backup || backup.id !== id) throw Object.assign(new Error('La copia no es válida para este proyecto.'), { statusCode: 400 });
  const next = { ...backup, revision: (current?.revision ?? backup.revision) + 1, createdAt: current?.createdAt ?? backup.createdAt, updatedAt: new Date().toISOString(), lastAiUndo: null, lastAiSlideUndo: null, lastAiDeckUndo: null };
  const directory = projectDirectory(id);
  if (current) {
    const currentCopy = join(directory, 'backups', `${current.revision}-${current.updatedAt.replace(/[:.]/g, '-')}-before-restore-${crypto.randomUUID()}.json`);
    await copyFile(join(directory, 'project.json'), currentCopy, constants.COPYFILE_EXCL);
    try {
      const verify = JSON.parse(await readFile(currentCopy, 'utf8'));
      if (!validateProject(verify) || verify.revision !== current.revision) throw new Error('La copia previa a restauración no es válida.');
    } catch (error) { await rm(currentCopy, { force: true }).catch(() => undefined); throw error; }
  } else {
    await mkdir(join(directory, 'backups'), { recursive: true });
    try {
      const damagedCopy = join(directory, 'backups', `project-corrupt-${Date.now()}.json.invalid`);
      await copyFile(join(directory, 'project.json'), damagedCopy, constants.COPYFILE_EXCL);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  await durableWrite(join(directory, 'project.json'), JSON.stringify(next, null, 2));
  await pruneProjectBackups(join(directory, 'backups'), id).catch(() => undefined);
  return next;
}

export function restoreProjectBackup(id: string, fileName: string, expectedRevision: number) {
  return serializeProjectMutation(id, () => restoreProjectBackupUnlocked(id, fileName, expectedRevision));
}

type SaveProjectInput = {
  expectedRevision?: number;
  project?: ProjectDocument;
  preserveAiUndo?: boolean;
  preserveAiSlideUndo?: boolean;
  preserveAiDeckUndo?: boolean;
  onValidated?: () => void;
};

async function saveProjectUnlocked(id: string, input: SaveProjectInput) {
  const current = await readProject(id);
  if (input.expectedRevision !== current.revision) throw Object.assign(new Error('El proyecto cambió desde que lo abriste. Recárgalo antes de guardar.'), { statusCode: 409 });
  if (!input.project || input.project.id !== id) throw Object.assign(new Error('El documento del proyecto no es válido.'), { statusCode: 400 });
  const candidate: ProjectDocument = { ...input.project, lastAiUndo: null, lastAiSlideUndo: null, lastAiDeckUndo: null };
  if (input.preserveAiUndo) candidate.lastAiUndo = input.project.lastAiUndo;
  if (input.preserveAiSlideUndo) candidate.lastAiSlideUndo = input.project.lastAiSlideUndo;
  if (input.preserveAiDeckUndo) candidate.lastAiDeckUndo = input.project.lastAiDeckUndo;
  if (!validateProject(candidate)) throw Object.assign(new Error('El documento del proyecto no es válido.'), { statusCode: 400 });
  const conversationOnly = !input.preserveAiUndo && !input.preserveAiSlideUndo && !input.preserveAiDeckUndo
    && candidate.name === current.name && isDeepStrictEqual(candidate.map, current.map)
    && isDeepStrictEqual(candidate.presentation, current.presentation)
    && isDeepStrictEqual(candidate.suggestions, current.suggestions)
    && !isDeepStrictEqual(candidate.conversation, current.conversation);
  const nextRevision = current.revision + 1;
  const next: ProjectDocument = {
    ...candidate,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    revision: nextRevision,
    createdAt: current.createdAt,
    updatedAt: new Date().toISOString(),
    // Reuse only the server's inverse when the canvas is unchanged.
    lastAiUndo: conversationOnly && current.lastAiUndo
      ? { ...current.lastAiUndo, appliedAtRevision: nextRevision }
      : input.preserveAiUndo && input.project.lastAiUndo?.appliedAtRevision === nextRevision ? input.project.lastAiUndo : null,
    lastAiSlideUndo: conversationOnly && current.lastAiSlideUndo
      ? { ...current.lastAiSlideUndo, appliedAtRevision: nextRevision }
      : input.preserveAiSlideUndo && input.project.lastAiSlideUndo?.appliedAtRevision === nextRevision ? input.project.lastAiSlideUndo : null,
    lastAiDeckUndo: conversationOnly && current.lastAiDeckUndo
      ? { ...current.lastAiDeckUndo, appliedAtRevision: nextRevision }
      : input.preserveAiDeckUndo && input.project.lastAiDeckUndo?.appliedAtRevision === nextRevision ? input.project.lastAiDeckUndo : null,
  };
  if (!validateProject(next)) throw Object.assign(new Error('El documento actualizado del proyecto no es válido.'), { statusCode: 400 });
  input.onValidated?.();
  const directory = projectDirectory(id);
  const file = join(directory, 'project.json');
  const backupDirectory = join(directory, 'backups');
  await mkdir(backupDirectory, { recursive: true });
  let backup = join(backupDirectory, `${current.revision}-${current.updatedAt.replace(/[:.]/g, '-')}.json`);
  let createdBackup = false;
  try {
    await copyFile(file, backup, constants.COPYFILE_EXCL);
    createdBackup = true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    const [source, existing] = await Promise.all([readFile(file), readFile(backup)]);
    if (!source.equals(existing)) {
      backup = join(backupDirectory, `${current.revision}-${current.updatedAt.replace(/[:.]/g, '-')}-${crypto.randomUUID()}.json`);
      await copyFile(file, backup, constants.COPYFILE_EXCL);
      createdBackup = true;
    }
  }
  try {
    const verifyBackup = JSON.parse(await readFile(backup, 'utf8'));
    if (!validateProject(verifyBackup) || verifyBackup.revision !== current.revision) throw new Error('La copia previa no pasó la verificación.');
  } catch (error) {
    if (createdBackup) await rm(backup, { force: true }).catch(() => undefined);
    throw error;
  }
  // Keep the verified snapshot if the atomic replacement fails. A retry at
  // the same revision reuses it when it still matches the current file.
  await durableWrite(file, JSON.stringify(next, null, 2));
  // Backup pruning is maintenance after the project commit. Its failure must
  // not turn a successful save into an apparent error and stale retry.
  // Maintenance after commit must not turn a successful save into an apparent error.
  await pruneProjectBackups(backupDirectory, id).catch(() => undefined);
  return next;
}

export function saveProject(id: string, input: SaveProjectInput) {
  return serializeProjectMutation(id, () => saveProjectUnlocked(id, input));
}
