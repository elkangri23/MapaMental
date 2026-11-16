# Cambios

- El chat puede sugerir diapositivas con recorridos estáticos o formularios ya rellenados con datos ficticios.

- Al aplicar una expansión, el servidor comprueba los nombres de las ideas y rechaza el borrador si contiene duplicados.

- Al ampliar una rama, la petición señala sus ideas hijas que están dentro del contexto para que el modelo aporte detalles nuevos.

- Cuando la expansión no contiene ideas nuevas, el chat explica el resultado y permite pedir otro enfoque.

- Las expansiones de IA admiten una sola idea nueva, incluso si las demás se descartan por repetidas.

- Al ampliar una idea con IA, la vista previa omite etiquetas repetidas dentro del borrador o entre la idea principal y sus hijas directas.

- Las vistas previas de IA muestran un contorno cuando reciben el foco. El contorno queda dentro del panel para que el chat no lo recorte.

- Escape descarta la vista previa de IA que tiene el foco y vuelve al botón de origen si sigue disponible.

- Al descartar un borrador de presentación completo, el foco vuelve al botón que abrió el diálogo de creación si sigue disponible.

- Al descartar una propuesta de ideas o diapositiva, el foco vuelve al botón que la generó si sigue disponible.

- Las vistas previas de ideas y diapositivas de IA reciben el foco al aparecer, para llegar a sus controles con el teclado.

- Al volver a generar sugerencias, el chat pide alternativas a las tarjetas anteriores de la misma selección.

- Dos sugerencias con el mismo título pueden aparecer juntas si apuntan a ideas distintas. Cada tarjeta muestra su destino.

- Las tarjetas de IA con la misma instrucción, destino y tipo de resultado se muestran una sola vez aunque el modelo cambie el título.

- El chat muestra las sugerencias en la selección para la que se generaron, aunque otra rama incluya alguna de las mismas ideas.

- El panel de sugerencias explica cuándo el modelo no propone acciones para la selección y permite volver a pedirlas.

- La interfaz retira las propuestas de IA obsoletas y ofrece cargar la versión guardada tras un conflicto. Si hay cambios locales que no se pueden guardar, mantiene la opción de recuperarlos.

- El lanzador de Windows da tiempo a la comprobación de almacenamiento y explica cuándo Windows no puede validar el volumen de proyectos.

## Paquete portátil reconstruido — 2026-11-16

- El empaquetado offline pasó e incluyó runtime y componentes esperados. La revalidación de arranque quedó bloqueada por `Get-Volume`/`PROJECT_STORAGE_VOLUME_INVALID`; no se desactivó la comprobación de almacenamiento ni se compiló el instalador Inno Setup, que requiere `ISCC.exe`.
## Conflictos de sugerencias entre pestañas — 2026-11-16

- Recorrido visual con dos pestañas: una aplicó una propuesta IA (5→7 ideas); la otra recibió HTTP 409 y un aviso para recargar. Al recargar, mostró el estado persistido, sin duplicar ideas.

## Concurrencia de propuestas IA — 2026-11-16

- Dos solicitudes simultáneas que intentaron aplicar la misma propuesta y revisión produjeron un solo guardado (HTTP 200) y un conflicto claro (HTTP 409). El documento terminó con una única copia de las ideas propuestas.

## Contexto IA medido con diapositivas extensas — 2026-11-16

- Un fixture con 40 diapositivas confirmó los topes de 20 títulos, 500 caracteres por extracto y 6.000 caracteres totales, además de resumen de ocho ramas con etiquetas limitadas a 120 caracteres y exclusión de contenido ajeno.

## Fallo upstream verificado en el servicio completo — 2026-11-16

- El mock HTTP 503 pasó SSE y JSON con validación de almacenamiento activa: evento terminal `UPSTREAM_ERROR` y respuesta JSON 502 correlacionados. Logs y respuestas no filtraron los marcadores privados.

## Manejo de errores del proveedor en JSON y SSE — 2026-11-16

- Un mock 503 confirmó HTTP 502 con error redactado en JSON y un evento terminal `UPSTREAM_ERROR` correlacionado por SSE; el cuerpo sentinela del proveedor no se filtró. Se ejecutó en arnés Fastify aislado porque Windows Storage bloqueó el arranque completo en esta sesión.

## Capacidad de guardado local — 2026-11-16

- Un fixture local de 1.005.189 bytes, 1.000 ideas y 100 diapositivas se guardó ocho veces directamente con `saveProject` en 63–142 ms. Se eliminó una validación completa redundante del objeto intermedio; la revisión final normalizada sigue validándose antes de respaldar y guardar. Métrica de servicio local, sin transporte HTTP; otros equipos quedan por medir.

