# MyMap.ai como referencia para una web personal

Investigación del 14 de noviembre de 2026. Objetivo: reproducir la experiencia de pasar de una idea a un mapa editable, ampliarlo con IA y convertirlo en una presentación. La copia será una web de uso personal con un proveedor de IA que el usuario pueda configurar. Este documento deja la base para la siguiente fase con EGM.

> **Estado actualizado:** este informe conserva evidencia histórica y límites de observación de REA/Chrome. Las decisiones de producto y arquitectura se consolidaron en [`../docs/designs/espacio-visual-personal.md`](../docs/designs/espacio-visual-personal.md). La revisión Goldfish de ese diseño sigue pendiente. Las pruebas no completadas aquí (como reordenación manual o descarga con nombre final) permanecen sin verificar; no se presentan como capacidades comprobadas de MyMap.

## Hallazgos y evidencia

| Flujo | Resultado | Evidencia |
|---|---|---|
| Iniciar un proyecto | La pantalla de inicio pone un campo de texto en el centro. En la barra inferior agrupa adjuntos, formato automático o explícito, selector de modelo y envío. Debajo aparecen accesos a formatos y tarjetas de plantillas. | REA `ev_905930b62277ebdc8c848cd4af399067e72cdc55a3aed3fb52cecbde4c458eb0` · [Inicio](https://www.mymap.ai/home) |
| Generar un mapa | REA escribió un prompt en español y pulsó Enviar. Apareció un diálogo de registro que conservaba el prompt. El selector mostraba DeepSeek V4 Pro antes del envío y el diálogo indicaba DeepSeek V4 Flash. La causa del cambio queda sin verificar. | REA `ev_4c986d0c5394a85c6a956096ffd509a87e90305518ca4e697a6bd4430f902f7f` |
| Explorar el mapa | La plantilla pública muestra un mapa de solo lectura con una idea central, cuatro ramas temáticas y tres hojas por rama. Incluye zoom, ajuste de vista y sugerencias que proponen extender o adaptar una rama. | REA `ev_a227aca05c25e34f53882e8ce47d2cb29369ffc0aa94a5199a96532dfda0a266` · [Plantilla](https://www.mymap.ai/templates/mindmap-sustainable-coffee) |
| Ampliar una idea | La portada demuestra un lienzo acompañado por chat, sugerencias para explorar o añadir detalle y un resumen de las modificaciones. También describe seleccionar un nodo y pedir su edición. La aplicación de cambios a un mapa propio queda pendiente de observación. | REA `ev_cfd178f944285d04fd23a464a06e03d9cf569950b0d47d719b901d1d6ba310ca` · [Portada](https://www.mymap.ai/) |
| Crear una presentación a partir de ramas | La herramienta pública muestra tres bloques de ejemplo con títulos y viñetas. Al usar una sugerencia y pulsar Generar, apareció el diálogo que pide cuenta. La documentación describe una diapositiva por rama principal, edición y reordenación. | REA `ev_10a2bd37fb860e79972938994acbf7df0b79d569ceadec32770522a8184aa723`, `ev_418010040ddc573cd9eda420b59a8295724493c79209df36a78db3f2a1b4c217` · [Map to Slides](https://www.mymap.ai/tools/mind-map-to-slides) |
| Presentar el propio lienzo | La portada anuncia que se puede encuadrar una zona del lienzo, presentarla desde el navegador y exportar un PDF con una página por marco. Es un flujo distinto a redactar diapositivas a partir de las ramas. | [Portada](https://www.mymap.ai/) |
| Cambiar de modelo | REA abrió el menú en Inicio. Hay dos grupos, económico y prémium, y un indicador de modelo activo. En el menú público capturado no aparece la opción de añadir una URL propia. | REA `ev_1a0b03d6383781d8afaa2d37427c0960e0de52a2f81d6177576879e26d90ec61` |
| Exportar | El sitio describe PNG, SVG, PDF, Markdown y enlaces de compartición. Otra página menciona PPTX para Pro. Son funciones publicadas para distintas superficies. Los formatos disponibles por objeto, plan y pantalla siguen por verificar. | [Portada](https://www.mymap.ai/) · [Mind Map to Presentation](https://www.mymap.ai/tools/mind-map-to-presentation) · [Planes](https://www.mymap.ai/pricing) |

Las capturas se hicieron con REA en Chrome, con perfiles temporales sin sesión y una ventana de 1440 × 1000. Las dos pruebas de envío llegaron al registro antes de mostrar un resultado generado. Quedan pendientes el editor autenticado, la generación real y su streaming, la persistencia, la creación de marcos, la navegación de presentación y las exportaciones. El código del servidor, sus prompts, su formato interno y la causa del cambio de modelo no se establecen con estas capturas.

El paquete `evidencia-rea.json` contiene los escenarios y sus identificadores, incluido un primer intento de envío de diapositivas que encontró dos botones con el mismo nombre. La repetición seleccionó el botón habilitado y llegó al registro. `inicio-modelos.png` es la captura original del menú y su SHA-256 coincide con el del registro REA.

## Referencia visual

- Inicio claro con un degradado suave rosa, lila y azul en la parte superior. Cabecera compacta, título centrado, compositor blanco ancho con bordes redondeados y sombra tenue. Controles pequeños en una fila inferior. Galería de tarjetas con previsualización y título.
- El menú de modelos se ancla al compositor. Es una lista blanca compacta con grupos, iconos, una selección resaltada en azul claro y una marca al final de la fila.
- La referencia para el editor es la demostración pública. Priorizar el espacio para el lienzo, controles compactos de zoom y ajuste, y chat con seguimiento y acciones sugeridas. Las barras, paneles y estados definitivos requieren una captura del editor real.
- La plantilla de mapa y el ejemplo de diapositivas sirven como referencias diferentes. El mapa combina jerarquía y conexiones alrededor de un centro. La secuencia usa bloques de texto con títulos y viñetas. Usar contenido propio en las plantillas de la web personal.

## Propuesta para discutir en EGM

| Prioridad | Comportamiento de la web personal |
|---|---|
| Primera entrega | Crear un mapa desde texto, añadir y editar nodos a mano, moverlos, seleccionar ramas, hacer zoom y ajustar vista. Autoorganizar el mapa y guardar el proyecto localmente. |
| Primera entrega | Chat junto al lienzo. Enviar una petición global o contextual a una rama. Poder ampliar, resumir, reescribir y deshacer. Una ampliación de una rama conserva las demás. |
| Primera entrega | Generar diapositivas editables a partir del mapa. Registrar qué nodos sirvieron de fuente, editar títulos y puntos, reordenar, presentar en el navegador y exportar PDF. |
| Primera entrega | Configurar proveedores por nombre, protocolo, URL base, modelo y credencial opcional. Incluir botón para probar la conexión y selección de modelo en el compositor. Permitir introducir el ID a mano si el servidor no anuncia modelos. |
| Siguiente corte | Incorporar marcos del lienzo como diapositivas, exportación PNG/SVG y adjuntos de texto o PDF. Evaluar PPTX editable según el uso personal. |
| Paridad ampliada | Inventariar y priorizar otros diagramas, importaciones, galería, colaboración, enlaces públicos e imágenes. Cada familia de diagramas requiere reglas de edición, estructura y distribución propias. |

El modelo devolvería contenido y operaciones tipadas. La aplicación validaría los IDs y los cambios permitidos, aplicaría las operaciones al documento en una sola transacción y calcularía la distribución visual con reglas propias. El documento local guardaría el grafo, la conversación y la presentación como partes del mismo proyecto. Para una selección, el contexto incluiría los nodos seleccionados, su ascendencia y las ramas pertinentes. Un deck generado sería editable de forma independiente, con referencias a sus nodos de origen.

El primer adaptador puede usar Chat Completions compatible con OpenAI. Los valores iniciales serían `http://127.0.0.1:11434/v1` para Ollama y `http://127.0.0.1:1234/v1` para LM Studio. El conector personalizado compartiría ese protocolo cuando su API lo admita. Otros protocolos requerirían sus propios adaptadores. El servicio local de la aplicación haría las peticiones, guardaría secretos por separado y validaría las salidas aunque el modelo no admita JSON con esquema. Nombrar y seleccionar un proveedor remoto sería una decisión explícita del usuario. [Ollama](https://docs.ollama.com/api/openai-compatibility) · [LM Studio](https://lmstudio.ai/docs/developer/openai-compat)

## Recorrido de aceptación propuesto

1. Configurar un proveedor local, comprobar conexión y seleccionar un modelo.
2. Escribir en español una idea de huerto urbano y generar tres ramas visibles y editables.
3. Seleccionar «Riego» y pedir dos alternativas. Ver los nuevos nodos solo en esa rama y poder deshacer la operación.
4. Crear una presentación de cuatro diapositivas a partir del mismo mapa, editar una, reordenarlas, presentarlas y exportarlas a PDF en ese orden.
5. Recargar el navegador y recuperar mapa, conversación y presentación. Cambiar de proveedor sin perder el proyecto. Simular un fallo de conexión y comprobar que sigue accesible el trabajo previo.

## Segunda pasada con la cuenta gratuita

Prueba del 14 de noviembre de 2026 en la sesión autenticada del usuario, mediante el control de Chrome. Los identificadores REA del análisis anterior corresponden a escenarios públicos. La sesión autenticada estaba disponible mediante la extensión de Chrome.

| Prueba | Resultado observado |
|---|---|
| Crear un mapa | Inicio arrancó con DeepSeek V4 Pro seleccionado. Al enviar apareció una oferta de pago con la opción de continuar con DeepSeek V4 Flash. Flash generó un mapa con raíz, tres ramas y seis hojas, 10 elementos en total. |
| Seleccionar y ampliar | Al pulsar el texto «Riego» se seleccionó el objeto de mapa completo y el chat mostró su título y acciones contextuales. El prompt nombró la rama y las dos ideas concretas. Aparecieron bajo Riego y se conservaron las ideas anteriores. El mapa pasó de 10 a 12 elementos; el chat contabilizó una actualización del lienzo. |
| Crear diapositivas | Con el modo Auto y un prompt explícito, el chat creó cuatro bloques de contenido sobre el cultivo, con portada, planificación, riego y mantenimiento. Estaban en una cuadrícula dentro de un marco general y el mapa original se conservó. El informe del chat indicó 9 nodos añadidos. |
| Presentar | El botón abrió el visor con navegación, pantalla completa y salida por Esc. Este deck mostró «Diapositiva 1 / 1» con las cuatro secciones juntas. El menú de exportación también contó un marco. Esto apunta a que la unidad de presentación es el marco reconocido por el visor; en este caso, cuatro secciones redactadas quedaron agrupadas como una sola diapositiva de presentación. |
| Exportar | El menú ofreció Descargar PNG y marcó PDF de marco y PDF de todos los marcos como Pro. Al pulsar PNG se cerró el menú, pero la herramienta no detectó una descarga. PPTX no apareció en este menú. Queda por verificar un archivo descargado y el comportamiento con varios marcos independientes. |
| Reabrir | Tras recargar reaparecieron el mapa de 12 elementos, los cuatro bloques y los tres turnos del chat. |

El editor usa un lienzo con cuadrícula de puntos y atribución de React Flow. Una barra vertical a la izquierda reúne texto, encabezado, forma, marco, imagen y archivo. Zoom, ajuste y minimapa están abajo a la izquierda. El chat está a la derecha, es redimensionable y se puede contraer. Arriba reúne historial, nuevo chat, presentación, compartir y exportar. El compositor muestra adjuntos, modo y modelo.

Para EGM, convertir el número de diapositivas en un requisito verificable: si se piden cuatro, el visor debe indicar 1/4 al abrir, permitir navegar a 4/4 y producir cuatro páginas al exportar. También queda por decidir si seleccionar una rama debe pasarla directamente al chat, ya que en esta prueba se seleccionó el mapa entero y se indicó la rama por texto.

## Prueba de marcos independientes

En el mismo proyecto, pedí a DeepSeek V4 Flash dos marcos independientes fuera del marco existente. El chat mostró primero «Preparando tu mapa», después «Contexto analizado» y, mientras seguía disponible «Stop generating», el lienzo ya mostraba los dos marcos y el chat indicaba «Dibujando nodos · 4». Al finalizar, el chat mostró cuatro nodos dibujados en 11 segundos. Esto verifica actualización visible durante la respuesta, con el protocolo y la secuencia interna de eventos aún por comprobar.

El visor pasó de 1/1 a 1/3. El primer marco conservó las cuatro secciones agrupadas. La flecha siguiente mostró «Prueba A — Siembra» como 2/3 y «Prueba B — Cosecha» como 3/3. El menú ofreció exportar tres marcos en un PDF con Pro. No se verificó una reordenación manual ni el contenido del PDF.

La prueba autenticada se hizo con el control de Chrome. La revisión automática bloqueó el lanzamiento de un perfil de prueba de Chrome con un puerto de depuración local. Por tanto, sigue pendiente observar esta sesión directamente desde REA.

## Repetición del control de exportación

En una repetición posterior, el menú de tres marcos confirmó que el PDF requiere Pro. Descargar PNG hizo que apareciera la oferta «Descarga en PDF con Pro», que confirma que el PNG gratuito lleva marca de agua y que el PDF está bloqueado. Desde esa oferta, el botón «Descargar PNG en su lugar» informó «Descarga lista». La automatización de Chrome no detectó un evento de descarga ni un nombre de archivo normal. Al revisar la carpeta Descargas del perfil local encontré dos archivos temporales de 457 709 bytes, ambos con firma PNG válida. Esto confirma que la imagen se transfirió, aunque el nombre o la finalización de la descarga quedó en un estado temporal y MyMap no indicó una ruta final.

La navegación se repitió y confirmó portada 1/3, «Prueba A — Siembra» 2/3 y «Prueba B — Cosecha» 3/3. La reordenación manual de marcos sigue pendiente.

## Estado de conexión REA a Chrome

Intento del 14 de noviembre de 2026. REA necesita un endpoint CDP local de Chrome y un ID de página para capturar la sesión autenticada. Consulté `http://127.0.0.1:9222` y `http://127.0.0.1:9223` con `mcp__rea__list_browser_targets`, limitando el origen a MyMap. Ambos devolvieron `endpoint_unreachable`. La pestaña autenticada visible por la extensión de Chrome no proporciona a REA ese endpoint. Un intento anterior de iniciar otro Chrome con puerto de depuración fue bloqueado por la revisión automática de comandos, así que no se consiguió una sesión REA autenticada. Las observaciones del editor se mantienen atribuidas a Chrome, y las capturas REA existentes a las páginas públicas. Para reanudar REA sobre el editor hace falta que Chrome autenticado exponga un CDP local en `127.0.0.1` y que se identifique la pestaña MyMap.

La inspección local de Descargas sí encontró dos transferencias recientes de 457 709 bytes con firma PNG válida. Se observaron como archivos `.tmp` con UUID, no como una descarga con nombre PNG finalizado. Esto confirma que MyMap produjo y transfirió los bytes de imagen, pero no explica por qué el navegador dejó el nombre temporal.

Queda pendiente intentar reordenar los marcos en el editor autenticado. No se debe presentar la reordenación ni el resultado de las descargas como verificados por REA con el acceso disponible.

## Sugerencias contextuales en el chat

Ejemplo aportado por el usuario: al partir de una idea, el chat le sugirió explorar distintos tipos de monetización. Para la versión personal, las sugerencias deben poder detectar dimensiones relevantes que todavía no aparecen en el lienzo. En una idea de negocio, una acción como «Explora tres formas de monetizar esta idea» podría desarrollar una diapositiva que compare quién pagaría, por qué y cómo se cobraría. La monetización tiene sentido cuando encaja con el proyecto.

El usuario también vio propuestas de formularios con campos y valores ficticios de ejemplo, y diagramas sobre cómo se usaría la aplicación. Esto amplía el criterio de EGM: el chat debe poder elegir el artefacto que ayude a explorar la idea. Por ejemplo, «Esboza el formulario de alta» produciría un borrador editable con campos, ejemplos y huecos por definir. «Dibuja el recorrido del primer uso» produciría un diagrama editable con pasos, decisiones y rutas alternativas. Ambos se añadirían al mismo lienzo y podrían seguir refinándose desde el chat. Estos ejemplos proceden de la experiencia del usuario. Queda pendiente comprobar qué grado de edición o interacción ofrece MyMap para los formularios.

El editor mostró tres acciones breves después de responder y las renovó al cambiar el lienzo. Tras ampliar Riego sugirió extender Mantenimiento, añadir una rama de Compostaje y convertir el mapa en tareas. Tras generar la presentación, propuso añadir un diagrama a la diapositiva de Riego, crear una diapositiva de resumen o convertir la presentación en un póster. El usuario destaca que, al pulsar una sugerencia de diapositiva, el chat desarrolla esa idea directamente en el lienzo. Observamos las sugerencias en Chrome. La ejecución por clic se recoge como experiencia del usuario.

Propuesta para EGM: después de una respuesta que modifique el lienzo, el chat ofrece unas pocas sugerencias concretas basadas en el contenido actual y, cuando exista, en la selección. Cada sugerencia indica qué hará y dónde. Al pulsar «Añade una diapositiva de resumen final», el chat ejecuta la acción sin que el usuario tenga que redactar un prompt. El lienzo conserva el mapa y las diapositivas existentes, y el visor muestra una diapositiva adicional navegable. Las sugerencias se actualizan tras el cambio y el usuario puede deshacer la acción.
