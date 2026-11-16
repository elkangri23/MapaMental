# Auditoría de código — 2026-11-15

## Auditoría de código, seguridad e interfaz solicitada — 2026-11-15

### Correcciones aplicadas

- Las mutaciones de perfiles de proveedor (crear/editar, eliminar y activar) se ejecutan en una cola común. Antes cada operación leía el JSON y luego lo reemplazaba; peticiones solapadas podían guardar una copia obsoleta y perder el cambio de la otra. La cola conserva el orden y también permite continuar tras un error anterior.
- Se retiró `proOptions.hideAttribution` de React Flow. Así el lienzo muestra la atribución requerida por el componente y deja de emitir el aviso asociado a ocultarla.

### Verificación y límites

- `npm run build` (Node 24.22.2): correcto en dominio, servidor y web.
- `npm audit --omit=dev`: cero vulnerabilidades reportadas.
- Revisión estática del flujo de sesión, rutas de proveedores, persistencia de credenciales, controles del mapa/chat, CSS responsive/teclado/impresión y estado del roadmap.
- No se añadieron ni ejecutaron tests en esta actualización. La serialización de perfiles está comprobada por compilación, no por carrera dinámica. La atribución no se revisó visualmente en navegador en esta sesión.
- No equivale a pentest ni confirma WCAG 2.0 AA. Siguen pendientes recorridos negativos completos, pruebas concurrentes, lector de pantalla, teclado de punta a punta, zoom y contraste.

## Estado y alcance

Auditoría estática de React, Fastify, almacenamiento JSON, validación del dominio y adaptadores IA. Se registran los hallazgos de la revisión inicial y su estado tras aplicar correcciones en esta fecha. La evidencia dinámica previa sigue identificada como tal; esta actualización no afirma que los nuevos escenarios hayan sido reproducidos manualmente.

**Verificación de esta actualización:** `npm run build` con Node 24.22.2 pasó para dominio, servidor y web. No se ejecutaron pruebas automatizadas ni recorridos UI dinámicos. Para pendientes manuales y otras verificaciones previas, consultar [`VERIFICATION.md`](../VERIFICATION.md).

## Hallazgos y resolución

### P1 — Contexto IA divergente y cambios pendientes

**Estado: corregido en código; pendiente recorrido dinámico.**

Las peticiones de chat, sugerencia y mejora de diapositiva bloquean ahora la edición antes de esperar `flushPendingSave`; capturan proyecto, ámbito, destino y señal de cancelación, y solo continúan con el proyecto persistido. Las operaciones de aplicar/deshacer también bloquean durante la sincronización previa. El lienzo y sus mutadores, el selector de proyecto y el proveedor activo quedan bloqueados mientras la operación está en curso. La aplicación de una propuesta sigue validando la revisión base.

**Pendiente:** recorrido con guardado en curso, intento de edición/cambio de proyecto, cancelación durante la sincronización y respuesta lenta del proveedor.

### P1 — Restaurar puede descartar cambios no guardados

**Estado: resuelto antes de esta actualización; pendiente carrera dinámica.**

`restoreBackup` ya espera `flushPendingSave()` antes de confirmar y usa la revisión actualizada como precondición. La restauración crea una revisión posterior y el servidor conserva una copia anterior. No se volvió a modificar esta ruta.

**Pendiente:** comprobar con autosave activo y conflicto simultáneo.

### P1 — Conflicto de revisión sin recuperación

**Estado: recuperación por copia implementada; endurecida ahora.**

La UI ofrece guardar los cambios locales como proyecto nuevo. La copia ahora limpia tanto `lastAiUndo` como `lastAiSlideUndo`, para no transportar inversos vinculados a otra revisión/documento. No existe fusión automática: el proyecto original queda intacto y la copia es una bifurcación local.

**Pendiente:** recorrido de dos ventanas concurrentes y comprobación de la copia tras recarga.

### P2 — Archivo principal ausente

**Estado: restauración de backups implementada antes de esta actualización.**

