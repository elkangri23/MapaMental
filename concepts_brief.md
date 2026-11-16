# Espacio visual personal asistido por IA

* **Autor:** Antonio Moles
* **Fecha:** 2026-11-14

## Overview

Aplicación web personal, local y centrada en un lienzo, para desarrollar ideas con mapas mentales, diapositivas y sugerencias de IA que se ejecutan con un clic. Los proyectos se guardan en el ordenador. Los modelos locales son importantes y se podrán configurar OpenAI, Anthropic, LM Studio y Ollama. La interfaz conserva el lienzo central y el chat lateral de MyMap con una identidad visual propia.

## Hipótesis de trabajo

Una web local y personal ayuda a convertir una idea inicial en un espacio visual que se puede seguir pensando. El usuario conversa en un panel lateral, mientras la IA propone mapas, desarrolla ramas y descubre ángulos aún no explorados, como formas de monetización, formularios de muestra o recorridos de uso. Cada sugerencia puede añadir al mismo lienzo un artefacto editable, incluidos diagramas y diapositivas, con un proveedor de modelos que el usuario configura.

**Mínimo útil confirmado por el usuario:** crear mapas mentales o diapositivas desde la aplicación con ayuda de IA. El chat también propone acciones útiles y, al pulsarlas, las desarrolla en el proyecto.

**Alcance inicial confirmado tras Goldfish:** el lienzo admite dos formatos, mapas mentales y presentaciones. Casos de uso, monetización, formularios de ejemplo y recorridos de uso son contenido que la IA desarrolla dentro de esos formatos, no tipos adicionales de lienzo en la primera versión.

**Aplicación de sugerencias aclarada por el usuario:** al pulsar una sugerencia, se aplica directamente. La interfaz indica qué parte del lienzo afectará y permite deshacer el cambio. No se requiere una vista previa previa.

**Límite local confirmado por el usuario:** los proyectos se guardan en el ordenador y la aplicación puede usar modelos locales. Se admite configurar un proveedor remoto de forma opcional, cuando el usuario lo elija.

**Persistencia local aclarada por el usuario:** guardado automático y copias locales recuperables. Los proyectos deben seguir abriéndose aunque cambie la versión de la aplicación o el modelo que los creó ya no esté disponible.

**Contexto para modelos remotos aclarado por el usuario:** cuando el usuario elige un proveedor remoto, prefiere que la IA reciba más contenido del proyecto para mantener el contexto. La app indicará claramente cuándo usa el proveedor remoto y qué contexto comparte. No pedirá confirmación en cada petición.

**Límites de uso aclarados por el usuario:** la configuración permite definir límites de uso o coste por proveedor remoto, o dejarlo sin límite si el usuario lo decide.

**Artefactos de exploración aclarados por el usuario:** los formularios incluyen datos escritos de prueba para visualizar una idea, no son funcionales ni se rellenan. Los diagramas de uso son representaciones visuales del recorrido, no prototipos interactivos.

**Presentaciones aclaradas por el usuario:** seguir el flujo observado en MyMap, que permite añadir contenido agrupado en el lienzo y también marcos independientes que se muestran como diapositivas separadas en el visor.

**Proveedores pedidos por el usuario:** OpenAI, Anthropic, LM Studio, Ollama y proveedores personalizados. No se implementará soporte específico para Strata. La primera hipótesis para proveedores personalizados es configurar protocolo compatible, URL base, modelo e información de acceso opcional.

**Dirección visual confirmada por el usuario:** conservar la distribución general de MyMap, con lienzo y chat lateral, usando un estilo visual propio.

## Lo ya observado

