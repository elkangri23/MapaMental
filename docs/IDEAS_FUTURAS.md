# Ideas de extensiones futuras

**Estado:** exploración. Estas ideas no están aprobadas, no forman parte del alcance comprometido de v1 y no crean tareas en [`TASKS.md`](TASKS.md). Se priorizarán después de estabilizar las funciones actuales.

El producto seguirá centrado en **mapas mentales y presentaciones**. Las extensiones propuestas amplían la ayuda, el contenido, la navegación o las salidas de esos dos formatos; no añaden lienzos independientes sin una decisión posterior.

## Candidatas de mayor valor

| Prioridad sugerida | Extensión | Valor de uso | Tamaño orientativo |
|---|---|---|---|
| 1 | Sugerencias por huecos y etapa | Detectar qué falta en la idea actual y proponer acciones concretas —como monetización, calendario, riesgos o pasos de uso— usando el mapa, la conversación y las diapositivas. Cada tarjeta mostraría el nodo de origen, el resultado esperado y si añade una idea, amplía una diapositiva o crea otra. | M |
| 2 | Generación de brief y plan desde el mapa | Crear un brief, casos de uso, requisitos, criterios de éxito, riesgos y un plan de validación a partir de las ideas seleccionadas. El resultado se revisa y se incorpora a diapositivas; no se crea un tercer tipo de lienzo. | M |
| 3 | Fuentes, evidencias y preguntas pendientes | Asociar notas, URLs y documentos a las ideas; distinguir hipótesis, hechos y decisiones; detectar afirmaciones sin fuente y generar preguntas de validación. En peticiones remotas, mostrar exactamente qué extractos se enviarán. | L |
| 4 | Versiones con hitos y comparación | Crear puntos de control con nombre antes de cambios importantes; comparar mapas y presentaciones, ver qué cambió y restaurar una versión sin depender solo de backups automáticos. | M |
| 5 | Exportación editable y formatos portables | Exportar/importar mapas con OPML o Markdown y convertir presentaciones a PPTX. Mantener IDs de origen cuando el formato lo permita y avisar qué bloques no tienen equivalente. | L |
| 6 | Temas y diseños de presentación | Añadir temas visuales, tipografía, paletas y composiciones alternativas; guardar preferencias por proyecto y conservar una salida legible en PDF y PNG. | M |

## Otras extensiones posibles

### Organización y reutilización

- **Búsqueda global y paleta de comandos:** encontrar proyectos, ideas, diapositivas y mensajes; ejecutar acciones con teclado sin recorrer paneles.
- **Biblioteca personal de fragmentos:** guardar ideas, tablas, formularios ficticios, recorridos y prompts propios para reutilizarlos en otros mapas, conservando procedencia y evitando copiar credenciales o datos de configuración.
- **Plantillas de proyecto guiadas:** empezar con estructuras para analizar una idea, diseñar monetización, describir casos de uso o preparar una presentación. Las plantillas crearían nodos y diapositivas editables y ofrecerían ejemplos claramente ficticios.
- **Etiquetas y filtros:** marcar ideas por estado (hipótesis, por validar, decidida, descartada) y filtrar el mapa sin eliminar relaciones.

### Más control sobre la IA

- **Perfiles por tarea:** elegir un modelo para sugerencias, otro para redacción y otro para presentaciones, con un indicador claro de qué proveedor recibirá cada petición.
- **Comparación de modelos locales:** ejecutar el mismo prompt de muestra contra Ollama y LM Studio, revisar calidad/tiempo/coste estimado y escoger el perfil. No enviaría datos del proyecto durante una comparación de prueba.
- **Revisión crítica opcional:** pedir a la IA que encuentre supuestos, contradicciones, riesgos o información que falta, y presentar cada hallazgo como una sugerencia que se pueda aceptar o descartar.
- **Reescritura con tono y audiencia:** adaptar una rama o diapositiva a perfiles como equipo técnico, dirección o cliente, manteniendo visible la versión anterior y el origen del contenido.
- **Presupuesto de contexto visible:** permitir elegir qué ramas, mensajes y diapositivas incluir, y mostrar tamaño aproximado antes de cada petición remota.

