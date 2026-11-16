# Desarrollo

## Entorno

- Windows 10/11 x64 para la primera entrega.
- Node.js 24 LTS y npm compatible.
- Ollama o LM Studio serán opcionales para las primeras tareas de UI y servicio; necesarios solo al implementar generación local.

La máquina de trabajo tiene Node.js 18.20.8, que no satisface el requisito actual de Vite. Para este workspace se instaló un Node 24.22.2 portátil dentro de `.tools`; no se instala en el sistema ni se añade a Git. El instalador final incluirá su propio runtime.

## Workspace

El proyecto usa npm workspaces: `apps/web` para React/Vite, `apps/server` para Fastify y `packages/domain` para tipos y operaciones compartidas. El dominio compila primero a `packages/domain/dist`; web y servicio importan su JavaScript y declaraciones TypeScript. `npm run dev` compila el dominio antes de iniciar ambos procesos, y `npm run build` compila dominio, servicio y web en ese orden. Las dependencias raíz se instalaron con Node 24 portátil. En desarrollo, el servicio permite un bootstrap de nonce limitado al origen de Vite (`http://127.0.0.1:5173` por defecto); el proxy conserva orígenes ajenos y completa el origen solo cuando la petición same-origin llega sin él. El build de producción ya se compiló; falta iniciar la app y recorrer el flujo en navegador:

```powershell
npm install
npm run dev
```

## Regla de cierre

Antes de cerrar una tarea, actualizar `docs/TASKS.md`, `docs/STATUS.md` y las guías que hayan cambiado. El progreso y los documentos no deben afirmar que una función está comprobada sin haberla recorrido en el producto.