## Trazabilidad técnica de operaciones IA — 2026-11-16

- Se añadieron eventos estructurados de generación, proveedor, validación y guardado correlacionados por ID de petición, sin registrar prompts ni contenido del proyecto. ADR-0019 documenta los campos y límites; el recorrido con mock confirmó generación, validación, guardado y ausencia de marcadores sensibles.

## Resumen global en contexto IA — 2026-11-16

- Vista previa y solicitudes IA comparten un resumen estructural con la idea central y hasta ocho ramas principales, limitadas a 120 caracteres por etiqueta. El detalle de diapositivas ajenas sigue excluido; la vista previa informa que se comparten los nombres principales.
- El mock recibió el resumen mostrado, el extracto seleccionado y no recibió el marcador ajeno. Añadido ADR-0018.

## Contrato de error correlacionable — 2026-11-16

- Las respuestas JSON de error y los eventos terminales SSE ahora incluyen código estable y `correlationId` alineado con `reqId` del servicio. Se preservan campos de estado como `mode`, y el texto de errores 5xx se redacta.
- Se añadió ADR-0014. En producción aislada se comprobaron el 404 API, rechazo 403 de sesión y evento terminal SSE por proyecto inexistente (sin contactar un proveedor). Un fallo SSE real del proveedor y la respuesta 5xx quedan pendientes.

## Verificación del PDF desde impresión nativa — 2026-11-16

- Se guardó «Huerto-balcon-vista.pdf» desde el diálogo de Chrome en una carpeta temporal aislada. `pdfinfo` confirmó tres páginas A4 apaisadas y PDF etiquetado; el árbol lógico conserva títulos H1, listas, tabla con encabezados asociados y orden secuencial.
- Se renderizaron las tres páginas y se comprobó que tabla, recorrido y formulario ficticio caben sin cortes visibles. T-011 queda completada; lector de pantalla real y evaluación general WCAG siguen en T-016.

## Contrato de loopback para WebAuthn — 2026-11-16

- ADR-0013 alinea la especificación con el servicio: `localhost` como origen WebAuthn, escucha solo en `::1` y callback OIDC en IPv6 loopback. Los ADR 0001/0009 quedan reemplazados parcialmente; no se abre acceso de red.
- El recorrido de impresión T-011 se inició en almacenamiento temporal, pero se detuvo antes de guardar PDF; no cambia su estado pendiente.

## Aclaración del acceso OIDC protegido — 2026-11-16

- Ajustes ya no indica erróneamente que el inicio protegido no está habilitado: explica que hay que vincular OIDC y registrar una passkey antes de arrancar con `MYMAP_AUTH_MODE=protected`.
- El código de OIDC + PKCE, passkeys/WebAuthn y recuperación TOTP ya está integrado. El recorrido real sigue pendiente de configurar un IdP y usar un autenticador en el equipo.

## Recorrido de contexto IA con proveedor simulado — 2026-11-16

- T-010: se comprobó en Chrome que «Ver contexto» coincide con el cuerpo HTTP recibido por un mock local; rama, ancestro, relaciones, diapositiva vinculada, conteos y exclusiones coincidieron.
- La respuesta del mock produjo una tarjeta de sugerencia con destino válido y esta apareció en el chat. No se contactó un modelo real.

## Contexto IA de rama ampliado — 2026-11-16

- T-010 parcial: un constructor compartido por dominio, UI y servidor añade hasta 50 ancestros, relaciones acotadas, títulos de hasta 20 diapositivas vinculadas y un resumen cuantitativo del proyecto al contexto.
- La vista previa del chat y del borrador de presentación declara esos elementos y los límites. El build pasa; la calidad con modelo real y el recorrido de UI/payload quedan pendientes.

## Vista previa de impresión aislada — 2026-11-16

- T-011 parcial: en Chrome se abrió el diálogo nativo desde una instancia y almacenamiento aislados. El visor presentó tres páginas y expuso texto de cada una en el árbol accesible; se canceló antes de imprimir.
- El archivo PDF final y sus etiquetas/orden de lectura siguen sin verificar porque no se completó «Guardar como PDF».

## Revisión de deriva de diseño — 2026-11-16

