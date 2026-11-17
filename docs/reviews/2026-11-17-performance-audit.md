# Auditoría de rendimiento — 2026-11-17

## Alcance y método

Se revisó el frontend React/React Flow y se midió una compilación de producción servida localmente. Chrome abrió un proyecto aislado de cinco ideas; el proceso usó directorios temporales para proyectos, perfil y ajustes. La traza de carga se tomó con caché vacía, CPU 1× y red sin limitación. No hubo datos de usuarios reales (CrUX), ni se probó un proveedor de IA.

Es una muestra de escritorio en una máquina local, no un presupuesto de rendimiento ni una prueba representativa de móviles. La auditoría deja seguimiento abierto para perfiles de mapas grandes y condiciones lentas.

## Evidencia de partida

| Medición | Resultado |
|---|---:|
| Largest Contentful Paint (LCP) | 492 ms |
| TTFB | 6 ms |
| Demora de renderizado del LCP | 485 ms (98,7 % del total) |
| Cumulative Layout Shift (CLS) | 0,00 |
| Elementos DOM al terminar el mapa | 208 |
| Bundle principal | 519,01 kB sin comprimir / 159,07 kB gzip |
| Layout inicial reportado por Chrome | 260 ms, con 194 elementos recalculados |

El LCP fue el título `h1`, texto ya presente en el documento generado por React, no un recurso externo. La traza relacionó el tiempo con la fase de render y señaló una cadena de solicitudes API; la captura de Resource Timing midió entre 2 y 7 ms por petición en la máquina local. Por ello, las cifras de la cadena de traza no se toman como latencia de servicio aislada.

## Hallazgos y correcciones

### Props inestables del canvas

El componente `App` recreaba `ariaLabelConfig`, `fitViewOptions` y el callback `onNodeClick` en cada render. Los cambios del chat, formularios o diálogos podían invalidar propiedades del componente React Flow aunque el mapa no hubiera cambiado.

**Corrección:** las opciones de accesibilidad y ajuste quedaron a nivel de módulo; el callback de selección usa `useCallback`. Los nodos y conexiones ya se memoizaban según sus datos.

### Coste cuadrático en vista de lista

Para cada nodo, la vista de lista recorría todas las conexiones y volvía a buscar nodos destino. En mapas de `n` ideas y `e` conexiones suponía O(n × e) trabajo.

**Corrección:** al activar la vista, se construyen etiquetas y listas de hijos en un recorrido de nodos y conexiones, O(n + e); el índice no se calcula mientras el usuario está en el lienzo.

### Mapas grandes y DOM

El proyecto admite hasta 10.000 ideas. React Flow no limita por defecto el dibujo a elementos visibles. La documentación del componente indica que `onlyRenderVisibleElements` puede ayudar con mapas grandes, aunque añade coste, por lo que no se recomienda para todos los casos.

