## docs/designs/espacio-visual-personal.md

- **Restricción de volumen:** el diseño limita proyectos a volúmenes locales fijos y excluye UNC/unidades extraíbles. `project-store.ts` solo normaliza `ESPACIO_VISUAL_PROJECTS_DIR` con `resolve`; no comprueba tipo de volumen, UNC ni unidad extraíble.
- **Contrato del proyecto:** el diseño declara `chat`, nodos `{id,parentId,label,detail,position}` y aristas `{sourceId,targetId}`; el dominio usa `conversation`, nodos de React Flow con `data.label` y aristas `source`/`target`.
- **Contrato de diapositiva:** el diseño declara bloques tipados bajo `slides[].blocks`; el dominio almacena campos planos `body`, `bullets`, `diagramSteps`, `mockFields` y `table`. Las funciones se representan, pero el contrato serializado diverge.
- **Contexto del modelo (parcial):** `buildProjectAiContext` comparte entre UI y servidor hasta 50 ancestros, 350 relaciones, títulos de hasta 20 diapositivas vinculadas y conteos globales; un recorrido sintético confirmó que la vista previa coincide con el payload. El diseño pide un resumen del proyecto; el actual es cuantitativo, no narrativo. No se incluyen cuerpos de diapositivas relevantes y la calidad no se ha validado con un modelo real.
- **Errores de API — resuelto en 2026-11-16:** ADR-0014 fija `{code,message,correlationId}` para errores JSON y errores terminales SSE. El hook central normaliza errores JSON de rutas/middleware/Fastify, preserva los campos de estado, oculta mensajes 5xx y reutiliza el ID de petición de los registros. Los errores SSE se tiparon con el mismo contrato. Se verificaron manualmente las respuestas 404 y 403; el evento SSE aún requiere un recorrido con proveedor simulado.
- **Trazabilidad de operaciones:** el diseño prevé correlacionar proveedor, validación, commit y guardado sin registrar prompts. Ahora hay un registro local acotado de eventos de autenticación y se eliminan los query strings de los logs HTTP, pero no se registra la secuencia proveedor→validación→commit→guardado para cambios IA.
- **Dirección de escucha — resuelto:** ADR-0013 establece `::1` para el servicio, `localhost` para el origen WebAuthn y el callback `[::1]` para OIDC. Se actualizaron la especificación y los ADR 0001/0009; la prueba con un IdP real sigue pendiente.
- **Capacidad objetivo:** el diseño fija una meta inicial de 1.000 nodos; el límite efectivo del dominio y la interfaz es 10.000. No se ha documentado una decisión que sustituya la meta ni medido el objetivo de guardado de 1 MB en menos de un segundo.

## README.md

No drift detected.
