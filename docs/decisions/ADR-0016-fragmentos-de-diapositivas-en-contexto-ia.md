# ADR-0016: Fragmentos de diapositivas relevantes en contexto IA

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Relacionado:** [ADR-0004](ADR-0004-mapa-y-presentacion-enlazados.md), [ADR-0010](ADR-0010-almacen-secreto-windows.md)

## Contexto

Las sugerencias IA conocían títulos de diapositivas relacionadas con el ámbito, pero no los detalles ya desarrollados en ellas. Esto podía producir propuestas repetidas o genéricas pese a que el proyecto ya contenía tablas, recorridos o ejemplos útiles. Enviar la presentación completa expondría más contenido del necesario y aumentaría el contexto sin límite práctico.

## Decisión

- Al enviar contexto a IA, incluir fragmentos solo de las diapositivas que referencien una idea del ámbito o uno de sus ancestros.
- Construir el fragmento de forma determinista con cuerpo, viñetas, pasos de diagrama, campos ficticios y celdas de tabla disponibles.
- Limitar a 20 diapositivas relevantes, 500 caracteres por diapositiva y 6.000 caracteres totales. Se conserva también la lista de títulos.
- La vista previa de contexto muestra títulos y fragmentos tanto para sugerencias/chat como para generación de presentación. La misma función de dominio construye la vista previa y el payload del servidor.
- No se envían diapositivas sin vínculo con el ámbito, el mapa completo fuera de sus límites actuales, credenciales, copias ni otros proyectos.

## Alternativas

- **Enviar la presentación completa:** descartado por exceso de datos y tamaño variable.
- **Enviar solo títulos:** mantenía el contexto pequeño, pero omitía detalles existentes que permitirían sugerencias más concretas.
- **Generar un resumen adicional con el modelo:** aumenta latencia/coste y no puede mostrarse con exactitud antes de la llamada que lo produce.

## Consecuencias

Las sugerencias pueden apoyarse en contenido ya creado sin duplicarlo entero. La vista previa deja visible la información compartida. Los límites pueden truncar tablas o fragmentos largos. ADR-0018 añade después un resumen estructural global determinista (idea central y hasta ocho ramas); no genera prosa adicional ni amplía los fragmentos detallados de diapositivas.