El servidor permite restaurar una copia válida cuando `project.json` falta o está corrupto, solo con `expectedRevision === 0`; conserva el rechazo de esquemas futuros. La UI carga copias aunque falle la lectura del proyecto.

**Pendiente:** recorrido destructivo aislado con archivo principal ausente y backup válido; no se ejecutó en esta actualización.

### P2 — Ordenamiento de grafos compartidos, cíclicos o profundos

**Estado: corregido en código.**

Se sustituyó la búsqueda de profundidad desde cada rama por condensación iterativa de componentes fuertemente conectados y cálculo de profundidad más larga sobre el DAG resultante (O(V+E)). La colocación también usa una pila explícita en lugar de recursión, evitando desbordamiento de pila en cadenas largas. Cada nodo se coloca como máximo una vez.

**Pendiente:** medir respuesta con grafos grandes, convergentes, cíclicos y una cadena larga en navegador.

### P2 — IDs duplicados/referencias y `lastAiUndo` inconsistente

**Estado: endurecido en código.**

Ya se rechazaban IDs duplicados de nodo/arista, extremos de arista inexistentes y referencias de diapositiva colgantes. El inverso de IA ahora exige revisión actual, IDs con formato AI, igual número de nodos/aristas añadidos, aristas únicas que convergen desde un padre existente y ausencia de conexiones adicionales a esos nodos. Las mutaciones normales validan el proyecto después de limpiar el inverso anterior; de otro modo, borrar una idea generada haría fallar el guardado aunque esa operación de deshacer ya debiera invalidarse. Se corrigió la aplicación de mapa IA para incrementar explícitamente la revisión antes de validar. Restaurar backup invalida ambos inversos. La migración v2 conserva el inverso de mapa solo si su revisión sigue vigente.

**Pendiente:** probar fixtures maliciosos y flujos de editar/eliminar tras usar IA, con guardado y deshacer.

## Aspectos de seguridad observados

- Servicio enlazado a loopback; rutas de datos protegidas por host/origen y sesión.
- Nonce de un uso, cookie `HttpOnly`/`SameSite=Strict` y rechazo de orígenes ajenos.
- Claves fuera del JSON de perfiles, en el almacén de credenciales del sistema.
- El modelo propone; el servidor valida ámbito/revisión y la UI requiere aplicación explícita.
- Copia verificada antes de sustituir documento durante guardados normales y validación del archivo temporal.
- Cancelación propagada al proveedor; queda pendiente comprobar respuesta lenta y si el proveedor detiene su cómputo interno.

## Pendientes de verificación

1. Carrera de autosave con IA y restauración, además de conflicto entre dos ventanas.
2. Recuperación en directorio temporal cuando falta `project.json`.
3. Grafos grandes/cíclicos/profundos y medidas de tiempo en navegador.
4. Fixtures de validación inválidos y ciclo de aplicar IA → editar/borrar → guardar/recargar/deshacer.
5. Cancelación con mock lento.

Este informe es una revisión de código más compilación, no un pentest ni una certificación.

## Seguimiento de estabilidad — 2026-11-15

Al revisar estos puntos para corregir código que podía fallar en uso normal se encontraron y ajustaron riesgos adicionales:

- Guardado del cliente: la cola ahora toma el snapshot más reciente al ejecutar cada escritura, espera operaciones previas incluso si el estado parecía limpio al encolar, no aplica respuestas de otro proyecto y vuelve a sincronizar si aparecieron ediciones nuevas durante la escritura.
- Almacenamiento del servidor: guardados y restauraciones se serializan por ID de proyecto. Las operaciones concurrentes vuelven a comprobar revisión después de esperar su turno, evitando competir por el mismo archivo de backup.
- Acciones IA: la revisión de diapositiva al deshacer ahora avanza junto con el documento. Guardar tras un deshacer de mapa también invalida el inverso de diapositiva; cada acción de deshacer queda vinculada únicamente a su revisión correspondiente.
- Contexto de mapas grandes: cliente y servidor aplican el mismo límite (250 IDs de selección y 100 nodos/250 relaciones de contexto), priorizan el nodo objetivo en sugerencias y solo envían relaciones entre nodos incluidos. Antes, el chat podía exceder el límite del servidor y una sugerencia podía tener un padre fuera del recorte.
- El ordenamiento evita copiar arrays de adyacencia por cada arista y limita las coordenadas al rango que acepta el esquema.
- Los refrescos secundarios de listado/copias pasan a ser best-effort tras confirmar la mutación principal, evitando mostrar error de operación cuando el guardado/restauración ya se completó.

