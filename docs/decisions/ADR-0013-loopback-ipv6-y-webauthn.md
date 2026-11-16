# ADR-0013: Origen localhost y escucha loopback IPv6

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Reemplaza:** la dirección de escucha y el host de navegador descritos en [ADR-0001](ADR-0001-web-servicio-local.md) y [ADR-0009](ADR-0009-sesion-local-segura.md)
- **Relacionado:** [ADR-0012](ADR-0012-identidad-oauth-mfa-passkeys.md)

## Contexto

La implementación de autenticación WebAuthn usa `localhost` como RP ID. WebAuthn no admite una dirección IP como RP ID, mientras que las ceremonias requieren que navegador y servicio compartan el origen esperado. El login OIDC vuelve a un callback IPv6 loopback en un puerto aleatorio. Las decisiones iniciales describían `127.0.0.1` tanto para la escucha como para navegar, lo que ya no coincide con el lanzador ni con el servicio.

## Decisión

- El lanzador abre la interfaz en `http://localhost:<puerto>` y las ceremonias WebAuthn validan ese origen exacto junto al RP ID `localhost`.
- El servicio escucha únicamente en `::1`. El callback OIDC utiliza `http://[::1]:<puerto>/api/session/oidc/callback`; la UI intercambia el estado temporal en el origen `localhost`.
- Se mantienen las validaciones exactas de `Host` y `Origin`, cookies `HttpOnly` y `SameSite=Strict`, y las guardas de sesión. No se habilita escucha en interfaces de red ni acceso desde otros dispositivos.
- El proveedor OIDC debe aceptar un cliente público y un callback IPv6 loopback con puerto variable; si no lo admite, no es compatible con este flujo.

## Alternativas

- **Mantener `127.0.0.1` como origen:** no permite usar ese literal como RP ID WebAuthn.
- **Escuchar en todas las interfaces o en una dirección dual-stack:** ampliaría la superficie de acceso y no es necesario para la aplicación local.
- **Usar un puerto fijo/HTTPS para salvar incompatibilidades del proveedor:** añade configuración y certificados locales; queda fuera del alcance actual.

## Consecuencias

El navegador debe resolver `localhost` a `::1` en el equipo y el servicio requiere loopback IPv6 disponible. La instalación y la guía OIDC deben conservar el puerto dinámico y callback IPv6. La interoperabilidad depende del IdP; se mantiene pendiente el recorrido con uno real. Esta decisión corrige el contrato de loopback sin ampliar el límite de seguridad local.