- MyMap generó un mapa desde un prompt y aceptó una solicitud contextual para ampliar una rama sin reemplazar las demás.
- Un nuevo prompt creó marcos de diapositiva dentro del lienzo. Los marcos independientes aparecieron como páginas separadas en el visor.
- El chat mostró sugerencias contextuales que cambiaban al cambiar el artefacto. El usuario vio sugerencias sobre monetización, formularios ficticios y diagramas de uso de una aplicación.
- El usuario pide que la IA sugiera líneas útiles de exploración, por ejemplo casos de uso, recorridos, actores y necesidades, alternativas, riesgos, validación, monetización y formularios ilustrativos. En la primera versión esas ideas se expresan como nodos del mapa mental o como contenido de diapositivas, sin añadir nuevos tipos de lienzo.
- La recarga conservó el mapa, los marcos y el historial del chat.
- En la cuenta gratuita, la generación probada usó DeepSeek V4 Flash. El menú mostró PDF de marcos como Pro. El PNG presentó un indicador «Descarga lista», y se encontraron transferencias temporales con firma PNG válida.

## Análisis Goldfish

Se completaron las siete lentes de BRAINSTORM: diseño y economía, YAGNI, comprensión y UX, observabilidad, compatibilidad y persistencia, mantenibilidad y contradicciones.

### Hallazgos principales

- **Alcance y prioridad.** El núcleo confirmado son mapas mentales, diapositivas y sugerencias accionables. El catálogo abierto de casos de uso, actores, riesgos, validación, monetización y otros artefactos podría ampliar demasiado la primera versión. Recomendación Goldfish: empezar por mapa, diapositivas y chat contextual. Probar otros artefactos como sugerencias puntuales y añadirlos según uso.
- **Cambios seguros en el lienzo.** Una sugerencia debe decir qué va a crear o modificar y sobre qué ámbito. La aplicación debe conservar el contenido fuera de ese ámbito, permitir revisar el cambio y poder deshacerlo. La salida del proveedor se valida antes de confirmarla en el proyecto.
- **Configuración de modelos.** Los cuatro proveedores acordados tienen protocolos y capacidades distintos. La configuración debería indicar proveedor y modelo activos, comprobar conexión y explicar errores. Los límites de contexto, streaming, formato estructurado, coste remoto y recursos de modelos locales aún deben acordarse.
- **Privacidad, coste y recursos.** Los proyectos son locales, pero una petición a un proveedor remoto transmite el contexto incluido en esa petición. Antes de cada uso remoto debe quedar claro qué datos salen y a qué proveedor. Conviene enviar solo el contexto necesario, ofrecer límites de generación y cancelación, y dejar diagnóstico local sin guardar prompts por defecto.
- **Persistencia y cambios de formato.** El usuario confirmó guardado automático, copias recuperables y proyectos que sobreviven a cambios de versión y de modelo. Sigue pendiente definir un formato local versionado, identificadores estables y escritura recuperable ante un cierre o disco lleno.
- **Diagnóstico y mantenimiento.** Hace falta distinguir fallos del modelo, proveedor, validación, aplicación del cambio y guardado. Un identificador de petición que conecte chat, generación, validación y persistencia ayudaría a entender fallos sin registrar el contenido del proyecto. Las fronteras de proveedor, artefactos, operaciones de lienzo y estado del proyecto deben evitar que cada modelo o tipo de diagrama acople todo el chat.
- **Contradicciones.** La lente inventiva no detectó una falsa disyuntiva que requiera patrones arquitectónicos adicionales en esta fase.

### Estado de los revisores

| Lente | Estado |
|---|---|
| Diseño y economía | Completo |
| YAGNI y simplicidad | Completo |
| Comprensión y UX | Completo |
| Observabilidad y diagnóstico | Completo |
| Compatibilidad y persistencia | Completo |
| Mantenibilidad | Completo |
| Contradicciones inventivas | Completo |

Resultado de la crítica: **0 bloqueos, hallazgos mayores de diseño por resolver y algunos puntos menores**. Los hallazgos mayores reflejan decisiones pendientes en una idea temprana, no defectos de una implementación existente. No hay código de producto en el directorio de este proyecto para verificar reutilización de componentes.

