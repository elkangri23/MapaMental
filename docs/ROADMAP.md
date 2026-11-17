# Roadmap

Los hitos son incrementos internos de implementación v1, no productos comerciales independientes. El trabajo granular vive solo en [`TASKS.md`](TASKS.md).

| Hito | Entrega | Criterio de salida | Tareas |
|---|---|---|---|
| M0 — Fundamentos | Diseño revisado, ADR, documentos y shell de aplicación | Goldfish sin bloqueos abiertos; web y servicio pueden arrancar en desarrollo | T-003–T-006 |
| M1 — Proyectos y mapas | Guardado local recuperable y edición de mapas | Crear, editar, cerrar y recuperar un proyecto sin perder cambios | T-007–T-008 |
| M2 — IA y proveedores | Chat contextual, sugerencias accionables, propuestas y operaciones IA seguras | Proveedor local real puede crear/ampliar un mapa; el alcance se previsualiza y las operaciones son reversibles; proveedor remoto muestra contexto detallado y respeta límites | T-009–T-010, T-012 |
| M3 — Presentaciones | Conversión desde mapa, edición y visor | Cantidad pedida coincide con navegación y PDF; PNG actual legible | T-011 |
| M4 — Uso diario | Instalador Windows y documentación operativa | Instalación y desinstalación verificadas; guía coincide con paquete | T-013–T-014 |
| M5 — Identidad y autenticación (diseño aprobado) | Modo protegido opcional con OIDC, segundo factor WebAuthn y recuperación TOTP | Sesión revocable; OIDC, alta/recuperación de passkeys y revisiones de seguridad recorridas | T-021, T-023–T-026 (T-018–T-020, T-022 y T-027 completadas) |

La línea base transversal de seguridad y accesibilidad se sigue en T-015 y T-016 de [`TASKS.md`](TASKS.md). La auditoría de código del 2026-11-15 corrigió la fijación DNS para SSRF, validación de configuración/documentos y errores; el build y el audit de dependencias pasan. Siguen pendientes los recorridos negativos de rutas, validación de proveedores en Windows y evaluación manual WCAG; no declarar conformidad hasta cerrarlos. Informe: [`reviews/2026-11-15-security-audit.md`](reviews/2026-11-15-security-audit.md).

