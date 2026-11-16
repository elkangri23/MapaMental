# ADR-0005: Operaciones IA validadas y atómicas

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

El transporte de progreso se actualizó en el [ADR-0011](ADR-0011-eventos-de-generacion-en-la-peticion.md). Esta decisión sigue vigente para validación, aplicación y deshacer.

## Contexto

Las sugerencias deben aplicarse con un clic, señalar el alcance, conservar contenido ajeno a la acción y poder deshacerse.

## Decisión

El modelo devuelve una propuesta estructurada con revisión base, objetivo, cambios y sugerencias de seguimiento. El servidor valida IDs, tipos y alcance, construye el nuevo documento y lo guarda de forma durable junto con la copia previa antes de actualizar memoria o confirmar el resultado a la UI. SSE muestra progreso; cancelar o fallar antes del commit no cambia el proyecto. Se persiste un inverso para la última acción IA y se desactiva cuando hay una edición posterior.

## Alternativas

- Dibujar parcial mientras genera: da respuesta visual temprana, pero expone estados incompletos.
- Mostrar cambios en vista previa: aporta revisión previa, pero añade un paso que el usuario rechazó.

## Consecuencias

Cada generación es auditable y reversible; el servicio necesita contratos tipados, manejo de trabajos/cancelación y coordinación con el almacenamiento para no reportar éxito antes del commit durable.

