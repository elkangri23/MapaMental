# Criterios de aceptación

## Presentación completa con IA

- Chrome y Ollama simulado, con proyectos temporales. Se pidió un borrador de cuatro diapositivas y, en modo automático, se aceptó un borrador de cinco. El servidor rechazó una cantidad distinta de la solicitada y referencias fuera del mapa enviado.
- Revisar el borrador no cambió la revisión guardada. Aplicar guardó cuatro diapositivas y una copia de la versión anterior. Tras recargar, deshacer recuperó las tres diapositivas originales. El mapa mantuvo sus nodos y conexiones.
- La primera diapositiva mostró una tabla en la vista previa. Descartar el borrador automático dejó intacto el documento. La compilación de producción pasó. Queda pendiente evaluar la calidad y los tiempos con un modelo real.
- Tras aplicar un borrador, se guardó una revisión externa por API para provocar un conflicto. La copia del proyecto conservó la presentación y la edición local del mapa. El deshacer quedó asociado únicamente al proyecto original.

## Número de diapositivas al convertir un mapa

- Compilación de producción correcta. Desde Chrome se abrió el diálogo y se comprobó el foco inicial, la cantidad sugerida y el rechazo de 101 diapositivas.
- Una presentación de tres diapositivas conservó referencias a las cinco ideas de muestra. La navegación mostró «2 de 3» y DevTools produjo un PDF de tres páginas.
- Cancelar mantuvo la revisión existente. Al confirmar siete diapositivas se conservaron las anteriores como copia y las dos adicionales quedaron en blanco. El límite de cien se recorrió en el editor y se verificó el guardado.

## Paquete portátil Windows x64

- El script compiló la aplicación, preparó las dependencias de producción desde el archivo de bloqueo y generó el ZIP con Node 24.22.2.
- En una extracción aislada se comprobó el arranque, la web servida por HTTP, el intercambio de nonce por sesión y el guardado bajo una ruta de proyectos temporal. El segundo arranque conservó PID y puerto, y la parada cerró el servicio.
- Quedan pendientes el recorrido visual de los accesos directos, la compilación con Inno Setup y la prueba de instalación, actualización y desinstalación.

## Presupuesto remoto por proveedor

- La compilación de producción pasó. En Chrome aislado se guardó un perfil remoto compatible con OpenAI con presupuesto de 0 EUR. Se guardaron tarifas distintas para dos modelos del mismo perfil. La generación se bloqueó antes de contactar con la URL configurada. Vaciar el campo restauró el uso sin límite. El perfil Ollama en loopback quedó fuera del contador.
- Se recorrió la contabilidad con respuestas simuladas. El coste acumulado alcanzó el presupuesto y la siguiente llamada se rechazó. El mes siguiente partió de cero. Se guardó uso parcial en una respuesta fallida, se marcó como incompleto el uso sin tarifa y se rechazó una segunda petición simultánea para el mismo perfil dentro del servicio.
- Se comprobó el registro en disco. Queda pendiente comparar el uso reportado por un proveedor real con la estimación.

## Eventos de progreso de IA

- La compilación de producción pasó. En Chrome con Ollama simulado, la respuesta SSE entregó preparación, espera del proveedor, validación y resultado, en ese orden, con `Cache-Control: no-store`. Una selección inexistente terminó en un evento de error. El modo JSON siguió funcionando.
- Se repitieron las cuatro cancelaciones con el flujo SSE activo. Cesó la conexión con el proveedor y el proyecto quedó igual. Cancelar durante el guardado previo conservó la edición y evitó enviar la petición.
- Se simuló un corte después de la etapa de espera. La interfaz mostró un error, conservó el borrador y permitió reintentar con éxito.

## Cancelación de generación con proveedor lento

- Chrome y Ollama simulado, con almacenamiento temporal. Se cancelaron una consulta de chat, una propuesta de mapa, una nueva diapositiva con tabla y una mejora de diapositiva. El simulador observó cuatro conexiones cerradas antes de completar la respuesta, tanto mientras esperaba enviar cabeceras como durante la lectura del cuerpo.
- Tras esperar el tiempo de respuesta simulado, el documento seguía idéntico y no apareció ninguna propuesta. El chat conservó el borrador. En dos recorridos, la interfaz confirmó la cancelación entre 2 y 11 ms después de pulsar el botón. Este dato es del entorno local con respuesta simulada.
- Con un guardado previo ralentizado, pulsar «Cancelar» evitó que se enviara el contexto al proveedor y permitió que la edición del mapa se guardara.
- La compilación de producción pasó. La comprobación cubre el cierre de la petición HTTP. El comportamiento interno de los modelos reales queda pendiente.

## Historial del chat por proyecto

- En Chrome con almacenamiento aislado y Ollama simulado, se enviaron dos consultas y se comprobó su guardado y recuperación tras recargar. «Generar sugerencias» incluyó los turnos anteriores en la petición y no añadió mensajes artificiales al historial.
- Guardar conversación después de aplicar una propuesta conservó el inverso de creación de diapositiva. Al recargar se pudo deshacer esa creación y conservar la conversación. Un proyecto nuevo abrió con el chat vacío y el anterior recuperó sus cuatro mensajes al volver a seleccionarlo.

## Tabla editable desde una sugerencia

- El build de producción pasó. Con Chrome y un Ollama simulado, una tarjeta de calendario de cultivos solicitó explícitamente una tabla. La vista previa mostró tres columnas y dos cultivos. El proyecto se mantuvo sin diapositivas hasta confirmar.
- Aplicar guardó la tabla, deshacer retiró la diapositiva y volver a generarla permitió añadir una columna y una fila. El autosave guardó los cambios y la API rechazó una fila irregular con HTTP 400.
- La plantilla de impresión incluyó la celda editada y Chrome produjo un PDF de una página para esa diapositiva. El canvas de exportación PNG dibujó el valor editado. Queda pendiente revisar visualmente combinaciones densas y la calidad de la IA con un modelo real.

## Estabilización del editor y guardado

- En Chrome con perfil y almacenamiento temporales, vaciar el nombre de una idea conservó el nombre válido. Un fallo simulado de guardado impidió crear otro proyecto y el reintento guardó la edición. Un HTTP 500 del proveedor simulado dejó el borrador del chat disponible.
- El botón «Imprimir / Guardar PDF» invocó la función de impresión. Chrome produjo un PDF de seis páginas para seis diapositivas mediante DevTools. Queda pendiente comprobar el diálogo nativo y el guardado desde dicho diálogo.
- Cancelar el reemplazo conservó la presentación. Al restaurar con una edición pendiente, el guardado se completó primero y se comprobó en disco que la copia previa contenía esa edición. El chat quedó limpio.
- Una escritura externa por la API adelantó la revisión. El autosave del navegador recibió HTTP 409 y «Guardar cambios como proyecto nuevo» conservó la edición local en la copia. El original conservó la revisión externa.

## Sugerencias contextuales y creación de diapositivas

- Compilación de producción correcta. Con Fastify y Ollama simulado en `127.0.0.1`, se comprobó que el chat filtra duplicados y destinos fuera del ámbito, y que la expansión añade ideas solo bajo la rama indicada.
- La propuesta para otra rama devolvió HTTP 409. La vista previa dejó intacta la presentación. Aplicar añadió una diapositiva ligada a la idea de origen, repetir la misma revisión devolvió HTTP 409 y deshacer retiró la diapositiva sin tocar el mapa.
- Queda pendiente revisar el panel en navegador y evaluar la calidad de las sugerencias con un modelo real.

