# Índice de documentación

Actualizado: 2026-11-18. El estado se refiere a la documentación, no a que la función exista en el producto.

| Documento | Fuente de verdad para | Estado |
|---|---|---|
| [Español](../README.md) · [Français](../README.fr.md) · [English](../README.en.md) | Presentación visual, instalación y configuración | Tres ediciones con las mismas capturas del huerto escolar |
| [Manual en español](guia/es.md) · [Guide en français](guia/fr.md) · [English guide](guia/en.md) | Mapa, chat, presentaciones, mantenimiento y preguntas frecuentes | Fuente del botón de ayuda en los tres idiomas |
| [`designs/espacio-visual-personal.md`](designs/espacio-visual-personal.md) | Requisitos, alcance y comportamiento acordado | Revisado con Goldfish; implementación en curso |
| [`IDEAS_FUTURAS.md`](IDEAS_FUTURAS.md) | Catálogo de extensiones posibles fuera de v1 | Ideas para priorizar; no son compromisos ni tareas activas |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Componentes y flujo de datos previsto/implementado | Trazabilidad IA verificada con mock; diferencias remanentes en el informe EGM del 2026-11-17 |
| [`INSTALLATION.md`](INSTALLATION.md) | Instalación, inicio, actualización y desinstalación | Instalación, accesos, actualización y conservación comprobados; ruta de Configuración pendiente por fallo del control de UI |
| [`DEVELOPMENT.md`](DEVELOPMENT.md) | Preparación del entorno de desarrollo | En curso |
| [`PROVIDERS.md`](PROVIDERS.md) | Configuración de modelos, FreeLLMAPI, LM Studio, calidad y presupuesto | FreeLLMAPI se evaluó con modelos reales; integración LM Studio compilada, aceptación local pendiente |
| [`STORAGE.md`](STORAGE.md) | Archivo de proyecto, guardado, copias y migraciones | Contrato JSON v3 en ADR-0015; volumen fijo validado al inicio en ADR-0017; migración 2→3 y esquema futuro de solo lectura verificados |
| [`SECURITY.md`](SECURITY.md) | Límites locales, credenciales, datos remotos y registros | Checks SSRF, TLS/SNI local y concurrencia IA limitada; siguen pendientes DNS rebinding y otros controles |
| [`THREAT_MODEL.md`](THREAT_MODEL.md) | Activos, límites de confianza, adversarios, amenazas y riesgos residuales | Modelo inicial; pendiente contraste dinámico con los controles abiertos |
| [`AUTH_OAUTH_MFA_PASSKEYS.md`](AUTH_OAUTH_MFA_PASSKEYS.md) | Contrato y tareas para login OIDC, MFA y passkeys | T-018–T-020 y T-022 cerradas; T-021 y T-023–T-025 parciales; T-026 con revisión estática y registro local parcial; falta recorrido real |
| [`AUTH_OPERATIONS.md`](AUTH_OPERATIONS.md) | Gestionar el perfil, configurar el modo protegido y recuperar o desvincular la identidad | Guía escrita; flujos de IdP y autenticadores reales pendientes |
| [`COMPLIANCE.md`](COMPLIANCE.md) | Cruce inicial de OWASP Top 10:2025 y WCAG 2.0 AA | Actualización del 2026-11-17; revisión parcial, con verificaciones dinámicas y pendientes explícitos |
| [`VERIFICATION.md`](VERIFICATION.md) | Criterios de aceptación y escenarios de revisión | Contexto de diapositivas recorrido con proveedor simulado; PDF final guardado y estructura etiquetada inspeccionada |
| [`2026-11-16_DRIFT_REPORT.md`](2026-11-16_DRIFT_REPORT.md) | Informe histórico de diferencias de diseño/código | Conserva el estado revisado el 2026-11-16 |
| [`2026-11-17_DRIFT_REPORT.md`](2026-11-17_DRIFT_REPORT.md) | Diferencias actuales entre documentos de diseño y código | Revisión cerrada en T-004; discrepancias corregidas |
| [`STATUS.md`](STATUS.md) | Resumen de estado, bloqueos y próximo trabajo | T-004 cerrada; README/ayuda en curso; tareas actualizadas el 2026-11-18 |
| [`ROADMAP.md`](ROADMAP.md) | Hitos y condiciones de salida | T-011 completada; resumen global de contexto IA implementado; validaciones externas/locales siguen pendientes |
| [`TASKS.md`](TASKS.md) | Estado detallado de trabajo | Fuente única de progreso; T-010 incorpora resumen global estructural |
| [`CHANGELOG.md`](CHANGELOG.md) | Cambios visibles agrupados por versión | Registro de cambios desde esta auditoría |
| [`decisions/README.md`](decisions/README.md) | Índice de ADR y su estado | ADR-0012 y ADR-0014–0019 aceptados; identidad/MFA parcial, contratos, contexto, volumen y trazabilidad IA documentados |
| [`reviews/2026-11-14/`](reviews/2026-11-14/) | Informes de revisión Goldfish del diseño | Completados; hallazgos registrados |
| [`reviews/2026-11-15-code-audit.md`](reviews/2026-11-15-code-audit.md) | Auditoría estática de implementación, correcciones y pendientes | Correcciones compiladas; recorridos dinámicos pendientes |
| [`reviews/2026-11-16-auth-mfa-audit.md`](reviews/2026-11-16-auth-mfa-audit.md) | Revisión estática de OIDC, MFA, passkeys y accesibilidad | Correcciones compiladas; recorridos reales y lector de pantalla pendientes |
| [`reviews/2026-11-17-security-audit.md`](reviews/2026-11-17-security-audit.md) | Revisión de seguridad retomada y manejo seguro de excepciones de autenticación | Corrección compilada; pentest y recorridos dinámicos siguen pendientes |
| [`reviews/2026-11-18-auth-mfa-follow-up.md`](reviews/2026-11-18-auth-mfa-follow-up.md) | Seguimiento de código de passkeys, Credential Manager y controles de la interfaz | Build correcto; IdP, autenticadores, pruebas negativas y lector de pantalla pendientes |
| [`reviews/2026-11-17-wcag-aa-audit.md`](reviews/2026-11-17-wcag-aa-audit.md) | Revisión WCAG de interfaz, hallazgos móviles y arreglos | Lighthouse 100 en Accessibility en mapa y presentación; revisión manual/lector de pantalla pendientes |
| [`reviews/2026-11-17-performance-audit.md`](reviews/2026-11-17-performance-audit.md) | Rendimiento de carga, renderizado y mapas grandes | Mejoras aplicadas; comparación a escala y optimización de chunk pendientes |
| [`reviews/2026-11-15-security-audit.md`](reviews/2026-11-15-security-audit.md) | Auditoría de seguridad, cambios, límites y pendientes | Build y auditoría de dependencias verificados; revisión de código, no pentest |

## Cómo mantenerlo actualizado

- Al cambiar requisitos, actualiza primero la especificación y el ADR afectado.
- Al cerrar una tarea, actualiza `TASKS.md`, `STATUS.md` y las guías que hayan cambiado.
- Al añadir o retirar un documento, actualiza esta tabla y los enlaces del README.
- Las guías de instalación solo cambian a **comprobadas** tras recorrer el procedimiento en el paquete real.