- T-004 continúa parcial: se cotejó el diseño con el código actual y se precisaron diferencias de persistencia, contratos, contexto del modelo, errores, trazabilidad IA, loopback y metas de capacidad en `docs/2026-11-16_DRIFT_REPORT.md`.
- No se resolvieron automáticamente diferencias de contrato: requieren decisiones de diseño o cambios compatibles y quedan visibles en T-004.

## Registro local de seguridad — 2026-11-16

- T-026 parcial: eventos de autenticación JSONL en `%LOCALAPPDATA%\EspacioVisual\security-events.jsonl`, limitados a tipo, resultado, hora UTC e ID de petición saneado; sin identidad, claves ni datos del proyecto.
- Retención de 30 días, 5.000 eventos y 1 MiB; la escritura es best-effort. Fastify ahora elimina queries de las URLs registradas para no guardar `code`/`state` del callback OIDC.
- Build de producción correcto; falta recorrido del log en Windows y con disco no escribible. Vite advierte que el bundle principal llega a 502,37 kB.

## Guía de operación de identidad — 2026-11-16

- T-026 parcial: guía de configuración OIDC, primera passkey, modo protegido, recuperación TOTP y desvinculación/restablecimiento de identidad local.
- Se documentan ubicaciones y separación entre identidad, TOTP, passkeys locales, proveedores, claves API, proyectos y uso; advierte que restaurar `auth.json` antiguo puede reactivar claves públicas previamente revocadas.
- El índice, la instalación, seguridad, estado, roadmap y tareas enlazan la guía. La interoperabilidad real sigue pendiente.

## Revisión estática de autenticación — 2026-11-16

- T-026 parcial: informe de revisión estática de OIDC/MFA/passkeys; auditoría de código no sustituye los recorridos con IdP, autenticadores ni lector de pantalla.
- El enrolamiento TOTP ahora muestra clave/URI en un formulario legible y confirma con código etiquetado; la recuperación usa campos de formulario y puede reanudarse tras cancelación.
- Confirmación inicial TOTP permite cinco intentos antes de invalidar el enrolamiento; se corrigieron mensajes obsoletos sobre WebAuthn.
- Build de producción correcto; no se ejecutaron pruebas automatizadas. Vite mantiene advertencia de chunk principal ligeramente superior a 500 kB.

## Recuperación TOTP — 2026-11-16

- T-023 parcial: enrolamiento/confirmación TOTP tras reautenticación con passkey; RFC 6238, ventana ±1 paso, anti-replay y bloqueo persistido en Windows Credential Manager.
- Tras OIDC + TOTP, cookie de recuperación de cinco minutos permite solo registrar una passkey nueva; no autoriza rutas de proyectos, proveedores o IA y se invalida al completar el alta.
- La recuperación puede reanudarse tras cancelar/fallar el alta dentro del plazo original; la UI consulta ese estado para no pedir otra vez el TOTP. El estado no se amplía. Se limitaron enrolamientos pendientes y se endureció la validación del registro leído.
- Ajustes permite configurar/desactivar TOTP tras reautenticación. Pendientes recorridos con IdP, app autenticadora y autenticadores reales. Build de producción correcto con Node 24.22.2; no se ejecutaron pruebas automatizadas.

## OIDC — 2026-11-16

## WebAuthn — 2026-11-16

## Ciclo de vida de passkeys — 2026-11-16

- T-025 parcial: alta de passkeys adicionales desde modo protegido tras reautenticar con `UV`; listado de nombre/tipo/último uso; renombrado y revocación con paso WebAuthn reciente de hasta cinco minutos. Se impide revocar la última credencial y la baja invalida las sesiones protegidas activas.
- La guía de autenticación y el roadmap registran que TOTP sigue pendiente y depende de validar el ciclo WebAuthn. Build de producción correcto; no se probaron autenticadores reales.

- T-024 parcial: añadidos `@simplewebauthn/server` 14.1 y `@simplewebauthn/browser` 14.0. Alta inicial y autenticación exigen UV, usan RP ID `localhost` y challenge corto ligado a sesión/operación; la sesión protegida se emite solo tras OIDC + passkey.
- Se guardan clave pública y metadatos mínimos; attestation `none`. El lanzador cambió a `http://localhost:<puerto>` para cumplir el origen/RP ID. Build de producción correcto; falta probar IdP y autenticadores físicos/reales.