## OWASP Top 10:2025 y WCAG 2.0 AA (línea base)

La matriz de controles y criterios está en [`COMPLIANCE.md`](COMPLIANCE.md). Estado actual: build de producción y auditoría de dependencias verificados; controles de servidor revisados. No se ejecutaron suites automatizadas ni recorridos negativos completos. Los escenarios no marcados como parciales siguen pendientes:

1. [x parcial] Comprobar CSP/cabeceras en el build de producción para página y API; assets cargaron 200 bajo CSP. Falta confirmar todas las rutas/endpoints y recorridos con fallos.
2. [ ] Recorrer autorización de cada ruta, cabeceras host/origen, tamaño de cuerpo, errores y restauración con archivo principal ausente.
3. [x parcial] Skip link recibió foco; diálogo de proveedor recibió foco inicial, Escape cerró y devolvió foco a su botón; vista textual fue recorrida. Falta navegar todas las funciones con teclado.
4. [x parcial] Lighthouse ya no reporta contraste insuficiente en viewport móvil y dio 100 en Accessibility; medir combinaciones de color/estados con informe completo sigue pendiente.
5. [x parcial] A 375×812 no hubo scroll horizontal; zoom 200 %, texto ampliado y lector de pantalla siguen pendientes.
6. [ ] Completar evaluación de todos los criterios WCAG 2.0 nivel A y AA aplicables antes de declarar conformidad.

Resultados añadidos: Lighthouse en producción (desktop y móvil), Accessibility/Best Practices/SEO 100, 50/50 auditorías disponibles; handshake 204 sin cookie y 200 con cookie; consola móvil limpia. Resolución DNS bloqueó un dominio que devolvía loopback; el socket ahora se fija a las direcciones validadas. No se evaluaron zoom 200 %, lector de pantalla ni el recorrido de conexión fijada en Windows.

## Estado de ejecución

Este documento define escenarios manuales y registra por separado los resultados observados. Los recorridos Chromium de 2026-11-15 verificaron el handshake local, persistencia básica, migración, restauración de copia, borrado de rama, el flujo chat/mapa parcial y la propuesta de diapositiva→aplicar→recargar→deshacer con Ollama simulado en almacenamiento temporal aislado. También se verificó la creación del blob PNG. Falta modelo real, fallos/concurrencia IA, revisión de impresión/PDF y la instalación.

Estos escenarios definen resultados que deberá cumplir la aplicación. No indican que se hayan ejecutado ni crean una suite automatizada.

### Correcciones code-audit — 2026-11-15

- `npm run build` con Node 24.22.2: pasó para dominio, servidor y web tras los cambios de guardado/validación, concurrencia IA y layout de grafo.
- No se añadieron ni ejecutaron pruebas automatizadas, conforme al flujo del proyecto. Tampoco se recorrieron dinámicamente los escenarios pendientes listados en [`reviews/2026-11-15-code-audit.md`](reviews/2026-11-15-code-audit.md).

### Estabilización adicional — 2026-11-15

- `npm run build` con Node 24.22.2: pasó para dominio, servidor y web tras los cambios de cola de guardado, serialización por proyecto, revisiones IA y recorte de contexto.
- `git diff --check`: limpio.
- No se ejecutó suite automatizada ni recorrido E2E en este incremento.

### Estabilización por errores pendientes — 2026-11-15

- `npm run build` con Node 24.22.2: correcto para dominio, servidor y web tras serializar lecturas/migraciones, proteger restauración y coordinar creación de proyectos.
- `npm audit --omit=dev`: cero vulnerabilidades reportadas.
- No se ejecutaron pruebas automatizadas ni recorridos E2E. Siguen pendientes los casos aislados de fallo de guardado, restauración durante autosave y migración/lectura concurrente; no se marcan como verificados dinámicamente.

1. [x parcial] Crear un proyecto y un mapa en español, renombrar la idea central y añadir una idea conectada; esperar el autosave y recuperar ambos nodos tras recargar. No se recorrieron aún movimiento y cierre de app.
2. [x parcial] Seleccionar una rama y ampliarla con IA; comprobar que otras ramas permanecen intactas, que el ámbito se muestra y que la última operación puede deshacerse. Recorrido simulado confirmado; falta el modelo real, otra rama no seleccionada y reinicio antes del deshacer.
3. Cancelar una generación antes de confirmar; comprobar que el lienzo permanece como estaba.
4. Configurar Ollama o LM Studio, comprobar conexión y generar sin salir del equipo.
5. [x parcial] Expandir el resumen antes de enviar y comprobar proveedor/modelo, proyecto, etiquetas, relaciones, elementos omitidos e historial. Con perfil local simulado, el mapa completo mostró 5 ideas y 4 relaciones; una hija seleccionada mostró una idea y 4 omitidas. No se envió prompt. Pendiente probar proveedor remoto y confirmar payload real/logs.
6. Alcanzar un presupuesto conocido; comprobar que se bloquean nuevas peticiones y que cambiar el límite vuelve a habilitarlas. Si faltan tarifa o tokens, comprobar el aviso y el comportamiento acordado.
7. [x parcial] Crear cinco diapositivas; el visor mostró 5 y `Page.printToPDF` generó un PDF de 5 páginas en Chromium. Exportar PNG de la diapositiva seleccionada.
8. Editar texto, viñetas, un diagrama de recorrido y un formulario ficticio; comprobar que son bloques editables y no controles funcionales.
9. [x parcial] Restaurar una copia, conservar el estado previo y crear revisión nueva: recorrido Chromium en almacenamiento temporal aislado. Falta abrir tras cambiar de versión de app o proveedor.
10. Instalar desde el paquete Windows, abrir desde el acceso directo, actualizar preservando proyectos, y desinstalar conservando datos del usuario.

## Seguridad de sesión local (recorrido parcial)

1. [x] Abrir la UI de producción local desde el origen configurado: canje válido, cookie `HttpOnly`, fragmento eliminado y estado autenticado HTTP 200 tras recarga.
2. [x parcial] El nonce inválido/reutilizado se rechaza con HTTP 401; un origen distinto se rechaza con HTTP 403. No se probó un `Host` alternativo.
3. [x parcial] Sin cookie, estado responde HTTP 204 y listado de proyectos HTTP 403; con cookie válida, estado 200. No se probó la mutación sin `Content-Type`.
4. [x parcial] El bootstrap de producción respondió HTTP 404. Se comprobó el canje del nonce con Chromium contra producción temporal; queda pendiente verificar el fragmento emitido específicamente por el lanzador en el navegador.
5. Abrir un documento de esquema 0 y comprobar que crea una copia idéntica antes de migrar a esquema 1; abrir un esquema futuro y comprobar que permanece intacto.

## Verificación disponible ahora

