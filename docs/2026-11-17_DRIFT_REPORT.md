# Informe EGM de deriva — 2026-11-17

Alcance: README, especificación aprobada, arquitectura y guías de producto/operación, además de los ADR 0001–0019. Se compararon afirmaciones de estado con el código y la evidencia registrada. Este informe no sustituye recorridos funcionales.

## README.md

- Indicaba que faltaba validar el contexto con un proveedor real, aunque ya se hicieron evaluaciones con FreeLLMAPI y modelos reales. Se actualizó para distinguirlas de la validación local real que sigue pendiente.

## docs/designs/espacio-visual-personal.md

- El cierre afirmaba que la implementación aún no satisfacía los requisitos, aunque mapas, almacenamiento, presentaciones, perfiles, propuestas IA y exportación están implementados parcialmente o completados. Se sustituyó por un estado no absoluto que remite a tareas y verificación.
- La lista T-007 decía que recuperación tras corrupción estaba pendiente, pero existe recorrido de recuperación desde copia válida con documento principal corrupto. Se corrigió el alcance dejando pendientes ACL, fallos físicos y otros escenarios.
- La lista T-009/T-010 presentaba las evaluaciones reales como pendientes; ya existen evaluaciones y ciclos de aplicación/deshacer con FreeLLMAPI. Se actualizó para separar esa evidencia de las pruebas locales reales que faltan.
- El perfil personal de nombre/correo implementado en `profile.json` no figuraba en la especificación. Se añadió objetivo y recorrido de uso local.

## docs/ARCHITECTURE.md

- Indicaba que la traza de eventos IA no se había recorrido, pero ADR-0019 y VERIFICATION documentan un recorrido con mock que correlacionó generación/guardado y excluyó contenido sensible. Se actualizó la afirmación y se conserva el límite de retención operativa.
- Afirmaba que no se habían validado proveedores reales; ya había evaluaciones FreeLLMAPI por API. Se actualizó para distinguir ese uso de la conexión real a Ollama/LM Studio y de la repetición pendiente tras la indisponibilidad reciente.

## docs/PROVIDERS.md

No drift detected.

## docs/STORAGE.md

No drift detected.

## docs/SECURITY.md

- Afirmaba que la cancelación HTTP no se había verificado con un proveedor lento; VERIFICATION confirma cierres antes de recibir cabeceras y durante lectura del cuerpo. Se actualizó esa afirmación.
- No recogía las verificaciones SSRF del 2026-11-17 (muestras IANA, redirección, respuesta DNS loopback y normalización de nombres con punto final). Se añadió un seguimiento fechado con límites explícitos.

## docs/AUTH_OAUTH_MFA_PASSKEYS.md

No drift detected.

## docs/AUTH_OPERATIONS.md

No drift detected.

## docs/INSTALLATION.md

No drift detected.

## docs/DEVELOPMENT.md

No drift detected.

## docs/COMPLIANCE.md

- La fecha y el estado de la matriz no incorporaban los recorridos SSRF del 2026-11-17. Se actualizó la fecha y se añadió evidencia, diferenciando las comprobaciones realizadas de DNS rebinding, TLS/SNI, errores de disco, cuotas y análisis de amenazas todavía pendientes.

## docs/INDEX.md

- La fecha, los estados de Arquitectura/Seguridad/Proveedores y el índice de informes EGM estaban atrasados. Se actualizó el índice para apuntar al informe vigente y al resumen de estado.

## docs/STATUS.md

- El “siguiente” trabajo seguía centrado en una tanda anterior de T-010 y omitía los últimos bloqueos y verificaciones de T-004/T-009/T-013/T-015/T-017. Se reemplazó el historial largo por un resumen vigente basado en TASKS y VERIFICATION.

## docs/decisions/README.md

No drift detected.

## docs/decisions/ADR-0001-web-servicio-local.md

No drift detected.

## docs/decisions/ADR-0002-stack-typescript.md

No drift detected.

## docs/decisions/ADR-0003-proyecto-json-y-copias.md

No drift detected.

## docs/decisions/ADR-0004-mapa-y-presentacion-enlazados.md

No drift detected.

## docs/decisions/ADR-0005-operaciones-ia-atomicas.md

No drift detected.

## docs/decisions/ADR-0006-adaptadores-y-credenciales.md

No drift detected.

## docs/decisions/ADR-0007-contexto-y-presupuesto-remoto.md

No drift detected.

## docs/decisions/ADR-0008-instalador-windows.md

No drift detected.

## docs/decisions/ADR-0009-sesion-local-segura.md

- Seguía indicando que el intercambio de nonce/cookie estaba pendiente de recorrido en navegador. Ese recorrido está documentado: canje válido, limpieza del fragmento, sesión tras recarga y rechazo de nonce inválido/reutilizado. Se actualizó la consecuencia; la interoperabilidad OIDC real sigue pendiente.

## docs/decisions/ADR-0010-almacen-secreto-windows.md

No drift detected.

## docs/decisions/ADR-0011-eventos-de-generacion-en-la-peticion.md

No drift detected.

## docs/decisions/ADR-0012-identidad-oauth-mfa-passkeys.md

No drift detected.

## docs/decisions/ADR-0013-loopback-ipv6-y-webauthn.md

No drift detected.

## docs/decisions/ADR-0014-contrato-de-error-api.md

No drift detected.

## docs/decisions/ADR-0015-formato-persistido-proyecto-v3.md

No drift detected.

## docs/decisions/ADR-0016-fragmentos-de-diapositivas-en-contexto-ia.md

No drift detected.

## docs/decisions/ADR-0017-volumen-local-para-proyectos.md

No drift detected.

## docs/decisions/ADR-0018-resumen-global-contexto-ia.md

No drift detected.

## docs/decisions/ADR-0019-trazabilidad-operaciones-ia.md

- Decía que errores de proveedor/5xx seguían fuera del recorrido, pero un 503 simulado ya se comprobó con el contrato JSON 502 y el evento SSE terminal redactado. Se actualizó el ADR; la retención operativa y el proveedor real siguen sin cubrirse.
