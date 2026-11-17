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

- T-015 sigue parcial: falta recorrido HTTP integrado de DNS rebinding hasta socket, validación de errores adicionales de disco/ACL y revisión dinámica completa de rutas.
- T-021 y T-023–T-026 siguen pendientes de recorridos con IdP OIDC, autenticador WebAuthn y aplicación TOTP reales.
- El análisis no incluye pentest, revisión de todos los criterios OWASP, lector de pantalla ni verificación WCAG manual.
- La auditoría global permanece abierta; ver [`THREAT_MODEL.md`](../THREAT_MODEL.md), [`SECURITY.md`](../SECURITY.md) y [`TASKS.md`](../TASKS.md).
