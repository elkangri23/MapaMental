# Estado del proyecto

**Actualizado:** 2026-11-17
**Hito actual:** M3 — Presentaciones completado; M4 — Paquete Windows en curso. T-004 documental completada.

## Estado

- **Completadas:** fundamentos y diseño inicial (T-001–T-008, incluida T-004 documental), presentación y exportación PDF/PNG (T-011), presupuesto remoto (T-012), alcance/política inicial de identidad (T-018–T-020, T-022) y perfil personal (T-027).
- **En curso:** T-009–T-010 (proveedores y calidad de IA), T-013 (instalador), T-015 (seguridad), T-016 (accesibilidad), T-017 (estabilidad de almacenamiento) y las verificaciones reales de T-021/T-023–T-026.
- **T-009/T-010:** hubo evaluaciones anteriores con FreeLLMAPI y varios modelos, incluidos ciclos de sugerencia, vista previa, aplicación y deshacer. En la última repetición, Ollama y LM Studio no estaban activos y FreeLLMAPI agotó el tiempo a los 60 segundos. La calidad quedó sin reevaluar en esa petición.
- **T-013:** ZIP e instalador compilados; prueba aislada de instalación, servicio HTTP 200, parada y desinstalación correcta. Los artefactos se regeneraron tras la corrección T-016; falta repetir el smoke test de esta compilación, probar actualización desde una versión posterior y comprobar conservación de proyectos.
- **T-015:** build y varias verificaciones de host/SSRF están documentadas: matriz representativa IANA, redirección rechazada, hostname que resuelve a loopback bloqueado antes de conectar y normalización de sufijos con punto final. TLS/SNI y el máximo de tres generaciones IA simultáneas se verificaron en ejecución. Una simulación determinista ejercitó las funciones reales de resolución SSRF y lookup del socket con DNS inyectado. Se creó [`THREAT_MODEL.md`](THREAT_MODEL.md), un modelo inicial pendiente de contraste dinámico. Falta el recorrido HTTP de rebinding y siguen pendientes errores/permisos de disco.
- **T-016:** Chrome confirmó en 2026-11-17 nombres españoles en conexiones/nodos y su recorrido con Tab. Siguen pendientes lector de pantalla real y revisión completa de teclado, contraste y estados.
- **T-017:** se corrigieron colisiones de copias al reintentar guardados/restauraciones y se recorrieron fallos controlados. Siguen pendientes ACL, disco lleno e interrupciones físicas.
- **M5:** OIDC, WebAuthn/passkeys y recuperación TOTP están implementados parcialmente; faltan recorridos con IdP, aplicación TOTP y autenticadores reales.

## Próximo trabajo

Integrar un DNS fixture en una petición HTTP para verificar el trayecto completo hasta la capa de socket; contrastar el modelo de amenazas con los resultados y recorrer permisos/errores de disco. Para T-013, comprobar actualización y conservación de proyectos al publicar una versión posterior; las aceptaciones reales de proveedores, accesibilidad y modo protegido dependen de servicios o dispositivos disponibles.

La lista de tareas y criterios está en [`TASKS.md`](TASKS.md); la secuencia y evidencia detallada, en [`ROADMAP.md`](ROADMAP.md) y [`VERIFICATION.md`](VERIFICATION.md).