Verificación de este seguimiento: `npm run build` con Node 24.22.2 pasó para dominio, servidor y web; `git diff --check` no informó problemas. No se ejecutaron pruebas automatizadas ni E2E; las carreras y límites requieren recorrido dinámico aislado.

## Pausa de desarrollo: correcciones de fallos potenciales — 2026-11-15

Se limitó el trabajo a rutas de integridad identificadas durante la auditoría:

- `getProject` y el listado de proyectos serializan la lectura con las mutaciones del mismo ID. Esto importa porque abrir o enumerar un documento legado puede migrarlo y reemplazar el JSON; antes esa escritura podía competir con un guardado o una restauración.
- La restauración en la UI sincroniza el autosave, bloquea el editor mientras confirma y ejecuta la recuperación, y evita cerrar el diálogo en mitad de esa operación. Se muestra el estado específico de restauración.
- Crear un proyecto nuevo primero guarda el activo; se bloquean IA y cambios de proyecto durante la transición para no crear una entrada vacía si el guardado falla ni cambiar de documento mientras llega una respuesta de IA.
- Al crear una copia desde un documento válido se limpian los inversos de IA, cuyo número de revisión ya no correspondería al nuevo documento.

**Estado:** corregido en código; `npm run build` pasó con Node 24.22.2 y `npm audit --omit=dev` no encontró vulnerabilidades. La ejecución dinámica aislada de fallos de guardado, restauración simultánea con autosave y migración concurrente sigue pendiente. Esta revisión estática no certifica que esas carreras se hayan reproducido ni que el conjunto de la aplicación esté libre de defectos.

### Recorridos dinámicos aislados — 2026-11-15

- Lectura de proyecto y listado concurrentes mientras se abría un proyecto v2: ambos finalizaron; se escribió esquema 3 y quedó una copia v2 previa intacta.
- Guardado y restauración con la misma revisión esperada, iniciados concurrentemente: una mutación confirmó revisión 3; la otra fue rechazada con 409 por revisión obsoleta. No se observó sobrescritura silenciosa.
- Continúan pendientes el fallo de guardado previo a crear proyecto, la restauración desde UI con autosave pendiente y una edición simultánea en el navegador.

## Correcciones adicionales de fallos potenciales — 2026-11-15

- La inicialización de la UI crea el proyecto inicial solo cuando el listado está vacío. React StrictMode ejecuta el efecto de arranque dos veces en desarrollo; las dos lecturas podían observar el listado vacío y cada una crear un proyecto. La creación ahora comparte una única promesa entre ambos arranques y la descarta si falla para permitir un reintento. El build confirma tipos y compilación; no se ejecutó el arranque dinámico en StrictMode.
- El guardado escribía el proyecto y después recortaba copias antiguas. Un error leyendo el directorio de copias ocurría después del commit y se propagaba como si el guardado hubiera fallado, con riesgo de conflicto al reintentar. El recorte ahora es best-effort, igual que la eliminación de copias excedentes; el guardado confirmado conserva su respuesta correcta. No se simuló un error de lectura del directorio.
- La política de máximo 20 copias válidas se aplicaba al guardar, pero no a restauraciones ni migraciones, que podían acumular copias sin límite. La rotación se centralizó y se ejecuta best-effort después de confirmar cualquiera de esas tres operaciones. No se generaron más de 20 copias para inducir este caso.
- Verificación inicial: `npm run build` con Node 24.22.2 pasó para dominio, servidor y web. Los recorridos controlados posteriores se detallan al final de [`VERIFICATION.md`](../VERIFICATION.md); queda pendiente el conflicto entre dos ventanas completas.