- T-021 parcial: añadido cliente OIDC con `openid-client`, Authorization Code + PKCE S256, state/nonce de un solo uso, callback loopback y enlace explícito `(iss, sub)`.
- Ajustes inicia el vínculo de identidad y el modo protegido comienza login. Una respuesta válida deja un paso OIDC temporal; no emite sesión hasta completar WebAuthn.
- Discovery, JWKS y token usan el egress seguro con DNS/IP fijados. Build de producción correcto; falta validar interoperabilidad y escenarios negativos con un proveedor real.
- T-022 cerrada a nivel de política: matriz MFA documentada con passkey `UV`, reautenticación de cinco minutos para cambios de autenticador y prohibición de downgrade automático.

## Plan de identidad — 2026-11-16

- Se documentó una propuesta por fases para OIDC, OAuth 2.0, MFA y passkeys WebAuthn en `docs/AUTH_OAUTH_MFA_PASSKEYS.md`.
- Primera planificación de T-018–T-026 y M5. En ese momento ADR-0012 quedó propuesto; el cierre posterior de T-019 y la aceptación del ADR se registran en la siguiente entrada.
- T-019 cerrado: ADR-0012 acepta un issuer OIDC configurable, passkey WebAuthn propia como segundo paso del modo protegido local y TOTP opcional de recuperación. No hay autenticación implementada todavía; el siguiente paso es T-020.
- T-020 parcial: sesiones/cookies separadas por modo, límite de sesiones, revocación/logout, guardas por modo y servicio de almacenamiento OIDC local para issuer/client ID e identidad única. Aún no hay endpoint/UI conectados; el modo protegido rechaza el nonce local y falla cerrado hasta completar OIDC/WebAuthn. Build de producción correcto con Node 24.22.2; no se ejecutaron pruebas automatizadas.
- No se añadió ni activó código de autenticación; la sesión local de ADR-0009 sigue describiendo el comportamiento implementado.

## Proyectos futuros — 2026-11-16

- Los proyectos creados con una versión futura aparecen como solo lectura. Si los campos conocidos pasan validación, se puede consultar su proyección; si el contenido no es compatible, se conserva únicamente la información básica y se evita mostrar un mapa incompleto.
- Se actualizaron las tareas, estado, almacenamiento, roadmap, índice de documentación y evidencias de verificación para cerrar T-007 y conservar las diferencias de diseño aún abiertas.

## Accesibilidad de impresión — 2026-11-16

- Las diapositivas impresas se identifican por su título; los recorridos usan listas ordenadas y los formularios de ejemplo exponen pares etiqueta/valor semánticos.
- El build pasó. El intento de guardar desde el diálogo nativo quedó sin verificar por bloqueo del controlador de Chrome; no se guardó ningún PDF.

## Privacidad del contexto — 2026-11-16

- El panel del chat muestra los últimos diez mensajes que se incluyen en chat/sugerencias, indicando rol y recorte a 3.000 caracteres. También avisa que el mensaje actual se envía al pulsar «Enviar».
- No cambia el tratamiento del servidor ni añade datos al contexto; hace visible el historial que ya se mandaba. Falta verificarlo en navegador y revisar el payload.

## Seguridad — 2026-11-16

- Corregida la validación SSRF IPv6 para bloquear `2001::/23` (incluidos literales canonicalizados) y el rango de documentación `3fff::/20`; detalles y límites en `docs/reviews/2026-11-15-security-audit.md`.
- La restauración crea copias previas con nombres únicos, por lo que un fallo al reemplazar el archivo no bloquea los reintentos.
- Si falla un guardado después de verificar la copia previa, esa copia se conserva y se reutiliza al reintentar el mismo estado.

## Límite máximo de ideas — 2026-11-16

- El botón para añadir ideas se deshabilita y explica el límite al alcanzar 10.000 nodos.
- La UI evita aplicar propuestas IA que superen el máximo y el servidor las rechaza antes de guardar.

## Accesibilidad del mapa y presentaciones — 2026-11-16

- Se mejoró el contraste de textos auxiliares de diapositivas y controles del lienzo.
- React Flow anuncia en español las instrucciones de teclado y los controles de zoom; el chat y el guardado exponen estados para tecnologías de asistencia.
- El panel de chat ya tiene nombre de landmark y los mensajes identifican a la persona o al asistente en el árbol accesible.

## Correcciones de persistencia y arranque

- La creación inicial del proyecto se comparte entre las ejecuciones repetidas del efecto de arranque, evitando espacios vacíos duplicados en React StrictMode.
- El recorte de copias antiguas se trata como limpieza secundaria: si falla después del guardado, la API ya no informa erróneamente que el proyecto no se guardó.
- Guardar, restaurar y migrar usan la misma rotación de copias JSON válidas, limitada a las 20 más recientes.

## Navegación accesible de diapositivas

