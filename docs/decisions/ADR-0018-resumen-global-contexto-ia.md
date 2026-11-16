# ADR-0018: Resumen global estructural en contexto IA

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Contexto:** Las sugerencias útiles deben entender el propósito general del mapa, aunque una petición desarrolle solo una rama. Enviar el contenido completo de todas las ramas ampliaría innecesariamente el contexto y expondría detalles no pertinentes.

## Decisión

El constructor compartido de contexto incluye un resumen estructural determinista, construido sin otra llamada al modelo: etiqueta de la idea central y hasta ocho etiquetas de ramas principales, cada una limitada a 120 caracteres. Si no hay raíz, usa de forma estable el primer nodo; mapas vacíos y raíces sin ramas tienen mensajes explícitos. El resumen forma parte de la vista previa y del payload que recibe el proveedor. El detalle (texto de nodos y fragmentos de diapositivas) permanece limitado al ámbito seleccionado y sus relaciones pertinentes.

## Consecuencias

- La IA puede orientar sugerencias con la estructura global sin transmitir el contenido detallado de ramas ajenas.
- Los nombres de la idea central y de las ramas principales se envían al proveedor activo aun cuando el usuario trabaje en otra rama; la vista previa lo declara.
- Los límites son previsibles y no dependen de disponibilidad o calidad del LLM. Las etiquetas del mapa son datos no confiables que deben tratarse como contenido, no como instrucciones.
- Se priorizan las primeras ramas según el orden de datos; el resumen no infiere relevancia ni genera prosa.

## Verificación

Recorrido E2E aislado el 2026-11-16: Chrome mostró el resumen de un mapa de prueba; un mock OpenAI-compatible recibió el mismo resumen y el extracto de una diapositiva vinculada a la rama seleccionada, sin recibir el marcador de una diapositiva ajena. Build de producción y `npm audit --omit=dev` pasaron; no se usó un modelo real.