### Actualización de recorridos dinámicos — 2026-11-16

El conflicto entre dos pestañas quedó recorrido: la segunda edición recibió el 409, se guardó como copia desde la interfaz y se comprobó que el original no cambió. También se recuperó un proyecto sin `project.json` desde una copia válida. Estos dos escenarios salen de la lista de pendientes. Quedan la medición de grafos grandes y los fixtures/operaciones de deshacer IA descritos en la auditoría.

En una verificación adicional del 2026-11-16, el validador aceptó un inverso IA válido, rechazó un nodo IA con una conexión extra y permitió borrar/guardar el nodo generado; la revisión avanzó y el inverso desapareció tras recargar. Esto cubre la invalidación normal, no el flujo completo desde el proveedor/UI. La medición de grafos grandes sigue pendiente.

La medición inicial se completó: en Chromium, ordenar y guardar 2200 nodos encadenados con un ciclo y convergencia tardó 9 ms en el handler síncrono y produjo revisión 2 con coordenadas válidas. En otra prueba, una propuesta simulada se revisó y aplicó desde la UI, se añadió una idea manual, el guardado limpió el inverso y la recarga confirmó la persistencia; un deshacer obsoleto respondió 409. La validación de dominio acepta 10.000 nodos en 3,5 ms y rechaza 10.001, IDs duplicados, destinos ausentes y coordenadas infinitas. El máximo en UI y los fixtures inválidos adicionales se verificaron después, según el seguimiento siguiente.

### Seguimiento T-017: errores de almacenamiento — 2026-11-16

- La UI de producción aceptó el mapa máximo de 10.000 ideas y su alta final; fixtures adicionales rechazaron campos inválidos de proyecto, mapa, diapositivas y conversación. El detalle está en [VERIFICATION.md](../VERIFICATION.md).
- Se bloqueó la carpeta de copias en una instancia temporal. Un PUT falló con HTTP 500 genérico, sin alterar el proyecto; tras retirar el bloqueo, el reintento guardó la revisión 2 y una copia válida.
- Se intentó restaurar un backup con JSON inválido: la ruta devolvió HTTP 500 y conservó el proyecto en revisión 2. Una copia válida restauró los datos esperados como revisión 3.
- Siguen pendientes permisos ACL, disco lleno, fallo de `fsync`/rename, interrupción de restauración, proveedores reales y escenarios restantes. Son simulaciones controladas, no pruebas de fallos físicos.

### Recuperación del documento principal corrupto — 2026-11-16

En producción aislada, la lectura de `project.json` corrupto devolvió 409 sin sobrescribirlo. La lista ofreció la copia válida; restaurar con revisión esperada cero creó revisión 2 y conservó el original dañado como `backups/*.invalid`. Ver [VERIFICATION.md](../VERIFICATION.md). Permisos ACL, disco lleno y fallos físicos de escritura siguen sin probarse.

En otra comprobación aislada de T-017 se mantuvo el archivo actual abierto sin permiso de reemplazo mientras se ejecutaba el guardado. Windows devolvió `EPERM`; la revisión y el contenido originales quedaron intactos y la copia válida de revisión 1 se conservó. El reintento reutilizó esa copia, guardó revisión 2 y no la duplicó. El escenario ejercita un fallo de `rename`, pero no equivale a falta de espacio, ACL ni fallo físico del dispositivo.

Al repetir el mismo fallo durante una restauración se encontró una colisión de reintento: la primera tentativa dejaba la copia válida `before-restore` y la segunda reutilizaba su nombre fijo, fallando con `EEXIST`. El nombre ahora incluye un UUID. La reproducción posterior restauró como revisión 3 y conservó una copia recuperable de revisión 2. El patrón reduce una colisión por reintento; no acredita recuperación frente a pérdida de energía o fallos físicos.

