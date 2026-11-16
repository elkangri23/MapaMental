# EGM Stage 7 — Crítica de diseño

**Documento:** `docs/designs/espacio-visual-personal.md`  
**Ámbito:** FeatureRange, líneas 1–169 al inicio de la ronda  
**Revisores:** Design Critic, Structural, Style  
**Fecha:** 2026-11-14

## Hallazgos consolidados

### Mayor — Falta una defensa concreta de la superficie local del navegador

**Ámbito:** Technical Plan, API local, proveedores y requisitos no funcionales.  
La app propone una API de loopback y validación de origen, pero no define cómo el navegador recibe la sesión ni qué evita que una web ajena intente invocar el servicio. También falta indicar usuario/proceso que ejecuta Node y cómo queda aislado el almacén de credenciales.  
**Recomendación:** definir escucha loopback, allowlist exacta de origen/host, bootstrap de sesión de un solo uso con cookie HttpOnly/SameSite, CSRF, y servicio ejecutado en la sesión interactiva del usuario actual. Añadir aislamiento por cuenta Windows.

### Mayor — El commit de IA y el archivo local pueden quedar desincronizados

**Ámbito:** Proyecto y operaciones, Persistencia, criterios de aceptación.  
La app promete cambios atómicos, autosave, cancelación, revisión e inverso, pero no define el orden durable entre el commit en memoria y escritura en disco. Un fallo de escritura podría mostrar éxito sin guardar o dejar deshacer apuntando a otra revisión.  
**Recomendación:** validar, generar snapshot/inverso, escribir temporal, sincronizar, preservar y verificar backup, reemplazar el archivo, actualizar estado en memoria y solo entonces confirmar a UI. Si guardar falla, conservar el estado anterior y no informar éxito.

### Mayor — El contenido remoto descrito como “contexto pertinente” aún es abstracto

**Ámbito:** Proveedores, privacidad y coste.  
La UI necesita concretar qué partes se comparten y excluir explícitamente claves, copias, otros proyectos y metadatos no necesarios. La preferencia del usuario es contexto ampliado pertinente y no pedir confirmación en cada solicitud.  
**Recomendación:** enumerar selección, ancestros/relaciones pertinentes, resumen del proyecto y conversación reciente pertinente; permitir inspeccionar el detalle exacto del paquete sin un diálogo de confirmación. Nunca incluir claves ni carpetas de backup.

### Mayor — El presupuesto estimado no define sus casos de datos incompletos

**Ámbito:** Proveedores, privacidad y coste; criterios de aceptación.  
El comportamiento ante tarifa/uso ausente se menciona, pero faltan reglas de facturación estimada, reintentos, llamadas fallidas, interrupción de stream y cambio de tarifa.  
**Recomendación:** documentar que el presupuesto usa tarifas configuradas por el usuario en EUR y tokens reportados por el proveedor; no convierte moneda ni calcula impuestos. Registrar uso reportado de respuestas completas o parciales. Si el proveedor no informa uso/precio, avisar y continuar según decisión del usuario, señalando que el límite no está garantizado. Las solicitudes nuevas se bloquean cuando el total conocido alcanza el presupuesto.

### Mayor — Copias y escrituras necesitan un criterio de fallo y ubicación admitida

**Ámbito:** Persistencia, seguridad y riesgos.  
No se concreta qué hacer ante disco lleno, JSON corrupto, reemplazo interrumpido o directorio en red.  
**Recomendación:** limitar la primera versión a almacenamiento local; escribir y sincronizar el temporal, verificar la copia anterior y no rotar la última copia válida si el nuevo guardado falla. En errores de disco, conservar archivo y copia anterior y mostrar acción de recuperación.

### Mayor — Alternativas técnicas sin justificación comparativa suficiente

**Ámbito:** Alternatives Considered.  
Algunas razones repiten preferencia («el usuario quiere») más que comparar costo, recuperación, seguridad o fricción.  
**Recomendación:** añadir trade-offs verificables de browser-only, servicio local, escritorio y archivos/SQLite, dejando explícito que el servicio e instalador se eligieron para acceso a modelos locales, credenciales y recuperación.

### Mayor — Redacción confunde capacidades planeadas con existentes

**Ámbito:** Overview, The Problem, Technical Plan, API, proveedores, persistencia.  
El documento está en estado borrador, pero varias frases en presente pueden hacer parecer que el servicio, adaptadores, copias y exportaciones ya están disponibles.  
**Recomendación:** redactar requisitos y arquitectura en futuro o con “la aplicación deberá”; describir el shell inicial como código existente solo en el estado del proyecto, no en la especificación.

### Mayor — Falta sección explícita de riesgos y mitigaciones

**Ámbito:** estructura de FeatureRange.  
Seguridad, almacenamiento, límites y fallos están dispersos; el estándar requiere que el lector pueda revisar riesgos y mitigaciones en conjunto.  
**Recomendación:** incluir sección `Risks & Mitigations` con riesgos de loopback/CSRF, credenciales, proveedor remoto, coste no medible, fallo de disco, context-window, proceso local y empaquetado.

### Nit — Faltan objetivos medibles de tamaño y respuesta

**Ámbito:** Goals y Non-Functional Requirements.  
El diseño no fija tamaño orientativo de proyecto ni objetivo de guardado/exportación.  
**Recomendación:** proponer metas iniciales de rendimiento para validar en el uso personal, distinguiéndolas de capacidades verificadas.

## Resultado estructural y editorial

La jerarquía, listas y bloques Markdown son consistentes. No obstante, la sección `Risks & Mitigations` requerida por el estándar no está presente. La revisión de estilo pide distinguir todas las capacidades planeadas de las ya existentes y sustituir la frase subjetiva «líneas útiles» por ejemplos concretos.

