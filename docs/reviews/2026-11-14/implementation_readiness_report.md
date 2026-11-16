# EGM Stage 9 — Preparación para implementación

**Documento:** `docs/designs/espacio-visual-personal.md`  
**Ámbito:** Detailed Implementation Plan, líneas 170–187 al inicio de la etapa  
**Revisores:** Implementation Readiness, Codebase Details, Style  
**Fecha:** 2026-11-14

## Hallazgos consolidados

### Mayor — El inventario de archivos mezcla lo existente y lo que habrá que crear

El repositorio ya contiene manifiestos npm, shell React/React Flow, endpoint health, dominio mínimo y documentos. El plan solo los enumera como previstos, no marca **Modify/Create**, no incorpora los `tsconfig` actuales y no los vincula a T-006–T-013.

**Acción:** inventariar rutas reales, separar modificación de creación y asociar cada archivo a un hito. La revisión afirma que `docs/VERIFICATION.md` no existe, pero el archivo sí está presente en el repositorio; esa parte se registra como falso positivo del revisor.

### Mayor — Faltan contratos y secuencia durable

La lista de archivos no define campos de proyecto, revisión, forma de operaciones, errores, aplicación en memoria frente a disco, fallo de almacenamiento o reglas de reintentos/cancelación. El resumen de endpoints no asigna solicitud/respuesta y versiones.

**Acción:** documentar los contratos mínimos y el orden validar → construir nuevo snapshot/inverso → escribir y verificar temporal/copia → reemplazar archivo → actualizar estado en memoria → confirmar a UI. Ningún commit exitoso se informa si el disco falla.

### Mayor — No hay un límite por fases ligado a checkpoints

La propuesta enumera muchos archivos y funciones sin criterios para completar cada incremento. Las tareas existentes distinguen T-006 a T-014, pero el plan no enlaza las fases a ellas.

**Acción:** fijar entregas incrementales, con shell actual como base, mapas y guardado local, IA/proveedores, presentaciones y exportación, y finalmente el instalador.

### Mayor — Los escenarios no fijan resultados en fallos críticos

Faltan verificaciones para salida de modelo inválida, archivo más nuevo que la app, fallo de escritura/espacio agotado, origen web no permitido, reinicio con trabajo cancelado, límites cuando falta precio/uso y datos de uso parcial.

**Acción:** documentar conducta esperada y cómo revisar cada caso por fase. Mantener el documento de escenarios manuales; no agregar ni ejecutar tests automatizados en esta tarea.

### Mayor — La lista de archivos no es una instrucción de implementación

Los propósitos son resúmenes, no pasos por ruta. La fase de presentación no identifica sus componentes; la fase de instalador no establece su launcher ni preservación de datos.

**Acción:** enlazar cada archivo a cambios concretos, contratos y criterios. Registrar los detalles de instalación en `INSTALLATION.md` y `STORAGE.md` antes de marcar el instalador completo.

### Mayor — El plan mezcla estructura objetivo con estado actual

El shell existe como código inicial, pero no se ha arrancado. La lista de archivos futuros no indica qué se retiene y qué se modifica en la UI actual.

**Acción:** describir `App.tsx` como prototipo local no persistente que se ampliará; identificar archivos ya creados y capacidades pendientes.

### Nit — Estilo de archivos planificados

La frase «crean shell» y «incluyen runtime» puede sonar a trabajo ya completado. Añadir una nota de estado de implementación y usar verbos futuros en los propósitos.

