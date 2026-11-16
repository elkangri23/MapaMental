# Decisiones de arquitectura

Un ADR registra una decisión importante, por qué se tomó, qué alternativas se consideraron y qué consecuencias tiene. No es una tarea ni una segunda especificación. La especificación define el comportamiento; estos ADR explican decisiones duraderas.

Estados: **Aceptado**, **Propuesto**, **Reemplazado**. Un ADR reemplazado se conserva y enlaza al nuevo.

| ADR | Decisión | Estado |
|---|---|---|
| [0001](ADR-0001-web-servicio-local.md) | Web local con servicio loopback | Reemplazado parcialmente por ADR-0013 |
| [0002](ADR-0002-stack-typescript.md) | React/TypeScript, Vite, Fastify y npm workspaces | Aceptado |
| [0003](ADR-0003-proyecto-json-y-copias.md) | Carpeta JSON versionada con copias recuperables | Aceptado |
| [0004](ADR-0004-mapa-y-presentacion-enlazados.md) | Mapa y presentación como artefactos separados enlazados | Aceptado |
| [0005](ADR-0005-operaciones-ia-atomicas.md) | Cambios IA validados, atómicos y reversibles | Aceptado |
| [0006](ADR-0006-adaptadores-y-credenciales.md) | Adaptadores de proveedor y secreto fuera del proyecto | Aceptado |
| [0007](ADR-0007-contexto-y-presupuesto-remoto.md) | Contexto remoto pertinente y presupuesto en EUR | Aceptado |
| [0008](ADR-0008-instalador-windows.md) | Inno Setup con Node 24 LTS incluido | Aceptado |
| [0009](ADR-0009-sesion-local-segura.md) | Sesión local de un solo uso y API restringida al origen propio | Reemplazado parcialmente por ADR-0013 |
| [0010](ADR-0010-almacen-secreto-windows.md) | Claves en Windows Credential Manager mediante keyring | Aceptado |
| [0011](ADR-0011-eventos-de-generacion-en-la-peticion.md) | Eventos SSE en la petición de generación | Aceptado |
| [0012](ADR-0012-identidad-oauth-mfa-passkeys.md) | Modo protegido local con OIDC y segundo factor WebAuthn | Aceptado; implementación parcial en T-020–T-025 y revisión pendiente en T-026 |
| [0013](ADR-0013-loopback-ipv6-y-webauthn.md) | Origen localhost y escucha loopback IPv6 | Aceptado; sustituye la dirección y el host de navegador anteriores |
| [0014](ADR-0014-contrato-de-error-api.md) | Contrato común `{code,message,correlationId}` para errores JSON y SSE | Aceptado |
| [0015](ADR-0015-formato-persistido-proyecto-v3.md) | Contrato serializado v3 de mapa, conversación y presentación | Aceptado; no modifica el esquema actual |
| [0016](ADR-0016-fragmentos-de-diapositivas-en-contexto-ia.md) | Fragmentos acotados de diapositivas relevantes en contexto IA | Aceptado; visible en la vista previa |