- Revisión estática de enlaces Markdown ejecutada después de documentar el plan; los enlaces locales existentes resolvían.
- `npm run build` ejecutado con Node 24.22.2 el 2026-11-15, tanto antes como después de corregir el alta de la primera idea: dominio, servidor y Vite compilaron correctamente.
- La instalación de `@fastify/static` 10.1.11 dejó `npm audit` en cero vulnerabilidades; se descartó la versión 8.x por avisos de seguridad.
- El parser de PowerShell informó sintaxis válida para `scripts/start-local.ps1`.
- El lanzador `scripts/start-local.ps1` inició el servicio de producción en loopback. `GET /api/health`, `/`, y bundles JS/CSS respondieron HTTP 200.
- Chromium recorrió la UI de un servidor local con nonce controlado: canjeó la sesión, guardó cookie `HttpOnly`, limpió el fragmento y permaneció autenticado tras recargar. Crear un proyecto y usar “Añadir idea” produjo una idea central; después se renombró y se añadió una idea conectada. El estado pasó de “Guardando…” a “Guardado local”, y una recarga recuperó los dos nodos con sus etiquetas y enlace. La lista de proyectos confirmó revisión 2.
- Chromium mostró las copias válidas en el panel de recuperación. En datos temporales aislados se restauró desde el botón de la UI una copia de revisión 4. La UI mostró el aviso de éxito, el contador de copias pasó de 2 a 3 y el servicio escribió el resultado como una revisión nueva preservando antes el estado actual. No se tocó ningún proyecto personal.
- En el build posterior, seleccionar la idea hija dejó la revisión en 7 y el número de copias en 6. Una flecha derecha movió su posición X de 235 a 240; el autosave creó la revisión 8 y la recarga conservó ambas ideas, su conexión y la nueva posición. El estado `selected` no se escribió en el JSON.
- En almacenamiento temporal aislado, una tarjeta de monetización sobre mapa vacío creó una idea central y dos nodos enlazados. El autosave llegó a revisión 2.
- El layout automático con una subrama situó inicialmente un nodo en X=-50. Se corrigió el margen según la profundidad izquierda. El nuevo recorrido guardó posiciones X 150, 435, 720 y 1005; tras recargar conservó cuatro nodos y tres enlaces.
- En almacenamiento temporal aislado se abrió un documento esquema 0: la API lo migró a esquema 1, rellenó `presentation`, `conversation` y `suggestions`, conservó revisión 4 y creó una copia previa con esquema 0 intacto.
- El recorrido encontró y corrigió un bug: “Añadir idea” intentaba leer la posición de un padre inexistente en un mapa vacío. Ahora crea la primera idea como raíz. `npm run build` volvió a pasar.
- El mismo caso vacío podía fallar en las tarjetas de ejemplo; se añadió una idea central y las ramas de muestra. Chromium recorrió el caso y el autosave persistió el mapa.
- Antes del ajuste, el estado sin sesión devolvía 401; ahora devuelve 204 para no tratar el handshake esperado como error de consola. Proyectos sin sesión siguen respondiendo 403; bootstrap de producción 404; origen distinto 403; nonce inválido/reutilizado 401; sesión válida 200.
- En otro proyecto temporal aislado, se seleccionó “Suscripción flexible”, se confirmó borrar esa rama con su descendiente y se observó que permanecieron la idea raíz y la hermana “Servicios complementarios”; mensaje: “Se eliminó la rama con 2 ideas. El resto del mapa se conserva.”
- En un proyecto temporal con `root→A`, `root→B`, `A→shared`, `B→shared` y el ciclo `shared→A`, borrar A inicialmente exponía que el algoritmo podía proteger también el nodo seleccionado. Se ajustó la protección para conservar los descendientes compartidos, nunca la raíz de borrado. Tras repetir, desapareció A, permanecieron root/B/shared y `B→shared`; el servicio se detuvo y arrancó de nuevo y la UI recuperó los tres nodos restantes.
- T-009: build de producción correcto con Node 24. Chromium guardó un perfil OpenAI con credencial de marcador, lo activó y la API indicó `credentialConfigured: true`; el archivo temporal solo contenía `id,name,kind,baseUrl,model` y no el marcador secreto. Se eliminó el perfil. Después la UI creó y probó un perfil Ollama contra un mock en loopback; devolvió dos modelos y la UI mostró conexión correcta. No se contactó con proveedores reales.
- T-010 parcial: `npm run build` pasó con Node 24.22.2. En Chromium, con directorio de proyectos y `%APPDATA%` temporales y servidor Ollama JSON simulado, se creó un perfil y se verificó la conexión. Chat respondió texto y dos sugerencias dinámicas; pulsar “Añadir opciones” produjo vista previa de dos ideas bajo la raíz, indicando el ámbito. Aplicar cambió el conteo de 5 a 7 ideas y creó una copia recuperable (0→1); “Deshacer IA” restauró 5 ideas como nueva revisión y creó otra copia (1→2). No se ejecutó modelo real ni se tocaron proyectos personales. La pestaña y procesos de prueba ya no estaban activos al revisar esta continuación; los perfiles se guardaban en `%APPDATA%` temporal, no en la configuración personal.
- T-010, resumen de contexto: en Chromium se guardó y activó un perfil Ollama simulado en `%APPDATA%` temporal; el panel mostró proveedor/modelo y conexión local. Al expandirlo, con la raíz seleccionada aparecieron nombre del proyecto, 5 etiquetas y las 4 relaciones; al seleccionar “Personas curiosas”, mostró esa idea y el aviso de 4 ideas fuera del ámbito. La nota explicó el historial de chat y su ausencia al pulsar sugerencias. No se envió mensaje ni propuesta. El servicio temporal se detuvo; el perfil quedó solo en el directorio de datos temporal aislado.
- Cancelación: el servidor ahora pasa la desconexión/cancelación del cliente al fetch del proveedor para chat y propuestas; la UI muestra que no se aplicaron cambios. `npm run build` de producción confirma compilación; falta ejecutar el escenario 3 con mock lento y comprobar que no aparece propuesta ni cambio en el mapa.
- El capturador de escritorio falló (`GetCursorPos failed: 0x80070005` y `CreateForMonitor failed: 0x80070057`); Chromium DevTools permitió los recorridos de la UI. Falta verificar el fragmento concreto emitido por el lanzador.
- Al completar cada incremento, registrar aquí el comando/escenario realizado y resultado observado; no marcar los escenarios anteriores como pasados por inferencia.



## Auditoría estática de seguridad — 2026-11-15

- `npm run build` con Node 24.22.2: correcto.
- `npm audit --omit=dev`: cero vulnerabilidades reportadas.
- DNS fijado al socket de Undici; no se hizo recorrido real con proveedor. La petición de conectividad externa del entorno recibió HTTP 403 y no cuenta como verificación del proveedor.
- Alcance y pendientes: [`reviews/2026-11-15-security-audit.md`](reviews/2026-11-15-security-audit.md).

### Auditoría de código, seguridad e interfaz — 2026-11-15

- `npm run build` con Node 24.22.2: correcto para dominio, servidor y web.
- `npm audit --omit=dev`: cero vulnerabilidades reportadas.
- Revisión estática: escrituras de configuración de proveedor ahora comparten cola serializada; se eliminó la opción que ocultaba la atribución React Flow. El build confirma la integración, pero no se simuló carrera de API ni se hizo una inspección visual de la atribución en navegador.
- Alcance: lectura de rutas de sesión/proveedor y controles del editor/chat, CSS de foco/reflujo/impresión y revisión de estados/backlog. No se realizó pentest, pruebas automatizadas, lector de pantalla, contraste integral ni evaluación de conformidad WCAG.

### Rutas con cuerpos/identificadores inválidos — 2026-11-15

