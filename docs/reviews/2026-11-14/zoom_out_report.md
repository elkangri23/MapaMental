# EGM Stage 5 — Revisión de zoom inicial

**Documento:** `docs/designs/espacio-visual-personal.md`  
**Modo:** REVIEW  
**Contexto leído:** `concepts_brief.md`, `analisis/README.md`  
**Fecha:** 2026-11-14

## Hallazgos

### Mayor — Elecciones de distribución y runtime antes de probar el recorrido básico

**Ámbito:** Open Questions, Technical Plan, Alternatives Considered.  
**Riesgo:** El diseño cierra web+servicio local, runtime incluido e instalador Windows. La revisión no encuentra una comparación que pruebe que el navegador por sí solo no puede cubrir cada recorrido; el runtime y el instalador añaden mantenimiento antes de validar la experiencia esencial.  
**Resolución:** La forma web+servicio y el acceso directo son decisiones explícitas del autor. Mantenerlas, pero dividir su entrega: primero shell y servicio mínimo; empaquetado solo cuando el producto local funcione. No tratar el instalador como requisito del primer corte de UI.

### Mayor — Muchas garantías de infraestructura en v1

**Ámbito:** Project y operaciones, API local, Persistencia y requisitos no funcionales.  
**Riesgo:** Revisiones, transacciones, inversos, cancelación, SSE, control de origen, sesión local, reemplazo atómico, copias y lectura de esquemas futuros forman una superficie amplia antes de probar las operaciones del lienzo.  
**Resolución:** Conservar los requisitos de seguridad, reversión y recuperación que el usuario acordó; implementarlos por incrementos. Para la primera funcionalidad, exigir alcance validado, commit sin cambios parciales, guardado recuperable y cancelación antes del commit. Añadir robustez de recuperación y migración antes de empaquetar.

### Mayor — El plan fija muchos tipos y archivos antes del primer modelo de contenido

**Ámbito:** Project y operaciones, Detailed Implementation Plan.  
**Riesgo:** El modelo enumera chat, sugerencias, diagramas y formularios y anticipa numerosas rutas/archivos. Puede convertir una estructura futura en compromiso antes de validar mapa y presentación.  
**Resolución:** Mantener los dos formatos de lienzo confirmados. Implementar primero nodo de mapa, diapositiva y bloques de contenido que el usuario ya pidió. Mantener el chat y las sugerencias como parte del recorrido, pero crear módulos separados solo cuando haya un límite real de código que lo requiera.

### Nit — Coste de varios adaptadores y contabilidad en la primera entrega

**Ámbito:** Goals, Proveedores, privacidad y coste.  
**Riesgo:** Protocolos, descubrimiento, tarifas editables y presupuestos añaden complejidad a una app personal.  
**Resolución:** Conservar todos los proveedores pedidos como alcance del producto, pero entregar conectores por pasos: primero un proveedor local operativo; después OpenAI-compatible y Anthropic; finalmente el registro de tarifas y bloqueo de presupuesto.

## Contradicciones

La lente Inventive Catalyst informó: **No false compromise detected**. No recomienda patrón adicional.

## Búsqueda de reutilización

El repositorio tiene React/TypeScript/Vite, React Flow, el shell inicial, y un paquete de dominio pequeño. No se encontró infraestructura existente de proyectos, proveedores, copias, jobs/SSE, credenciales o deshacer. Por tanto, no hay módulos previos que reutilizar para esas funciones.