- El control de diapositivas tiene una región de navegación con nombre y anuncia la posición actual al avanzar, retroceder o cambiar el orden.

## PDF de presentaciones densas

- La impresión usa páginas A4 apaisadas con una diapositiva por página.
- Las diapositivas con mucho contenido reducen su escala para mantener texto, tablas, recorridos y formularios ficticios dentro de la página.

## Presentaciones completas con IA

- En «Crear presentación» se puede elegir «Generar con IA», fijar de una a doce diapositivas o dejar que el modelo proponga la cantidad. Se puede indicar un enfoque.
- El chat muestra el borrador y sus ideas de origen. Aplicar crea una copia recuperable de la presentación anterior. «Deshacer presentación IA» permite recuperarla después de recargar.

## Cantidad al crear una presentación desde el mapa

- La conversión local permite elegir de una a cien diapositivas. Agrupa las ideas y añade páginas en blanco si hacen falta para completar la cantidad.
- El diálogo indica cuándo se va a sustituir una presentación y permite cancelar antes de cambiarla.

## Paquete portátil de Windows

- Disponible el ZIP para Windows x64 con Node 24, el servidor y la interfaz compilada. Incluye comandos de inicio y parada. Abrirlo de nuevo desde la misma carpeta reutiliza la instancia.
- Añadido el proyecto de Inno Setup por usuario. La compilación y comprobación del instalador quedan pendientes.

## Presupuesto remoto opcional

- Cada perfil remoto puede tener un presupuesto mensual en EUR y tarifas por modelo. El chat muestra el gasto estimado y avisa si faltan datos.
- Al alcanzar el límite con el gasto conocido, se bloquean nuevas generaciones del perfil. Dejar el límite vacío permite continuar sin tope. Los modelos en loopback quedan fuera del presupuesto remoto.

## Etapas de generación comunicadas por el servidor

- El chat muestra la preparación, la espera del proveedor y la validación de la respuesta. Una conexión interrumpida conserva el borrador y deja volver a intentar la generación.

## Progreso y cancelación de IA

- El chat muestra junto al compositor si está guardando, esperando al proveedor o cancelando. El control de cancelación queda visible aunque se desplace el historial.
- Cancelar la generación conserva el borrador del chat y descarta la respuesta. El servicio cierra la petición al proveedor y aplica el límite de tiempo también durante la resolución del destino.

## Historial por proyecto

- El chat conserva los últimos 500 mensajes de cada proyecto. Al retomar la conversación o pedir nuevas sugerencias, se incluyen hasta diez mensajes recientes como contexto del proveedor.
- Guardar solo conversación conserva la última acción de IA que se puede deshacer. La conversación también forma parte de las copias recuperables.

## Tablas en presentaciones

- El chat puede sugerir una diapositiva con tabla, mostrar el borrador y añadirlo a la presentación después de confirmarlo.
- El editor permite añadir una tabla, editar sus celdas y ajustar filas y columnas. La tabla se guarda con el proyecto y aparece en impresión y PNG.

## Estabilización de edición y guardado

- El autosave, el guardado previo a cambiar de proyecto y el reintento usan la misma cola. Si hay cambios sin guardar, el navegador avisa al cerrar o recargar la pestaña.
- Cambiar de proyecto o restaurar una copia limpia los borradores y las propuestas del chat. Si falla la generación, el borrador sigue disponible para reintentar.
- Se puede renombrar una idea con Intro o F2. Vaciar el campo conserva el último nombre válido y el borrado de ramas usa el control que también actualiza las referencias de las diapositivas.
- Regenerar una presentación existente requiere confirmación y guardado previo. «Imprimir / Guardar PDF» indica que la salida depende del diálogo del navegador.

## Sugerencias contextuales

- El chat propone acciones sobre ideas concretas del mapa. Las tarjetas muestran su destino y abren una propuesta para ampliar una rama o añadir una diapositiva. Se pueden renovar las sugerencias desde el panel.
- Las diapositivas creadas desde una sugerencia se pueden deshacer desde el pie del proyecto.
- Corregida la conexión de proveedores locales con `127.0.0.1`.

## Auditoría de código, seguridad e interfaz — 2026-11-15

- Serializadas las escrituras de perfiles de proveedor para evitar que guardar/eliminar/activar operaciones simultáneas sobrescriban cambios recientes.
- React Flow vuelve a mostrar su atribución; se elimina la opción que la ocultaba y generaba un aviso de consola.
- Verificación: `npm run build` correcto; `npm audit --omit=dev` informó cero vulnerabilidades. Auditoría manual completa de WCAG y pentest siguen pendientes.