- En desarrollo, se canjeó el nonce local y se recorrieron creación de proyecto, guardado de proveedor, selección activa, lectura con ID de proyecto malformado, chat, propuestas, aplicación de acción y deshacer con JSON `null` o array.
- Las ocho solicitudes se rechazaron con HTTP 400. También se comprobó que una petición de sesión válida permitía entrar a la comprobación; no se enviaron prompts a proveedores.
- No se cubrieron todas las cabeceras de host/origen, archivos sobredimensionados, configuración corrupta ni rutas de recuperación; siguen pendientes en T-015.

### Presentaciones T-011 — recorrido parcial (2026-11-15)

- Build de producción con Node 24.22.2 correcto; `git diff --check` limpio. En perfil aislado y datos temporales se verificó el arranque limpio (proyecto y mapa inicial), generación desde cinco nodos, adición de bloques de recorrido y formulario, persistencia vía PUT y visualización tras recarga, y navegación a la diapositiva 2/5. El DOM mantiene cinco páginas en la plantilla de impresión y los bloques se representan allí.
- En el recorrido inicial, la acción de imprimir se intentó desde Chrome DevTools, pero el control quedó bloqueado por el diálogo del navegador; entonces no se confirmó vista previa ni archivo PDF ni recuperación desde backup. La plantilla de impresión renderiza todas las diapositivas en vez de solo la activa. Las verificaciones posteriores están en “Reanudación de T-011 y verificación dinámica T-017”.
- El esquema subió a v3; la migración 2→3 está implementada. Su recorrido con un archivo v2 temporal se registró el 2026-11-16 al final de este documento.
- Con configuración y almacenamiento temporales, un Ollama mock en `http://localhost` pasó la comprobación de conexión. La propuesta IA de diapositiva respondió HTTP 200; se revisó el texto, las ideas clave, recorrido y formulario ficticio antes de aplicar. La aplicación persistió como revisión nueva, se recargó el navegador, se confirmó la presencia del contenido y del deshacer persistente; al deshacer, la diapositiva original quedó restaurada como revisión posterior. La copia aumentó antes de aplicar y deshacer.
- La exportación PNG de la diapositiva activa se disparó desde su botón. Se inspeccionó el blob antes de la descarga: tipo `image/png`, tamaño 90.560 bytes en la diapositiva de muestra, 1600×900 y firma PNG válida (`89 50 4E 47 0D 0A 1A 0A`). Se comprobó el nombre de descarga. Esto valida creación/formato, no inspección visual completa de todas las combinaciones de bloques.
- No se contactó con proveedores reales. El diálogo/PDF, recuperación desde backup y revisión visual/accesible completa siguen pendientes.

### Reanudación de T-011 y verificación dinámica T-017 — 2026-11-15

- En un perfil de proyectos y configuración bajo `%TEMP%`, se abrió el proyecto con cinco diapositivas, se pasó a la vista Presentación y se llamó `Page.printToPDF` desde Chromium. Resultado: 5 diapositivas en el DOM de impresión, PDF de 5 páginas, tamaño Letter apaisado, 63.836 bytes.
- Se renderizaron las cinco páginas con Poppler y se revisaron las páginas 1, 2 y 4. Se detectó el bloque de título empujado hacia la mitad inferior por un margen automático. Se ajustó `@media print`; el PDF regenerado mantiene 5/5 páginas y el contenido queda arriba con un acento visual. No se guardó el PDF en el repositorio; el archivo temporal queda en `%TEMP%`.
- El intento de accionar el botón «Exportar PDF» desde Chrome DevTools no pudo completar la interacción con el diálogo del navegador; la salida PDF se verificó por CDP `Page.printToPDF`, que valida la plantilla paginada, pero el botón/diálogo de usuario permanece pendiente.
- En otra carpeta temporal, `getProject` y `listProjects` se ejecutaron concurrentemente sobre un JSON esquema 2 mientras se verificaba su migración y copia previa. Después, un guardado y una restauración con la misma revisión esperada compitieron: uno tuvo éxito y el otro recibió 409; el archivo quedó en revisión 3 y el esquema 3.
- Desde la UI aislada se generaron cinco diapositivas (revisión 2, una copia), se abrió «Copias recuperables» y se restauró la copia inicial. El proyecto volvió a cero diapositivas en revisión 3 y pasó de una a dos copias; la UI confirmó que la restauración creó una revisión nueva.
- Siguen pendientes el fallo de guardado desde UI y el autosave simultáneo con edición/restauración. No se ejecutó suite automatizada.

### PDF A4 para diapositivas densas — 2026-11-15

- Se corrigió la paginación de impresión: antes tres diapositivas podían ocupar cinco páginas. La hoja ahora tiene tamaño A4 apaisado fijo y el contenido denso se escala para permanecer en su página; las diapositivas con texto y bloques visuales se distribuyen en dos columnas.
- Chromium `Page.printToPDF` generó tres páginas para tres diapositivas de prueba. La segunda contenía 14 líneas de texto, ocho viñetas, una tabla de seis filas, seis pasos y seis campos de ejemplo. El render con Poppler mostró todos los bloques; la extracción PDF encontró las ocho observaciones y los cuatro marcadores colocados al final de cada bloque.
- Se comprobó el tamaño de página PDF: A4 apaisado. La prueba usó datos aislados; no contactó ningún proveedor de IA ni modificó proyectos del usuario. No se verificó el diálogo nativo de impresión/guardado.

### Accesibilidad de navegación T-011 — 2026-11-15

- Revisión estática del editor: los campos principales tienen nombre accesible, el recorrido y los bloques de formulario se exponen como texto, y los controles de navegación usan botones nativos con límites deshabilitados al principio y al final.
- Se añadió una etiqueta a la región de navegación y un estado `aria-live="polite"` y atómico con la posición actual, para que cambiar de diapositiva anuncie «Diapositiva N de total» sin releer todo el lienzo.
- No se ejecutó una prueba con lector de pantalla ni se declara conformidad WCAG por este cambio aislado; esos recorridos siguen pendientes en T-016.

### Correcciones de código y recorridos de T-017 — 2026-11-15

- Revisión de React StrictMode: el efecto inicial podía hacer dos lecturas vacías concurrentes y crear dos espacios. Se comparte la creación del proyecto inicial entre las ejecuciones mientras dure la promesa; si falla, se permite reintentar.
- Revisión de persistencia: el guardado ya confirmado podía responder error si fallaba la lectura del directorio usada para recortar copias. Esa limpieza ahora no puede invalidar el resultado del commit.
- En Vite de desarrollo con React StrictMode se retrasaron las respuestas de los dos listados iniciales para que ambos observaran el estado vacío. Hubo dos lecturas y una sola petición de creación; el servicio conservó un único proyecto.
- En almacenamiento temporal se lanzaron en paralelo 12 altas y 12 ediciones de perfiles Ollama; los 12 perfiles y sus nombres se conservaron. Activaciones simultáneas dejaron un perfil válido activo; edición, borrado y activación concurrentes conservaron los cambios esperados. Los perfiles temporales se eliminaron al finalizar.
- Se ejecutaron 25 guardados y cinco restauraciones en un proyecto aislado: la API siguió enumerando un máximo de 20 copias válidas.
- Se inyectó `EIO` en la lectura de la carpeta de copias después de escribir el proyecto. El guardado respondió revisión 2 y `getProject` confirmó el mismo nombre y revisión tras releer el archivo.
- Los datos y perfiles fueron temporales; no se enviaron peticiones a modelos. `npm run build` con Node 24.22.2 pasó en dominio, servidor y web. Seguía pendiente el recorrido de conflicto entre dos ventanas.

