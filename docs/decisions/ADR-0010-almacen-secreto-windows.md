# ADR-0010: Guardar credenciales en Windows Credential Manager

- **Estado:** Aceptado
- **Fecha:** 2026-11-15

## Contexto

Los perfiles de proveedor necesitan claves API, pero el JSON del proyecto y la configuración legible de la aplicación no deben contenerlas. El servicio local ya es el límite de confianza que habla con los proveedores.

## Decisión

Guardar cada clave en el almacén de credenciales del usuario actual de Windows usando `@napi-rs/keyring`, con el servicio `EspacioVisual` y una cuenta por ID de perfil. Mantener en `%APPDATA%\EspacioVisual\providers.json` solo el tipo, nombre, URL base, modelo, proveedor activo e IDs. La UI y la API reciben únicamente un indicador de que existe una clave. Al borrar un perfil, borrar también la entrada de Credential Manager.

## Alternativas

- **Clave en JSON cifrado con DPAPI:** exige mantener el formato cifrado, ACL, rotación y manejo de fallos; no es necesario si Windows ya ofrece Credential Manager.
- **Variable de entorno:** útil en automatización, pero incómoda para el flujo normal de la app y fácil de heredar a procesos secundarios.
- **`keytar`:** interfaz conocida, pero el repositorio original quedó archivado; se elige una binding N-API mantenida y con binarios precompilados.

## Consecuencias

Las credenciales quedan ligadas al usuario Windows y fuera de los backups de proyecto. No se exportarán con el proyecto. Reinstalar la app no elimina el almacén de credenciales; borrar el perfil sí elimina su secreto. La lectura de la credencial ocurre en el servicio justo antes de hacer la comprobación o petición al proveedor. Si el almacén no está disponible, se informa el error y no se escribe un fallback en texto plano.

El primer recorrido verificó el guardado, lectura indirecta (`credentialConfigured`), ausencia de la clave en el JSON y borrado de un perfil temporal. Falta comprobarlo en el instalador final y el comportamiento de recuperación del almacén.
