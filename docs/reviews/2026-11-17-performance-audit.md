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

## Comprobaciones posteriores

- `npm run build`: correcto.
- El bundle principal quedó en 519,26 kB (159,21 kB gzip), 0,25 kB mayor que la referencia. Vite mantiene el aviso por superar 500 kB; los cambios de render no reducen el peso transferido.
- Una interacción aislada para abrir el diálogo de proveedores registró INP de 176 ms: 5 ms de retraso de entrada, 41 ms de trabajo y 130 ms de presentación. Está bajo el umbral de 200 ms en esa sesión, pero no se hizo una medición A/B antes/después.
- CLS observado: 0,00. La traza posterior no produjo un LCP comparable, por lo que no se atribuye una mejora numérica a la corrección.
- La prueba usó Chrome con almacenamiento de proyecto temporal; no cambió ningún proyecto del usuario ni guardó el texto transitorio del formulario.

## Pendiente

1. Comparar interacción y carga de mapas con 100, 1.000 y 10.000 ideas, incluyendo zoom, selección, edición, vista de lista y apertura de diapositivas.
2. Repetir en perfiles de CPU lenta y Fast/Slow 4G, registrando LCP, INP, CLS, memoria y nodos montados.
3. Perfilar el bundle para identificar candidatos reales a carga diferida. No bajar el umbral de aviso de Vite sin reducir carga efectiva.
4. Revisar si la miniatura, medición del layout, serialización y autoguardado siguen siendo coste dominante en grafos grandes.

T-028 sigue parcial. Las métricas observadas en este informe son de laboratorio y no equivalen a experiencia de usuarios reales.