### Conflicto entre pestañas y recuperación de T-017 — 2026-11-16

- Se abrieron dos pestañas autenticadas sobre el mismo proyecto temporal en Chromium. La primera añadió una diapositiva y guardó revisión 2; la segunda añadió otra con título distinto y el autosave recibió el conflicto de revisión esperado. «Guardar cambios como proyecto nuevo» creó la bifurcación con la diapositiva local. Tras consultar ambas por API, el original conservó su diapositiva y revisión 2; la copia conservó el cambio de la segunda pestaña. El aviso de conflicto desapareció en la copia.
- En otra carpeta temporal se creó un proyecto, se generó una copia v1 con un guardado, se quitó el archivo principal y se consultaron/restauraron las copias. La restauración produjo un proyecto válido de revisión 2, recuperable tras releerlo.
- Los escenarios usaron almacenamiento aislado y no enviaron datos a modelos. El código temporal de recorrido se retiró. Siguen pendientes grafos grandes, fixtures inválidos y editar/borrar tras aplicar IA para comprobar guardado/deshacer.

### Integridad de deshacer IA — 2026-11-16

- En un proyecto temporal se guardó un inverso IA válido en revisión 2. El validador rechazó una conexión adicional hacia el nodo IA que el inverso habría borrado.
- Se eliminó el nodo IA y su arista mediante un guardado normal: el proyecto avanzó a revisión 3, limpió `lastAiUndo` y, después de releerlo, mantuvo una sola idea y ningún inverso disponible.
- Prueba directa de almacenamiento/validador con datos aislados. No se llamó al proveedor IA. Quedan pendientes otras variantes de payloads inválidos y ciclos completos de propuesta/aplicación/deshacer desde la interfaz.

### Ordenamiento de grafo grande T-017 — 2026-11-16

- Chromium abrió un proyecto temporal con 2200 nodos en una cadena, un ciclo de vuelta y una conexión convergente. «Ordenar» completó la parte síncrona en 9 ms, guardó la revisión 2 y conservó los 2200 nodos/2201 aristas. Todas las coordenadas seguían finitas y dentro de ±1.000.000; no hubo desbordamiento de pila.
- El escenario confirmó el comportamiento en una cadena larga/cíclica con convergencia; no representa una medición del máximo admitido de 10.000 nodos. Proyecto y proceso de prueba se aislaron y eliminaron al terminar.

### Propuesta IA y edición posterior desde la interfaz — 2026-11-16

- En perfil y proyecto aislados, un servidor Ollama simulado respondió con una sugerencia y una propuesta revisable. En Chromium se pulsó la sugerencia, se revisó la propuesta y se aplicaron dos ideas: el mapa pasó de cinco a siete nodos y guardó el inverso IA.
- Se añadió una idea manual desde la interfaz. El autosave avanzó una revisión, el mapa pasó a ocho nodos y `lastAiUndo` quedó vacío. Tras recargar, la API confirmó los ocho nodos persistidos y que no había inverso; intentar deshacer con la revisión vigente respondió 409.
- El escenario valida el ciclo UI y la invalidación tras una edición persistida, usando respuestas controladas; no mide la calidad de un modelo real. Los datos y procesos temporales se limpiaron al finalizar.

### Límites del validador de grafos T-017 — 2026-11-16

- Se construyó un documento de dominio temporal con 10.000 nodos válidos; `validateProject` lo aceptó en 3,5 ms en Node 24.22.2. Al exceder el máximo con un nodo adicional, lo rechazó.
- Con copias independientes, también rechazó IDs de nodo duplicados, una arista cuyo destino no existe y una coordenada infinita. El tiempo mide validación de dominio, no lectura JSON, guardado en disco ni carga/render de Chromium con 10.000 nodos.

### Auditoría de accesibilidad y build — 2026-11-16

- `npm run build` pasó con Node 24.22.2 en dominio, servidor y web. `npm audit --omit=dev` informó cero vulnerabilidades. No se ejecutaron pruebas automatizadas.
- En Chromium de producción sobre almacenamiento aislado, Lighthouse snapshot móvil y escritorio dio Accessibility 100/100, 35 comprobaciones disponibles aprobadas y cero fallidas en cada modo; se verificó tanto el mapa como una diapositiva con recorrido, formulario ficticio y tabla. Se recorrió el árbol accesible de React Flow y se comprobó que nodos, conexiones, minimapa y controles de zoom anuncian sus nombres e instrucciones en español.
- El recorrido de teclado comprobó skip link y foco en el main; el diálogo de proveedores recibe foco inicial, contiene el ciclo Tab, cierra con Escape y devuelve el foco al botón. En el mapa se pudo enfocar un nodo, entrar a edición con F2 y salir sin cambiar el proyecto; la vista de lista permitió seleccionar una idea con Enter.
- A 320 CSS px y 640 CSS px no hubo scroll horizontal; los controles activos quedaron en pantalla. El diálogo de proveedores a 320 px se mantuvo dentro del viewport y usó scroll interno.
- El muestreo de contraste en el lienzo y el editor de diapositiva encontró bajos contrastes que se corrigieron en etiquetas, marcadores, texto de formulario ficticio, fuente del mapa y controles del lienzo. Lighthouse encontró además botones de orden con nombre distinto del texto visible; se corrigieron y se repitieron las 35 auditorías móvil/escritorio sin fallos. El análisis automático no cubre gradientes, todos los estados ni el PDF. Lector de pantalla, revisión de contraste exhaustiva y conformidad WCAG 2.0 AA siguen pendientes.
- Todas las cuentas, proyectos, archivos y sesiones de navegador del recorrido se aislaron bajo `%TEMP%`; no se configuró ni contactó un proveedor LLM real.

### Matriz negativa de sesión y límites en producción — 2026-11-16

- Se inició el servidor compilado en loopback con variables y carpetas de proyectos/proveedores/uso aisladas en `%TEMP%`. Las 19 operaciones protegidas ejercitadas en rutas de proyectos, proveedores y funciones IA respondieron 403 al faltar la cookie; no llegaron a validar o aplicar los cuerpos.
- Con una sesión recién intercambiada, `GET /api/projects` respondió 200. Un origen ajeno y un valor de `Host` ajeno respondieron 403. Reutilizar el nonce del intercambio respondió 401. La cookie de sesión fue `HttpOnly`, `SameSite=Strict`, limitada a `/api` y con `Max-Age=43200`.
- La respuesta de producción incluyó CSP (`default-src 'self'`, scripts del mismo origen, `object-src 'none'`, `frame-ancestors 'none'`), `X-Frame-Options: DENY` y `X-Content-Type-Options: nosniff`. Un cuerpo JSON superior al límite de 8 MiB obtuvo HTTP 413 según el registro del servidor.
- Sin creación de proyectos, cambios en perfiles ni llamadas a modelos. El alcance no cubre las dos rutas de perfil por ID en modo autenticado, pruebas exhaustivas de cookies/cabeceras, errores/corrupción de disco ni el paquete Inno Setup final.

### Recuperación ante configuración de proveedores corrupta — 2026-11-16