## 2026-11-15

- Reanudado el roadmap en T-011. Se verificó en Chromium que 5 diapositivas generan 5 páginas PDF; la revisión visual encontró títulos demasiado abajo, así que se ajustó el espaciado de impresión y se añadió un acento gráfico. Los renders revisados muestran el contenido en la zona superior; quedan pendientes el botón/diálogo de impresión y la recuperación desde backup por UI.
- Restauración de presentación recorrida desde el diálogo de copias en almacenamiento temporal: de 5 diapositivas se volvió a la copia inicial con 0, como revisión 3, conservando el estado previo como copia válida.
- Estabilización a petición del usuario: las lecturas que migran proyectos comparten la cola serializada de mutaciones; crear proyecto nuevo sincroniza primero el anterior y bloquea operaciones durante el cambio; restaurar backup bloquea ediciones mientras guarda y restaura; bifurcar un proyecto descarta inversos de IA incompatibles con la revisión nueva. Build y auditoría de dependencias verificados; recorridos dinámicos pendientes. Seguimiento T-017 en `docs/TASKS.md`.

- Estabilización (sin avance de roadmap): serialización por proyecto de guardados/restauraciones, cola de autosave del cliente basada en el estado más reciente, correcciones de revisión en deshacer IA, contexto recortado coherente con su vista previa y tratamiento best-effort de refrescos secundarios. Detalles y verificaciones pendientes en `docs/reviews/2026-11-15-code-audit.md`.

- Aplicadas correcciones de la auditoría de código: serialización/bloqueo del estado durante IA, ordenamiento lineal e iterativo de grafos cíclicos/compartidos/profundos, validación relacional de deshacer IA y limpieza de inversos en guardado, restauración y copia por conflicto. Informe y estado documental actualizados; build de producción pasó. Los escenarios dinámicos pendientes están listados en `docs/reviews/2026-11-15-code-audit.md`.

- Auditoría de seguridad: fijada la conexión a IP ya resuelta para reducir SSRF por DNS rebinding; revalidación de perfiles persistidos, límites de proyecto y configuración, manejo centralizado de errores, límite de carga/conexiones y rechazo de IDs duplicados en propuestas. `npm audit --omit=dev` queda en cero vulnerabilidades; detalles y límites en `docs/reviews/2026-11-15-security-audit.md`.

- Añadida propuesta IA de contenido para la diapositiva activa: atajos de ampliación/recorrido/formulario, alcance contextual explícito, revisión previa, aplicación y deshacer persistente. E2E con Ollama simulado verificado, incluida persistencia tras recarga y deshacer. También se añadió exportación PNG de la diapositiva actual (1600×900, firma PNG verificada). El diálogo/PDF sigue pendiente de revisión.
- Corregida la revisión del documento en la validación previa a la aplicación IA de una diapositiva; la nueva revisión queda validada antes del commit durable.

