# MapaMental · Espacio Visual

**Espacio Visual** es una aplicación personal para Windows que convierte ideas en mapas mentales y presentaciones editables. Puedes trabajar sin IA, conectar un modelo local con Ollama o LM Studio, o usar un proveedor remoto compatible.

> **Estado:** versión 0.1.x en desarrollo. Mapas, guardado local, chat, sugerencias, borradores de diapositiva y exportación están implementados. La calidad de las sugerencias se ha afinado mediante instrucciones, contexto por rama y filtros; **no se ha entrenado un modelo propio**. Las evaluaciones reales se hicieron a través de FreeLLMAPI. El adaptador de LM Studio existe, pero aún falta completar la aceptación con un servidor y modelos locales reales. Consulta [Estado del proyecto](docs/STATUS.md) y [Tareas pendientes](docs/TASKS.md).

## Empieza en cinco minutos

1. Instala la aplicación con el paquete de Windows o arráncala desde el repositorio, como se explica abajo.
2. La primera vez se abre un mapa de muestra con una idea central y cuatro ramas. Puedes editarlo o pulsar **＋ Proyecto** para empezar una idea nueva.
3. Escribe una idea central. Pulsa **＋ Añadir idea** para crear una rama bajo la idea seleccionada.
4. Si quieres ayuda de IA, abre **⚙ Proveedores de IA**, configura y activa un perfil y vuelve al mapa.
5. Pulsa **Generar sugerencias** en el panel del chat. Elige una tarjeta para desarrollar su propuesta, revisa el borrador y aplícalo solo cuando estés conforme.
6. Pulsa **Crear presentación** para convertir el mapa en diapositivas. El guardado es automático; espera a **Guardado local** antes de cerrar.

El botón **?** dentro de la aplicación abre la guía completa con pasos para mapas, IA, diapositivas, proveedores y preguntas frecuentes.

## Instalación en Windows

La primera entrega está dirigida a Windows 10/11 x64. Si recibiste un instalador `EspacioVisual-*-Setup-x64.exe`, ejecútalo para instalar por usuario y abre Espacio Visual desde el menú Inicio. Para detener el servicio usa el acceso de parada que acompaña al paquete.

Si recibiste el ZIP portátil:

1. Extrae **todo** el ZIP en una carpeta local donde tengas permiso de escritura.
2. Ejecuta `scripts\start-windows.cmd`.
3. Espera a que se abra la aplicación en el navegador.
4. Guarda y detén la aplicación con `scripts\stop-windows.cmd` antes de actualizar o retirar esa carpeta.

El paquete incluye Node 24. Para actualizar, guarda tus cambios y ejecuta el instalador nuevo o extrae la versión nueva del ZIP. Los proyectos y ajustes están fuera de la carpeta de programa y se conservan; aun así, se recomienda verificar que aparece **Guardado local** antes de actualizar. Rutas de datos, solución de problemas y retirada se explican en [Instalación](docs/INSTALLATION.md).

## Ejecutar desde el código fuente

Requisitos: Windows 10/11 x64, Node.js 24 y npm. Desde PowerShell, en la raíz del repositorio:

```powershell
npm install
npm run dev
```

El comando inicia el servicio y la interfaz de desarrollo en direcciones loopback. Para una compilación de producción local:

```powershell
npm run build
.\scripts\start-local.ps1
```

Consulta [Desarrollo](docs/DEVELOPMENT.md) para preparar paquetes. No expongas el servidor en una red: la aplicación está diseñada para uso local.

## Configurar un modelo de IA

Abre **⚙ Proveedores de IA**. Elige un tipo, indica el modelo, pulsa **Probar conexión** y luego **Guardar**. La prueba consulta el catálogo de modelos; que ese paso funcione no garantiza que el modelo acepte una generación de chat. La clave de un servicio remoto se guarda en el almacén de credenciales de Windows, no en el proyecto.

### LM Studio

1. Abre LM Studio, carga un modelo y activa su servidor local compatible con OpenAI.
2. En Espacio Visual, elige **LM Studio**. La URL predeterminada es `http://127.0.0.1:1234`.
3. Prueba la conexión y elige el ID de modelo que publique LM Studio. Si no aparece en la lista, escribe el ID manualmente.

La integración con la API compatible está implementada. En este proyecto todavía falta completar la validación de chat, sugerencias y propuestas con LM Studio y un modelo local real. Si la lista de modelos responde, pero la generación falla, revisa que el servidor siga activo, que el modelo esté cargado y que el ID coincida.

### Ollama

Inicia Ollama y descarga/carga un modelo, por ejemplo desde su propia aplicación o CLI. En Espacio Visual, elige **Ollama**; la URL predeterminada es `http://127.0.0.1:11434`. Prueba la conexión y selecciona o escribe el nombre exacto del modelo.

### FreeLLMAPI

FreeLLMAPI se configura como un perfil **Compatible con OpenAI**; no es un protocolo distinto. Para el gateway local descrito por el proyecto, la URL base es `http://127.0.0.1:31415/v1`. En un checkout de desarrollo, la clave puede colocarse en `.env` a partir de `.env.example`:

```dotenv
FREELLMAPI_API_KEY=
```

Rellena el valor solo en tu copia local. `.env` está excluido de Git: no publiques ni pegues la clave en issues, documentación o chat. Aunque el gateway esté en `127.0.0.1`, FreeLLMAPI puede reenviar la petición a proveedores remotos.

### Otros proveedores

- **OpenAI:** API oficial y clave API.
- **Anthropic:** API nativa y clave API.
- **Compatible con OpenAI:** servidores propios que implementen el protocolo de chat compatible; indica su URL base y modelo.

Las URL remotas requieren HTTPS. Para presupuestos, los perfiles remotos permiten fijar un límite mensual y tarifas por modelo; deja vacío el límite si no quieres definir uno. El cálculo es una estimación, no una garantía de facturación. Más detalles en [Proveedores y costes](docs/PROVIDERS.md).

## Crear un mapa

- La idea central es el tema o pregunta que quieres explorar.
- Selecciona una idea antes de añadir otra: así la nueva se organiza como hija de esa rama.
- Edita una idea con doble clic, o selecciónala y pulsa **Intro** o **F2**. Pulsa **Intro** para confirmar o **Escape** para cancelar.
- Arrastra los tiradores de una idea a otra para dibujar una conexión. Las conexiones indican relaciones adicionales y no cambian la jerarquía.
- Arrastra ideas para reorganizarlas, pulsa **Ordenar** para distribuirlas o cambia a **Vista de lista** para recorrerlas con teclado.
- Para quitar una rama, selecciónala y usa la papelera. Se eliminan sus descendientes; las conexiones que ya no corresponden también desaparecen.

El guardado es automático. **Copias** permite restaurar revisiones recuperables y guarda el contenido actual antes de restaurar.

## Usar chat y sugerencias

Selecciona una rama para acotar el trabajo. Puedes pedir sugerencias generales con **Generar sugerencias**, escribir una pregunta en el chat o pulsar una tarjeta para convertirla en una propuesta concreta. Las tarjetas pueden sugerir ampliar el mapa o crear diapositivas con tablas, recorridos o formularios de ejemplo.

Antes de enviar, abre **Contexto enviado** para revisar el proveedor, el ámbito y los fragmentos de diapositivas incluidos. Con un proveedor remoto se envía ese contexto fuera del equipo. La IA devuelve un borrador: puedes revisarlo, modificar las partes editables, aplicarlo o descartarlo. La última operación se puede deshacer.

Las instrucciones se han ajustado para priorizar acciones distintas y relevantes para la rama, utilizar vacíos explícitos del mapa y reducir datos inventados o duplicados. La validación exacta de etiquetas no detecta todas las paráfrasis semánticas; los modelos también difieren en calidad. Revisa siempre el contenido generado, sobre todo fechas, cifras, datos externos y recomendaciones.

## Crear y exportar una presentación

Pulsa **Crear presentación** y elige **Agrupar ideas del mapa** para una conversión local o **Generar con IA** para crear un borrador. La conversión local permite de 1 a 100 diapositivas. La generación IA permite de 1 a 12; si dejas la cantidad vacía, el modelo propone entre 3 y 7. La propuesta se muestra antes de reemplazar la presentación actual.

En el editor puedes cambiar título, subtítulo, texto e ideas clave; añadir, mover y eliminar diapositivas; y añadir tablas, recorridos visuales o formularios ficticios. Puedes mejorar la diapositiva actual con IA, imprimir/guardar toda la presentación como PDF o exportar la diapositiva actual a PNG.

Los formularios son estáticos y llevan datos ficticios: no recogen ni envían información. Los diagramas son representaciones visuales, no prototipos ejecutables.

## Privacidad y límites conocidos

- Los proyectos y copias se guardan en el equipo. No hay sincronización en nube ni colaboración multiusuario.
- La aplicación solo envía datos a IA cuando el usuario solicita chat, sugerencias o generación. Revisa el contexto si usas un proveedor remoto.
- Los modelos no se entrenan desde la aplicación y los resultados pueden incluir errores.
- OIDC, passkeys y recuperación TOTP son un modo protegido experimental; consulta la [guía de autenticación](docs/AUTH_OPERATIONS.md) antes de activarlo.
- Aún faltan aceptación real de LM Studio/Ollama locales, revisión manual completa WCAG y algunos recorridos del instalador. El detalle está en [Estado](docs/STATUS.md).

## Documentación

- [Instalación, actualización y retirada](docs/INSTALLATION.md)
- [Desarrollo desde el código fuente](docs/DEVELOPMENT.md)
- [Proveedores de IA, FreeLLMAPI y presupuestos](docs/PROVIDERS.md)
- [Proyectos, guardado y copias](docs/STORAGE.md)
- [Seguridad y privacidad](docs/SECURITY.md)
- [Tareas y roadmap](docs/TASKS.md) · [Estado actual](docs/STATUS.md)
- [Índice de documentación](docs/INDEX.md)