- En una segunda instancia de producción con `APPDATA` y carpetas de datos temporales se colocó `{not-json` en `providers.json`. Tras canjear un nonce aislado, `GET /api/providers` respondió 200 con `activeId: null` y una lista vacía.
- Se comprobó que el archivo original seguía conteniendo el JSON corrupto después de la lectura; el servidor no lo sobrescribió ni creó un proveedor por defecto. Después se detuvo el proceso y se eliminó el directorio temporal.
- No se accedió a Credential Manager ni a proveedores externos. Quedan pendientes fallos/permisos de escritura, recuperación de archivos de proyecto corruptos y restauraciones que fallen a mitad.

### Carga máxima de mapa T-017 — 2026-11-16

- En almacenamiento aislado se creó un mapa válido con 10.000 nodos y se abrió desde la UI compilada de producción. Chromium renderizó 10.000 nodos; el botón de alta apareció deshabilitado como «Límite alcanzado · 10.000». La vista alternativa presentó 10.000 elementos y permitió seleccionar el último («Idea de prueba 09999»). El evento `load` terminó en 146 ms en este entorno; no mide por separado la hidratación/render ni representa otros equipos.
- Se envió por API una propuesta de dos ideas sobre el mapa al máximo. El servidor respondió HTTP 400 con el límite explícito; la lectura posterior confirmó 10.000 nodos y revisión 1. El alta manual quedó deshabilitada con el límite explicado.
- El proyecto de prueba permaneció en su revisión inicial preparada por API; no se guardó una edición desde la UI ni se usó un proveedor IA real. El proceso, la página y los datos temporales se retiraron.

### Guardado UI en el límite de 10.000 nodos — 2026-11-16

- En otro almacenamiento aislado se creó por API un mapa válido de 9.999 nodos y se abrió en la UI de producción. Se pulsó «Añadir idea» desde el lienzo; el autosave terminó en «Guardado local» y el control cambió a «Límite alcanzado · 10.000» deshabilitado.
- La lectura posterior por API devolvió HTTP 200 con 10.000 nodos, revisión 2 y «Nueva idea» como último nodo. La UI quedó con el mismo recuento y sin mensaje de error.
- No hubo proveedor LLM. Se detuvo el servidor y se eliminaron la página y el proyecto temporales.

### Fixtures negativos adicionales del validador — 2026-11-16

- Con Node 24.22.2 se comprobó `validateProject` usando un documento mínimo válido y copias mutadas de forma independiente. Aceptó el documento base y rechazó: UUID de proyecto incorrecto, nombre y fecha sobre sus límites, coordenada fuera de rango, tipo de nodo inesperado, arista hacia un nodo ausente, referencia de diapositiva inexistente, tabla irregular, mensaje de conversación sobre el límite, sugerencia sin `prompt` y viñeta no textual.
- Se ejecutó como comprobación puntual con el módulo de dominio compilado; no se añadió una suite automatizada. Los casos complementan los límites de 10.000 nodos, ID duplicado, destino de arista inexistente y coordenada infinita ya registrados arriba. No cubren todas las propiedades ni la recuperación de archivos dañados.

### Intento inicial fallido de revisión de impresión — 2026-11-16

- Se inició una instancia de producción en loopback y se abrió en una pestaña temporal de navegador. La SPA cargó, pero el intercambio de sesión no se completó y la UI quedó bloqueada; no se abrió la presentación ni se generó un PDF nuevo en este intento.
- Se cerró la instancia temporal. No se interactuó con las ventanas existentes de Chrome. La evidencia previa de PDF A4 y conservación de bloques sigue siendo válida; el diálogo nativo y la revisión visual/accesible final siguen pendientes.

### Vista previa Chrome de presentación aislada — 2026-11-16

- Se preparó un proyecto temporal de dos diapositivas con texto denso, ocho viñetas, tabla de cuatro columnas/seis filas, recorrido de seis pasos y formulario ficticio de cuatro campos. La instancia compilada autenticó con nonce de un solo uso y cargó el proyecto en un contexto Chrome aislado.
- «Imprimir / Guardar PDF» abrió la vista previa de impresión de Chrome. El árbol accesible mostró dos páginas y terminó de cargar el PDF. La extracción de texto incluyó el contenido del texto principal, las ocho viñetas, todas las celdas de la tabla, los seis pasos del recorrido, los cuatro campos ficticios y la diapositiva 2. Los controles detectados fueron destino, páginas, copias, color, más ajustes, imprimir y cancelar.
- El destino predeterminado era la impresora Minolta CPD. Se canceló la vista previa antes de imprimir; no se guardó un PDF. La captura de pantalla del diálogo falló por la limitación de captura del monitor, así que esta verificación acredita el árbol accesible y la extracción de texto, no el aspecto visual final de las páginas. Se cerró la pestaña temporal y el servidor aislado.

### Render visual de PDF de presentación — 2026-11-16

- En un perfil nuevo de Chrome headless, se autenticó contra el servicio compilado aislado, se abrió la presentación y se generó `deck-final.pdf` con `Page.printToPDF` mediante CDP. El artefacto temporal se describió como PDF etiquetado de dos páginas, A4 apaisado (841,92 × 594,96 pt), una página por diapositiva.
- Se renderizó a PNG a 120 dpi y se inspeccionaron ambas páginas. La primera incluye título/subtítulo, texto denso, ocho viñetas, tabla completa de cuatro columnas/seis filas, recorrido de seis pasos y formulario de cuatro campos. La segunda muestra título/subtítulo, texto y dos viñetas. No se observó recorte, solapamiento ni desbordamiento; la primera página conserva espacio libre bajo los bloques.
- La generación directa por CDP valida el CSS y la composición del PDF; no sustituye el paso interactivo de seleccionar «Guardar como PDF» en la vista previa de Chrome ni la evaluación completa del contraste/accesibilidad de impresión. El PDF, renders, perfil de Chrome, proyecto y servidor temporales se retiraron.

### Fallo de copia previa y reintento de guardado — 2026-11-16

- En servicio compilado con almacenamiento temporal, un archivo llamado `backups` bloqueó la creación del directorio de copias durante un PUT. La ruta devolvió HTTP 500; una lectura autenticada confirmó revisión 1 y el nombre inicial sin cambios. Tras retirar el archivo de bloqueo, el mismo PUT guardó revisión 2 y la API listó una copia válida.
- Se retiraron el proceso y los datos de prueba. No se probaron ACL ni errores de disco físico.

### Restauración rechazada y recuperación válida — 2026-11-16

- Con un documento temporal en revisión 2 y una copia válida disponible, un archivo de respaldo `{bad` causó HTTP 500 durante la restauración. La lectura posterior confirmó revisión 2 y el nombre actual. Restaurar después la copia válida devolvió revisión 3 y el contenido original esperado.
- Se retiraron el proceso y los datos de prueba. Este recorrido no simula un fallo de `fsync`/rename ni una interrupción a mitad de la escritura final.

### Recuperación de documento principal corrupto — 2026-11-16

- En una carpeta de producción aislada se guardó una copia válida de revisión 1 y se cambió `project.json` por `{malformed`. La lectura autenticada respondió HTTP 409 y dejó intacto el archivo corrupto; el endpoint de copias recuperables encontró una copia válida.
- Restaurar con `expectedRevision: 0` creó revisión 2 con el contenido de la copia y preservó el archivo dañado bajo `backups/*.invalid`. Una lectura posterior confirmó el documento recuperado en revisión 2.
- Se retiraron el proceso y el directorio temporal. No se probaron permisos ACL, disco lleno ni fallos físicos de escritura.

