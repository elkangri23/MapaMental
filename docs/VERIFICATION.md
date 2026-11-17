# Criterios de aceptación

## Perfil personal y sesión (T-027)

- Comprobado con Fastify y almacenamiento temporal. Sin sesión se rechazó la lectura. Un origen ajeno se rechazó al guardar y se comprobó el tipo de contenido, el correo mal formado y la cabecera no-store.
- Una sesión local guardó y recuperó el perfil, con recorte de espacios y comprobación del archivo persistido. En modo protegido se rechazó la cookie local. Una sesión protegida creada para la comprobación pudo consultar y vaciar el perfil. Tras revocarla, dejó de tener acceso.
- En Chrome, la compilación de producción abrió el diálogo con sus dos campos etiquetados. Guardar cerró el diálogo y devolvió el foco a Mi perfil. En un segundo recorrido aislado se guardaron nombre y correo ficticios, se recargó la página y ambos valores reaparecieron. Con una ventana emulada de 320 píxeles CSS, el diálogo abrió sin desbordamiento horizontal. Escape descartó una edición sin guardar y devolvió el foco a Mi perfil. Intro reabrió el diálogo con los valores persistidos.

## Base de sesión protegida (T-020)

- En Fastify con almacenamiento temporal y sesiones de prueba se comprobó que las rutas de proyectos, proveedores, perfil e IA rechazaban una sesión ausente, local, revocada o caducada en modo protegido. Una sesión protegida válida accedió a esas rutas. El modo protegido rechazó el canje del nonce local.
- Se ejecutó logout y se comprobó la cabecera que elimina la cookie. Se adelantó el reloj del proceso más de doce horas para verificar el vencimiento. Un proceso Node nuevo rechazó la cookie protegida anterior al consultar el perfil.
- Al volver al modo local, la sesión local pudo consultar proyectos y la protegida no accedió a sus rutas. La emisión tras OIDC y WebAuthn se acepta por separado con un proveedor y un autenticador reales.

## Canje OIDC y espera del segundo factor (T-021)

- Con Fastify aislado y un estado temporal de prueba, el canje devolvió una cookie HttpOnly y SameSite Strict. Repetir el canje inicial obtuvo HTTP 401.
- La cookie temporal produjo HTTP 428 al consultar el estado de sesión y HTTP 403 al consultar el perfil. Al adelantar el reloj más de cinco minutos, el estado del segundo factor dejó de ser válido.
- El recorrido comienza con un estado de prueba. La aceptación con un proveedor OIDC y una passkey reales sigue abierta.

- En Chrome con el segundo factor pendiente simulado, el foco inicial quedó en Continuar con passkey. Tab movió el foco a Perdí mi passkey. Se comprobó la navegación sin abrir el autenticador.

### Reintento al volver de OIDC

- En Chrome aislado y con la compilación de producción, se abrió un regreso de prueba con un paso temporal inexistente. El canje respondió HTTP 401. La aplicación retiró de la URL los datos del regreso, mostró el aviso de caducidad y enfocó Reintentar inicio de sesión. La pantalla permaneció en la aplicación sin mostrar el aviso de passkey.
- Este recorrido cubre el rechazo al volver de OIDC. Queda verificar un regreso de un proveedor real y el foco cuando la sesión ya ha entrado en recuperación TOTP.

## Reanudación de recuperación (T-023)

- Con Fastify aislado y una sesión de recuperación de prueba, el estado general respondió HTTP 428 e indicó recuperación activa. La API del perfil siguió devolviendo HTTP 403.
- Al consumir la sesión, el estado dejó de ofrecer la reanudación. Con la web compilada y un servidor simulado, Chrome enfocó Continuar recuperación al abrir y al recargar. Intro abrió el formulario y movió el foco al nombre de la passkey. El formulario no volvió a pedir el código TOTP.
- En Chrome con el segundo factor pendiente simulado, se abrió el formulario y se escribió un código ficticio sin enviarlo. Escape cerró el formulario y devolvió el foco a Perdí mi passkey. Intro lo reabrió con el código vacío. Cancelar también cerró el formulario y devolvió el foco. Queda completar el recorrido con una aplicación TOTP y un autenticador reales.

- En el almacén temporal se registraron diez credenciales ficticias. Una identidad distinta se rechazó y conservó las diez. El reemplazo autorizado dejó únicamente la nueva credencial, incluso al reutilizar un nombre, e invalidó la sesión protegida y la de recuperación. La prueba se realizó en el almacén compilado y no accionó un autenticador.

## Autorización al guardar una passkey (T-024)

- Con credenciales y sesiones de prueba, el almacén aceptó el alta inicial en modo local y rechazó una segunda alta local. Una sesión protegida revocada y otra con verificación de usuario fuera del plazo fueron rechazadas y el archivo conservó solo la credencial inicial.
- El alta adicional con una sesión protegida recién verificada y el reemplazo con una sesión de recuperación activa conservaron su comportamiento esperado. El recorrido se hizo en el almacén compilado con datos temporales. Queda comprobar la ceremonia WebAuthn con un autenticador real.

## Aceptación pendiente del modo protegido (T-021 y T-023 a T-026)

1. Desde el modo local, vincular un proveedor OIDC real, registrar una passkey y reiniciar en modo protegido. Verificar que el inicio exige OIDC y verificación de usuario con passkey.
2. Registrar una segunda passkey, revocarla tras reautenticarse y comprobar la invalidación de sesiones y el rechazo de la credencial revocada. Comprobar caducidad y reinicio.
3. Configurar TOTP con una aplicación autenticadora. Conservar una sesión de prueba controlada, simular la pérdida de la passkey y recuperar con OIDC y TOTP. Comprobar que la sesión temporal solo permite registrar una passkey, y que al terminar se revocan las anteriores.
4. Verificar cancelación, reintentos, caducidad y reutilización en un perfil aislado. Revisar el registro local y recorrer los diálogos con teclado y lector de pantalla. Anotar proveedor, autenticador, resultado y límites de cada recorrido.

La guía operativa está en [AUTH_OPERATIONS.md](AUTH_OPERATIONS.md). Las sesiones simuladas del perfil cubren las guardas de la API. La aceptación de OIDC, passkeys y TOTP requiere los dispositivos y el proveedor indicados.