### Presentación y captura

- **Notas del presentador y guion oral:** generar notas aparte del contenido proyectado, por diapositiva, que no se incluyan por defecto en PDF público.
- **Variantes visuales de una misma presentación:** crear una versión ejecutiva, breve o didáctica sin sustituir la original y mostrar las diferencias antes de aplicarla.
- **Imágenes de apoyo para diapositivas:** generar o seleccionar ilustraciones, iconos y fondos con un modelo local o remoto; pedir confirmación antes de guardar cada asset y explicar si se envía un prompt o una imagen fuera del equipo.
- **Diagramas estáticos adicionales:** matrices, líneas temporales, embudos, mapas de actores o diagramas de secuencia como bloques visuales editables dentro de las diapositivas. Deben tener una alternativa textual equivalente y no convertirse en prototipos ejecutables.
- **Captura por voz local:** dictar una idea y ubicarla en la rama seleccionada mediante reconocimiento de voz local, con confirmación antes de añadirla.
- **Asistente de ensayo:** recorrer las diapositivas con temporizador opcional y sugerencias de ritmo, sin grabar audio por defecto.

### Integridad y portabilidad

- **Importación de fuentes:** extraer texto de Markdown, PDF o DOCX y proponer nodos con citas a página o sección; el usuario revisa cada extracción y no se suben documentos sin una elección explícita.
- **Paquete de proyecto portátil:** exportar un ZIP con JSON, assets elegidos y manifiesto; excluir claves, perfiles, métricas privadas y backups salvo que el usuario los seleccione expresamente.
- **Protección local opcional:** documentar permisos y, si el riesgo lo justifica, ofrecer cifrado de proyectos con una recuperación clara; nunca guardar la clave junto al archivo cifrado.
- **Reparación y diagnóstico local:** detectar JSON dañado o assets ausentes y ofrecer un informe legible y restauración desde copia, sin enviar telemetría.

## Ideas que no parecen prioritarias ahora

- **Colaboración en tiempo real y cuentas en la nube:** añaden sincronización, identidad, conflictos y tratamiento remoto a una aplicación planteada para uso personal local.
- **Prototipos funcionales o formularios que recopilan datos:** contradicen el alcance actual de diagramas y maquetas estáticas.
- **Plugins que ejecutan código de terceros:** amplían la superficie de ataque y son innecesarios para poder seleccionar cualquier proveedor compatible con OpenAI API.
- **Soporte específico de Strata:** se descartó para este proyecto.
- **Analítica centralizada de uso:** no aporta lo suficiente a la experiencia personal como para justificar telemetría externa.

## Secuencia sugerida

1. Terminar la versión base: proveedores reales/locales, sugerencias útiles, exportación, instalador y verificaciones de seguridad/accesibilidad.
2. Probar primero sugerencias por huecos y plantillas con el ejemplo de siembra y otros mapas reales del usuario.
3. Añadir versiones/comparación si la edición frecuente empieza a hacer valiosos los checkpoints manuales.
4. Priorizar fuentes e importación cuando el usuario necesite convertir documentación extensa en mapas con referencias.
5. Dejar colaboración y extensibilidad por código fuera del plan mientras el uso siga siendo local y personal.

## Criterios para aceptar una extensión

- Resuelve una necesidad observada en el uso cotidiano y permanece dentro de mapas o presentaciones.
- Tiene una forma de revisión y reversión cuando la IA cambia contenido.
- Deja claro qué parte del proyecto afecta, qué datos usa y si salen del equipo.
- Respeta proveedores configurables y permite continuar con modelos locales cuando la función no dependa de una capacidad remota.
- Incluye alternativa accesible para contenido visual y un criterio comprobable de salida.
- Se incorpora a [`TASKS.md`](TASKS.md) solo después de decidir alcance, prioridad y dependencias.
