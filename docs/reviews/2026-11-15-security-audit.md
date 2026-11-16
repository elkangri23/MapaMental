# Auditoría de seguridad y estado del proyecto

## Actualización: auditoría solicitada de código, seguridad e interfaz — 2026-11-15

Se revisaron estáticamente sesión, rutas de proveedores, protección de secretos, validación de URL y controles principales del mapa/chat. Se detectó riesgo de actualización perdida porque crear/editar/eliminar/activar perfiles compartían un JSON con operaciones de lectura-modificación-escritura concurrentes. Se añadió una cola serializada para esas mutaciones. Se recompiló el proyecto y `npm audit --omit=dev` volvió a informar cero vulnerabilidades. No se hizo pentest ni simulación dinámica concurrente en esta actualización; los riesgos residuales y la matriz de cobertura permanecen abiertos.

**Fecha:** 2026-11-15  
**Alcance:** lectura de diseño y código, cambios correctivos en los controles de servidor, build y auditoría de dependencias de producción. No es un pentest ni una certificación OWASP.

## Resumen de estado

El producto tiene una base funcional: proyectos JSON locales con autosave, copias y restauración; mapas editables; perfiles para OpenAI, Anthropic, Ollama, LM Studio y compatibles; chat con contexto seleccionado; sugerencias y propuestas que requieren revisión antes de aplicarse; historial de deshacer. Existe documentación de arquitectura, seguridad, proveedores, instalación, cumplimiento, ADR y backlog.

Siguen pendientes las diapositivas y exportación, historial conversacional persistente, progreso/streaming, presupuesto de coste, instalador/actualización/desinstalación, recorridos con proveedores reales, cierre del registro documental y revisión manual de accesibilidad. Ver [`TASKS.md`](../TASKS.md) para la lista autorizada de estados.

## Hallazgos y cambios

| Prioridad | Hallazgo | Cambio aplicado | Estado |
|---|---|---|---|
| Alta | La comprobación DNS y la conexión podían resolver un nombre en momentos distintos (SSRF por rebinding). | Se resuelve cada destino y se fija la función `lookup` del socket a la lista comprobada mediante Undici; redirecciones rechazadas. | Corregido en código; falta recorrido Windows con redes/providers representativos. |
| Alta | Perfiles en disco solo tenían validación parcial y podían contener campos/url/modelo manipulados. | El archivo se limita a 256 KiB/50 perfiles; cada perfil se valida al leer, incluyendo URL segura, ID, tipo y longitudes; activo debe referenciar perfil válido. | Corregido. |
| Alta | El schema del proyecto dejaba listas/valores sin acotar y aceptaba posiciones no razonables. | Límites de ID, etiquetas, tonos, posiciones, aristas, diapositivas, conversación, sugerencias, undo y colecciones. | Corregido; el contenido de diapositivas se limita de forma estructural hasta completar su esquema de producto. |
| Media | Errores inesperados podían usar respuestas por defecto con mensajes internos y logs amplios. | Handler común devuelve texto genérico para 5xx y registra solo reqId/código/nombre. | Corregido; se deben recorrer errores de disco y red para confirmar UX. |
| Media | Aplicar propuestas no rechazaba IDs duplicados entre las ideas recibidas. | Se valida unicidad entre ideas y contra el mapa actual. | Corregido. |
| Media | Límites de carga de servidor/config no bastaban para reducir consumo accidental. | Cuerpo 8 MiB, timeout/connection timeout, límites de respuestas HTTP, tamaño de perfil/config y timeout de proveedor. | Parcial; no existe límite de peticiones/minuto ni presupuesto monetario configurado. |
| Media | La actualización del cliente HTTP añadía dependencia con avisos de seguridad activos. | Se fijó `undici` actualizado (`^7.30.1`). | `npm audit --omit=dev`: cero vulnerabilidades en la comprobación del 2026-11-15. |

### Revisión de rango IPv6 — 2026-11-16

WHATWG normaliza `2001:0::1` a `2001::1`, evitando la comprobación textual previa de `2001:0:`. La validación ahora obtiene los dos primeros hextetos y bloquea `2001::/23` y `3fff::/20`, además de los rangos previamente excluidos. IANA clasifica ambos como direcciones especiales no globalmente alcanzables; se bloquean completos por política de destinos de proveedores. Fuente primaria: [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry).

El validador real de perfiles rechazó nueve direcciones especiales, incluidos `2001:0::1` y los extremos de `3fff::/20`; dos bordes fuera de esos prefijos y una IPv6 pública se permitieron. Se usó `APPDATA` aislado, sin credenciales ni conexión al proveedor, y se retiró la configuración temporal. La corrección compiló con Node 24.22.2 y `npm audit --omit=dev` informó cero vulnerabilidades. No se completó en esta revisión la matriz exhaustiva de DNS, TLS/SNI y conexiones Windows; el hallazgo corregido no cierra T-015.

## Comprobaciones ejecutadas

- `npm run build` con Node 24.22.2: dominio, servicio y web compilan correctamente.
- `npm audit --omit=dev`: 0 vulnerabilidades en dependencias de producción.
- Inspección del flujo de sesión, autorizaciones, rutas de proveedor/proyecto/IA, persistencia, validación compartida y logs.
- En un servidor de desarrollo con sesión temporal, ocho peticiones malformadas a creación de proyecto, proveedor, proveedor activo, lectura de proyecto con UUID inválido y las cuatro rutas IA devolvieron HTTP 400; no se enviaron prompts. Se eliminó el proyecto vacío temporal que se había creado al probar `{}` en una primera iteración.
- Petición HTTPS aislada de conectividad: llegó al proxy/política de red del entorno y recibió 403, por lo que no se considera verificación del proveedor ni del flujo funcional.
- No se ejecutó una suite automatizada ni se probaron credenciales reales o proveedor local real en este ciclo.