### Resoluciones tras la crítica

- **Alcance de la primera versión, resuelto:** solo mapas mentales y presentaciones como formatos de lienzo. Los casos de uso, monetización, formularios de muestra y recorridos serán contenido dentro de esos dos formatos.
- **Aplicación de sugerencias, resuelto:** se ejecutan al pulsarlas, indican qué parte del lienzo cambiará y ofrecen deshacer. La primera versión no necesita una pantalla de vista previa.
- **Datos enviados a proveedores remotos, resuelto:** si el usuario elige un modelo remoto, la IA recibe más contexto del proyecto y la interfaz explica claramente cuándo ocurre y qué contexto comparte. No hay confirmación repetida en cada petición.
- **Límites de proveedores remotos, resuelto:** el usuario puede fijar límites de uso o coste o elegir operar sin límite.
- **Persistencia, resuelto en EGM Draft:** carpeta con JSON versionado, escritura temporal y reemplazo, 20 copias recuperables, migración protegida y apertura de esquemas futuros en modo de solo lectura.
- **Proveedores, resuelto en EGM Draft:** adaptadores para OpenAI, Anthropic, LM Studio y Ollama; perfiles personalizados compatibles con OpenAI; credenciales fuera del proyecto.
- **Presupuesto remoto, resuelto en EGM Draft:** presupuesto mensual en EUR, tarifas editables por modelo y aviso cuando falten datos para estimar.

## Goals vs. Non-Goals

- **Metas confirmadas:** crear mapas mentales y diapositivas mediante la aplicación y la IA; recibir sugerencias contextuales que se desarrollan al pulsarlas; conservar proyectos en el ordenador; ofrecer modelos locales y los proveedores OpenAI, Anthropic, LM Studio y Ollama; mantener la distribución lienzo más chat con identidad visual propia.
- **Metas de experiencia observadas y confirmadas:** ampliar una rama conservando otras; añadir tanto contenido agrupado como marcos de diapositiva independientes; guardar y recuperar el trabajo al recargar; guardar automáticamente y permitir restaurar copias locales; abrir proyectos tras actualizaciones y aunque cambie el modelo.
- **Fuera del alcance inicial confirmado:** soporte específico para Strata; formularios funcionales; prototipos interactivos de aplicaciones; tipos de lienzo adicionales a mapas mentales y presentaciones.
- **Decisiones añadidas en EGM Draft:** web con servicio local para Windows, TypeScript de extremo a extremo, React Flow, proyectos JSON, mapa y presentación enlazados, HTTP/SSE, cambios IA atómicos, visor y exportación PDF/PNG. El diseño técnico sigue pendiente de revisión Goldfish.

## Alternatives Weighed

- **Autor:** no se decidió imitar marca, colores y componentes exactos de MyMap. Se conservará la distribución del lienzo y chat con una apariencia propia.
- **Autor:** se dejó Strata fuera del alcance.
- **Goldfish:** posponer el catálogo amplio de artefactos hasta que los usos concretos lo justifiquen.
- **Goldfish:** preferir sugerencias contextuales y peticiones libres al obligar a elegir una categoría de artefacto antes de empezar.

## Key Decisions & Staging for Next Steps

1. El lienzo inicial tendrá solo mapas mentales y presentaciones. Casos de uso, monetización, formularios de ejemplo y recorridos serán contenido que la IA propone dentro de esos formatos.
2. Las sugerencias se aplican al pulsarlas, indican qué parte del lienzo cambiará, conservan el contenido ajeno al alcance y permiten deshacer el cambio. No hace falta una vista previa previa.
3. Para un proveedor remoto, se comparte más contenido del proyecto y la interfaz lo indica claramente sin pedir confirmación en cada petición.
4. Completar el diseño técnico y revisar el documento de diseño con Goldfish.
5. Mantener ADR, documentación y tasks sincronizados con el código a medida que avance la implementación.