### Error de reemplazo atómico en Windows — T-017 — 2026-11-16

- En un directorio aislado se creó un proyecto de revisión 1. Un `FileStream` mantuvo `project.json` abierto para lectura y sin permiso de borrado/reemplazo, permitiendo que el guardado leyera y copiara el estado actual pero haciendo fallar el `rename` de `durableWrite`.
- El guardado devolvió `EPERM`; una lectura posterior confirmó la revisión 1 y el nombre original, y la lista mostró una sola copia válida de revisión 1. Tras cerrar el handle, el reintento reutilizó esa copia, persistió el nuevo nombre como revisión 2 y mantuvo una sola copia previa recuperable.
- El recorrido llamó al almacenamiento compilado directamente, sin iniciar servidor ni tocar proyectos del usuario. Se retiraron los archivos temporales. No simula disco lleno, ACL, pérdida de energía ni interrupción a mitad de restauración.

### Preservación de copia válida y reintento de guardado — T-007/T-017 — 2026-11-16

- En una carpeta temporal, se bloqueó `project.json` para que el guardado fallara con `EPERM` durante el `rename`. La revisión 1 siguió intacta y quedó una copia recuperable verificada de esa misma revisión.
- Una vez liberado el handle, el reintento reconoció que la copia existente coincidía byte a byte con el estado actual, la reutilizó sin duplicarla y guardó revisión 2. `listRecoverableBackups` devolvió exactamente una copia, revisión 1.
- Esto corrige una discrepancia con la especificación: antes, el catch eliminaba esa copia válida tras fallar el reemplazo. Se compiló y recorrió el almacenamiento compilado directamente con Node 24.22.2; no se inició el servidor ni se modificaron proyectos del usuario. La carpeta temporal se retiró.

### Migración de archivo v2 a v3 — T-007 — 2026-11-16

- Se escribió un documento esquema 2 válido en una carpeta temporal y se abrió con `getProject`. La lectura migró a esquema 3, mantuvo la revisión 7 y generó `pre-migration-*.json`.
- El contenido de la copia previa coincidió byte por byte con el archivo v2 original, y `listRecoverableBackups` ofreció la revisión 7. Se usó el módulo de almacenamiento compilado con Node 24.22.2; los archivos temporales se retiraron.
- Este escenario verifica la migración 2→3 con copia; no verifica el modo de solo lectura de esquemas futuros.

### Reintento de restauración tras fallo de reemplazo — T-017 — 2026-11-16

- Se preparó un proyecto temporal en revisión 2 con una copia válida de revisión 1. Mientras `project.json` permanecía abierto sin permiso de reemplazo, la restauración falló con `EPERM` después de crear una copia previa de la revisión 2.
- Antes de la corrección, el reintento inmediato falló con `EEXIST`: reutilizaba el nombre determinista de esa copia previa. `restoreProjectBackup` ahora añade un UUID al nombre, conservando la copia del estado actual sin impedir otro intento.
- Tras recompilar con Node 24.22.2, se reintentó la misma restauración. Terminó en revisión 3 con el contenido de la revisión 1; la lista de copias mantuvo el estado de revisión 2 para recuperación. Los archivos temporales se retiraron. Esta prueba cubre fallo de reemplazo y reintento, no disco lleno ni interrupción física del proceso.

### Proyectos de esquema futuro en solo lectura — T-007 — 2026-11-16

- En almacenamiento temporal aislado se creó un documento válido de esquema 4 con mapa y diapositiva compatibles. La API de listado lo marcó `readOnly`; la previsualización conservó metadatos y contenido reconocido, y `getProject` rechazó la apertura editable con `PROJECT_FUTURE_SCHEMA`.
- Un segundo fixture con un nodo malformado conservó nombre/esquema para informar al usuario, pero entregó `project: null`; no se mostró una proyección parcial engañosa. No se escribieron los proyectos de prueba y el directorio temporal se retiró.
- La compilación de servidor/web terminó correctamente con Node 24.22.2 y `npm audit --omit=dev` reportó cero vulnerabilidades. El código de UI que desactiva el workspace y el autosave se compiló, pero este recorrido no automatizó interacción del navegador.

### Contraste del texto impreso — 2026-11-16

- Se calcularon ratios WCAG de las combinaciones de texto muestreadas en el CSS final de impresión: título `#292c3b`/blanco 13,84:1; cuerpo, viñetas, formulario y flechas `#55596b`/blanco 6,94:1; etiqueta `#5d4fac`/blanco 6,60:1; subtítulo `#77718e`/blanco 4,63:1; tabla `#343349`/`#f1edfc` 10,64:1; pasos del recorrido `#514c70`/blanco 8,02:1. El mínimo de la muestra supera 4,5:1.
- Es un cálculo de las declaraciones CSS y las combinaciones muestreadas; no mide una impresora/perfil de color físico, contornos de celdas, estados de foco ni todas las páginas/estados. T-016 y T-011 siguen parciales.

### Canonicalización de rangos IPv6 de proveedor — 2026-11-16

