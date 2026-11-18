# Seguimiento de implementación de autenticación

**Fecha:** 2026-11-18  
**Estado:** cambios de código compilados; T-021 y T-023–T-026 siguen parciales  
**Alcance:** gestión de passkeys, lectura/baja de TOTP, comprobación de autorización y build de producción.

## Cambios

- La lectura de la credencial TOTP ahora distingue entre ausencia de credencial, datos dañados y errores del almacén. Los errores de Credential Manager se propagan al manejador de errores genérico; ya no se convierten en «TOTP desactivado».
- La desactivación de TOTP deja de ocultar excepciones de Windows Credential Manager. `deletePassword()` informa ausencia con `false` y lanza un error cuando no puede borrar una credencial existente; la ruta devuelve error genérico en ese caso.
- Renombrar y revocar una passkey revalidan en la mutación serializada la sesión protegida, la identidad de la sesión y una verificación WebAuthn de menos de cinco minutos. Esto cubre expiración o revocación ocurrida mientras la operación esperaba su turno de escritura.
- La UI cambia las operaciones de añadir, renombrar y revocar passkeys y desactivar TOTP desde `window.prompt()`/`window.confirm()` a formularios confirmables dentro de la página, con etiquetas, foco en el campo de entrada, cancelación y aviso del efecto de revocación. No se ha validado todavía con lector de pantalla.

## Verificación

- `npm run build`: correcto para dominio, servidor y cliente.
- `git diff --check`: correcto.
- No se ejecutaron pruebas automatizadas ni recorridos de autenticación. La compilación no prueba interoperabilidad OIDC ni un autenticador real.

## Pendiente

- Probar OIDC con un IdP compatible configurado (cliente público, PKCE S256 y callback loopback `[::1]` con puerto dinámico).
- Recorrer Windows Hello, llave FIDO2 y una passkey sincronizada; comprobar cancelación, challenge, origen y replay.
- Probar TOTP con una app real, ventana de reloj, anti-replay, bloqueo tras cinco fallos, reinicio y errores/restauración de Credential Manager.
- Verificar con teclado y lector de pantalla las pantallas de login, passkey, renombrado/revocación, enrolamiento y recuperación; completar revisión manual WCAG aplicable.
- Ejecutar recorridos negativos de extremo a extremo de la sesión de recuperación y las rutas de proyectos/proveedores/IA; comprobar el registro y su retención bajo errores de disco.

No se declara completado M5, conformidad WCAG ni auditoría formal de seguridad.