- Endurecidas las rutas de proyectos, proveedores, sesión e IA frente a cuerpos nulos/primitivos, listas de ámbito malformadas e identificadores inválidos; se verificó el rechazo HTTP 400 en ocho rutas con sesión temporal.
- Primer editor/visor de presentaciones desde el mapa: diapositivas editables enlazadas a ideas, autosave, navegación y salida a impresión/PDF; esquema de proyecto v3 con migración 2→3.
- Corregido el proyecto inicial para que pase validación y abra el mapa de muestra sin error.
- Añadidos bloques editables de recorrido y formulario ficticio estático. La impresión incluye toda la presentación, con una página por diapositiva. Build y recorrido manual parcial (incluida recarga) verificados; vista previa PDF pendiente.
- El estado de sesión sin cookie ahora responde 204; con cookie válida devuelve 200, evitando la falsa alerta de consola del handshake.
- Ampliado el bloqueo de salida a rangos IPv4 no públicos, IPv6 especial y dominios cuyo DNS resuelve a direcciones privadas.
- Lighthouse en producción, móvil y desktop: 100 en Accessibility, Best Practices y SEO; 50 comprobaciones disponibles aprobadas en ambas vistas.
- Continuación de T-015/T-016: bloqueo parcial de SSRF en URLs de proveedores y límites de tamaño/tiempo de respuesta; recuperación de borrador local como proyecto nuevo ante conflictos de revisión.
- Ajustados formularios, viewport móvil y colores de etiquetas del mapa; Lighthouse móvil dio 100 en Accessibility y el handshake/cabeceras/CSP se recorrieron en producción con datos temporales aislados.
- Endurecidos límites de petición, cabeceras HTTP/CSP en producción y redacción de credenciales en logs.
- Validación reforzada de los grafos persistidos y serialización previa al uso de contexto IA/restauración para preservar cambios recientes.
- Añadidas ayudas de accesibilidad: salto al contenido, foco visible, diálogos con gestión de teclado y foco, alternativa textual de mapa, reflujo móvil y preferencia de movimiento reducido.
- Añadida matriz inicial de OWASP Top 10:2025 y WCAG 2.0 AA; quedan pendientes las auditorías manuales y no se declara conformidad.
- Endurecidos límites de petición, cabeceras HTTP/CSP en producción y redacción de credenciales en logs.
- Validación reforzada de los grafos persistidos y serialización previa al uso de contexto IA/restauración para preservar cambios recientes.
- Añadidas ayudas de accesibilidad: salto al contenido, foco visible, diálogos con gestión de teclado y foco, alternativa textual de mapa, reflujo móvil y preferencia de movimiento reducido.
- Añadida matriz inicial de OWASP Top 10:2025 y WCAG 2.0 AA; quedan pendientes las auditorías manuales y no se declara conformidad.
- Verificados en Chromium el arranque de producción, el handshake de sesión local y el autosave de un proyecto tras recarga.
- Corregido “Añadir idea” en un mapa vacío: ahora crea el nodo como idea central.
- Preparadas las sugerencias de muestra para iniciar un mapa sin nodos y añadir su contenido bajo una idea central.
- Añadido un panel para consultar copias recuperables y restaurarlas con confirmación, conservando la versión actual.
- Excluidos los indicadores transitorios de React Flow del archivo del mapa, evitando guardados por selección y recuperando posiciones editadas tras recarga.
- Corregido el ordenamiento multinivel para que las subramas profundas no reciban coordenadas negativas.
- El build de producción vuelve a pasar después de la corrección.
- Verificada en Chromium la restauración de una copia desde UI en datos temporales aislados; la versión actual quedó respaldada y la restaurada pasó a una revisión nueva.
- Verificado el borrado confirmado de una rama con descendiente en datos temporales aislados; raíz y rama hermana permanecieron intactas.
- Corregido el borrado en grafos cíclicos con nodos compartidos y validada la persistencia del grafo restante tras reiniciar el servicio.
- Añadidos perfiles configurables para OpenAI, Anthropic, Ollama, LM Studio y API compatible con OpenAI; las claves usan el almacén de credenciales de Windows y la comprobación de conexión detecta modelos disponibles.
- La ventana de ajustes permite activar, guardar, probar y eliminar perfiles.
- Añadido el primer flujo de IA: chat contextual con sugerencias dinámicas, vista previa de expansión del mapa, aplicación explícita y deshacer persistente. Recorrido con Ollama simulado; proveedor real, streaming e historial pendientes.
- Añadido un resumen expandible antes de enviar que identifica proveedor/modelo y muestra ideas, relaciones y omisiones del contexto; explica cuándo se incluye historial.
- La cancelación desde la UI informa que el mapa no cambió y aborta la petición HTTP del servidor hacia el proveedor en curso; falta verificar con respuesta lenta y aclarar que el motor puede seguir computando internamente.

Los cambios de producto visibles para el usuario se registran aquí. El trabajo detallado y su estado se mantiene en [`docs/TASKS.md`](docs/TASKS.md).

## Sin publicar

- Inicialización del repositorio Git y estructura documental.
- Creación de una shell React/React Flow con edición local de nodos de ejemplo y panel contextual de chat.
- Creación de un servicio Fastify con endpoint de estado `/api/health`.
- Las sugerencias de muestra alteran el mapa localmente y avisan que aún no usan un modelo.
- Instalación de dependencias de desarrollo y generación de `package-lock.json` usando Node 24 portátil dentro de `.tools`.
- Conectada la shell a proyectos locales: selector y creación de proyectos, autosave del mapa, copias previas y restauración manual de una copia válida. Sin build ni recorrido aún.
- Añadida recuperación de copias y validación estructural básica del mapa.
- Añadido intercambio de nonce de un solo uso por cookie `HttpOnly`/`SameSite=Strict` y protección de rutas de proyectos por host, origen, sesión y tipo JSON; falta comprobar el flujo en navegador.
- Ordenado el build de workspaces para compilar el dominio compartido antes que web y servicio, evitando que dependan de importar TypeScript fuente directamente.
- Añadida migración de proyectos de esquema 0 a 1 tras crear y verificar una copia previa.
- Añadidos ordenamiento de mapa seguro ante ciclos, ámbito/recuento de rama y eliminación confirmada de descendientes, preservando ideas compartidas con otras ramas.
- Añadido servidor de estáticos de producción y lanzador Windows inicial con puerto loopback libre, nonce de sesión por fragmento y apertura del navegador. `npm run build` pasa con Node 24.
- Actualizado el plugin estático a una versión corregida tras detectar vulnerabilidades en 8.x; la auditoría resultante informa cero vulnerabilidades.