## Revisión de código y WCAG 2.0 AA — 2026-11-16

### Cambios correctivos

- Se dio un nombre accesible al landmark complementario del chat y se marcó la conversación como `log` polite, con autor anunciado por mensaje. El estado del autosave se expone como `status` polite y el indicador gráfico se oculta del árbol accesible.
- Se localizó `ariaLabelConfig` de React Flow: nombres de minimapa/zoom/controles e instrucciones para nodos y conexiones ahora se anuncian en español.
- El monograma personal pasó a imagen con nombre accesible. Se oscurecieron controles/iconos con contraste bajo; comprobaciones dinámicas en editor de diapositivas encontraron también subtítulos y texto auxiliar con contraste insuficiente, ya ajustados junto con títulos, etiquetas, fuente del mapa, formularios ficticios y marcadores de recorrido.

### Verificación

- `npm run build` con Node 24.22.2 pasó y `npm audit --omit=dev` informó cero vulnerabilidades.
- Chromium aislado de producción: Lighthouse snapshot dio 100/100 en Accessibility móvil y escritorio (35 comprobaciones disponibles, cero fallidas) en mapa y diapositiva con recorrido, formulario ficticio y tabla. La prueba de diapositivas encontró dos botones con texto visible «Orden» que no coincidía con su `aria-label`; se alineó el texto visible y el nombre accesible como «Mover antes/después» y se repitió el recorrido sin fallos. El árbol accesible mostró instrucciones de mapa en español y landmarks de navegación/chat nombrados.
- Con teclado se recorrieron el skip link, el foco del main, apertura/foco/ciclo Tab/Escape/restauración del diálogo y selección de idea de lista; F2 abrió edición de nodo. A 320 y 640 CSS px no hubo desbordamiento horizontal, y el diálogo permaneció dentro del viewport móvil con scroll interno.
- El análisis de contraste inspeccionó dinámicamente el lienzo principal y un editor de diapositiva con recorrido, formulario ficticio y tabla. Se ajustaron los problemas detectados. No constituye medición exhaustiva de todas las superficies/estados, gradientes, impresión ni controles de terceros.

### Pendientes

- Revisión con lector de pantalla real, teclado de punta a punta en todos los estados, zoom con texto largo y contraste de propuestas/avisos/impresión.
- Evaluación de todos los criterios A/AA aplicables y matriz de seguridad completa, incluyendo host/origen/cookie, CSP empaquetada, permisos/archivos, cargas y amenazas. El build, Lighthouse y npm audit no equivalen a conformidad ni pentest.

**Nota posterior sobre contraste de impresión — 2026-11-16:** tras renderizar el PDF A4, los colores tipográficos muestreados en la salida de impresión dieron ratios de 4,63:1 a 13,84:1. Esto cubre las combinaciones enumeradas en [`VERIFICATION.md`](../VERIFICATION.md); no sustituye la revisión de todos los estados, bordes, perfiles de color ni impresión física.

## Máximo de nodos en UI — seguimiento T-017 — 2026-11-16

- El recorrido de Chromium con 10.000 nodos encontró que «Añadir idea» continuaba habilitado aunque el dominio y el servidor rechazaban 10.001 nodos. También faltaba un error de dominio claro al aplicar una expansión IA sobre el máximo.
- Se centralizó el límite `PROJECT_NODE_LIMIT`, se deshabilitó el alta manual con una explicación visible y se añadió una comprobación al aplicar propuestas en UI y servidor. El endpoint devuelve 400 antes de intentar persistir la expansión fuera de rango.
- El build con Node 24.22.2 pasó. En producción aislada se cargaron los 10.000 nodos, se seleccionó el último desde la vista textual, se comprobó el botón deshabilitado y el rechazo HTTP 400; una lectura confirmó 10.000 nodos y revisión 1. La UI guardó una edición al máximo: pasó de 9.999 a 10.000 nodos, autosave «Guardado local», revisión 2 confirmado por API.
