# ADR-0001: Web local con servicio loopback

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto

La app necesita conectarse a modelos locales, guardar carpetas de proyecto, mantener copias y proteger claves. El producto solicitado sigue siendo una experiencia web personal.

## Decisión

Separar UI web y servicio local. El proceso se ejecutará bajo la cuenta Windows interactiva que lo inició; el navegador se conectará a `127.0.0.1`, y el servicio realizará operaciones de archivos y llamadas a proveedores. Solo aceptará el host/origen de la aplicación y usará la sesión de un solo uso descrita en [ADR-0009](ADR-0009-sesion-local-segura.md). El instalador abrirá la UI en el navegador.

## Alternativas

- Solo navegador: evita un proceso, pero dificulta gestionar copias, archivos y secretos.
- App de escritorio: da acceso local, pero cambia el formato solicitado y añade una shell nativa.

## Consecuencias

Hay que iniciar/detener el servicio y mantener validaciones de host, origen y sesión. Las claves protegidas por cuenta Windows no se comparten con otros usuarios del equipo. El proyecto puede seguir usando el navegador y modelos locales.

