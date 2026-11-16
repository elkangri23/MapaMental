# ADR-0015: Formato persistido de proyectos v3

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Relacionado:** [ADR-0003](ADR-0003-proyecto-json-y-copias.md), [ADR-0004](ADR-0004-mapa-y-presentacion-enlazados.md)

## Contexto

La especificación describía un modelo conceptual de mapa y diapositivas, mientras que `ProjectDocument` ya define y valida el archivo JSON v3. En el diseño faltaba decir que `chat`, `parentId` y `slides[].blocks` eran conceptos y no nombres/campos del formato serializado. Tratar esa diferencia de nomenclatura como migración de datos supondría riesgo sin aportar valor al flujo actual.

## Decisión

- El contrato persistido v3 de `packages/domain/src/project.ts` es la fuente canónica para leer y escribir `project.json` y las copias. La UI puede derivar vistas conceptuales, pero no cambia nombres/campos persistidos sin una nueva versión de esquema y migración.
- La raíz del documento contiene `id`, `name`, `schemaVersion`, `revision`, `createdAt`, `updatedAt`, `map`, `presentation`, `conversation`, `suggestions`, `lastAiUndo` y los inversos de diapositiva/presentación opcionales.
- `map.nodes` utiliza objetos de nodo de React Flow con `id`, `position` y `data.label` (con `tone` opcional); `map.edges` utiliza `id`, `source` y `target`. La jerarquía conceptual se representa mediante las aristas; no se persiste `parentId`.
- `presentation.slides` es una lista ordenada de `PresentationSlide`: `id`, `title`, `subtitle`, `body`, `bullets`, `sourceNodeIds` y, opcionalmente, `diagramSteps`, `mockFields` y `table`. Los bloques conceptuales de texto, lista, recorrido, formulario ficticio y tabla se serializan en esos campos y no en un `blocks[]`.
- El historial del chat se serializa como `conversation`, una lista acotada de `{role, content}`. Los datos de proveedores/secretos permanecen fuera del proyecto.
- El esquema v3 no cambia en este ADR; las migraciones existentes siguen siendo la vía para modificar el formato persistido.

## Alternativas

- **Migrar a `chat`, `parentId`, aristas `sourceId/targetId` y `slides[].blocks`:** añadiría una migración y coordinación de todos los consumidores sin cambiar el comportamiento visible; se descarta para v1.
- **Mantener dos contratos persistidos intercambiables:** haría ambiguas las validaciones, copias y migraciones; se descarta.

## Consecuencias

El diseño puede hablar de conceptos de producto sin sugerir que esos nombres se almacenan literalmente. Cualquier cambio a la estructura JSON futura necesita una nueva versión, validador y migración con copia previa verificada. La estructura React Flow de v3 queda acoplada al archivo, mitigado por el contrato y las migraciones explícitas.
