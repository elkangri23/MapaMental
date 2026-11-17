# Estado del proyecto

**Actualizado:** 2026-11-17
**Hito actual:** M3 — Presentaciones completado; M4 — Paquete Windows en curso. T-004 documental completada.

## Estado

- **Completadas:** fundamentos y diseño inicial (T-001–T-008, incluida T-004 documental), presentación y exportación PDF/PNG (T-011), presupuesto remoto (T-012), alcance/política inicial de identidad (T-018–T-020, T-022) y perfil personal (T-027).
- **En curso:** T-009–T-010 (proveedores y calidad de IA), T-013 (instalador), T-015 (seguridad), T-016 (accesibilidad), T-017 (estabilidad de almacenamiento), T-028 (rendimiento) y las verificaciones reales de T-021/T-023–T-026.
- **Seguridad (T-015/T-026):** revisión estática, build y `npm audit` sin vulnerabilidades conocidas. En Fastify, un hostname real que resolvió a loopback se rechazó con HTTP 400 y cero conexiones al listener canario; una simulación separada confirmó el pinning ante un cambio DNS. Aún falta una única prueba HTTP que fuerce la carrera resolución/socket, además de errores adicionales de almacenamiento y recorridos reales de OIDC/MFA; ver [`informe`](reviews/2026-11-17-security-audit.md).
- **T-009/T-010:** hubo evaluaciones anteriores con FreeLLMAPI y varios modelos, incluidos ciclos de sugerencia, vista previa, aplicación y deshacer. En la última repetición, Ollama y LM Studio no estaban activos y FreeLLMAPI agotó el tiempo a los 60 segundos. La calidad quedó sin reevaluar en esa petición.
- **T-013:** ZIP e instalador compilados; prueba aislada de instalación, servicio HTTP 200, parada y desinstalación correcta. Los artefactos se regeneraron tras la corrección T-016; falta repetir el smoke test de esta compilación, probar actualización desde una versión posterior y comprobar conservación de proyectos.
- **T-015:** build y varias verificaciones de host/SSRF están documentadas: matriz representativa IANA, redirección rechazada, hostname que resuelve a loopback bloqueado antes de conectar y normalización de sufijos con punto final. TLS/SNI y el máximo de tres generaciones IA simultáneas se verificaron en ejecución. Una simulación determinista ejercitó resolución SSRF y lookup de socket con DNS inyectado. Se creó [`THREAT_MODEL.md`](THREAT_MODEL.md), pendiente de contraste dinámico. La ACL denegada en `backups` provocó `EPERM` sin alterar el proyecto y el reintento funcionó al restaurar permisos. Falta el recorrido HTTP de rebinding y quedan otros errores/permisos de disco.
- **T-016:** Chrome confirmó nombres en español para conexiones/nodos, recorrido con Tab, Lighthouse 100/100 Accessibility en mapa y presentación, controles con nombre y reflujo sin solapamiento a 320 px. Se amplió el objetivo táctil «Copias» tras corregir el pie fijo de diapositivas en móvil. Siguen pendientes lector de pantalla real y revisión completa de teclado, contraste y estados; ver [`informe WCAG`](reviews/2026-11-17-wcag-aa-audit.md).
- **T-017:** se corrigieron colisiones de copias al reintentar guardados/restauraciones; una prueba ACL aislada confirmó que `EPERM` al escribir el backup preserva el proyecto y permite reintento. Siguen pendientes otros puntos ACL, disco lleno e interrupciones físicas.
- **T-028 — Rendimiento:** props estables, vista de lista O(n + e), virtualización desde 100 ideas y canvas React Flow con carga diferida. Build correcto; chunk inicial 333,57 kB (99,61 kB gzip) y canvas diferido 185,84 kB (60,23 kB gzip), total similar al bundle previo. Una corrida con 100 ideas y CPU 4×/Fast 3G bajó LCP de 5.908 a 5.085 ms, sin significancia estadística. 1.000 ideas cargó con 224 nodos/693 conexiones, pero sin LCP comparable. 10.000 sigue pendiente: JSON 2,04 MB y alta carga DOM observada antes del cambio. Ver [informe](reviews/2026-11-17-performance-audit.md).
- **M5:** OIDC, WebAuthn/passkeys y recuperación TOTP están implementados parcialmente; faltan recorridos con IdP, aplicación TOTP y autenticadores reales.

## Próximo trabajo

Integrar un DNS fixture en una petición HTTP para verificar el trayecto completo hasta la capa de socket; contrastar el modelo de amenazas con los resultados y cubrir otros errores de almacenamiento. Para T-013, comprobar actualización y conservación de proyectos al publicar una versión posterior; las aceptaciones reales de proveedores, accesibilidad y modo protegido dependen de servicios o dispositivos disponibles.

La lista de tareas y criterios está en [`TASKS.md`](TASKS.md); la secuencia y evidencia detallada, en [`ROADMAP.md`](ROADMAP.md) y [`VERIFICATION.md`](VERIFICATION.md).
