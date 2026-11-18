# Informe de autenticación: OAuth/OIDC, MFA y passkeys

**Estado (2026-11-18):** ADR-0012 aceptado; T-018/T-019/T-020/T-022 cerradas; T-021/T-023/T-024/T-025 parciales. La lectura y baja de TOTP fallan de forma cerrada ante errores del llavero; la gestión de passkeys revalida sesión/UV al escribir y usa formularios en página. OIDC, WebAuthn y recuperación TOTP no se han recorrido con IdP, app autenticadora ni autenticadores reales. No considerar M5 operativo todavía. Seguimiento: [`informe del 2026-11-18`](reviews/2026-11-18-auth-mfa-follow-up.md).

## Resumen ejecutivo

La aplicación actual es personal y local. Un único proceso de Windows sirve la UI y API en loopback; un nonce de un solo uso establece una sesión de navegador en memoria. No hay cuentas multiusuario, base de datos de identidad ni permisos por proyecto; la configuración local conserva como máximo una identidad `(iss, sub)`. En ese modelo, OAuth no añade por sí solo una barrera útil y MFA no sustituye la protección de la cuenta Windows ni el acceso físico al equipo.

La ampliación preserva el modo local sin login y añade un **modo protegido opcional** para una persona y solo en loopback. La aplicación no se expondrá por red ni añadirá cuentas multiusuario o sincronización en nube en esta ampliación.

El contrato técnico aprobado para el modo protegido es:

1. Usar **OpenID Connect (OIDC)** encima de OAuth 2.0 para iniciar sesión. OAuth 2.0 por sí solo delega autorización; no define una identidad de usuario.
2. Usar Authorization Code con PKCE `S256`, navegador externo, `state`, `nonce` y validación estricta del emisor y del ID Token. No implementar Implicit Grant ni Resource Owner Password Credentials.
3. Usar OIDC como primer factor de identidad y exigir después una passkey WebAuthn administrada por la app, con verificación de usuario (`UV`), antes de emitir sesión protegida. TOTP queda como alternativa de recuperación opcional y no como downgrade automático.
4. El origen compatible, el ciclo de vida de sesión y almacenamiento de identidad quedaron definidos en ADR-0012; la implementación y recuperación se cierran por fases.

## Situación actual y alcance

### Lo que existe

- El servicio Fastify escucha solo en `::1`; el lanzador abre la UI mediante `localhost` y la app se ejecuta bajo la cuenta Windows interactiva.
- El lanzador crea un nonce de inicio de un solo uso; el cliente lo intercambia por una cookie de sesión `HttpOnly`/`SameSite=Strict`.
- Las sesiones están en memoria, duran hasta 12 horas y desaparecen al reiniciar el proceso.
- No hay cuentas de aplicación, roles, usuarios, registro de proveedores de identidad ni mecanismos para asociar una identidad con proyectos.
- Los proyectos locales no tienen `ownerId`; se aíslan por carpeta y por usuario del sistema operativo.

La línea de base existente está en [`SECURITY.md`](SECURITY.md), [`ADR-0009`](decisions/ADR-0009-sesion-local-segura.md) y [`COMPLIANCE.md`](COMPLIANCE.md).

### Alcance definido para esta planificación — T-018

De acuerdo con el objetivo expresado para el proyecto —uso personal, proveedores LLM locales y configuración en el propio equipo— el modo objetivo se limita a **una persona Windows y acceso loopback**. Esta ampliación no habilitará escucha por red, cuentas multiusuario ni sincronización en nube. El modo local sin autenticación seguirá disponible para conservar el uso sin IdP y sin conexión.

Se planifica un modo protegido opcional para autenticar el acceso a la UI/API local. Este límite protege el uso de la app; no cifra los proyectos ni sustituye permisos de Windows. Las decisiones de IdP configurable, WebAuthn administrado por la app, MFA y recuperación están fijadas en ADR-0012; T-021 y T-023–T-025 tienen implementación parcial y los recorridos de aceptación siguen pendientes.

### Detalles de implementación pendientes