## Seguimiento de uso en proveedor local con límite opcional (T-012)

- El servicio mantiene el camino local sin contador cuando el perfil no tiene presupuesto ni tarifas.
- Si se configura un presupuesto mensual o tarifas para el modelo de un perfil local, el generador pasa por el registro y la verificación de gasto de T-012. Esto permite configurar FreeLLMAPI u otro proxy con URL loopback sin activar límites para instalaciones locales de forma predeterminada.
- `npm run build` pasó con Node 24. Con un proveedor OpenAI-compatible simulado en loopback, la generación informó 100 tokens de entrada y 50 de salida. Con tarifa de 10 EUR por millón en ambas direcciones, el registro persistió 0,0015 EUR. Al fijar el presupuesto en 0,001 EUR, la siguiente petición devolvió 429 antes de llegar al proveedor (una petición upstream total). El presupuesto volvió a cero por ser un fixture temporal.
- Con un perfil temporal compatible con OpenAI apuntando al proxy local de FreeLLMAPI, se configuraron un presupuesto de 100 EUR y tarifas de 0,05/0,1 EUR por millón de tokens. gpt-oss-120b respondió en 1,15 s y devolvió una sugerencia. El contador pasó de 0 a 0,000078 EUR, informó el mes actual, cero solicitudes incompletas y ningún guardado pendiente. La credencial se leyó del entorno local; no se registró ni se mostró.

## Revisión de registro de direcciones especiales (T-015)

