# Revisión de seguridad y accesibilidad de autenticación

**Fecha:** 2026-11-16  
**Estado:** revisión estática; T-026 parcial  
**Alcance:** flujo OIDC, sesiones local/protegida, WebAuthn, TOTP de recuperación, rutas de registro de passkey y los formularios visibles de login/recuperación. Se revisó el código y se compiló la aplicación. No se ejecutaron pruebas automatizadas, lector de pantalla, prueba de penetración ni recorrido con IdP o autenticadores reales.

## Resultado

No se declara conformidad WCAG ni cierre de M5. La implementación sigue acotada a una persona y loopback. Las decisiones de seguridad más importantes —separación de cookies, validación de origen, sesión protegida tras OIDC + WebAuthn con UV y token de recuperación de uso restringido— están reflejadas en el código. Los riesgos restantes son principalmente falta de validación dinámica y limitaciones de operación/localidad, detallados abajo.

## Comprobaciones de código

| Área | Resultado de revisión |
|---|---|
| Sesiones | Cookie local y protegida separadas; estado en memoria; vencimiento y revocación del lado servidor. La recuperación no es aceptada como sesión de proyecto. |
| OIDC | Authorization Code + PKCE, `state`/`nonce`, enlace por `(iss, sub)` y estado de segundo factor corto. El proveedor real, JWKS/firmas y callback loopback siguen sin recorrido. |
| WebAuthn | Se requiere UV en alta/autenticación; challenge asociado a sesión/operación y consumido una sola vez. No se verificó un dispositivo real. |
| TOTP | RFC 6238, secreto aleatorio de 160 bits, ventana de ±1 paso, comparación de seis dígitos con `timingSafeEqual`, anti-replay por paso aceptado y máximo de cinco intentos de recuperación antes del bloqueo de 15 minutos. Secreto/estado usan Windows Credential Manager, no archivos de proyecto. |
| Recuperación | Tras OIDC + TOTP, cookie HttpOnly de cinco minutos; solo endpoints de alta WebAuthn la aceptan. El registro completo conserva la passkey nueva, revoca las anteriores e invalida sesiones protegidas. Un intento incompleto se reanuda durante el plazo restante. |
| Origen/CSRF | Las rutas sensibles comprueban host y origen esperado; las mutaciones esperan JSON. Hace falta recorrerlas en el paquete/servidor local y cubrir casos negativos de navegador. |
| Registro | Fastify serializa solo la ruta y omite la query, evitando que el callback escriba `code`/`state`. Los eventos de autenticación usan JSONL local sin identidad ni secretos, 30 días, máximo 5.000 eventos/1 MiB; la escritura es best-effort. No se ha comprobado el archivo en una ejecución del paquete. |
| Interfaz | Login y recuperación exponen controles HTML nativos, nombres y estados; enrolamiento TOTP usa etiquetas, descripción, `one-time-code`, patrón de seis cifras y lectura manual del secreto. No se ha hecho recorrido real con lector de pantalla ni medición manual de contraste/foco/reflujo. |

## Correcciones realizadas en esta revisión

- Se puede reanudar el registro de passkey si el usuario cancela o falla el autenticador, sin volver a consumir el TOTP ni extender la cookie de recuperación.
- La UI consulta el estado de recuperación y muestra un formulario con nombre y código accesibles, en vez de pedirlos mediante diálogos del navegador.
- El enrolamiento TOTP permanece vigente tras un código erróneo hasta cinco intentos; al alcanzar el límite se debe iniciar un enrolamiento nuevo.
- El logger HTTP elimina los parámetros de query antes de escribir una URL; el callback OIDC ya no registra `code`/`state`. Se añadió el registro local acotado de eventos de autenticación.
- Se limita el número de enrolamientos pendientes y se valida el estado recuperado desde Credential Manager.
- Se corrigieron mensajes de interfaz y documentación que decían que WebAuthn seguía bloqueado después de OIDC.

## Pendiente / límites

1. Recorrido positivo y negativo con IdP OIDC real y Windows Hello, FIDO2 y una passkey sincronizada; comprobar cancelación, expiración y replay.
2. Recorrido con una app TOTP real, reloj fuera de ventana, código reutilizado, cinco fallos, bloqueo, reinicio y fallo/restauración de Credential Manager.
3. Verificar en ejecución que el token de recuperación no pasa las guardas de todas las rutas de proyectos, proveedores y generación; revisar expiración en cada endpoint.
4. Recorrido manual WCAG 2.0 AA con teclado y lector de pantalla, foco, errores, zoom/reflujo y contraste; las comprobaciones estáticas no bastan para declarar conformidad.
5. Recorrer el archivo de eventos en Windows y verificar retención/rotación y comportamiento ante disco no escribible. La configuración, recuperación, desvinculación y datos conservados están documentados en [`AUTH_OPERATIONS.md`](../AUTH_OPERATIONS.md).
6. Revisar el bundle de producción: Vite advierte que el chunk principal mide 502,37 kB minificados; no bloquea el build.

## Verificación ejecutada

- `npm run build`: correcto con Node 24.22.2.
- `git diff --check`: correcto.
- No se ejecutaron pruebas automatizadas ni pruebas dinámicas de autenticación.
