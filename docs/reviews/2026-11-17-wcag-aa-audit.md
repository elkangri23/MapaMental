# Revisión de accesibilidad — 2026-11-17

## Alcance y resultado

Se recorrieron las vistas de mapa y editor de presentación en Chrome con la aplicación local conectada, además de comprobar etiquetas, nombres accesibles, foco, reflujo y contraste de una muestra de texto. Lighthouse snapshot dio **100/100 en Accesibilidad** en mapa móvil, mapa escritorio, presentación móvil a 320 px y presentación escritorio. No se considera una declaración de conformidad WCAG 2.0 AA: Lighthouse solo automatiza parte de los criterios y no se usó lector de pantalla.

## Hallazgos y correcciones

1. **Pie de diapositivas solapado en móvil.** A 320 CSS px, el bloque de ideas vinculadas salía del contenedor de altura fija y podía quedar encima del botón «Copias». Se cambió el lienzo de presentación móvil a altura automática y desbordamiento visible. El pie ahora sigue al contenido y el solapamiento desaparece.
2. **Objetivo táctil de «Copias».** Lighthouse marcaba el botón porque el bloque previo lo solapaba, dejando 22 px de área libre. Se aumentó a 28 px de alto y se incrementó la separación de los elementos del pie. Lighthouse móvil de la presentación pasó de 97 a 100 en accesibilidad; el botón dejó de aparecer en el informe de fallos.
3. **Indicador del selector.** El chevrón decorativo tenía contraste 2,91:1 frente al fondo. Se oscureció a `#73798b`; el muestreo da 4,34:1. Cumple el umbral 3:1 de contraste no textual de WCAG 2.1 1.4.11, que es una mejora adicional y no un criterio de WCAG 2.0 AA.
4. **Proxy de desarrollo.** La revisión funcional descubrió que Vite apuntaba a IPv4 (`127.0.0.1`) mientras el API solo escucha en IPv6 loopback (`::1`). El proxy y los scripts `dev`/`preview` se alinearon con `::1`; el fallback de `Origin` queda en `localhost:5173`, acorde a `expectedUiOrigin`. Se comprobó el arranque sin override de entorno: API health 200 y la interfaz conectó al servicio. Se conserva el límite de loopback.
5. **Objetivos táctiles en mapas densos.** El perfil móvil de 10.000 ideas encontró que el zoom automático podía reducir a 4,3 px la altura del botón de cada idea. En pantallas de hasta 760 px se fijó un zoom mínimo de 0,4 y 60 px de alto para el botón (24 px efectivos en pantalla). Se amplió a 28 px el área del enlace de atribución de React Flow, que Lighthouse también marcaba. La repetición en Chrome móvil a 390×844 dio 100/100 en Accessibility y no señaló objetivos táctiles.

## Evidencia adicional

- Mapa y presentación: 100/100 Lighthouse en Accessibility en escritorio y móvil; la evaluación de presentación se realizó con mapa, recorrido, formulario ficticio y tabla.
- A 320 CSS px, `document.documentElement.scrollWidth` coincidió con el ancho del viewport en el mapa y en el editor de diapositivas; sin desplazamiento horizontal. A 640 CSS px tampoco hubo desbordamiento.
- La presentación móvil tiene altura de documento suficiente para contenido y pie; el bloque de ideas vinculadas termina antes del pie y no hay intersección entre sus cajas.
- La inspección del árbol encontró nombres accesibles para controles visibles, incluyendo campos, botones de icono, controles del mapa y navegación de diapositivas. El primer Tab enfoca «Saltar al contenido principal» con contorno visible de 3 px.
- En la muestra DOM se inspeccionaron 58 nodos de texto en mapa y 83 en presentación. No apareció texto por debajo de 4,5:1; las combinaciones con gradientes, pseudo-elementos y estados no visibles no quedan cubiertas por ese cálculo. El chevrón decorativo alcanzó 4,34:1 tras el cambio.
- `prefers-reduced-motion: reduce` estuvo activo durante la revisión; CSS reduce animaciones y transiciones.
- En el perfil de 10.000 ideas, los botones del mapa midieron 24×67 px en el zoom mínimo de móvil. En vista de lista se conservaron 10.000 botones, 30.116 elementos DOM, conexiones anunciadas dentro de cada fila, foco visible y sin desbordamiento horizontal.
- Lighthouse pudo auditar el canvas móvil de 10.000 ideas (100/100), pero la auditoría de la lista completa agotó el tiempo del protocolo del navegador. No se infiere un fallo de accesibilidad de esa interrupción; queda pendiente repetirla con carga por lotes o una muestra de tamaño controlado.

## Pendiente

La línea T-016 sigue parcial: lector de pantalla real y anuncios en contexto, recorrido manual completo de teclado en todos los estados, zoom con cadenas largas, revisión de estados de foco/hover/deshabilitado y evaluación de todos los criterios A/AA aplicables. Lighthouse 100 no certifica WCAG. Los resultados de SEO y Agentic Browsing de Lighthouse no son criterios de accesibilidad: en desarrollo fallaron `robots.txt`, `llms.txt` y ARD.