- Se contrastaron las reglas de `isBlockedRemoteHost` con los registros actuales de direcciones especiales de IANA. IPv4 bloquea redes privadas, loopback, link-local, espacio compartido, documentación, benchmarking, multicast, reservado y broadcast. IPv6 permite solo global unicast y excluye `2001::/23`, `2001:db8::/32`, `2002::/16` y `3fff::/20`, además de espacio no global y direcciones IPv4 mapeadas.
- No se hizo un cambio de código en esta revisión. La verificación fue documental y por lectura del validador, no una enumeración automatizada de cada prefijo. La matriz de DNS, TLS/SNI, hosts internacionales y operaciones negativas sigue abierta en T-015. Registros: [IANA IPv4](https://www.iana.org/assignments/iana-ipv4-special-registry) y [IANA IPv6](https://www.iana.org/assignments/iana-ipv6-special-registry).
- El 2026-11-17, `npm audit --omit=dev` informó cero vulnerabilidades y `npm run build` pasó con Node 24.
- Matriz puntual mediante `saveProviderProfile` y almacenamiento temporal: se rechazaron 27 literales IPv4/IPv6 especiales (privados, loopback remoto, link-local, compartidos, reservados, documentación, benchmarking, multicast, IPv4 mapeado y prefijos IPv6 especiales). Se permitieron 9 direcciones globales y los literales loopback aprobados para servicios locales. Cero resultados distintos de lo esperado. La matriz no cubre DNS mixto/rebinding, IDN, TLS/SNI ni hosts con punto final.

## Reconstrucción del paquete portátil (T-013)

- El 2026-11-17 se generó `release/EspacioVisual-0.1.0-windows-x64.zip` con `scripts/package-windows.ps1 -PortableOnly -Offline`, Node 24 y dependencias de producción. El ZIP contiene 4.445 entradas y pesa 43.909.945 bytes. Su SHA-256 es `902F653A013560B0FABCAB34D63385598DC93556F140D74B7F84860B734EF2F3`.
- Se comprobó que el archivo incluye `runtime/node.exe`, el servidor y web compilados, el módulo nativo de credenciales de Windows y el lanzador local. No se ejecutó desde una extracción temporal en esta iteración. La compilación/recorrido de Inno Setup sigue pendiente por ausencia de `ISCC.exe`.
- La extracción temporal se inició con `scripts/start-local.ps1 -NoBrowser -PassThru`, `APPDATA`, `LOCALAPPDATA` y proyectos aislados bajo Temp. El servicio local respondió HTTP 200 en modo local; `-Stop` detuvo el proceso y se confirmó su salida. No se abrió una ventana de navegador ni se creó un proyecto. Inno Setup sigue pendiente.

## Calidad de las sugerencias con el mapa de siembra (T-010)

Este recorrido está pendiente con un modelo real. Usa un proyecto de prueba llamado «Huerto de balcón». Añade a la idea central las ramas «Prueba A — Siembra» y «Prueba B — Cosecha». Bajo Siembra, añade tomate y lechuga. Deja Cosecha sin ideas hijas. Crea una diapositiva vinculada a Siembra titulada «Calendario de siembra», con los dos cultivos y los meses por concretar.

1. Con el mapa completo, envía al chat «Quiero convertir este mapa en una guía práctica para mi primer huerto. Aún no he indicado la ubicación ni el clima». Busca tarjetas que aprovechen detalles concretos del proyecto, como completar el calendario, desarrollar la rama de cosecha o convertir la siembra en una diapositiva con pasos.
2. Selecciona «Prueba A — Siembra» y pulsa **Generar sugerencias**. Comprueba que los destinos de las tarjetas pertenecen a la rama visible y que ofrecen acciones distintas. Para meses o profundidades concretas, la tarjeta debe pedir los datos que falten o explicitar los supuestos.
3. Pulsa una tarjeta de expansión. Comprueba que la vista previa señala la rama y muestra las ideas antes de guardar. Aplícala y deshaz el cambio desde el pie del mapa. Repite con una tarjeta de diapositiva y comprueba que el borrador respeta el formato anunciado, por ejemplo una tabla con columnas de cultivo, época y profundidad. Para una tarjeta con recorrido, el borrador debe incluir al menos dos pasos. Para un formulario ficticio, todos los campos deben tener etiqueta y valor de ejemplo. Si falta una tarjeta de alguno de los tipos, anótalo.
4. Repite las dos rondas con las mismas condiciones y un proyecto nuevo. Registra proveedor, modelo, versión de la app, tiempos aproximados y títulos de las tarjetas. Para cada tarjeta, indica si es concreta, si aporta algo distinto, si apunta al destino correcto y si el resultado cumple lo prometido. Registra también las tarjetas genéricas, los supuestos sin explicar y las acciones fallidas.

Cierra la comprobación de calidad cuando ambas rondas produzcan al menos dos tarjetas útiles y distintas para el mapa completo, una recomendación pertinente para la rama seleccionada y se puedan recorrer la expansión y la diapositiva con sus formatos anunciados. Si algún criterio falla, conserva los resultados para ajustar el comportamiento y repetir el recorrido.

### Primera evaluación real con FreeLLMAPI

#### Ronda de mapa completo y rama de cosecha con gpt-oss-120b

- En un proyecto temporal, el mapa completo produjo una expansión para recoger la ubicación/clima pendientes y dos diapositivas distintas para cosecha: calendario de tabla y ficha con formulario ficticio. La consulta de la rama Cosecha devolvió tres tarjetas: expansión del calendario, formulario ficticio para Ficha de ejemplo de cosecha y recorrido visual para Cosecha.
- Los destinos de las tres tarjetas de rama pertenecían a la selección enviada. Las tarjetas anunciaron `mock-form` y `diagram` para las diapositivas. La respuesta generó dos propuestas diferentes en 3,7 segundos. Esta ronda mejora la cobertura de selección global y de rama, pero no completa dos rondas de aceptación completas ni el ciclo de aplicar/deshacer de cada formato.
- En las tarjetas de la rama, el recorrido (6 pasos) y el formulario (6 campos) se generaron, aplicaron y deshicieron por API. Las revisiones avanzaron de 14 a 16 y de 16 a 18; el proyecto quedó con cero diapositivas. En una consulta nueva al mapa completo, tras reforzar la instrucción contra ramas ausentes, la expansión pidió ubicación/clima y la tarjeta de recorrido apuntó a Cosecha. La tercera tarjeta volvió a proponer una tabla de cultivos para la ficha de cosecha, un cruce de tema/destino que requiere seguir afinando la calidad.

#### Modelos adicionales y respuestas lentas

- El catálogo de FreeLLMAPI anunció los alias `qwen3.5-9b` y `gemma-4-31b-it`. Se repitió por la API de MapaMental la consulta que pide un recorrido y un formulario ficticio en el mapa temporal de cosecha.
- La primera petición a Qwen por SSE perdió la conexión a los 10 segundos. Se añadieron comentarios SSE cada cuatro segundos mientras hay una generación activa. Con un proveedor compatible con Ollama simulado que esperó 12 segundos, se recibieron al menos dos comentarios y el resultado completo. El cliente web ignora los comentarios SSE. Las peticiones con respuesta JSON conservan el comportamiento anterior.
- Con la corrección, las dos consultas terminaron con un evento SSE de error del proveedor. Qwen tardó 60,1 segundos y Gemma, 24,4 segundos. Ninguna generó tarjetas. Queda comparar la calidad con otro alias que complete una respuesta.
- Una ronda con gpt-oss-20b completó sugerencias en 47,7 segundos. Propuso un recorrido con una temperatura fija de conservación sin conocer el cultivo. Al generar esa diapositiva, FreeLLMAPI devolvió un error. Una ronda posterior respondió en 2,1 segundos con un recorrido de cinco pasos y una tarjeta de formulario ficticio sin etiqueta de formato. El borrador del recorrido conservó los cinco pasos. Llama 3.3 70B respondió en 11,4 segundos con tarjetas de recorrido, formulario ficticio y expansión. No se completó una segunda diapositiva en esa ronda.
- Se ajustaron las instrucciones para evitar cifras operativas sin datos del cultivo y se recupera automáticamente `mock-form` cuando el título o prompt pide crear explícitamente un formulario ficticio o de ejemplo. La compilación de producción pasó. La recuperación de formato de formulario queda pendiente de repetición en Chrome.
- En Chrome con gpt-oss-20b, la tarjeta se anunció como «Diapositiva con formulario ficticio» aunque el modelo omitió la etiqueta de formato. Dos intentos de generar el borrador fueron rechazados porque el modelo no rellenó todos los campos. La clasificación quedó corregida y el validador impidió aplicar una diapositiva sin datos ficticios. Falta probar con un modelo que complete correctamente el formulario.
- En un proyecto temporal, se cambió el perfil de FreeLLMAPI a Llama 3.3 70B. La tarjeta volvió a anunciar el formulario ficticio aun cuando el proveedor no devolvió la etiqueta de formato. El borrador incluyó Cultivo: Lechuga, Cantidad: 2 kg y Destino: Mercadillo. La vista previa mostró los tres valores; aplicar creó la diapositiva y el contenido siguió presente tras recargar Chrome. El botón de deshacer la retiró y devolvió la presentación a cero diapositivas.
- Mistral Small 3.2 24B respondió en 12,4 segundos con tres sugerencias distintas para cosecha: recorrido, formulario ficticio y requisitos de conservación. El borrador del recorrido devolvió cinco pasos, pero también añadió dos campos ficticios que la tarjeta no pidió. La propuesta de formulario terminó con error del proveedor. Falta corregir la mezcla de bloques en el recorrido y repetir el formulario con este modelo.
- Se ajustó el borrador de diapositiva para retirar tablas, formularios o recorridos que no corresponden con el formato solicitado por la tarjeta. La compilación pasó. Falta repetir en Chrome con Mistral para confirmar que ya no mezcla bloques y que las demás diapositivas conservan el contenido anunciado.
- Se inició en Chrome una repetición de la consulta de recorrido y formulario con Mistral Small 3.2 24B y almacenamiento temporal. El proveedor no respondió durante la sesión de verificación y se canceló la generación. No se obtuvo un nuevo borrador para validar la corrección en la interfaz.
- Un proveedor OpenAI-compatible simulado devolvió deliberadamente, para una tarjeta de recorrido, pasos, campos ficticios y tabla a la vez. La API conservó los pasos y retiró los bloques de formulario y tabla. La clasificación y el filtrado del servidor quedaron verificados; la confirmación con un modelo real y la interfaz de Chrome sigue pendiente.
- La repetición directa por API con Mistral Small 3.2 24B sí respondió: la tarjeta de formulario ficticio se clasificó con `mock-form` y el borrador devolvió exactamente los tres campos solicitados: Cultivo, Cantidad y Destino, con valores ficticios rellenados. La aplicación, persistencia y deshacer en Chrome con el nuevo filtrado siguen pendientes.
- La repetición del ciclo en Chrome con Mistral Small 3.2 24B volvió a fallar en la solicitud de sugerencias con un error genérico del proveedor. El segundo intento quedó esperando respuesta y se canceló. La vista previa, aplicación, persistencia y deshacer en Chrome no se completaron; la generación correcta por API queda como evidencia independiente.
- Con gpt-oss-120b, una consulta por API devolvió una tarjeta de recorrido con formato `diagram`; el borrador contenía siete pasos y ningún bloque de formulario o tabla. Se verificó el filtrado con un modelo real. La vista previa, aplicación, persistencia y deshacer de este borrador filtrado siguen pendientes en Chrome.
- En Chrome con gpt-oss-120b y almacenamiento temporal, la tarjeta anunció «Diapositiva con recorrido · Cosecha». La vista previa mostró seis pasos y no mostró tabla ni formulario. Se aplicó como «Proceso de Cosecha», se recargó Chrome y se confirmó la diapositiva persistida. Deshacer la retiró y mostró el aviso correspondiente. Este ciclo confirma el filtrado de bloques y la reversibilidad en Chrome.

#### Vista previa de formulario y clasificación de recorrido en Chrome

- En Chrome con un proyecto temporal y FreeLLMAPI (gpt-oss-120b), la tarjeta de formulario abrió la vista previa con el rótulo «Formulario de ejemplo con datos ficticios» y campos ya rellenados. Aplicar añadió una diapositiva. Deshacer restauró la presentación a cero diapositivas.
- En la misma respuesta, «Diseña un recorrido visual de cosecha» se clasificó como una idea para el mapa. Tras corregir el servidor, una comprobación de clasificación confirmó que esa tarjeta pide una diapositiva con diagrama, se descarta si la presentación está llena o el destino queda fuera del ámbito y conserva el comportamiento de una expansión ordinaria y una tabla explícita.
- Se repitió la misma consulta en Chrome con la compilación de producción corregida, el mismo proyecto temporal y FreeLLMAPI (gpt-oss-120b). La tarjeta se anunció como «Diapositiva con recorrido · Cosecha». La vista previa mostró cinco pasos en orden: comprobar la madurez, cosechar, limpiar, empaquetar y almacenar. Aplicar añadió la diapositiva «Cosecha». Al recargar, seguían disponibles la diapositiva, el recorrido y el botón de deshacer. Deshacer volvió a cero diapositivas y mostró el aviso de retirada. Esta comprobación cubre un modelo.

- Se usó el conector compatible con OpenAI de MapaMental y el mapa ficticio de siembra en proyectos temporales. El catálogo de FreeLLMAPI respondió HTTP 200. Una consulta de chat a gemini-flash devolvió HTTP 502 tras unos 60 segundos. El alias gpt-oss-120b respondió en ambas rondas, con cuatro peticiones de chat entre 1,7 y 15,2 segundos. El alias identifica el modelo solicitado al intermediario.
- En las dos rondas de mapa completo se obtuvieron tres tarjetas. Se propusieron acciones sobre el calendario y un recorrido de cultivo. Al seleccionar Siembra, las tarjetas apuntaron a esa rama. Una tarjeta que pedía un recorrido se clasificó como expansión de mapa. En la primera ronda la selección devolvió una sola tarjeta y pidió una tabla sin marcar ese formato.
- Las expansiones se aplicaron y deshicieron correctamente. La cantidad de nodos volvió a cinco en ambos casos. La calidad falló porque los borradores rellenaron la ubicación y el clima con datos que el ejemplo no proporcionaba.
- En una ronda, la tarjeta pidió cinco columnas y la validación rechazó la tabla. En la otra, FreeLLMAPI devolvió HTTP 429 al generar la diapositiva. Queda por confirmar un borrador de tabla aplicable y su deshacer con un modelo real.
- Se ajustaron las instrucciones para respetar el máximo de cuatro columnas, pedir el formato de tarjeta correspondiente y marcar los datos ausentes. Estos resultados son anteriores al ajuste. Queda repetir el recorrido para medir su efecto. El perfil temporal se retiró al terminar.


### Repetición tras ajustar las instrucciones

- Dos proyectos temporales repitieron el caso mediante el conector compatible con OpenAI, FreeLLMAPI y el modelo solicitado gpt-oss-120b. La clave se leyó del archivo local. Las cuatro consultas de chat devolvieron HTTP 200 entre 1,6 y 12,8 segundos.
- En ambas rondas salieron tres tarjetas para el mapa completo y dos para Siembra. Los destinos de estas últimas estaban dentro de la rama. Las tarjetas de tabla pidieron entre dos y cuatro columnas. La segunda ronda repitió el tema del calendario al cambiar de ámbito y una expansión sugirió solicitar fotografías. Queda afinar el encaje entre la acción anunciada y el resultado que se puede producir en el mapa.
- Los dos borradores de expansión evitaron atribuir una ciudad o un clima concretos al huerto. El primero propuso rangos como objetivos y el segundo propuso preguntas de comprobación. Aplicar y deshacer devolvió el mapa a cinco nodos en ambos casos.
- La primera ronda generó una tabla de tres columnas y dos filas. El texto marcó la ubicación y el clima como pendientes. Aplicar añadió una diapositiva y deshacer recuperó la presentación original. Algunas celdas tituladas Mes de inicio y Mes de fin contenían estaciones, un punto pendiente de calidad semántica.
- En la segunda ronda, el proveedor devolvió HTTP 502 al generar la diapositiva. Se confirma el flujo completo de la tabla en una ronda. La aceptación de dos rondas completas y el recorrido desde Chrome siguen abiertos.

### Edición antes de aplicar una tabla en Chrome

- Genera una diapositiva con tabla. Cambia una celda a «Pendiente de confirmar» y descarta el borrador. Comprueba que el proyecto conserva la presentación anterior.
- Genera otra tabla, edita una celda con el teclado y comprueba que el foco permanece en el campo. Aplica el borrador, recarga y confirma que se guardó el valor editado. Deshaz la operación y comprueba que se restaura la presentación original.
- Completado con la compilación de producción, Chrome aislado y el modelo solicitado gpt-oss-120b a través de FreeLLMAPI. Al editar la primera celda, el foco se mantuvo en ella. Tras aplicar y recargar, el documento conservó «Pendiente de confirmar». Deshacer dejó solo la diapositiva original.
- En otro borrador se cambió una celda y se pulsó Escape. Se cerró la vista previa, el foco volvió a la tarjeta y el documento conservó solo la diapositiva original. El modelo generó meses concretos en el primer borrador y marcó celdas como pendientes en el segundo. La segunda tarjeta no anunció que contenía una tabla, aunque el borrador sí la incluyó.

### Recuperación del formato de tabla omitido

- Con un proveedor simulado, la ruta de chat devolvió una tarjeta con formato de tabla a partir de una petición explícita que omitía ese campo. Una mención incidental a una tabla mantuvo el formato genérico y una tarjeta con formato explícito de recorrido lo conservó.
- Al usar el formato recuperado en la ruta de propuestas, el servidor rechazó un borrador sin tabla y aceptó el mismo borrador con una tabla válida. La comprobación usó almacenamiento temporal y no consumió cuota de FreeLLMAPI.

### Comprobación específica de tablas con FreeLLMAPI

- Se realizaron dos recorridos por la API de MapaMental en proyectos temporales, solicitando una tarjeta de calendario de siembra a gpt-oss-120b. Las cuatro peticiones de generación devolvieron HTTP 200.
- Las dos tarjetas apuntaron a Siembra y generaron tablas de cuatro y dos columnas, con dos filas para Tomate y Lechuga. Las columnas de meses contenían nombres de meses. En las dos rondas se añadió la diapositiva y deshacer devolvió la presentación a una diapositiva.
- Las tablas todavía proponían meses concretos con la ubicación y el clima sin confirmar. La primera lo indicaba en Observaciones. Este recorrido confirma la coherencia entre encabezado y tipo de dato y el guardado reversible. Queda verificar que los datos inciertos queden marcados en cada celda y repetir el flujo de uso en Chrome.

### Datos pendientes en las celdas del calendario

- El servidor indica que los datos ausentes se marcan en cada celda afectada aunque la tarjeta sugiera una estimación. Una nota general no basta.
- Dos peticiones de borrador mediante FreeLLMAPI con gpt-oss-120b solicitaron meses para tomate y lechuga con ubicación y clima ausentes. Una pedía estimarlos si era posible. Ambas devolvieron HTTP 200 y las seis celdas de meses quedaron como «Pendiente de confirmar». El texto y las viñetas tampoco atribuyeron fechas al huerto.
- La comprobación cubre dos peticiones de diapositiva por API. En Chrome con un proyecto temporal, una tarjeta para Siembra anunció «Diapositiva con tabla». La primera generación falló y el reintento desde la misma tarjeta produjo seis filas de meses. En las doce celdas de Tomate y Lechuga apareció «Pendiente de confirmar». Se añadió la diapositiva desde la vista previa y Deshacer la retiró. Quedan otras variaciones del mapa y modelos por evaluar.

### Recorridos y formularios ficticios con FreeLLMAPI

- La API de MapaMental, con FreeLLMAPI y el modelo solicitado gpt-oss-120b, obtuvo dos tarjetas para un huerto ficticio. La tarjeta de recorrido apuntó a Cosecha y la de formulario a su ficha de ejemplo. Ambas anunciaron el formato correcto.
- El borrador de recorrido incluyó seis pasos ordenados, desde revisar la madurez hasta registrar la cosecha. El de formulario incluyó cultivo, cantidad, fecha y destino, todos rellenados con valores ficticios.
- Las dos diapositivas se aplicaron y se deshicieron por separado en el proyecto temporal. La presentación volvió a quedar vacía en ambos casos. El modelo describió los valores como típicos en el cuerpo del segundo borrador. Se añadió un rótulo visible a la vista previa para identificarlos como ficticios. Queda comprobar la rotulación en Chrome y ampliar la evaluación a otros modelos.

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
- La interfaz expone esos campos en los paneles de contexto del chat y de generación de presentación. En este recorrido inicial el payload no incluía cuerpos de diapositivas vinculadas ni resumen global. La verificación posterior de fragmentos y resumen estructural está registrada más abajo; el tamaño sigue acotado por los límites descritos. Las tarjetas siguen limitadas a destinos de idea del ámbito, no a ancestros.
- Se recorrió la UI en Chrome contra un proyecto temporal con seis ideas, cinco relaciones y una diapositiva vinculada. Al seleccionar «Personas curiosas», la vista previa mostró dos ideas de ámbito, el ancestro raíz, dos relaciones, el título vinculado y tres ideas fuera de contexto.
- «Generar sugerencias» envió la petición a un servidor Ollama-compatible local simulado. Se capturó el cuerpo HTTP y se comparó con la vista previa: nombre del proyecto, conteos 6/5/1, nodos del ámbito, ancestro, relaciones, título vinculado y recuento 3 coincidieron. La respuesta simulada creó una tarjeta «Añade ejemplos concretos» apuntada a un nodo de la rama y esta apareció en el chat.
- Los archivos, proyecto, credenciales, servidor y perfil de navegador eran temporales y aislados; no se usó ni modificó el perfil personal, ni se contactó un modelo remoto o real. Build completo correcto con Node 24.22.2; bundle principal 505,56 kB con aviso de Vite; `git diff --check` correcto. La calidad con Ollama/LM Studio real y concurrencia sigue pendiente.

### Contrato común de errores API/SSE — T-004 — 2026-11-16

- En una instancia de producción aislada con `APPDATA`, `LOCALAPPDATA` y carpeta de proyectos temporales, un `GET /api/no-such-route` devolvió HTTP 404 y `{code:"NOT_FOUND", message, correlationId:"req-2"}`.
- El GET no autenticado de `/api/session/oidc-config` devolvió HTTP 403 con `code:"FORBIDDEN"`, mensaje de sesión y `correlationId:"req-3"`. El cuerpo conservó el código de estado requerido por el cliente; no se inició sesión ni se accedió a datos personales.
- Tras canjear el nonce temporal en la misma instancia, un POST SSE de IA a un UUID de proyecto inexistente devolvió `stage` y un evento terminal `error` con `code:"NOT_FOUND"`, mensaje y `correlationId:"req-3"`. La llamada no contactó proveedor alguno ni cambió un proyecto.
- `npm run build` pasó con Node 24.22.2 y `npm audit --omit=dev` reportó cero vulnerabilidades. Vite mantiene su aviso por un bundle principal de 505,63 kB. Las comprobaciones posteriores del fallo 5xx se detallan a continuación. La configuración y carpetas temporales se dejaron aisladas y el servicio se detuvo.

### Contrato persistido del proyecto — T-004 — 2026-11-16

- Se cotejaron `ProjectDocument`, `PresentationSlide`, validadores y uso de almacenamiento con el modelo descrito en la especificación.
- ADR-0015 fija el JSON v3 existente como contrato canónico y documenta las diferencias de representación. No se modificó el esquema ni se requiere migración.
- Esta resolución documental no sustituye calidad de contexto IA ni la medición de capacidad y trazabilidad que se añadieron en recorridos posteriores; otros pendientes permanecen en T-004.

### Fragmentos acotados de diapositivas en contexto IA — 2026-11-16

- En una instancia aislada con perfil Chrome, almacenamiento temporal y un mock OpenAI-compatible en `127.0.0.1`, se creó un mapa con una diapositiva enlazada a «Validar aprendizaje» y otra enlazada a una rama ajena. El panel abierto para la rama mostró el cuerpo, viñeta, pasos, campos ficticios y tabla de la diapositiva pertinente; no mostró el marcador secreto de la otra.
- Se envió una petición de chat desde la rama seleccionada. El proveedor capturó `DETAIL_BODY`, `DETAIL_BULLET`, `DETAIL_STEP`, `DETAIL_FIELD` y `DETAIL_TABLE`; no recibió `UNRELATED_SECRET_SENTINEL`. La respuesta simulada produjo HTTP 200 y una sugerencia con destino válido. Esto confirma la coincidencia de contenido relevante entre la vista previa y la petición en este escenario.
- `buildProjectAiContext` limita a 20 diapositivas, 500 caracteres por diapositiva y 6.000 en total; estos topes no se estresaron con contenido largo en el recorrido. No se usó un modelo real. El servidor, proveedor, perfil y proyectos temporales se detuvieron o quedaron aislados fuera del repositorio.

### Validación de volumen local para proyectos — T-004 — 2026-11-16

- El build de producción pasó con Node 24.22.1. Se invocó la función compilada de validación con una ruta temporal bajo C:; Windows Storage la resolvió como `Fixed` sobre bus NVMe y fue aceptada.
- Se invocó la misma validación con `\\invalid-host\share\projects`; la ruta UNC fue rechazada con `PROJECT_STORAGE_VOLUME_INVALID` antes de una consulta de red.
- No se conectó unidad extraíble/USB ni volumen de red asignado, por lo que no se afirma verificación física de esos tipos. La comprobación se ejecuta una vez al inicio y falla cerrada si PowerShell Storage no puede resolver volumen, particiones o discos.
- `npm audit --omit=dev` reportó cero vulnerabilidades y `git diff --check` pasó. No se ejecutó la suite automatizada.

### Resumen global acotado en contexto IA — T-010 — 2026-11-16

- En Chrome, la vista previa de «Huerto de balcón» mostró la idea central y cuatro ramas principales, además del contenido pertinente de la rama seleccionada. También indicó que el detalle del resto del mapa queda fuera, mientras el resumen menciona las ramas principales.
- Se envió el mensaje a un mock OpenAI-compatible local. El payload capturado contenía la idea central, las cuatro ramas y el extracto «Sembrar tomate en marzo»; no contenía `MARKET_DETAIL_SENTINEL`, que pertenecía a otro tema. La respuesta simulada fue HTTP 200.
- El constructor limita el resumen a ocho etiquetas de hasta 120 caracteres y se comparte entre vista previa y servidor; no genera prosa con el modelo. El recorrido no evalúa calidad semántica con un modelo real ni estresa los límites con proyectos extensos. Los datos y proveedor fueron aislados.

### Instrumentación de trazabilidad IA — T-004 — 2026-11-16

- En almacenamiento, perfil y servicio aislados, se creó un mapa con `TRACE_LABEL_SENTINEL`; se solicitó una propuesta con `TRACE_PROMPT_SENTINEL` a un mock OpenAI-compatible y se aplicó. La operación generó dos ideas y guardó la revisión 3.
- Los logs mostraron `ai_generation_started`, etapas `waiting-for-provider` y `validating`, `ai_generation_finished`, `ai_operation_validated`, `ai_project_commit_started` y `ai_project_commit_finished`; las fases se correlacionaron con los IDs de petición. El tipo de proveedor fue `openai-compatible`, y el commit incluyó revisiones base/objetivo y duración. Ninguno de los dos marcadores apareció en los registros capturados. El mock solo registró la ruta y el tamaño del cuerpo recibido.
- Build de producción y `npm audit --omit=dev` con cero vulnerabilidades. No se recorrieron respuesta fallida del proveedor, error de guardado ni SSE; las pruebas reales de Ollama/LM Studio permanecen pendientes. Los datos y configuraciones temporales se aislaron.

### Medición de guardado local — capacidad T-004 — 2026-11-16

- Fixture sintético persistido bajo directorio temporal aislado: 1.005.189 bytes, 1.000 nodos, 999 relaciones, 100 diapositivas y 100 mensajes de conversación. Windows clasificó el volumen local de prueba como fijo/NVMe en la comprobación previa del entorno.
- Se midió directamente la llamada del servicio `saveProject`, incluyendo lectura/validación de la revisión vigente, copia previa, validación de la copia, escritura durable (sync, lectura/validación temporal y rename) y mantenimiento de copias. Tras la compilación con Node 24.22.0, ocho guardados dieron 63–142 ms. El objetivo local de 1 MB en menos de 1 s se cumple en este fixture y equipo.
- La medición excluye serialización de la petición y transporte HTTP/UI. En una tentativa separada, PowerShell tardó 7.8 s y el tiempo de respuesta del endpoint fue 2.82 s, por lo que no se usa como métrica del servicio: el coste del cliente y de transferir/responder 1 MB contaminó el recorrido. No se generaliza a otros equipos/discos ni a cancelación o arranque en frío. Los datos de prueba permanecen en Temp, no en el repositorio.


### Fallo 503 del proveedor por JSON y SSE — T-004 — 2026-11-16

- El mock local respondió HTTP 503 y un cuerpo con `FAIL_RESPONSE_SENTINEL`. Por JSON, la ruta devolvió HTTP 502, `UPSTREAM_ERROR`, `correlationId` y mensaje genérico; el texto del proveedor no apareció en la respuesta.
- Por SSE, la conexión estableció HTTP 200 y terminó con un evento `error` que incluía `UPSTREAM_ERROR`, ID de correlación y mensaje genérico; el cuerpo del proveedor no apareció en los eventos. Los registros de traza indicaron fin con error/código, sin mensaje o cuerpo del upstream.
- El recorrido registró `sessionRoutes`, `projectRoutes`, `providerRoutes` y `aiRoutes` en un arnés Fastify aislado sobre datos temporales. No se usó un modelo real. Dos intentos de iniciar `apps/server/src/index.ts` fallaron cerrados porque la consulta `Get-Volume` no devolvió respuesta dentro del límite; no se omitió esa comprobación para arrancar el servicio. Por tanto, falta repetir el mismo flujo a través del arranque completo tras recuperarse Windows Storage.


### Confirmación en el servicio completo del fallo upstream — T-004 — 2026-11-16

- Se repitió el mock HTTP 503 contra `apps/server/src/index.ts` con carpeta de proyecto, perfiles y datos aislados. La validación Windows Storage (`Get-Volume`, `Get-Partition`, `Get-Disk`) clasificó el directorio en C: como `Fixed`/NVMe y el proceso completo escuchó en loopback; no se desactivó el control de volumen.
- SSE devolvió HTTP 200 para el flujo abierto y terminó con evento `error` que incluía `UPSTREAM_ERROR`, `correlationId` y mensaje genérico. La petición JSON devolvió HTTP 502 con el mismo código/correlación y mensaje 5xx redactado. El mock incluyó `FAIL_RESPONSE_SENTINEL` en el cuerpo 503; no apareció en ninguna respuesta al cliente.
- Los logs completos de Fastify mostraron etapas y código/correlación para SSE y JSON, más el error central redactado para JSON. No aparecieron `FULL_PROMPT_SENTINEL`, `FULL_LABEL_SENTINEL` ni `FAIL_RESPONSE_SENTINEL`. Mock y servicio detenidos; perfiles y proyecto solo existieron en Temp.


### Límites del contexto IA con proyecto extenso — T-010 — 2026-11-16

- Fixture sintético: idea central, diez ramas principales, una rama seleccionada, 40 diapositivas vinculadas con cuerpos de 700 caracteres y viñetas de 600, más una diapositiva enlazada a otra rama.
- `buildProjectAiContext` devolvió 20 títulos como máximo, 12 extractos de 500 caracteres y 6.000 caracteres totales. El resumen incluyó ocho ramas más el tema central, limitó las etiquetas a 120 caracteres e indicó que quedaban dos ramas; omitió el título y el marcador de la diapositiva ajena.
- Se recorrió el constructor compartido del dominio con datos sintéticos; no se llamó al LLM ni se repitió el recorrido de red. La coincidencia vista previa/payload se confirmó en E2E previos. Calidad semántica con un modelo real sigue pendiente; la concurrencia de API y el recorrido visual en dos pestañas se registran en entradas posteriores.

### Aplicación concurrente de propuesta IA — T-010 — 2026-11-16

- En el servicio completo con proyecto, perfil y almacenamiento aislados, un mock OpenAI-compatible devolvió una propuesta válida de dos ideas.
- Se enviaron al mismo tiempo dos solicitudes `/ai-actions` con idéntica propuesta y revisión base. Una respondió HTTP 200 y guardó la revisión 3; la otra recibió HTTP 409 por conflicto. La lectura final confirmó exactamente tres nodos (raíz y dos ideas), por lo que no hubo aplicación duplicada ni pérdida silenciosa.
- No se probaron dos ventanas de navegador ni un proveedor/modelo real. El servidor, mock, proyecto y configuración temporales se detuvieron o conservaron fuera del repositorio.

### Conflicto de propuestas en dos pestañas — T-010 — 2026-11-16

- Servicio, proyectos, configuración de proveedor y navegador aislados en carpetas/contexto temporales. Se creó un perfil compatible con OpenAI apuntando a un mock local; no se llamó a servicios externos ni a un LLM real.
- Dos pestañas autenticadas abrieron el mismo proyecto de ejemplo en revisión 1. Ambas generaron y mostraron la misma tarjeta sugerida, con una propuesta revisable de dos ideas todavía sin guardar.
- En la primera pestaña, aplicar la tarjeta creó la revisión 2 y el mapa pasó de cinco a siete ideas. En la segunda, aplicar la propuesta antigua fue rechazado con HTTP 409; la interfaz mostró un aviso accesible: «El mapa cambió desde que se generó la propuesta. Recarga antes de aplicarla.» No se duplicaron ideas.
- Al recargar la segunda pestaña, se recuperaron las siete ideas guardadas y la opción de deshacer IA. Las páginas de prueba y los procesos de servicio/mock se cerraron; los datos permanecen en Temp, fuera del repositorio.

### Reconstrucción del paquete portátil — T-013/T-014 — 2026-11-16

- `scripts/package-windows.ps1 -PortableOnly -Offline -NodeDirectory .tools/node-v24.22.2-win-x64` completó build y empaquetado con Node 24.22.2. Vite mantuvo el aviso conocido del bundle principal de 508,15 kB. El ZIP resultante pesa 43.901.641 bytes y contiene 4.443 entradas.
- Se verificó la presencia de Node, los scripts de inicio/detención, la SPA compilada, el servidor y el módulo nativo de credenciales Windows; el runtime extraído respondió `v24.22.2`.
- El recorrido de arranque desde una extracción en Temp se detuvo antes de escuchar: `validateProjectStorageRoot` falló con `PROJECT_STORAGE_VOLUME_INVALID`. Una consulta directa `Get-Volume -FilePath` sobre la misma ruta no produjo salida dentro de la espera y se interrumpió. No se omitió el control de almacenamiento. La prueba anterior de paquete arrancado y detenido sigue siendo evidencia histórica; esta repetición queda pendiente de repetir cuando Windows Storage responda.
- `ISCC.exe` no está instalado; no se compiló ni instaló el asistente Inno Setup. Datos y configuración de esta comprobación estaban en Temp.

### Arranque del ZIP actualizado — T-013 — 2026-11-16

- El empaquetado portátil en modo offline completó la compilación. El ZIP se extrajo en una carpeta temporal, con proyectos y perfiles de prueba separados.
- Con una ruta de red, el lanzador abortó el inicio y mostró el aviso específico de validación del almacenamiento. Con una carpeta local, el servicio arrancó y sirvió la interfaz con HTTP 200.
- El segundo inicio reutilizó el mismo proceso. El lanzador lo detuvo y se comprobó que el proceso había salido. Queda pendiente el recorrido del instalador Inno Setup.

### Deriva temática de sugerencias con gpt-oss-120b

- En una repetición aislada mediante FreeLLMAPI, el mapa de prueba tenía la rama «Cosecha» y su ficha. La respuesta generó una ficha de cosecha con una tabla pertinente y un recorrido de etapas de cultivo, pero mezcló conceptos de siembra en la tabla y no mantuvo el contenido estrictamente dentro del contexto de la rama.
- Se retiró el ejemplo concreto de calendario de siembra del prompt de sugerencias y se reforzó que las propuestas se basen en etiquetas y relaciones presentes. También se aclaró la relación entre el destino y el tema, evitando ejemplos ajenos al proyecto.
- La compilación del servidor pasó tras el cambio de instrucciones. La respuesta real observada ya no propuso el calendario de siembra como sugerencia, aunque conservó referencias a fechas de siembra dentro de una tabla para cosecha y sugirió etapas de cultivo. Por tanto, esta modificación reduce un sesgo explícito, pero no resuelve la deriva semántica; T-010 permanece abierta.
- La siguiente iteración debe comprobar la selección y el destino de cada tarjeta frente al subgrafo incluido en el contexto, y repetir la consulta real con mapa completo y rama seleccionada. No se considera aceptado hasta que tarjetas, prompts y borradores sean coherentes con el tema de su destino.

### Filtrado de sugerencias con tema de otra rama — T-010

- El servidor calcula los términos distintivos de ramas hermanas con el mapa completo solo para validación interna, incluso si la selección actual excluye esas ramas. Los destinos permitidos siguen limitados al ámbito enviado al modelo. Descarta una tarjeta si su título o prompt contiene uno de esos términos y no solicita explícitamente comparar o relacionar ramas.
- El filtro se aplica antes de devolver las tarjetas al cliente; no altera el mapa ni el contenido del proyecto. Las comparaciones explícitas quedan permitidas.
- `npm run build --workspace @espacio-visual/server` y `git diff --check` pasaron después del cambio. No se ha vuelto a consultar FreeLLMAPI ni se ha recorrido Chrome en esta iteración; la evaluación real de calidad continúa pendiente.
- Limitación: la regla es léxica. No detecta sinónimos ni todos los cruces conceptuales; palabras que aparezcan en una etiqueta de rama hermana pueden provocar un descarte aunque el modelo las use con otro sentido. Evaluar con la fixture de siembra/cosecha y revisar tanto tarjetas aceptadas como descartadas antes de dar T-010 por cerrada.

### Evaluación de sugerencias tras el filtro de ramas — 2026-11-17

- Con FreeLLMAPI y el modelo solicitado gpt-oss-120b, en un proyecto temporal «Huerto de balcón», el mapa completo devolvió tres tarjetas sobre siembra, ficha de cosecha y comparación de cultivos. Los tres destinos pertenecían al mapa y los temas coincidían con las ideas asociadas.
- Al seleccionar Cosecha y su ficha, el modelo devolvió tres tarjetas sobre completar el registro, crear una diapositiva resumen y explorar condiciones climáticas/ubicación. Los destinos quedaron dentro de la selección y no hubo referencias a tareas de siembra. Esta ronda no generó ni aplicó diapositivas; evalúa únicamente la respuesta de sugerencias.
- En una repetición mediante un upstream compatible simulado, el servidor descartó «Añade meses y profundidad de siembra» dirigida a «Ficha de cosecha». Conservó «Compara siembra y cosecha» porque la tarjeta expresaba una comparación entre ramas, y conservó «Completa el registro de cosecha» por corresponder al destino.
- Las llamadas se hicieron a la API local con perfiles, sesión y proyecto temporales. El proyecto no se guardó en los datos personales. La respuesta real se solicitó a FreeLLMAPI; el mock solo sirvió para verificar el filtrado.
- Resultado: mejora confirmada para esta fixture y este modelo. T-010 sigue abierta para probar otros mapas/modelos y recorrer propuestas de diapositivas de principio a fin.

### Clasificación de sugerencias de diagrama — T-010 — 2026-11-17

- Una llamada real con FreeLLMAPI y gpt-oss-20b para la rama Cosecha devolvió «Diseñar diagrama de proceso de cosecha» como diapositiva sin `format`. El clasificador se amplió para reconocer «diagrama», «flujo de trabajo», «flujo del proceso» y «proceso visual» y asignar `create-slide` con formato `diagram`.
- Se repitió la petición real con gpt-oss-20b. Generó dos tarjetas: expansión de Ficha de cosecha y tabla comparativa entre Siembra y Cosecha con destino en Cosecha. Ambas estaban en el ámbito; la comparación se conservó por ser explícita. Esa repetición no volvió a proponer el diagrama.
- Una respuesta de proveedor compatible simulada que clasificaba el diagrama como expansión se filtró en la API como una tarjeta `create-slide`, formato `diagram`, con destino Cosecha.
- `npm run build --workspace @espacio-visual/server` pasó tras el cambio. No se generó ni aplicó el borrador de la diapositiva en esta iteración; queda evaluar los pasos del diagrama en el ciclo de vista previa, aplicación, persistencia y deshacer.