- **Interoperabilidad OIDC:** la app aceptará issuer configurable; la biblioteca `openid-client` ya está integrada; falta recorrer discovery/JWKS y confirmar que el IdP admite cliente público y callback IPv6 loopback de puerto variable.
- **MFA:** T-022 define la matriz; T-024 implementa parcialmente la verificación WebAuthn con `UV`. Los claims `acr`/`amr` del IdP no sustituyen la passkey.
- **RP ID/origen:** el RP ID es `localhost`; el lanzador usa ese host para WebAuthn y el servidor valida origen completo (incluido puerto), RP ID y challenge. Está implementado parcialmente; falta recorrerlo en Windows y navegadores objetivo.
- **Recuperación:** T-023 implementa parcialmente enrolamiento TOTP autenticado y una recuperación tras OIDC que solo permite registrar una passkey nueva y revocar las anteriores; falta recorrido de extremo a extremo y verificación negativa.
- **Datos locales:** issuer/client ID e identidad vinculada no son secretos y se guardan en el perfil local; claves WebAuthn privadas permanecen en el autenticador. El secreto TOTP y el estado de anti-replay/bloqueo se guardan mediante `@napi-rs/keyring` en Windows Credential Manager, fuera de `auth.json`, proyectos y backups de proyectos.

T-018/T-019/T-020/T-022 están cerradas. T-021/T-023/T-024/T-025 están parciales. ADR-0012 fija OIDC configurable con cliente público, identidad por `(iss, sub)`, passkey WebAuthn propia como segundo paso, TOTP opcional solo para recuperación y RP ID `localhost`. El emisor y client ID se configuran manualmente; no se elige ni instala un proveedor específico. El alta inicial vincula explícitamente una única identidad OIDC desde el flujo local de confianza y bloquea cualquier auto-registro posterior.

**Estado de implementación (2026-11-16):** T-021 parcial. Se integró `openid-client` 6.8.8 con discovery, cliente público, Authorization Code + PKCE S256, state/nonce de un solo uso, callback en el literal loopback `[::1]` y comprobación de issuer/subject tras la validación del ID Token por la biblioteca. El callback entrega el estado MFA de un solo uso como fragmento al origen UI `localhost`; la app lo retira del historial y lo canjea por cookie host-only en ese mismo origen. Las peticiones OIDC comparten el egress seguro con DNS/IP fijados. Ajustes inicia la vinculación; en modo protegido se inicia login y la respuesta válida deja un estado temporal de cinco minutos para el paso WebAuthn. OIDC por sí solo no crea sesión protegida. Solo se ha validado el build; falta configurar un IdP y recorrer casos positivos/negativos. Hay que confirmar que el IdP acepta el callback IPv6 loopback con puerto variable.

## Vocabulario y enfoque

| Concepto | Función | Qué no significa |
|---|---|---|
| OAuth 2.0 | Delegar autorización para que un cliente obtenga acceso limitado | No es, por sí solo, un protocolo de login ni garantiza MFA |
| OpenID Connect | Capa de identidad sobre OAuth 2.0; entrega un ID Token validable | No convierte cualquier claim de MFA en una garantía universal |
| MFA | Verificar factores distintos según una política definida | Pedir dos pasos en pantalla no demuestra que sean factores independientes |
| WebAuthn/passkey | Credencial de clave pública vinculada al RP ID; puede habilitar login resistente al phishing | No todas las passkeys demuestran la misma garantía ni la app controla las passkeys administradas por un IdP |
| TOTP | Código temporal de una aplicación autenticadora | Es susceptible a phishing y replay si se implementa mal; no equivale a una passkey |

## Arquitectura propuesta por etapas

### 1. Conservar la sesión local como modo separado

El nonce de lanzamiento existente seguirá protegiendo el arranque del modo local. No se convertirá en un token de cuenta, ni se persistirá en `localStorage`. El modo protegido utilizará su propio flujo de autenticación y sesión. El código de sesión deberá distinguir explícitamente ambos modos, y las rutas no podrán aceptar una sesión más débil para una operación protegida.

