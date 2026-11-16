# ADR-0003: Carpeta JSON versionada y copias

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto

Los proyectos deben permanecer locales, ser legibles entre versiones y recuperarse tras cierres o fallos.

## Decisión

Guardar cada proyecto en una carpeta con `project.json`, `schemaVersion`, revisiones y hasta 20 copias válidas previas. Limitar v1 a volúmenes locales fijos. Antes de reemplazar el documento, escribir, sincronizar y releer el temporal; crear y verificar la copia del documento vigente. Si cualquiera de esos pasos falla, no reemplazar el documento ni rotar copias válidas. Migrar formatos antiguos con copia previa.

## Alternativas

- Archivo empaquetado: fácil de mover, pero menos transparente para recuperar.
- SQLite: buenas transacciones, pero menos legible y requiere migraciones de base.

## Consecuencias

El documento será inspeccionable y copiable. El servicio gestiona operaciones atómicas y recuperación; las versiones antiguas no sobrescriben esquemas más nuevos. Se excluyen rutas UNC y unidades extraíbles para mantener predecible el comportamiento de reemplazo y recuperación en v1.