**Corrección:** la propiedad se activa a partir de 100 nodos para no imponer ese trabajo extra a los mapas pequeños. La vista de lista sigue disponible para recorrer el contenido completo. La carga con 1.000 o 10.000 ideas no se midió aún; el zoom inicial puede encuadrar una gran parte del mapa, así que esta opción no demuestra por sí sola una mejora del primer render. Referencia: [React Flow, API `onlyRenderVisibleElements`](https://reactflow.dev/api-reference/react-flow).

### Minimapa y mapas de hasta 10.000 ideas — 2026-11-17

La inspección de la implementación instalada de `@xyflow/react` confirmó que `MiniMapNodes` recorre `s.nodes` y monta un `NodeComponentWrapper` por cada ID; el minimapa no sigue el límite de elementos visibles del canvas. Con el máximo admitido, eso añade hasta 10.000 formas SVG y suscriptores aunque el canvas principal represente solo una parte del grafo.

**Corrección aplicada:** el minimapa se muestra hasta 1.000 ideas y se omite por encima de ese umbral. Los controles de zoom y «Ajustar mapa a la vista» permanecen disponibles. El umbral es una medida de contención fundamentada en el coste lineal del minimapa; la medición controlada siguiente observó una reducción DOM, pero aún no determina el impacto estable en memoria o respuesta.

**Medición posterior:** un arnés temporal de Vite en Chromium cargó 10.000 ideas y 9.999 conexiones sintéticas. En una comparación con el mismo conteo montado del canvas (756 nodos y 810 aristas), el estado sin minimapa registró 7.819 elementos DOM; un override temporal que volvió a montar el minimapa registró 17.823, incluidos 10.000 rectángulos SVG. La diferencia observada fue de 10.004 elementos DOM (56 % menos en esa instantánea). En otra corrida, 1.000 ideas mostraron el minimapa con 1.000 rectángulos; a 10.000 el minimapa se ocultó y el botón «Ajustar mapa a la vista» siguió presente y cambió la transformación del viewport al pulsarlo. Es una comparación única del componente en servidor de desarrollo, sin emulación ni persistencia: no mide el arranque de producción, memoria estable ni variabilidad entre corridas. El arnés y el override se retiraron.

### Perfil de producción a 10.000 ideas y vista textual — 2026-11-17

Se sirvió el build de producción local desde una raíz de proyectos, perfil de navegador y carpetas de configuración creados dentro de `.perf-run`; el fixture tenía 10.000 ideas, 9.999 conexiones y 1.857.983 bytes. No se usaron proyectos ni proveedores del usuario.

- La navegación con caché vacía y CPU 1× dio LCP 966 ms (TTFB 14 ms, demora de render 952 ms) y CLS 0,00. Es una única muestra local. En el momento de la instantánea, el canvas tenía 6.540 elementos DOM, 612 nodos y 681 aristas montados; el minimapa no estaba presente.
- La traza señaló una actualización de layout de 403 ms (80.013 nodos afectados), recálculo de estilos de 416 ms (60.003 elementos) y 58 ms de reflujo forzado dentro del chunk de React Flow. Son hallazgos de esa navegación, no una suma de tiempos de usuario.
- Antes de optimizar la lista, cambiar del lienzo a lista tardó 2.414 ms en una corrida, con 40.128 elementos DOM, 10.000 filas principales y 19.999 elementos `li` por la repetición de relaciones directas.
- Primera iteración: en mapas de más de 1.000 ideas se añadió `content-visibility: auto` a las filas principales con tamaño intrínseco estimado de 76 px. Tres cambios de vista tardaron 577, 365 y 352 ms (mediana 365 ms), conservando 40.128 elementos DOM; al final «Idea sintetica 9999» siguió visible y seleccionable.
- Segunda iteración: los nombres conectados pasaron de listas `<ul>/<li>` anidadas a un texto «Ideas conectadas: …» dentro del botón de la idea de origen. Conserva los nombres y cada idea tiene una sola fila/botón principal. El DOM descendió a 30.128 elementos (25 % menos que la iteración anterior), con 10.000 filas, 10.000 botones y 9.999 bloques de relaciones. Tres cambios de vista dieron 398, 514 y 462 ms (mediana 462 ms); la última idea siguió visible y seleccionable.
- La medición previa sin estas optimizaciones fue 2.414 ms y 40.128 elementos. No es un A/B balanceado: la comparación orienta el trabajo, pero no atribuye una mejora estadística. `content-visibility` conserva el DOM y el cambio a texto en botón modifica la presentación semántica de las relaciones; falta revisión con lector de pantalla.
- El CSS inicial pasó de 33,93 kB (8,05 kB gzip) a 34,01 kB (8,09 kB gzip); JS principal y chunk del canvas cambiaron solo por el rebuild (333,62 y 185,86 kB respectivamente).

La comparación de 2.414 ms frente a las corridas tras los cambios no es una serie A/B balanceada; orienta la corrección, no demuestra una mejora garantizada. Siguiente foco: revisar con lector de pantalla la presentación de relaciones, medir memoria y aislar el coste del canvas y sus reflows.

### Perfil móvil Fast 3G/CPU 4× y compresión JSON — 2026-11-17

Se repitió el mapa de 10.000 ideas en Chrome a 390×844 CSS, densidad 3, CPU 4×, Fast 3G y movimiento reducido. La respuesta del proyecto se mide en la sesión del servidor local; los únicos datos fueron sintéticos.

- Antes de comprimir respuestas, la navegación dio LCP 6.910 ms (TTFB 566 ms, demora de render 6.344 ms) y CLS 0,01. La traza indicó una respuesta de proyecto de 1,86 MB en la ruta crítica.
- Se añadió gzip negociado a respuestas JSON de al menos 1 KiB cuando el cliente lo admite; se establece `Vary: Accept-Encoding` y se conservan sin compresión HTML, streams y respuestas pequeñas. El JSON del fixture era 1.857.990 B; el endpoint respondió `Content-Encoding: gzip`, `Content-Length: 134.148` y `Vary: Accept-Encoding` (92,8 % menos bytes).
- Tras el cambio, una navegación con la misma emulación dio LCP 4.817 ms (TTFB 566 ms, demora de render 4.252 ms) y CLS 0,01. El navegador descomprimió el cuerpo y la UI mostró el proyecto; el canvas montó nodos/aristas visibles. La diferencia de LCP fue de 2.093 ms, pero una corrida por variante no demuestra causalidad ni es un A/B balanceado.
- La vista de lista en móvil tardó 2.306 ms con CPU 4×/Fast 3G, mantuvo 10.000 botones y 30.128 elementos DOM; la medición confirma que la compresión no alteró el contenido decodificado.

La compresión recorta transferencia de mapas grandes; todavía se debe repetir el perfil móvil y mejorar la demora de render, que sigue siendo 4.252 ms en esta muestra.

## Comprobaciones posteriores

- `npm run build`: correcto.
- El bundle principal quedó en 519,26 kB (159,21 kB gzip), 0,25 kB mayor que la referencia. Vite mantiene el aviso por superar 500 kB; los cambios de render no reducen el peso transferido.
- Una interacción aislada para abrir el diálogo de proveedores registró INP de 176 ms: 5 ms de retraso de entrada, 41 ms de trabajo y 130 ms de presentación. Está bajo el umbral de 200 ms en esa sesión, pero no se hizo una medición A/B antes/después.
- CLS observado: 0,00. La traza posterior no produjo un LCP comparable, por lo que no se atribuye una mejora numérica a la corrección.
- La prueba usó Chrome con almacenamiento de proyecto temporal; no cambió ningún proyecto del usuario ni guardó el texto transitorio del formulario.

## Continuación T-028 — carga diferida y mapas de escala — 2026-11-17

### Separación del canvas

React Flow, su proveedor de contexto y sus estilos se movieron a `MapCanvas.tsx`, cargado bajo demanda cuando se muestra el lienzo. Mientras se descarga aparece un estado `role="status"`; la vista de lista no carga el canvas. El renderizado de elementos visibles se conserva desde 100 ideas y la vista de lista mantiene acceso a todas.

`npm run build` terminó correctamente. El chunk de entrada pasó de 519,26 kB (159,21 kB gzip) a 333,57 kB (99,61 kB gzip); el canvas queda en un chunk diferido de 185,84 kB (60,23 kB gzip). La suma de ambos es aproximadamente 519,41 kB sin comprimir: la separación reduce lo que debe parsearse al inicio y elimina el aviso de chunk de entrada de Vite, pero no reduce el JavaScript total. El CSS del canvas también se difiere.

### Perfil controlado

Se generaron fixtures aisladas de 100, 1.000 y 10.000 ideas. La instancia temporal usó directorios propios para proyectos, configuración y perfil; no se tocaron datos reales. Chrome se ejecutó a CPU 4× y Fast 3G, viewport 1280×900.

| Escenario de 100 ideas | Antes de dividir el canvas | Después de dividirlo |
|---|---:|---:|
| LCP | 5.908 ms | 5.085 ms |
| TTFB | 565 ms | 566 ms |
| Demora de renderizado LCP | 5.342 ms | 4.519 ms |
| CLS | 0,00 | 0,00 |
| Chunk de entrada transferido | 519.568 B | 333.879 B |

La diferencia de LCP fue de 823 ms (13,9 %) en estas dos corridas de laboratorio; no es una serie estadística ni una garantía de mejora en producción. El chunk diferido se obtuvo desde caché (304) en la medición posterior, así que no se atribuye ahorro de bytes de transferencia total. No hay datos de usuarios reales.

En la página de 1.000 ideas, la compilación nueva montó 224 nodos y 693 conexiones, con 5.275 elementos DOM en la instantánea de página. El JSON del proyecto midió 197.988 B. La navegación cargó y el canvas respondió, pero Chrome devolvió `NO_NAVIGATION` para esa traza y no se registra un LCP comparable. Antes del cambio, 1.000 ideas dio LCP 5.780 ms bajo la misma emulación, aunque no constituye una comparación A/B de la nueva versión.

El fixture de 10.000 ideas tenía un JSON de 2.035.696 B. Antes de dividir el canvas, la instantánea observó aproximadamente 27.255 elementos DOM, 294 nodos y 3.833 conexiones visibles/montadas en ese momento. El cambio de proyecto dejó el renderizador sin responder en esa sesión; el escenario de 10.000 no se repitió tras el code split. Las trazas también señalaron actualización de layout y reflujo forzado. Estas muestras varían según el momento de captura; no deben interpretarse como un conteo estable de todos los elementos del grafo.

### Estado y siguiente trabajo

- `T-028` permanece parcial. Se verificaron tamaños 100/1.000/10.000, pero faltan perfiles completos de interacción, memoria y diapositivas en cada escala.
- Perfilado inicial a 10.000 ideas completado con arnés de desarrollo: la comparación de una captura observó 10.004 elementos DOM menos al omitir el minimapa y confirmó que «Ajustar mapa a la vista» sigue operativo. Falta un perfil de producción y medidas repetidas.
- Build de producción perfilado con 10.000 ideas: LCP 966 ms y CLS 0 en una corrida. La lista consolidó relaciones en texto dentro de cada botón; bajó de 40.128 a 30.128 elementos DOM (25 %), mantiene los 10.000 botones/ideas y selecciona la última. Tres recorridos dieron mediana 462 ms; el A/B no fue balanceado.
- Se incorporó gzip para JSON grande; en móvil Fast 3G/CPU 4× el endpoint de proyecto bajó de 1.857.990 a 134.148 bytes. LCP observado 6.910→4.817 ms en dos muestras únicas no balanceadas; el navegador cargó y decodificó el mapa completo.
- Perfil móvil de 390×844 con 10.000 ideas, antes de paginar: el zoom mínimo 0,4 mantiene 24 px de altura visible para el botón de nodo; la lista completa tenía 10.000 botones y 30.116 elementos DOM, sin scroll horizontal. Lighthouse mobile dio 100/100 Accessibility sobre el canvas, pero la auditoría de la lista expiró por el tamaño del DOM.
- Para reducir el coste de lista, se paginó en grupos de 250. En el mismo fixture móvil de 10.000 ideas, una página montó 250 botones y 871 elementos DOM contando la app. Lighthouse snapshot terminó en 3–4 s con 100/100 Accessibility en primera y última página, frente al timeout con la lista completa. Se verificó teclado y selección de la idea 10.000. Esto reduce DOM en pantalla, pero la carga JSON, preparación de relaciones y memoria del mapa completo siguen pendientes de perfilado.
- Revisar la lista de relaciones con lector de pantalla y medir memoria; perfilar repetidamente 10.000 ideas, especialmente conexiones, layout, reflows y persistencia.
- Repetir varias corridas comparables con caché fría y medir zoom, selección, edición, cambio de mapa, lista y editor de diapositivas; documentar variabilidad.
- Considerar una estrategia de renderizado de conexiones o agrupación adaptativa solo si la nueva traza confirma que son el cuello de botella.
- Repetir en viewport móvil/CPU lenta y revisar que el fallback de carga diferida siga accesible.

## Pendiente

1. Completar perfiles de interacción, memoria, lista y diapositivas a 100/1.000/10.000 ideas.
2. Repetir comparaciones con varias corridas y caché fría, y en móvil/CPU lenta.
3. Identificar con trazas si conexiones, miniatura, layout, serialización o autosave dominan el caso de 10.000.

T-028 sigue parcial. Las métricas observadas en este informe son de laboratorio y no equivalen a experiencia de usuarios reales.

## Continuación — heap, callbacks y persistencia — 2026-11-17

La primera lectura de memoria se interpretó como estable, pero al esperar más apareció la recolección automática de basura y el heap bajó de aproximadamente 162 MB a 25 MB. En la lista también hubo lecturas de 12–28 MB según el momento. Se corrige el informe: los valores previos de 164–182 MB describían memoria transitoria antes de GC, no heap retenido. `performance.memory` no permite comparar variantes sin fijar estado de GC, y no se forzó una recolección. Estos datos no sustentan un presupuesto de RAM ni un cálculo de ahorro frente a la versión anterior.

Se eliminó la copia del objeto `data` de cada nodo que solo servía para añadir el callback de edición; el callback ahora llega al nodo mediante contexto React. Los nodos conservan su `ariaLabel` en el estado y las conexiones ya etiquetadas se reutilizan, regenerando solo nombres ausentes o desactualizados. `serializeMap` sigue escribiendo únicamente los campos persistidos.

`npm run build` pasó. En Chrome, un mapa aislado de 10.000 ideas mostró 72 nodos y 97 conexiones visibles con nombres accesibles. F2 abrió la edición; cambiar el nombre actualizó la etiqueta del nodo y de la conexión, y el API guardó la revisión 2. La lectura posterior del proyecto devolvió el nuevo nombre, 9.999 conexiones y ningún `ariaLabel` transitorio en el JSON. Lighthouse móvil en la lista paginada dio 100/100 en las cuatro categorías informadas, sin auditorías fallidas.

Las nuevas lecturas en producción siguen siendo exploratorias: el heap pasó por ~162 MB antes de GC a ~25 MB tras GC natural en canvas; la lista osciló entre ~12 y ~28 MB. El build de producción se midió en una sesión; el servidor no pudo reiniciarse para repetir la variante después porque Windows falló al validar el volumen temporal. La prueba funcional de edición se completó en desarrollo. T-028 continúa parcial: comparar heap bajo condiciones controlables, perfilar serialización/autosave y revisar layouts/reflows en canvas. No se estableció un umbral automático ni se cambió la vista que se abre por defecto.

## Continuación — snapshots del autosave — 2026-11-17

La ruta de autosave serializaba repetidamente el mismo mapa: el efecto de cambios, la preparación de la petición, la comprobación posterior de ediciones concurrentes y el aviso de cierre llamaban a `serializeMap`/`JSON.stringify`. Ahora los snapshots serializados del mapa, diapositivas y conversación se memoizan por identidad de estado. Las comprobaciones del autosave reutilizan el snapshot y el efecto ya no se vuelve a ejecutar solo por cambiar referencias de nodos/conexiones cuando el contenido persistible no cambia. Una actualización real del mapa todavía requiere recorrer y serializar nodos/conexiones una vez, en O(n + e); este cambio elimina repeticiones, no el coste base.

`npm run build` pasó después del cambio. No se hizo una comparación de latencia ni se afirma un ahorro temporal cuantificado. Pendiente: perfilar con fixture reproducible de 10.000 nodos las ediciones durante el debounce, guardado de respuesta grande y reflows, además de repetir heap con condiciones de GC comparables.