Para el modo protegido local, el RP ID será `localhost`; el lanzador navegará a través de `localhost` aunque el servicio escuche solo en loopback. El puerto puede variar porque no forma parte del RP ID, pero el servicio comprobará el origen exacto (esquema, host y puerto) de cada ceremonia contra el origen local activo. W3C admite `http://localhost` como origen de desarrollo, pero exige validar el origen en cada ceremonia. El acceso remoto queda fuera del alcance de M5.

### 2. Identidad federada con OIDC

- El navegador del sistema realizará la autenticación en el IdP; no se pedirá la contraseña del IdP dentro de Espacio Visual.
- Authorization Code + PKCE `S256`; `state` aleatorio ligado a la transacción, `nonce` de OIDC, URI de redirección exacta y de un solo uso.
- Para cliente nativo/local, aplicar el patrón de navegador externo y callback loopback permitido por RFC 8252, sujeto a soporte/registro del IdP. El despliegue remoto y callbacks HTTPS quedan fuera del alcance de M5.
- Usar discovery/JWKS del emisor configurado. Validar firma y algoritmo permitido, `iss`, `sub`, `aud`, `exp`, `iat`, `nonce`, `azp` cuando corresponda y restricciones de tenant/issuer.
- La identidad local se enlazará por pareja estable `(iss, sub)`, nunca por email solamente. No se enlazarán cuentas automáticamente por coincidencia de correo.
- No guardar access/refresh/ID tokens en `localStorage`, en proyectos, logs o parámetros de URL. Reducir scopes y retener tokens solo si una operación los necesita.
- Aplicar cookie `HttpOnly`, `SameSite` adecuada al callback local, expiración, rotación, CSRF y cierre de sesión/revocación; validar el origen exacto del callback.

### 3. MFA y autenticadores

El modo protegido exige dos pasos encadenados: una identidad OIDC permitida y una passkey propia con `UV` requerido. La cuenta se vincula por `(iss, sub)`; email no basta. Los claims `acr`/`amr` del proveedor no sustituyen la passkey local. La app no declarará certificación o nivel NIST por este flujo; registrará únicamente que completó OIDC y WebAuthn.

**MFA propio, solo si hace falta:** TOTP como factor de respaldo para un modo de cuenta local, con enrolamiento iniciado desde sesión autenticada y confirmación del primer código. Los secretos se cifrarán con almacenamiento ligado al sistema operativo/servicio; nunca se guardarán en claro ni en el JSON de proyecto. La verificación aplicará límite de intentos, ventana acotada, tolerancia de reloj y prevención de reutilización del mismo código.