# Cambios

- El chat puede sugerir diapositivas con recorridos estáticos o formularios ya rellenados con datos ficticios.

- Al aplicar una expansión, el servidor comprueba los nombres de las ideas y rechaza el borrador si contiene duplicados.

- Al ampliar una rama, la petición señala sus ideas hijas que están dentro del contexto para que el modelo aporte detalles nuevos.

- Cuando la expansión no contiene ideas nuevas, el chat explica el resultado y permite pedir otro enfoque.

- Las expansiones de IA admiten una sola idea nueva, incluso si las demás se descartan por repetidas.

- Al ampliar una idea con IA, la vista previa omite etiquetas repetidas dentro del borrador o entre la idea principal y sus hijas directas.

- Las vistas previas de IA muestran un contorno cuando reciben el foco. El contorno queda dentro del panel para que el chat no lo recorte.

- Escape descarta la vista previa de IA que tiene el foco y vuelve al botón de origen si sigue disponible.

- Al descartar un borrador de presentación completo, el foco vuelve al botón que abrió el diálogo de creación si sigue disponible.

- Al descartar una propuesta de ideas o diapositiva, el foco vuelve al botón que la generó si sigue disponible.

- Las vistas previas de ideas y diapositivas de IA reciben el foco al aparecer, para llegar a sus controles con el teclado.

- Al volver a generar sugerencias, el chat pide alternativas a las tarjetas anteriores de la misma selección.

- Dos sugerencias con el mismo título pueden aparecer juntas si apuntan a ideas distintas. Cada tarjeta muestra su destino.

- Las tarjetas de IA con la misma instrucción, destino y tipo de resultado se muestran una sola vez aunque el modelo cambie el título.

- El chat muestra las sugerencias en la selección para la que se generaron, aunque otra rama incluya alguna de las mismas ideas.

- El panel de sugerencias explica cuándo el modelo no propone acciones para la selección y permite volver a pedirlas.

- La interfaz retira las propuestas de IA obsoletas y ofrece cargar la versión guardada tras un conflicto. Si hay cambios locales que no se pueden guardar, mantiene la opción de recuperarlos.

- El lanzador de Windows da tiempo a la comprobación de almacenamiento y explica cuándo Windows no puede validar el volumen de proyectos. — 2026-11-16

- Los proyectos creados con una versión futura aparecen como solo lectura. Si los campos conocidos pasan validación, se puede consultar su proyección; si el contenido no es compatible, se conserva únicamente la información básica y se evita mostrar un mapa incompleto.
- Se actualizaron las tareas, estado, almacenamiento, roadmap, índice de documentación y evidencias de verificación para cerrar T-007 y conservar las diferencias de diseño aún abiertas.

## Contrato persistido canónico de proyecto — 2026-11-16

- ADR-0015 documenta el formato JSON v3 que usa `ProjectDocument`, incluidas las formas reales de nodos, relaciones, conversación y diapositivas.
- Se aclaró que las estructuras conceptuales del diseño no implican cambios de serialización ni migración.

## Contexto acotado de diapositivas vinculadas — 2026-11-16

- El chat, las sugerencias y las propuestas IA reciben fragmentos de diapositivas relacionadas con el ámbito: hasta 20 diapositivas, 500 caracteres cada una y 6.000 en total.
- La vista previa del contexto muestra esos fragmentos antes de enviarlos al proveedor. ADR-0016 registra los límites y el motivo.
- Chrome y un proveedor simulado confirmaron que el payload contiene el contenido de la diapositiva enlazada y omite el de otra rama.

## Validación de volumen local — 2026-11-16

- En Windows, el servicio comprueba antes de escuchar que el directorio de proyectos está en un volumen fijo y de bus local permitido; UNC, red y tipos desconocidos fallan cerrados (ADR-0017).
- La función compilada aceptó una ruta temporal sobre C: y rechazó una ruta UNC sintética. No había unidad extraíble conectada para comprobarla en hardware.
