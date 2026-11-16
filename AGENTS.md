# Instrucciones del proyecto

## Fuente de verdad

- `docs/designs/espacio-visual-personal.md` define el comportamiento aprobado del producto.
- `docs/decisions/` conserva el contexto y las consecuencias de las decisiones de arquitectura.
- `docs/TASKS.md` es la única lista detallada de tareas y estados.
- `docs/ROADMAP.md` organiza hitos y enlaza tareas; no dupliques allí la lista de trabajo.
- `docs/STATUS.md` resume el hito actual y la siguiente tarea. Actualízalo junto con `TASKS.md`.

## Antes y después de cada cambio

1. Lee la tarea activa y los documentos que enumera como relacionados.
2. No describas como implementada o comprobada una función que solo esté planeada.
3. Al completar una tarea, actualiza su casilla y criterio de aceptación en `docs/TASKS.md`.
4. Actualiza las guías afectadas por el cambio, el mapa `docs/INDEX.md` si cambia el inventario y `CHANGELOG.md` cuando haya un cambio visible.
5. Si una decisión aprobada cambia, crea un ADR que la sustituya y enlázalo desde el anterior; no reescribas el historial para ocultar el cambio.
6. Mantén los documentos en español y usa las mismas palabras para los conceptos del producto.

## Límites del producto

- Primera versión: mapas mentales y presentaciones. Otros ejemplos (monetización, recorridos, formularios y diagramas) son contenido dentro de esos formatos.
- Los formularios de ejemplo no envían datos. Los diagramas son visuales, no prototipos ejecutables.
- El estilo se inspira en la distribución de MyMap, con identidad visual propia.
- No añadas soporte específico de Strata.
- Los proyectos y credenciales no se deben incluir en registros de diagnóstico.
