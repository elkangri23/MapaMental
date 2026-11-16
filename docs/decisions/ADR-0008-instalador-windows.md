# ADR-0008: Instalador Windows con runtime incluido

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto

La primera entrega se usa en Windows y debe iniciar el servicio y navegador desde un acceso directo, sin depender de Node instalado por el usuario.

## Decisión

Crear instalador Windows con Inno Setup. Incluir Node 24 LTS, desplegar los archivos de la app, crear acceso directo y conservar proyectos/credenciales en actualización o desinstalación.

## Alternativas

- Requerir Node y npm instalados: más sencillo para desarrollo, menos cómodo para uso personal.
- WiX/MSI: mejor encaje con despliegue empresarial, mayor complejidad que necesita esta app personal.

## Consecuencias

El paquete es mayor y debe actualizar el runtime de forma controlada. La guía de instalación seguirá marcada como prevista hasta probar instalación, actualización y desinstalación.

