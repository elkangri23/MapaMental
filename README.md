# Espacio visual personal asistido por IA

Aplicación local para desarrollar ideas en mapas mentales y presentaciones editables. La distribución combina un lienzo con chat contextual y sugerencias de IA; la identidad visual será propia.

> **Estado:** implementación inicial. La shell React/React Flow está conectada a proyectos JSON con autosave y recuperación; hay configuración de proveedores y chat con historial por proyecto, sugerencias, etapas de generación, vista previa, aplicación y deshacer probado con Ollama simulado. Antes de generar, la UI muestra proveedor, rama, ancestros, conexiones, títulos y fragmentos limitados de diapositivas vinculadas, un resumen estructural con la idea central y hasta ocho ramas principales, conteos y los últimos diez mensajes con recortes. El detalle de las ramas ajenas sigue excluido, aunque sus nombres principales se comparten y aparecen en la vista previa. Los fragmentos se limitan a 20 diapositivas, 500 caracteres cada una y 6.000 en total. El editor de presentaciones enlaza diapositivas al mapa, incluye recorrido y formulario ficticio, impresión de todas las diapositivas, propuesta IA revisable con aplicación/deshacer y PNG de la diapositiva actual. La propuesta IA se recorrió de extremo a extremo con un mock local; el PNG entrega una imagen de 1600×900 con firma válida. El PDF final se guardó desde el diálogo nativo y se verificó como etiquetado, con tres páginas A4 apaisadas y contenido sin cortes visibles. Siguen pendientes validar el contexto con un proveedor real, completar evaluaciones WCAG y el asistente Inno Setup. Consulta [`docs/STATUS.md`](docs/STATUS.md) y [`docs/TASKS.md`](docs/TASKS.md).

Para crear una tabla, utiliza **＋ Tabla** en la vista de presentación o aplica una sugerencia de tipo **Diapositiva con tabla** desde el chat. La tabla admite hasta cuatro columnas y seis filas. Puedes editarla antes de imprimir o exportar la diapositiva.

Para convertir el mapa, abre **Crear presentación** y elige la cantidad. El editor admite de una a cien diapositivas y crea páginas en blanco si la cantidad supera las ideas disponibles.

Con un proveedor configurado, selecciona **Generar con IA** en el mismo diálogo. Puedes pedir de una a doce diapositivas o dejar la cantidad vacía. Revisa el contexto antes de generar y el borrador en el chat antes de aplicarlo.

En **Proveedores de IA** puedes configurar un presupuesto mensual por perfil remoto y las tarifas por modelo. Deja el presupuesto vacío para usarlo sin límite. El chat muestra el gasto estimado.

## Uso en Windows

El ZIP portátil incluye Node 24. Extrae todos sus archivos y abre `scripts\start-windows.cmd`. Consulta [Instalación](docs/INSTALLATION.md) para iniciar, detener o actualizar el paquete.

## Requisitos de desarrollo

- Windows 10 u 11 de 64 bits para la primera entrega.
- Node.js 24 LTS y npm. El Node 18 que pudiera estar instalado no es compatible con la configuración actual de Vite.
- Para generación local: Ollama o LM Studio ejecutándose en el equipo. Los adaptadores están implementados, pero falta validarlos con servidores y modelos reales.

## Inicio de desarrollo

Con Node.js 24 instalado, ejecuta desde la raíz:

```powershell
npm install
npm run dev
```

La interfaz de desarrollo y el servicio local se abrirán en puertos de loopback. Este flujo es para desarrollo; el instalador de Windows todavía no está disponible. Consulta [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) y [`docs/INSTALLATION.md`](docs/INSTALLATION.md).

**Dependencias instaladas con Node portátil 24.22.2; build y flujo básico de producción comprobados en Chromium.**

Para abrir la compilación de producción local: `npm run build` y después `.\scripts\start-local.ps1`.

## Documentación

- [Índice y estado de la documentación](docs/INDEX.md)
- [Especificación del producto](docs/designs/espacio-visual-personal.md)
- [Arquitectura](docs/ARCHITECTURE.md)
- [Proveedores y presupuestos](docs/PROVIDERS.md)
- [Proyectos, copias y recuperación](docs/STORAGE.md)
- [Privacidad y seguridad local](docs/SECURITY.md)
- [Informe y plan de OAuth/OIDC, MFA y passkeys](docs/AUTH_OAUTH_MFA_PASSKEYS.md)
- [Roadmap](docs/ROADMAP.md)
- [Ideas de extensiones futuras](docs/IDEAS_FUTURAS.md)
- [Tareas y backlog](docs/TASKS.md)
- [Criterios de aceptación](docs/VERIFICATION.md)
- [Informe de auditoría de seguridad y estado](docs/reviews/2026-11-15-security-audit.md)
- [Decisiones de arquitectura (ADR)](docs/decisions/README.md)

## Datos y privacidad

Los proyectos se guardarán en el ordenador. Solo se enviará información a un proveedor remoto cuando el usuario lo seleccione. La interfaz indicará el proveedor y el contexto ampliado pertinente que se enviará. Las claves no se guardarán en el archivo del proyecto.

