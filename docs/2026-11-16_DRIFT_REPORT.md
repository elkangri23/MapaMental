## docs/designs/espacio-visual-personal.md

- **Restricción de volumen:** el diseño limita proyectos a volúmenes locales fijos y excluye UNC/unidades extraíbles. `project-store.ts` solo normaliza `ESPACIO_VISUAL_PROJECTS_DIR` con `resolve`; no comprueba tipo de volumen, UNC ni unidad extraíble.
- **Contrato del proyecto:** el diseño declara `chat`, nodos `{id,parentId,label,detail,position}` y aristas `{sourceId,targetId}`; el dominio usa `conversation`, nodos de React Flow con `data.label` y aristas `source`/`target`.
- **Contrato de diapositiva:** el diseño declara bloques tipados bajo `slides[].blocks`; el dominio almacena campos planos `body`, `bullets`, `diagramSteps`, `mockFields` y `table`. Las funciones se representan, pero el contrato serializado diverge.
- **Contexto del modelo (parcial):** `buildProjectAiContext` comparte entre UI y servidor hasta 50 ancestros, 350 relaciones, títulos de hasta 20 diapositivas vinculadas y conteos globales; un recorrido sintético confirmó que la vista previa coincide con el payload. El diseño pide un resumen del proyecto; el actual es cuantitativo, no narrativo. No se incluyen cuerpos de diapositivas relevantes y la calidad no se ha validado con un modelo real.
- **Errores de API:** el diseño requiere `{code,message,correlationId}`. El manejador común de Fastify devuelve `{message}` y los eventos SSE de error también exponen solo un mensaje; el ID de petición no se devuelve de forma correlacionada al cliente.
- **Trazabilidad de operaciones:** el diseño prevé correlacionar proveedor, validación, commit y guardado sin registrar prompts. Ahora hay un registro local acotado de eventos de autenticación y se eliminan los query strings de los logs HTTP, pero no se registra la secuencia proveedor→validación→commit→guardado para cambios IA.
- **Dirección de escucha:** el diseño especifica `127.0.0.1`; el servicio escucha en `::1` y el callback OIDC usa `[::1]`. Ambos restringen a loopback, pero el contrato de dirección literal diverge.
- **Capacidad objetivo:** el diseño fija una meta inicial de 1.000 nodos; el límite efectivo del dominio y la interfaz es 10.000. No se ha documentado una decisión que sustituya la meta ni medido el objetivo de guardado de 1 MB en menos de un segundo.

## README.md

No drift detected.