En T-015, el 2026-11-17 se verificó con un proveedor compatible simulado que la consulta de modelos rechaza una redirección sin solicitar su destino (`302` → solo `/v1/models`, no `/redirect-target`). La matriz DNS y TLS/SNI sigue pendiente; evidencia en [`VERIFICATION.md`](VERIFICATION.md#redirección-del-endpoint-de-modelos-del-proveedor--t-015--2026-11-17).

La clasificación de URL se contrastó además con 32 direcciones representativas de los registros IANA IPv4/IPv6: 25 rangos especiales bloqueados, cinco direcciones públicas permitidas y loopback permitido solo por la configuración local. Sin discrepancias en las muestras; la prueba no resolvió DNS ni hizo conexiones a las direcciones. T-015 sigue parcial. [Evidencia](VERIFICATION.md#matriz-acotada-de-rangos-especiales-iana--t-015--2026-11-17).

### Puerta de entrada a M5

M5 es una ampliación solicitada. **T-018 y T-019 están cerradas:** alcance de una persona Windows/loopback y contrato OIDC + passkey WebAuthn `UV`; TOTP opcional de recuperación; RP ID `localhost`; ADR-0012 aceptado. **T-020 está cerrada. T-021 sigue parcial.** TOTP ya tiene implementación parcial: enrolamiento tras reautenticación, secreto/anti-replay en Credential Manager, bloqueo tras fallos, y recuperación limitada a registrar una passkey nueva y revocar las anteriores. Falta validar IdP, apps autenticadoras y autenticadores reales. El modo protegido depende de Internet para OIDC; el modo local sigue disponible. No habrá acceso por red, multiusuario ni sincronización en nube.

1. Alcance y contrato aprobados: T-018–T-019.
2. Base de sesión y guardas verificadas en T-020. T-021 sigue pendiente del recorrido con IdP real.
3. WebAuthn/passkeys y ciclo de vida: T-024/T-025 parciales; falta verificación real.
4. Cerrar recuperación MFA: recorrer la recuperación TOTP con app autenticadora real, comprobar bloqueo, ventana/replay y caducidad, y verificar que el token temporal no accede a datos de proyecto; completar T-023.
5. Auditoría, accesibilidad y operación: T-026 parcial; informe estático, guía de operación y registro local acotado añadidos; formularios accesibles en estructura, recorridos manuales pendientes.

No se incluye colaboración en tiempo real, formularios funcionales, prototipos interactivos, nuevos tipos de lienzo ni soporte específico de Strata. El modo protegido de M5 no implica sincronización de proyectos en nube; esa capacidad requeriría otra decisión y roadmap.


## Progreso vigente

T-011 ya permite elegir la cantidad de diapositivas en la conversión local. T-013 cuenta con ZIP portátil y sigue pendiente de compilar y recorrer el instalador. Consulta [Tareas](TASKS.md) para los criterios y la verificación.

T-010 continúa en evaluación semántica con modelos reales mediante FreeLLMAPI. gpt-oss-120b confirmó tablas, recorridos y formularios ficticios en el mapa de siembra; Llama 3.3 70B completó en Chrome la vista previa, aplicación, persistencia y deshacer de un formulario ficticio. gpt-oss-20b y Mistral Small 3.2 24B mostraron omisiones de formato o mezcla de bloques. El servidor recupera formatos explícitos y el filtrado se confirmó mediante API con una respuesta simulada que contenía bloques ajenos. Mistral generó también por API un formulario con sus tres campos rellenados. La repetición con modelos reales en Chrome falló por errores o esperas del proveedor. El 2026-11-17, gpt-oss-120b por FreeLLMAPI devolvió tres sugerencias pertinentes para el mapa completo y tres para Cosecha; una respuesta simulada confirmó el filtro de temas de ramas hermanas y el paso de comparaciones explícitas. gpt-oss-20b también devolvió tarjetas pertinentes para Cosecha; la evaluación descubrió y corrigió la omisión de formato `diagram` ante «diagrama de proceso», verificada con proveedor simulado. Después, FreeLLMAPI/gpt-oss-20b generó un diagrama de cinco pasos por API; aplicar, recargar y deshacer completaron el ciclo y dejaron el proyecto temporal vacío. Chrome confirmó además la tarjeta, la vista previa y la persistencia; la repetición reveló viñetas duplicadas, que el servidor ahora filtra por solapamiento con los pasos. La aceptación de T-010 continúa abierta; los criterios y resultados están en [Tareas](TASKS.md) y [Verificación](VERIFICATION.md).

En la repetición del 2026-11-17, una nueva petición de chat desde el servicio aislado llegó correctamente a FreeLLMAPI pero terminó a los 60 segundos con `UPSTREAM_ERROR`; no se obtuvo una respuesta semántica. Ollama y LM Studio tampoco tenían servicios locales activos, así que T-009/T-010 siguen abiertas a la espera de proveedores disponibles. Evidencia en [Verificación](VERIFICATION.md#repetición-de-chat-con-proveedor-real-no-disponible--t-009t-010--2026-11-17).

En la continuación de seguridad del 2026-11-16 se corrigió la clasificación de rangos IPv6 especiales en la protección SSRF: se bloquean `2001::/23` (incluida la normalización de `2001:0::1`) y `3fff::/20` (documentación). Fixtures de los prefijos y límites pasaron; build y auditoría de dependencias también. La matriz SSRF sigue abierta en T-015. Fuente: [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry).

M3 — Presentaciones queda completado con T-011: generación desde el mapa, editor, autosave, bloques visuales, propuesta IA revisable/reversible, PNG y PDF nativo. La IA se verificó con Ollama simulado; el PDF de tres diapositivas se guardó en la última iteración y se confirmó como tres páginas A4 apaisadas, etiquetadas y sin cortes visibles. El historial de intentos previos permanece abajo; el criterio final y la evidencia están en [`TASKS.md`](TASKS.md) y [`VERIFICATION.md`](VERIFICATION.md). La evaluación con lector de pantalla real sigue en T-016.

En la continuación de T-017 se cargó desde la UI un mapa de 10.000 nodos, se recorrió su vista textual y se seleccionó el último. Se corrigió el límite de alta manual y propuestas IA para evitar mapas que no se puedan guardar; un recorrido en producción aislada guardó desde la UI el nodo 10.000 desde una base de 9.999 y confirmó la revisión 2 por API. Fixtures puntuales adicionales rechazaron documentos malformados en campos de proyecto, mapa, diapositiva y conversación. T-017 sigue parcial por escenarios de auditoría y errores de disco. T-011 queda cerrado en la actualización final registrada al pie de este documento; el siguiente trabajo se centra en T-004 y las tareas de IA/proveedores.

En la siguiente sesión se corrigió el arranque usando el nonce heredado por el servicio de producción y un perfil aislado de Chrome. La vista previa expuso los controles de destino/impresión y el árbol accesible describió dos páginas con tabla, recorrido y formulario ficticio. Después se abrió la vista de presentación en Chromium headless y CDP generó un PDF de dos páginas A4 apaisadas. Los renders mostraron que ambas diapositivas y sus contenidos caben en una página por diapositiva. No se imprimió en la Minolta ni se accionó «Guardar como PDF» en la vista previa; queda completar ese flujo interactivo y la revisión accesible/contraste de impresión.

### Corrección de recuperación de proyecto — T-015/T-017 — 2026-11-17

El flujo de restauración desde una copia válida podía bloquearse si ya existía el archivo de preservación del documento corrupto con el mismo sello temporal (`EEXIST`). Se añadió UUID al nombre de esa copia. El build completo pasó y la repetición aislada recuperó la revisión 2 conservando tanto la copia `.invalid` preexistente como la copia válida. T-015/T-017 siguen abiertos para los demás escenarios de seguridad y almacenamiento descritos en [`TASKS.md`](TASKS.md) y [`VERIFICATION.md`](VERIFICATION.md).

En la continuación de T-017 se reprodujo un fallo de `rename` bloqueando temporalmente el archivo destino con un handle Windows. El guardado dejó revisión 1 intacta y conservó su copia válida; el reintento la reutilizó y guardó revisión 2 sin duplicados. La restauración reveló una colisión `EEXIST` porque reutilizaba el nombre de la copia previa dejada por la primera tentativa; se corrigió añadiendo UUID y el reintento restauró revisión 3, manteniendo una copia válida de revisión 2. T-017 sigue parcial por escenarios ACL, disco lleno e interrupciones físicas.

En T-007 se recorrió una migración v2→v3 de almacenamiento aislado: conservó revisión 7, creó esquema 3 y produjo una copia previa byte por byte idéntica. También se implementó y verificó la apertura de esquemas futuros en solo lectura, con proyección compatible y fallback a metadatos ante contenido incompatible; T-007 queda completada.

En T-011 se mejoró la semántica del documento de impresión: cada diapositiva se identifica por su título, los pasos del recorrido son una lista ordenada y los campos de ejemplo exponen pares etiqueta/valor. El build y la auditoría de dependencias pasan. El intento de interactuar con el diálogo de impresión en una instancia aislada no pudo completarse porque la automatización de Chrome quedó bloqueada al abrirlo; no se guardó PDF. Sigue pendiente el guardado interactivo y comprobar las etiquetas accesibles del PDF final.

En T-017 se provocó un fallo controlado en la escritura de la copia previa al guardado: la API devolvió 500 sin cambiar la revisión 1 y el reintento guardó revisión 2 al retirar el bloqueo. La restauración de una copia JSON malformada también devolvió 500 y conservó la revisión 2; una copia válida restauró el documento en revisión 3. Quedan permisos ACL, disco lleno, otros fallos a mitad de escritura y los escenarios de auditoría aún abiertos.

### Continuación de T-011 — 2026-11-16

Se repitió el recorrido con perfil de navegador, proyecto y almacenamiento temporales. La presentación contenía tres diapositivas y el visor de impresión mostró tres páginas con contenido accesible, incluidos tabla, recorrido y campos ficticios. Se intentó usar «Guardar como PDF»; la ventana nativa se cerró durante la recuperación de la automatización, así que no se generó ni inspeccionó un archivo. T-011 sigue parcial. Siguiente paso: repetir el guardado con un medio fiable de controlar el cuadro nativo y examinar el PDF resultante, incluida la paginación y el orden de lectura.

### Cierre de T-011 — 2026-11-16

En la siguiente iteración se guardó el PDF desde el diálogo nativo con tres diapositivas. `pdfinfo` confirmó tres páginas A4 apaisadas y PDF etiquetado; el árbol lógico mostró títulos, listas, tabla con encabezados asociados y orden secuencial. Se renderizaron e inspeccionaron todas las páginas, sin cortes visibles; las páginas 2 y 3 son escasas por el mapa de prueba. T-011 queda completada. La comprobación con lector de pantalla real sigue en T-016. Evidencia detallada en [`VERIFICATION.md`](VERIFICATION.md).

También se corrompió de forma controlada `project.json` después de crear una copia válida. La lectura respondió 409 sin reescribir el original dañado; el endpoint de copias ofreció la versión recuperable. Restaurarla con revisión esperada cero creó revisión 2 y guardó el archivo dañado en `backups/*.invalid`. Quedan pendientes ACL, disco lleno y errores físicos.

### Pausa solicitada — 2026-11-15

El desarrollo de producto se pausó y el trabajo se limitó a correcciones de estabilidad. La auditoría y su historial quedan registrados en T-017.

### Reanudación — 2026-11-15

El usuario indicó continuar el roadmap. T-017 sigue parcial: se recorrieron migración/lectura concurrente y conflicto entre guardado y restauración con datos temporales. T-011 continúa como el siguiente frente de producto; Chromium generó cinco páginas para cinco diapositivas y se mejoró la composición de impresión tras revisar los renders. Pendientes en [`TASKS.md`](TASKS.md).


Se muestrearon los colores de texto del CSS de impresión tras revisar el PDF: la relación más baja fue 4,63:1 para el subtítulo y las demás entre 6,60:1 y 13,84:1. No sustituye la revisión de todos los estados ni de salida física; queda pendiente guardar desde la vista previa interactiva.
