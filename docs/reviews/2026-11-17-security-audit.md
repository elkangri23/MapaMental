# Auditoría de seguridad — 2026-11-17

## Alcance

Revisión estática de autenticación OIDC/WebAuthn/TOTP, cookies y sesión, rutas de perfil, proveedores y auditoría local; comprobación de dependencias y compilación. No es pentest, evaluación de despliegue ni certificación OWASP/WCAG.

## Hallazgo corregido

Las rutas de OIDC/MFA/passkeys convertían varias excepciones sin `statusCode` en HTTP 400 y devolvían directamente `error.message`. Un fallo imprevisto del almacén, del llavero del sistema o de una biblioteca WebAuthn podía aparecer como error de cliente y revelar texto interno. El helper común `sendCaughtApiError` ahora conserva mensajes solo para errores esperados 4xx; las excepciones inesperadas pasan a HTTP 500 con mensaje genérico y el log registra únicamente el ID de petición y el nombre del tipo de error. Se aplicó a los handlers de alta/autenticación/gestión de passkeys y operaciones de recuperación TOTP.

## Comprobaciones

- `npm run build`: correcto con Node 24.22.2.
- `npm audit`: 0 vulnerabilidades conocidas, incluidas dependencias de desarrollo.
- `git diff --check`: correcto.
- Revisión estática de límites loopback, validación Host/Origin, sesiones en memoria, PKCE/state/nonce, desafíos WebAuthn de un solo uso, verificación de usuario, límites de TOTP, redacción de cookies/query strings y controles SSRF existentes.

## Riesgos y trabajo abierto

- En T-015, la ruta HTTP real de prueba de proveedores ahora rechaza `127.0.0.1.nip.io` al resolver a loopback (HTTP 400 y cero conexiones en listener canario). Junto con la simulación determinista anterior, confirma dos partes del control. Sigue faltando reproducir el cambio de respuesta DNS entre validación y socket en un recorrido HTTP real; también quedan errores adicionales de disco/ACL y revisión dinámica completa de rutas.
- La inspección de `project-store` detectó un fallo de limpieza: si `copyFile` fallaba después de crear un destino, podía quedar un snapshot parcial con extensión `.json`. Se centralizó la copia exclusiva para retirar el destino ante fallos distintos de `EEXIST`, y se usa copia verificada para migración y respaldo previo a restauración. Una inyección ENOSPC tras crear el parcial confirmó que desaparece, que el proyecto conserva sus bytes y que el reintento guarda revisión 2 con una copia válida. Una segunda inyección hizo fallar la copia con ENOSPC y la retirada del parcial con EACCES: se conservó el proyecto original byte a byte, se propagó ENOSPC y el reintento creó revisión 2. Esto ejercita la ruta de error, no un volumen lleno ni ACL del sistema operativo.
- En una revisión estática adicional se encontró que las rutas del proyecto seguían enlaces locales al abrir JSON y copias. `project-store` ahora usa `lstat` y rechaza directorios de proyecto, `project.json`, carpeta `backups` y ficheros de copia que sean symlinks/reparse points o tipos inesperados. `npm run build` y `git diff --check` pasaron. Una fixture runtime temporal en Windows confirmó error de aplicación 409 para junctions de directorio, symlink de `project.json` y restauración de copia enlazada; el listado omitió una copia enlazada. El control previo no elimina la carrera con otro proceso de la misma cuenta, que aún puede modificar directamente los datos locales.
- La API de proyectos transforma `ENOSPC` a HTTP 507 `INSUFFICIENT_STORAGE` con orientación para liberar espacio, sin ruta local ni texto original del sistema. El recorrido Fastify inyectó la falla después de crear un backup parcial, confirmó el 507 seguro, proyecto intacto, parcial retirado y reintento en revisión 2. No se agotó espacio físico ni se usó una ACL real; siguen pendientes la validación con ACL del sistema operativo y otros errores de disco.
- T-021 y T-023–T-026 siguen pendientes de recorridos con IdP OIDC, autenticador WebAuthn y aplicación TOTP reales.
- El análisis no incluye pentest, revisión de todos los criterios OWASP, lector de pantalla ni verificación WCAG manual.
- La auditoría global permanece abierta; ver [`THREAT_MODEL.md`](../THREAT_MODEL.md), [`SECURITY.md`](../SECURITY.md) y [`TASKS.md`](../TASKS.md).
