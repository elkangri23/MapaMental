# ADR-0004: Mapa y presentación como artefactos enlazados

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto

El usuario quiere crear mapas y diapositivas desde un mismo proyecto y editar cada presentación sin dañar el mapa fuente.

## Decisión

Un proyecto contiene un mapa y una presentación ordenada separados. Cada diapositiva puede referenciar IDs de nodos de origen; la referencia sirve para trazabilidad y no sincroniza cambios automáticamente. Los bloques de diapositiva incluyen texto, viñetas, diagramas estáticos y maquetas de formularios no funcionales.

## Alternativas

- Lienzo único con marcos: más parecido al modelo observado, pero acopla el grafo y el orden de presentación.
- Documentos independientes: aísla formatos, pero pierde el vínculo y el contexto común.

## Consecuencias

La presentación es editable por separado. Regenerar tras cambios del mapa será una acción explícita. Una cantidad solicitada se conserva exactamente; sin cantidad, el modelo elige entre 3 y 7.