- Se comprobó con Node 24.22.2 que WHATWG `URL` normaliza `https://[2001:0::1]` a host `[2001::1]`. El filtro actualizado bloquea `2001::/23` y `3fff::/20` comparando los dos primeros hextetos, que cubre tanto el literal normalizado como los rangos especiales de IANA.
- El validador real de perfiles rechazó nueve direcciones: `2001:0::1`, `2001:1ff::1`, `2001:db8::1`, `2002::1`, `3fff::1`, `3fff:fff::1`, `fd00::1`, `fe80::1` y `ff02::1`. Aceptó `2001:200::1` y `3fff:1000::1` en los bordes fuera de los prefijos, además de `2606:4700:4700::1111` como IPv6 pública. Se usó `APPDATA` aislado en el workspace, sin credenciales ni conexión al proveedor, y se retiró la configuración temporal.
- La clasificación de ambos prefijos se contrastó con el [registro oficial IANA](https://www.iana.org/assignments/iana-ipv6-special-registry). El fixture aislado confirma canonicalización y regla; no equivale a un recorrido HTTP del endpoint, resolución DNS/TLS, pruebas en la distribución instalada ni una matriz exhaustiva SSRF. T-015 permanece parcial.

### Semántica accesible del PDF y diálogo de impresión — T-011 — 2026-11-16

- Se asociaron las páginas impresas con sus títulos, se representaron los recorridos como listas ordenadas y los campos ficticios como listas de términos/definiciones. Se mantuvo el aspecto de tarjetas y se recompiló la aplicación.
- En la compilación de producción se abrió el proyecto predeterminado en una instancia y almacenamiento aislados, se generaron tres diapositivas y se esperó a que el autosave confirmara «Guardado local». Se abrió el diálogo nativo de impresión; la vista de impresión expuso un documento PDF de tres páginas y su árbol accesible mostró los títulos/subtítulos y el texto de las ideas de cada página. Se canceló el diálogo sin enviar nada a la impresora física seleccionada por defecto.
- Esta observación confirma que la interfaz abre el diálogo nativo y crea una vista de tres páginas con texto detectable; no confirma que «Guardar como PDF» finalice ni que el archivo guardado conserve etiquetas PDF completas. No se guardó archivo desde el diálogo; queda pendiente el recorrido final de guardado y revisar las etiquetas/orden de lectura del PDF exportado.

### Reintento de guardado desde impresión — T-011 — 2026-11-16

- Se retomó el proyecto sintético aislado «Huerto de balcón», con tabla Cultivo/Mes de siembra, recorrido de tres pasos y formulario de ejemplo con datos ficticios. Chrome confirmó autosave local y abrió la vista de impresión con tres páginas.
- El árbol del visor expuso los textos de la diapositiva y los bloques de tabla, recorrido y formulario. Se activó «Guardar como PDF», pero el cuadro nativo dejó de estar disponible al actualizar el estado de la ventana para continuar la automatización; no se guardó un archivo ni se tocó la impresora física.
- Por tanto, la estructura observada es la vista previa HTML/PDF de Chromium, no el archivo final. La revisión del PDF descargado y sus marcadores/etiquetas y orden de lectura sigue sin verificar; T-011 permanece parcial.

### PDF nativo guardado y revisado — T-011 — 2026-11-16

- Se abrió el proyecto sintético «Espacio para pensar» en una instancia Chrome aislada, se crearon tres diapositivas y se completó la primera con título y texto de «Huerto de balcón», lista, tabla (Tomate/Marzo), recorrido de tres pasos y formulario ficticio (Alex García; Interés: Explorar la propuesta). El indicador confirmó «Guardado local».
- Desde «Imprimir / Guardar PDF» se eligió el destino «Guardar como PDF» y se guardó el documento desde el diálogo nativo en `%TEMP%\mymap-roadmap-t011-final-projects\Huerto-balcon-vista.pdf`. La acción de guardar se completó y `pdfinfo` leyó el archivo resultante (87.875 bytes).
- `pdfinfo` confirmó PDF 1.4, tres páginas, A4 apaisado (841,92 × 594,96 puntos), sin cifrado y `Tagged: yes`. `pdfinfo -struct-text` expuso por página títulos `H1`, viñetas como listas, tabla como `Table` con encabezados `TH` y celdas `TD` asociadas mediante `/Headers`; el recorrido aparece como lista y los campos ficticios como etiquetas/valores en orden secuencial.
- Las tres páginas se renderizaron con Poppler y se inspeccionaron visualmente: la primera incluye título, subtítulo, texto, viñetas, tabla, recorrido y formulario; la segunda y tercera tienen sus propios títulos/contenidos. No se observaron recortes ni desbordamiento. La segunda y tercera quedan escasas porque reflejan el mapa sintético de prueba.
- Esto cierra el criterio de exportación de T-011 para paginación, etiquetado estructural y lectura lógica del artefacto. La estructura etiquetada no equivale a prueba con lector de pantalla; evaluación con AT real permanece en T-016. El PDF y sus renders están en `%TEMP%`, no en el repositorio, y no se usó impresora física.

### Transparencia del historial enviado — T-010 — 2026-11-16

- El panel de contexto del chat ahora renderiza los últimos diez mensajes que usa el cliente al llamar chat/sugerencias, indica «Tú» o «Asistente» y aplica el mismo recorte de 3.000 caracteres por entrada que `sanitizeHistory` en el servidor. También avisa que el texto actual del compositor se enviará al pulsar «Enviar».
- Compilación completa correcta con Node 24.22.2 y `npm audit --omit=dev` con cero vulnerabilidades. No se pudo recorrer el panel ni capturar el payload desde Chrome en esta sesión porque el controlador quedó bloqueado por la apertura anterior del diálogo nativo de impresión. No se envió contenido a ningún modelo en esta verificación.

### Contexto ampliado compartido entre UI y servicio — T-010 — 2026-11-16

- Se añadió `buildProjectAiContext` al paquete de dominio y se usa tanto en las rutas IA como en la vista previa del cliente. El contexto contiene las ideas del ámbito, relaciones internas y con sus ancestros, hasta 50 ancestros, títulos de hasta 20 diapositivas que referencian ideas incluidas, resumen global de cantidad de ideas/conexiones/diapositivas y el recuento que queda fuera.
- La interfaz expone esos campos en los paneles de contexto del chat y de generación de presentación. El payload no incluye cuerpos de diapositivas vinculadas ni un resumen narrativo; su tamaño está acotado por los límites descritos. Las tarjetas siguen limitadas a destinos de idea del ámbito, no a ancestros.
- Se recorrió la UI en Chrome contra un proyecto temporal con seis ideas, cinco relaciones y una diapositiva vinculada. Al seleccionar «Personas curiosas», la vista previa mostró dos ideas de ámbito, el ancestro raíz, dos relaciones, el título vinculado y tres ideas fuera de contexto.
- «Generar sugerencias» envió la petición a un servidor Ollama-compatible local simulado. Se capturó el cuerpo HTTP y se comparó con la vista previa: nombre del proyecto, conteos 6/5/1, nodos del ámbito, ancestro, relaciones, título vinculado y recuento 3 coincidieron. La respuesta simulada creó una tarjeta «Añade ejemplos concretos» apuntada a un nodo de la rama y esta apareció en el chat.
- Los archivos, proyecto, credenciales, servidor y perfil de navegador eran temporales y aislados; no se usó ni modificó el perfil personal, ni se contactó un modelo remoto o real. Build completo correcto con Node 24.22.2; bundle principal 505,56 kB con aviso de Vite; `git diff --check` correcto. La calidad con Ollama/LM Studio real y concurrencia sigue pendiente.

### Contrato común de errores API/SSE — T-004 — 2026-11-16

- En una instancia de producción aislada con `APPDATA`, `LOCALAPPDATA` y carpeta de proyectos temporales, un `GET /api/no-such-route` devolvió HTTP 404 y `{code:"NOT_FOUND", message, correlationId:"req-2"}`.
- El GET no autenticado de `/api/session/oidc-config` devolvió HTTP 403 con `code:"FORBIDDEN"`, mensaje de sesión y `correlationId:"req-3"`. El cuerpo conservó el código de estado requerido por el cliente; no se inició sesión ni se accedió a datos personales.
- Tras canjear el nonce temporal en la misma instancia, un POST SSE de IA a un UUID de proyecto inexistente devolvió `stage` y un evento terminal `error` con `code:"NOT_FOUND"`, mensaje y `correlationId:"req-3"`. La llamada no contactó proveedor alguno ni cambió un proyecto.
- `npm run build` pasó con Node 24.22.2 y `npm audit --omit=dev` reportó cero vulnerabilidades. Vite mantiene su aviso por un bundle principal de 505,63 kB. La ruta de normalización oculta detalles para 5xx; la respuesta 5xx y el manejo visual del ID de correlación aún requieren recorrido específico. La configuración y carpetas temporales se dejaron aisladas y el servicio se detuvo.

### Contrato persistido del proyecto — T-004 — 2026-11-16

- Se cotejaron `ProjectDocument`, `PresentationSlide`, validadores y uso de almacenamiento con el modelo descrito en la especificación.
- ADR-0015 fija el JSON v3 existente como contrato canónico y documenta las diferencias de representación. No se modificó el esquema ni se requiere migración.
- Esta resolución documental no sustituye recorridos de volumen, calidad de contexto IA, trazabilidad de operaciones ni medición de capacidad; siguen pendientes en T-004.
