# Índice de documentación

Actualizado: 2026-11-16. El estado se refiere a la documentación, no a que la función exista en el producto.

| Documento | Fuente de verdad para | Estado |
|---|---|---|
| [`../README.md`](../README.md) | Qué es el proyecto y entrada rápida | Estado y límites de contexto IA precisados; PDF de T-011 guardado y revisado |
| [`designs/espacio-visual-personal.md`](designs/espacio-visual-personal.md) | Requisitos, alcance y comportamiento acordado | Revisado con Goldfish; implementación en curso |
| [`IDEAS_FUTURAS.md`](IDEAS_FUTURAS.md) | Catálogo de extensiones posibles fuera de v1 | Ideas para priorizar; no son compromisos ni tareas activas |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Componentes y flujo de datos previsto/implementado | Contratos reales de contexto/logs y diferencias ligadas al informe EGM |
| [`INSTALLATION.md`](INSTALLATION.md) | Instalación, inicio, actualización y desinstalación | Lanzador local disponible; instalador no disponible |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | Preparación del entorno de desarrollo | En curso |
| [`PROVIDERS.md`](PROVIDERS.md) | Configuración de modelos y presupuesto | Propuesta de diapositiva recorrida con mock Ollama local; real pendiente |
| [`STORAGE.md`](STORAGE.md) | Archivo de proyecto, guardado, copias y migraciones | Migración 2→3, reintento tras fallo de reemplazo y esquema futuro de solo lectura verificados |
| [`SECURITY.md`](SECURITY.md) | Límites locales, credenciales, datos remotos y registros | Límites locales y proveedor documentados; informe de autenticación estática añadido; recorridos dinámicos pendientes |
| [`AUTH_OAUTH_MFA_PASSKEYS.md`](AUTH_OAUTH_MFA_PASSKEYS.md) | Contrato y tareas para login OIDC, MFA y passkeys | T-018/T-019 cerradas; T-020–T-025 parciales; T-026 con revisión estática y registro local parcial; falta recorrido real |
| [`AUTH_OPERATIONS.md`](AUTH_OPERATIONS.md) | Configurar modo protegido, recuperar y desvincular la identidad | Guía escrita; flujos de IdP y autenticadores reales pendientes |
| [`COMPLIANCE.md`](COMPLIANCE.md) | Cruce inicial de OWASP Top 10:2025 y WCAG 2.0 AA | Línea base parcial; auditoría de código documentada y verificación manual pendiente |
| [`VERIFICATION.md`](VERIFICATION.md) | Criterios de aceptación y escenarios de revisión | Diapositiva IA y salida PNG recorridas; PDF final guardado y estructura etiquetada inspeccionada |
| [`2026-11-16_DRIFT_REPORT.md`](2026-11-16_DRIFT_REPORT.md) | Diferencias entre diseño aprobado y README frente al código | Incluye persistencia, contratos, contexto, errores, trazabilidad IA, dirección loopback y capacidad |
| [`ROADMAP.md`](ROADMAP.md) | Hitos y condiciones de salida | T-011 completada; T-004 y las validaciones externas/locales siguen pendientes |
| [`TASKS.md`](TASKS.md) | Estado detallado de trabajo | Fuente única de progreso; T-013 en curso |
| [`decisions/README.md`](decisions/README.md) | Índice de ADR y su estado | ADR-0012 y ADR-0014 aceptados; identidad/MFA parcial y contrato de error implementado |
| [`reviews/2026-11-14/`](reviews/2026-11-14/) | Informes de revisión Goldfish del diseño | Completados; hallazgos registrados |
| [`reviews/2026-11-15-code-audit.md`](reviews/2026-11-15-code-audit.md) | Auditoría estática de implementación, correcciones y pendientes | Correcciones compiladas; recorridos dinámicos pendientes |
| [`reviews/2026-11-16-auth-mfa-audit.md`](reviews/2026-11-16-auth-mfa-audit.md) | Revisión estática de OIDC, MFA, passkeys y accesibilidad | Correcciones compiladas; recorridos reales y lector de pantalla pendientes |
| [`reviews/2026-11-15-security-audit.md`](reviews/2026-11-15-security-audit.md) | Auditoría de seguridad, cambios, límites y pendientes | Build y auditoría de dependencias verificados; revisión de código, no pentest |

## Cómo mantenerlo actualizado

- Al cambiar requisitos, actualiza primero la especificación y el ADR afectado.
- Al cerrar una tarea, actualiza `TASKS.md`, `STATUS.md` y las guías que hayan cambiado.
- Al añadir o retirar un documento, actualiza esta tabla y los enlaces del README.
- Las guías de instalación solo cambian a **comprobadas** tras recorrer el procedimiento en el paquete real.
