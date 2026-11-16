# ADR-0012: Identidad federada, MFA y passkeys como modo protegido opcional

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Relacionados:** [ADR-0001](ADR-0001-web-servicio-local.md), [ADR-0006](ADR-0006-adaptadores-y-credenciales.md), [ADR-0009](ADR-0009-sesion-local-segura.md), [ADR-0013](ADR-0013-loopback-ipv6-y-webauthn.md), [informe de autenticación](../AUTH_OAUTH_MFA_PASSKEYS.md)

## Contexto

La app actual es personal y local, se sirve desde loopback y no tiene cuentas, roles ni una base de datos multiusuario. ADR-0009 protege el canal local mediante nonce de un solo uso y sesión de navegador. OAuth, MFA y passkeys pretenden ampliar el modelo de identidad y pueden exigir un origen estable, IdP, almacenamiento de cuentas y recuperación. Aplicarlos sobre la sesión actual sin definir el objetivo crearía una falsa sensación de autenticación.

OAuth 2.0 es autorización; para inicio de sesión federado se necesita una capa de identidad como OpenID Connect. MFA y passkeys pueden ser administrados por el IdP o por la aplicación, con responsabilidades y garantías diferentes.

## Decisión

1. Mantener el modo local sin cuentas como ruta predeterminada.
2. El modo protegido usará un proveedor OIDC configurable, sin dependencia de una marca. El usuario aportará issuer y client ID de un cliente público; no se solicitará client secret ni se almacenará una contraseña del proveedor.
3. El login usará Authorization Code + PKCE `S256`, navegador externo, callback loopback, `state` y `nonce` de un solo uso, y validación completa del ID Token. La identidad se vincula por `(iss, sub)`, no por email.
4. La sesión protegida exigirá login OIDC y una passkey WebAuthn propia con verificación de usuario (`UV`) como segundo paso. Los secretos privados permanecen en el autenticador; el servicio solo guarda claves públicas y metadatos mínimos. La app no afirmará certificación ni nivel NIST por usar passkeys.
5. TOTP podrá añadirse como método de respaldo solo tras T-023, con secreto protegido por Windows y recuperación explícita. No se aceptará degradación automática de MFA ni SMS como fallback.
6. Limitar esta ampliación a una persona Windows y acceso loopback. No habilitar escucha de red, acceso multiusuario ni sincronización en nube dentro de M5.
7. Mantener intacto el modo local actual sin login. El modo protegido es opcional y depende de Internet para OIDC; una sesión protegida nunca se degrada silenciosamente al modo local.

## Alternativas

- **Delegar toda MFA/passkey al IdP:** reduce código propio, pero hace que las funciones dependan de cada proveedor y no permite administrar passkeys desde la app.
- **Construir contraseñas propias:** aumenta el riesgo y la carga de recuperación; se rechaza.
- **Aceptar cualquier OAuth provider/token:** no aporta identidad verificable y deja ambigüedad de issuer, audiencia, MFA y linking; se rechaza.
- **Hacer passkeys locales sin preparar RP/origin:** puede impedir la creación o reutilización de credenciales; se rechaza hasta fijar el origen y probar navegadores/Windows Hello.

## Consecuencias

- T-018 y T-019 quedan cerradas; T-020–T-026 implementan esta decisión por etapas.
- WebAuthn usará RP ID `localhost`. El puerto loopback puede variar, pero el servicio comprobará el origen exacto de la ceremonia contra el origen local activo. El lanzador debe navegar por `localhost`, no por `127.0.0.1`, para las ceremonias WebAuthn.
- Federar identidad no sincroniza proyectos ni concede acceso a ellos; multiusuario requiere aislamiento y autorización propios.
- La política de MFA exige completar OIDC y después una ceremonia WebAuthn con `UV`; los claims `acr`/`amr` del IdP no sustituyen el segundo paso.
- La pérdida de passkeys/TOTP debe tener un camino de recuperación con garantía equivalente, revocación y auditoría mínima.

## Estado

Esta decisión fija el contrato para la implementación. No habilita exposición por red ni instalación automática de un IdP; la configuración del issuer corresponde al usuario.
