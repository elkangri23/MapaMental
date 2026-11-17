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

**Corrección aplicada:** el minimapa se muestra hasta 1.000 ideas y se omite por encima de ese umbral. Los controles de zoom y «Ajustar mapa a la vista» permanecen disponibles. El umbral es una medida de contención fundamentada en el coste lineal del minimapa; todavía no hay medición Chrome antes/después que demuestre su impacto real en memoria o respuesta.

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
- Perfilar y optimizar 10.000 ideas después de la carga diferida, especialmente el coste de conexiones, layout, medición y persistencia.
- Medir en Chrome el nuevo umbral del minimapa con 1.000 y 10.000 ideas; confirmar conteo DOM, tiempo de respuesta y que ajustar/zoom y navegación siguen operativos.
- Repetir varias corridas comparables con caché fría y medir zoom, selección, edición, cambio de mapa, lista y editor de diapositivas; documentar variabilidad.
- Considerar una estrategia de renderizado de conexiones o agrupación adaptativa solo si la nueva traza confirma que son el cuello de botella.
- Repetir en viewport móvil/CPU lenta y revisar que el fallback de carga diferida siga accesible.

## Pendiente

1. Completar perfiles de interacción, memoria, lista y diapositivas a 100/1.000/10.000 ideas.
2. Repetir comparaciones con varias corridas y caché fría, y en móvil/CPU lenta.
3. Identificar con trazas si conexiones, miniatura, layout, serialización o autosave dominan el caso de 10.000.

T-028 sigue parcial. Las métricas observadas en este informe son de laboratorio y no equivalen a experiencia de usuarios reales.
