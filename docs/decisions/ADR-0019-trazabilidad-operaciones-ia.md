# ADR-0019: Trazabilidad de operaciones IA

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Contexto:** El diseño requiere diagnosticar fallos entre petición, proveedor, validación y guardado. Los logs de petición existentes no distinguen las etapas de una operación IA, pero prompts, respuestas y contenido de mapas son privados.

## Decisión

Añadir eventos JSON estructurados al logger local de Fastify para inicio, etapas y resultado de generación; y validación, inicio y resultado del guardado de propuestas. Los eventos comparten `reqId` y pueden incluir la ruta de API, UUID opaco de proyecto, nombre fijo de operación, tipo de proveedor (`ProviderKind`), etapa, código HTTP estable, revisiones y duración en milisegundos. La etiqueta del evento expresa el hito del flujo; no se añade una capa de persistencia o exportación.

No registrar prompts, respuestas del modelo, historial, etiquetas/relaciones, nombre de proyecto, URL/base URL del proveedor, credenciales, cabeceras ni cuerpos. Los mensajes son constantes. El proyecto se identifica solo mediante UUID validado.

## Consecuencias

- Los logs pueden correlacionar esperas y fallos del proveedor con validación y guardado durable mediante `reqId`, sin guardar el texto enviado o producido por el modelo.
- Revisión base/objetivo y duración ayudan a identificar conflictos y latencia de persistencia.
- Los logs de Fastify dependen de la configuración de registro del proceso; no se incorpora retención, análisis o interfaz de auditoría.
- Build de producción y auditoría de dependencias pasaron. Un recorrido aislado con mock local verificó eventos de proveedor y guardado correlacionados por petición; los marcadores del prompt/idea no aparecieron en los logs. Una falla 503 simulada se verificó con error JSON 502 y evento SSE terminal redactado. La retención operativa de logs y proveedores reales siguen fuera de ese recorrido.
