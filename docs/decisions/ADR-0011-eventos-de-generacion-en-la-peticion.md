# ADR-0011. Eventos de generación en la misma petición

- **Estado** Aceptado
- **Reemplaza** El transporte de progreso descrito en [ADR-0005](ADR-0005-operaciones-ia-atomicas.md).

## Contexto

La interfaz genera una respuesta o propuesta en una petición autenticada. La aplicación de una propuesta es una segunda operación, confirmada por el usuario y comprobada contra la revisión del documento.

## Decisión

Los endpoints de chat y propuestas entregan eventos SSE en la respuesta a su petición POST cuando el cliente envía `Accept: text/event-stream`. Comunican preparación, espera del proveedor, validación y un resultado o error terminal. La cancelación cierra esa conexión y propaga el cierre al proveedor. Las peticiones sin esa cabecera conservan la respuesta JSON. Aplicar y deshacer conservan sus endpoints y checks de revisión.

## Consecuencias

La petición define la vida de la generación. En caso de interrupción, el usuario puede volver a solicitarla. No se mantienen trabajos recuperables entre conexiones. El resultado completo sigue pasando validación antes de llegar a la interfaz y aplicar sigue siendo una operación durable separada.