**T-023 parcial (2026-11-16):** se aplica RFC 6238 con HMAC-SHA1, secreto aleatorio de 160 bits, 6 dígitos y pasos de 30 segundos; se acepta ±1 paso para tolerancia de reloj. Un código válido solo puede consumirse una vez; el último paso aceptado, secreto y bloqueo se guardan como una entrada protegida por Windows Credential Manager. Cinco fallos bloquean los intentos durante 15 minutos. El enrolamiento requiere sesión protegida y reautenticación WebAuthn; se confirma con el primer código. Para recuperar: OIDC válido + TOTP válido emite cookie HttpOnly de cinco minutos que solo autoriza registrar una passkey. Al completar ese registro se revocan las passkeys anteriores y se invalidan sesiones protegidas. El token de recuperación no es aceptado por las rutas de proyectos, proveedor o IA. Falta validar con app autenticadora real, revisar los casos de restauración/fallo del almacén y recorrer los casos de expiración, intentos/replay y accesibilidad. El algoritmo sigue la especificación [RFC 6238](https://www.rfc-editor.org/rfc/rfc6238).

No se usará SMS como método principal. Los códigos de recuperación serán aleatorios, de un solo uso, se mostrarán una sola vez y se almacenarán como hashes. Cambiar o quitar un segundo factor requerirá reautenticación fuerte y avisará al usuario.

#### Matriz de decisión MFA (T-022)

| Estado/operación | Permitido | Rechazado |
|---|---|---|
| Modo local existente | Continuar con nonce local sin IdP ni passkey | Presentarlo como autenticación MFA o como sesión protegida |
| Alta inicial protegida | OIDC del issuer configurado; enlazar una sola vez `(iss, sub)` desde sesión local | Enlace por email, auto-registro, issuer distinto o segundo propietario |
| Abrir modo protegido | OIDC válido seguido de passkey propia con `UV`; solo entonces emitir sesión protegida | OIDC por sí solo, `acr`/`amr` del IdP, passkey sin `UV`, nonce local, TOTP como downgrade silencioso |
| Primera passkey | Sesión local confiable más identidad OIDC ya vinculada; se permite una credencial de bootstrap | Crear más credenciales por el endpoint inicial |
| Añadir, quitar o renombrar passkey | Reautenticación WebAuthn con `UV` realizada en los últimos 5 minutos | Cambios basados solo en sesión OIDC o en una sesión protegida antigua |
| Recuperación | OIDC + TOTP explícito para emitir una sesión de cinco minutos que solo registra una passkey nueva y revoca las anteriores | Respaldo automático a TOTP, acceso a proyectos/IA con TOTP o soporte que evada el segundo factor |
| Cierre de sesión | Revocar sesión actual y limpiar cookie de ese modo | Tratar el logout local como revocación de sesión protegida distinta |

La ventana de cinco minutos es el máximo de antigüedad para la verificación WebAuthn que autoriza cambios de autenticadores; challenges individuales seguirán teniendo expiración menor y uso único. La primera credencial es una excepción de bootstrap que requiere sesión local y enlace OIDC; las altas adicionales requieren una verificación WebAuthn reciente, implementada parcialmente en T-025.

### 4. Passkeys/WebAuthn

- Usar WebAuthn estándar desde navegador seguro; no implementar criptografía ni protocolo FIDO propios.
- Establecer RP ID, nombre visible y lista exacta de orígenes. Rechazar un `origin`, `rpIdHash`, challenge, tipo de operación o firma que no coincida.
- Challenges impredecibles, de un solo uso, con expiración corta y ligados a sesión/operación/usuario.
- Comprobar flags de presencia y, cuando la política MFA lo requiera, verificación de usuario (`UV`). No afirmar “MFA” automáticamente para cualquier passkey sin evaluar el autenticador y el perfil de assurance.
- Guardar identificador de credencial, clave pública, usuario propietario y metadatos mínimos de transporte/backup; nunca guardar la clave privada. No depender exclusivamente de un contador de firma para passkeys sincronizadas.
- Permitir más de una credencial por usuario, poner nombre a cada una, consultar último uso y revocar una credencial. Evitar exigir attestation de fabricante salvo una necesidad concreta.
- Probar sincronización entre dispositivos, Windows Hello, llave FIDO2, cancelación del navegador, credencial no reconocida y credencial perdida.

**T-024/T-025 parciales:** se añadieron `@simplewebauthn/server` 14.1 y `@simplewebauthn/browser` 14.0. El alta inicial está disponible desde Ajustes tras vincular OIDC, bajo sesión local; se usa attestation `none`, UV requerido y se guarda clave pública, contador, transportes y metadatos mínimos en `auth.json`. En modo protegido, tras OIDC se muestran las opciones de passkey; una verificación válida crea la sesión protegida y consume el estado temporal. El servicio escucha en `::1`, el lanzador usa `http://localhost:<puerto>` para RP ID `localhost`, y el callback OIDC usa `[::1]` como literal loopback. Solo se comprobó el build; no se ha probado un autenticador real ni el callback/flujo completo. T-025 añade varias credenciales, listado de nombre/uso, renombrado y revocación con reautenticación `UV` reciente; no deja revocar la última passkey e invalida sesiones protegidas al revocar. La recuperación TOTP ahora puede registrar una passkey mediante un token de alcance exclusivo y corta duración. Faltan recorridos reales y revisión de borde del flujo.

### 5. Recuperación y operación

La autenticación queda tan protegida como su recuperación. Antes de cerrar M5 deben recorrerse: recuperación cuando se pierde el último autenticador, bloqueo, cambio de IdP, baja de usuario, revocación de sesiones, fallo/copia/restauración del almacén de credenciales y respuesta ante compromiso. La recuperación no rebaja silenciosamente MFA ni permite acceso general con una sesión de recuperación.

Se escriben eventos mínimos de seguridad en `%LOCALAPPDATA%\EspacioVisual\security-events.jsonl`: inicio del servicio, OIDC (vínculo/login), passkey (login, reautenticación, alta, renombrado, revocación), TOTP (alta, recuperación, baja) y logout. Cada línea contiene solo hora UTC, tipo, resultado e identificador de petición saneado; no incluye issuer/subject, tokens/códigos, IDs de passkey, biometría ni datos de proyectos. Un evento `oidc.login` solo indica que se completó el primer factor; el login protegido se completa con el evento de passkey correspondiente. Se depuran eventos con más de 30 días, máximo 5.000 registros y 1 MiB; la escritura es best-effort y no bloquea el acceso si el archivo falla. El logger HTTP elimina la query completa, incluidos `code` y `state` del callback OIDC. El archivo permanece bajo el perfil del usuario Windows y se elimina solo al retirar manualmente ese archivo o los datos locales.

## Fases y tareas

Las tareas T-018–T-026 están en [`TASKS.md`](TASKS.md). T-018/T-019/T-020/T-022 están cerradas; T-021/T-023/T-024/T-025 y T-026 están parciales. La guía de configuración, recuperación y desvinculación está en [`AUTH_OPERATIONS.md`](AUTH_OPERATIONS.md). Hay formularios accesibles en estructura para enrolamiento TOTP y recuperación, pero falta validación manual con teclado/lector de pantalla/contraste. Ver [`reviews/2026-11-16-auth-mfa-audit.md`](reviews/2026-11-16-auth-mfa-audit.md). El siguiente bloque es recorrer OIDC + TOTP + alta de una passkey real y verificar que la sesión temporal no alcanza rutas protegidas.

## Criterios de salida globales

- El usuario puede continuar usando el modo personal local sin IdP ni conexión a Internet; el modo protegido es opcional y no reemplaza el comportamiento actual.
- Los flujos OIDC y WebAuthn usan bibliotecas mantenidas y estándares; revisión de dependencias y threat model actualizados.
- No hay cuenta enlazada solo por email; tokens/challenges/CSRF/sesiones tienen pruebas positivas y negativas.
- MFA se exige según política verificable, con recuperación probada y sin SMS por defecto.
- Passkeys se registran, autentican, renombran y revocan desde orígenes admitidos; no se almacenan secretos privados en servidor.
- En modo protegido, ninguna ruta sensible responde sin sesión que haya completado OIDC y WebAuthn; los proyectos siguen siendo locales a la única cuenta Windows.
- Se recorren teclado y lector de pantalla en login, MFA, alta de passkey, recuperación y errores; WCAG aplicable se revisa sin declarar conformidad por una prueba automática aislada.
- La documentación describe el IdP y despliegue realmente probados, incluidos recuperación, cierre de sesión y eliminación de cuenta.

## Fuentes normativas consultadas

- [RFC 9700 — OAuth 2.0 Security Best Current Practice](https://www.rfc-editor.org/rfc/rfc9700.html), publicada en enero de 2025.
- [RFC 8252 — OAuth 2.0 for Native Apps](https://www.rfc-editor.org/rfc/rfc8252.html), patrón de navegador externo y redirecciones loopback para apps nativas.
- [OpenID Connect Core 1.0, errata set 2](https://openid.net/specs/openid-connect-core-1_0.html), autenticación e ID Token.
- [W3C Web Authentication Level 3](https://www.w3.org/TR/webauthn-3/), Recommendation publicada el 25 de agosto de 2026. Define el RP ID y la validación del origen; localhost HTTP se admite como caso especial de desarrollo, los puertos no forman parte del RP ID pero sí del origen que debe validar la app.
- [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html), guía de autenticadores y niveles de garantía; se usa como referencia técnica, no como afirmación de cumplimiento normativo del producto.
