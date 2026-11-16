# ADR-0014: Contrato común para errores de API

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Relacionado:** [ADR-0011](ADR-0011-eventos-de-generacion-en-la-peticion.md)

## Contexto

La especificación pide errores accionables, pero el servicio devolvía `{message}` y la transmisión SSE terminaba con el mismo mensaje sin código ni referencia correlacionable. Eso dificulta al cliente distinguir categorías de fallo y pedir ayuda con un identificador sin incluir prompts o datos del proyecto.

## Decisión

- Toda respuesta JSON de error devuelve `{code, message, correlationId}`. El código es estable por categoría HTTP; `correlationId` es el ID de petición de Fastify que aparece como `reqId` en los registros del servicio.
- Los eventos SSE terminales `error` contienen los mismos tres campos además de `type: "error"`. Los eventos `stage` y `result` no cambian.
- Se conservan campos de estado ya existentes en errores (por ejemplo `mode`) para no romper clientes. Los fallos 5xx usan un mensaje genérico y no revelan detalles internos.
- Los errores de callback OIDC que deliberadamente son texto plano quedan fuera del formato JSON; no son respuestas de API consumidas por la aplicación.

## Alternativas

- **Añadir solo un encabezado de correlación:** no cubre eventos SSE y exige que cada cliente combine encabezado y cuerpo.
- **Dejar la normalización a cada ruta:** aumenta el riesgo de formatos divergentes; la serialización centralizada cubre errores de validación, sesión, rutas inexistentes y errores de Fastify.
- **Devolver códigos internos de excepción:** puede filtrar detalles de infraestructura y no ofrece categorías estables.

## Consecuencias

Los clientes existentes pueden seguir leyendo `message`; clientes nuevos disponen de código y referencia. Las categorías se derivan del estado HTTP. El identificador correlaciona con `reqId` de los registros locales sin registrar contenido de la petición. Las respuestas exitosas no cambian.
