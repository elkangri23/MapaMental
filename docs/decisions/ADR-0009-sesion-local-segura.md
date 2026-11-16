# ADR-0009: Sesión local de un solo uso y API restringida al origen propio

- **Estado:** Reemplazado parcialmente por [ADR-0013](ADR-0013-loopback-ipv6-y-webauthn.md) en la dirección de loopback y el origen de navegador
- **Fecha:** 2026-11-14

## Contexto

Un servicio en loopback puede recibir peticiones de páginas web abiertas en el mismo navegador. Restringirlo a loopback evita acceso desde la red, pero por sí solo no impide ataques desde un origen web ajeno ni protege las rutas que modifican proyectos. La dirección y el origen concretos se actualizaron para WebAuthn en ADR-0013.

## Decisión

El servicio valida estrictamente `Host` y `Origin` contra el origen de la aplicación y no habilita CORS abierto. Al arrancar genera un nonce aleatorio de un solo uso; el lanzador entrega la página local con el nonce en el fragmento de URL, que no se envía en la petición HTTP. La UI lo intercambia por una cookie de sesión `HttpOnly`, `SameSite=Strict` y limitada a loopback. El nonce se invalida tras el primer intercambio. Las rutas que leen o cambian datos requieren sesión; las rutas mutables también validan el origen y un tipo de contenido JSON esperado. La UI no guardará el nonce ni la cookie en almacenamiento accesible por JavaScript. La escucha en `::1` y el origen `localhost` están fijados en ADR-0013.

## Alternativas

- **Confiar solo en loopback y CORS:** fácil de desplegar, pero CORS no protege todas las peticiones y no autentica llamadas simples a la API.
- **Token permanente en `localStorage`:** sencillo para una SPA, pero expuesto a scripts del mismo origen y reutilizable tras una filtración.
- **Servicio Windows compartido:** facilita inicio automático para varias cuentas, pero complica el aislamiento de secretos y proyectos personales; no se usará en v1.

## Consecuencias

El servicio conserva el nonce solo en memoria y lo invalida al intercambiarlo. En desarrollo, Vite añade el origen esperado cuando una petición same-origin no trae `Origin`; si llega un origen distinto, lo conserva para que el servicio lo rechace. En producción, cuando un `GET` same-origin no incluye `Origin`, se exige `Sec-Fetch-Site: same-origin` y un encabezado privado enviado por la UI; las mutaciones usan JSON y el navegador incluye `Origin`. El endpoint bootstrap solo existe fuera de producción y solo para el origen/host configurados. `scripts/start-local.ps1` crea el nonce, lo pasa al proceso mediante `ESPACIO_VISUAL_SESSION_NONCE` y abre la UI con el nonce en el fragmento. La sesión autoriza a la cuenta Windows que ya ejecuta el proceso; no sustituye los permisos del sistema de archivos. El intercambio/session se implementó, pero falta recorrerlo y confirmar comportamiento de proxy/cookie en navegador.