## Riesgos residuales / siguiente trabajo

1. Completar recorridos negativos por todas las rutas: sin cookie, origen/host incorrectos, tamaño de cuerpo, manipulación ID/path y errores de almacenamiento. La comprobación actual cubre solo cuerpos/formas malformadas e ID inválido en las rutas enumeradas.
2. Revisar clasificación completa de direcciones IPv4/IPv6 especiales, nombres internacionales/trailing dot, aliases DNS y compatibilidad TLS/SNI para perfiles personalizados.
3. Añadir cuota concurrente y, si el usuario lo activa, límites de gasto/uso por modelo. La app personal local aún puede generar muchas llamadas si queda abierta.
4. Definir schema versionado de diapositivas y elementos, validar e importar datos dañados con archivos grandes.
5. Revisar XSS/DOM, contaminación de proyecto, permisos del sistema de archivos, copias y borrado seguro de credenciales.
6. Validar errores y cancelación con Ollama/LM Studio y proveedor remoto; completar el manual de accesibilidad sigue siendo trabajo independiente.

## Estado del roadmap

La base local, mapas, configuración de proveedores y primer ciclo de IA están implementados en parte o cerrados según [`TASKS.md`](../TASKS.md). Los hitos grandes restantes son: cerrar IA/proveedores con límites y validación, completar presentaciones/exportación, empaquetar para Windows y completar las verificaciones OWASP/WCAG. No declarar conformidad completa de seguridad ni AA a partir de build/Lighthouse.

## Seguimiento de código y seguridad — 2026-11-16

- Build de producción verificado con Node 24.22.2: dominio, servidor y web compilaron. `npm audit --omit=dev` informó cero vulnerabilidades en dependencias de producción.
- Recorridos aislados documentados desde la auditoría anterior cubren conflicto entre pestañas, recuperación sin archivo principal, rotación de backups, errores postcommit y varios fixtures de documento/grafo inválidos. Esta sesión revalidó visualmente sesión local y el árbol accesible, no los controles completos de host/origen/cookie ni la CSP del instalador.
- La UI recibió correcciones de accesibilidad y contraste descritas en [`2026-11-15-code-audit.md`](2026-11-15-code-audit.md). El almacenaje de verificación quedó bajo `%TEMP%` y sin proveedor real.
- Sigue sin realizarse pentest, revisión de permisos del sistema de archivos, prueba exhaustiva SSRF/TLS, matriz completa de errores/cargas y análisis formal de amenazas. `npm audit` solo cubre vulnerabilidades conocidas de dependencias; Lighthouse solo mide un subconjunto automatizable de la accesibilidad.

### Errores controlados de respaldo/restauración — 2026-11-16

En producción aislada, el fallo al crear la carpeta de copias y la restauración desde JSON malformado devolvieron HTTP 500 genérico sin modificar revisión ni contenido. El reintento tras retirar el bloqueo guardó una copia válida; restaurar esa copia creó la siguiente revisión. No se probaron ACL, disco lleno, `fsync`/rename ni permisos reales. Evidencia y alcance: [VERIFICATION.md](../VERIFICATION.md).

La recuperación de un `project.json` corrupto también se recorrió: GET respondió 409 sin modificar el archivo, y una copia recuperable restauró revisión 2 preservando el corrupto como `.invalid`. Esto verifica un flujo controlado; permisos ACL y errores reales de almacenamiento siguen abiertos.

## Continuación de verificaciones de sesión y carga — 2026-11-16

- En el servidor compilado de producción, con carpetas temporales aisladas, se verificaron 19 operaciones protegidas de proyecto/proveedor/IA: todas devolvieron 403 sin cookie. Una sesión recién intercambiada permitió consultar la lista vacía de proyectos (200). Un origen distinto y `Host: localhost` se rechazaron (403), y el nonce reutilizado se rechazó (401).
- La cookie de sesión incluyó `HttpOnly`, `SameSite=Strict`, `Path=/api` y expiración de 12 horas. La ruta web sirvió la CSP de producción, `X-Frame-Options: DENY` y `X-Content-Type-Options: nosniff`. El servidor devolvió 413 para un cuerpo que superaba 8 MiB.
- No se creó ni modificó ningún proyecto o proveedor y no se conectó con modelos. La prueba no cubrió dos rutas de proveedor por ID con sesión válida, errores de almacenamiento, el instalador Inno Setup ni variantes adicionales de cabeceras. T-015 permanece parcial; sin pentest ni certificación.
- En otra carpeta temporal se escribió JSON inválido en `providers.json`; tras autenticar, `GET /api/providers` devolvió 200 con configuración vacía y conservó intacto el archivo corrupto. El proceso y el archivo de prueba se retiraron. No se probaron permisos ni errores de escritura.

## Nota posterior — primer incremento de presentaciones

Después de esta auditoría, T-011 añadió un contrato validado de diapositiva y esquema v3 con migración desde v2; la UI genera y edita un deck desde el mapa y lo guarda con autosave. La exportación usa impresión/PDF. Este incremento solo se compiló: no se ejecutó recorrido manual. Riesgos de IA para generar presentaciones, formatos de diagrama/formulario, PNG y revisión visual siguen abiertos.
