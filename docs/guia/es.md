# Guía de Espacio Visual

**Español** · [Français](fr.md) · [English](en.md) · [Volver al repositorio](../../README.md)

> Este software, incluida esta guía y las imágenes originales del repositorio, se ofrece bajo GNU AGPLv3 únicamente. Se permite el uso comercial y el alojamiento. Las versiones modificadas distribuidas o ejecutadas como servicio de red deben ofrecer su código fuente bajo la misma licencia. Conserva la atribución a `elkangri23`. Consulta [LICENSE](../../LICENSE) y [COPYRIGHT](../../COPYRIGHT). Las dependencias mantienen sus licencias propias.

## Primeros pasos

La primera vez verás un mapa de muestra. Puedes editarlo o pulsar **＋ Proyecto** y empezar con tu propia idea. Para seguir este ejemplo, llama al proyecto «Nuestro huerto escolar» y, en el lienzo vacío, pulsa **＋ Añadir idea**. Haz doble clic en «Nueva idea», escribe «Huerto escolar» y confirma con **Intro**.

1. Selecciona la idea central y pulsa **＋ Añadir idea**. Haz doble clic en la nueva tarjeta y llámala «Calendario de siembra».
2. Vuelve a seleccionar el centro antes de añadir «Riego por turnos» y «Registro de cosecha». Así las tres ramas quedan al mismo nivel.
3. Espera a **Guardado local**. La próxima vez podrás abrir el mapa desde el selector de proyectos de la barra superior.

Puedes completar el mapa y convertirlo en diapositivas sin configurar IA. El botón **?** de la barra lateral abre esta guía incluso sin conexión a Internet.

## Editar el mapa

- **Renombrar.** Haz doble clic en el nombre de una idea o dale el foco y pulsa **Intro** o **F2**. Confirma con **Intro** o cancela con **Escape**.
- **Relacionar.** Arrastra un tirador desde una idea hasta otra. El vínculo va desde la primera idea hasta la segunda. Ese sentido ayuda a delimitar qué ideas se incluyen en una rama.
- **Organizar.** Arrastra las tarjetas, cambia el zoom o pulsa **Ordenar y ajustar**. En **Vista de lista** puedes recorrer y seleccionar ideas con el teclado.
- **Eliminar.** Selecciona una rama y pulsa la papelera. La eliminación incluye sus descendientes. La idea central se conserva. El límite del mapa es de 10.000 ideas.

## Configurar la IA

Abre el engranaje **Proveedores de IA** y pulsa **Nuevo perfil** si ya tienes otro. Indica el tipo, la dirección, el modelo y la clave cuando corresponda. **Probar conexión** consulta el catálogo. Elige el identificador exacto del modelo y pulsa **Guardar**. Comprueba el modelo activo debajo del chat.

- **FreeLLMAPI.** Inicia el servicio, elige **Compatible con OpenAI** y usa `http://127.0.0.1:31415/v1`. Desde el repositorio puedes crear `.env` copiando `.env.example` si todavía no existe. Asigna tu clave a `FREELLMAPI_API_KEY` en ese archivo local. Usa un modelo disponible en tu catálogo. El servicio puede reenviar el contexto a un proveedor remoto.
- **Ollama.** Descarga un modelo, inicia Ollama y usa `http://127.0.0.1:11434` con el nombre que publica el servicio.
- **LM Studio.** Carga un modelo, activa el servidor local y usa `http://127.0.0.1:1234` con el identificador publicado.
- **OpenAI, Anthropic y otros servidores.** Elige el tipo correspondiente. Para otro servicio con API de chat compatible con OpenAI, introduce su URL base y modelo. Las direcciones remotas requieren HTTPS. Las claves introducidas en Ajustes se guardan en el almacén de credenciales de Windows.

Los perfiles remotos permiten fijar un presupuesto mensual y tarifas por modelo. Deja el límite vacío si prefieres trabajar sin presupuesto. El cálculo depende de las tarifas y del uso que comunique el proveedor. El presupuesto remoto no se aplica a una dirección local como la de FreeLLMAPI.

## Desarrollar una rama con IA

1. Selecciona «Calendario de siembra» para centrar el chat en esa rama. Selecciona la idea central para trabajar sobre el mapa completo.
2. Abre **Ver contexto** bajo el chat. Ahí puedes revisar qué ideas, relaciones, mensajes y fragmentos de diapositivas acompañarán la petición.
3. Pulsa **Generar sugerencias**. Cada tarjeta indica qué se creará y a qué idea afectará. También puedes escribir «Convierte el calendario en una tabla y marca las fechas que faltan».
4. Pulsa la tarjeta que te interese. Revisa el destino y el contenido del borrador. Aplica los cambios si te sirven o descarta la propuesta. Puedes deshacer la última aplicación mientras siga vigente su revisión.

La aplicación usa el contenido de la rama, instrucciones y filtros para evitar repeticiones. Se ha evaluado con modelos a través de FreeLLMAPI. La calidad varía por modelo. Una fecha o cantidad marcada como pendiente es un dato que puedes completar tú.

## Crear diapositivas y exportar

1. Pulsa **Crear presentación**. **Agrupar ideas del mapa** convierte el mapa localmente en entre 1 y 100 diapositivas y reparte el contenido entre título, subtítulo, desarrollo e ideas clave. **Generar con IA** permite pedir de 1 a 12 o dejar la cantidad vacía para recibir una propuesta de entre 3 y 7.
2. En el borrador de IA, revisa las diapositivas y las ideas vinculadas antes de crear o sustituir la presentación.
3. Edita títulos, subtítulos, texto e ideas clave. Usa **Anterior**, **Siguiente**, **Mover antes** y **Mover después** para recorrer u ordenar las diapositivas. Desde el editor puedes añadir o quitar diapositivas.
4. Pulsa una idea de **Ideas vinculadas** para volver a ella en el mapa. La tarjeta se centra y se resalta un instante para que la encuentres.
5. Añade una tabla de cultivos, un recorrido «Sembrar → Observar → Trasplantar» o un formulario de muestra con datos ficticios. **Mejorar con IA** prepara un borrador para la diapositiva actual.
6. **Imprimir / Guardar PDF** abre la impresión de toda la presentación en el navegador. Selecciona el destino PDF para guardarla. **Exportar PNG** guarda una imagen de la diapositiva actual.

## Guardado, perfil y privacidad

Los proyectos, el chat y las copias se guardan en este equipo. La carpeta predeterminada es `Documents\EspacioVisual\Proyectos` dentro de tu carpeta de usuario. Cada proyecto contiene un `project.json` y sus copias recuperables. Abre **Copias** para restaurar una revisión. Al restaurar se conserva una copia del estado anterior.

En **Perfil** puedes guardar nombre y correo localmente. El correo es un dato de perfil. El modo de acceso protegido con OIDC, passkeys y recuperación TOTP es experimental y tiene comprobaciones pendientes con proveedores y dispositivos reales.

Si usas IA remota, el proveedor recibe el contexto al enviar la petición. El guardado y la edición manual son locales. No hay sincronización en la nube ni edición compartida entre usuarios.

## Instalación y mantenimiento

El instalador de Windows crea accesos en Inicio. Si tienes el paquete portátil, extrae todo el ZIP y ejecuta `scripts\start-windows.cmd`. Espera a **Guardado local** y detén el servicio con `scripts\stop-windows.cmd` antes de actualizarlo. Extrae el ZIP nuevo en otra carpeta. Puedes retirar la carpeta antigua después de detener su servicio.

Si el lanzador avisa de un problema con el volumen, comprueba que la carpeta de proyectos esté en un disco interno fijo. Una carpeta de red o una unidad extraíble no sirve como ubicación de proyectos. Si caduca la sesión del navegador, guarda los cambios en la ventana original, detén el servicio y vuelve a iniciarlo.

Para hacer una copia de seguridad independiente, cierra la aplicación tras el guardado y copia la carpeta de proyectos completa. Los perfiles de proveedor están en `%APPDATA%\EspacioVisual` y el registro de uso en `%LOCALAPPDATA%\EspacioVisual`. Las claves guardadas en el almacén de Windows se configuran por separado en otro equipo.

## Preguntas frecuentes

### ¿Puedo empezar sin una cuenta ni clave de IA?

Sí. Abre un proyecto, añade ideas y usa **Crear presentación → Agrupar ideas del mapa**. Para pedir sugerencias activa un perfil de IA.

### ¿Por qué el catálogo funciona y el chat falla?

El catálogo y el chat usan peticiones distintas. Comprueba el modelo seleccionado, que el servicio sigue activo y, con un modelo local, que está cargado. Prueba una petición breve. Un error 401 indica que debes revisar la credencial. Ante un 502 del gateway, vuelve a intentarlo y comprueba si otro modelo del catálogo genera una respuesta.

### ¿Se ha entrenado un modelo propio? ¿Se ha probado LM Studio?

Se han ajustado las instrucciones, el contexto y la validación de los borradores. La evaluación real se hizo a través de FreeLLMAPI. Los adaptadores de LM Studio y Ollama están implementados y su aceptación completa con modelos locales reales sigue pendiente.

### ¿Por qué veo información pendiente en una propuesta?

Falta un dato para sustentar la respuesta. Por ejemplo, para fijar una fecha de siembra puedes precisar el lugar y la temporada en el mapa y volver a generar la propuesta.

### ¿Los formularios recogen respuestas? ¿Puedo ejecutar un diagrama?

Son representaciones visuales. Puedes editar los datos ficticios de un formulario o los pasos de un recorrido y exportarlos como parte de la diapositiva.

### ¿Cómo recupero un trabajo anterior?

Selecciona el proyecto correcto en la barra superior. Usa la opción de deshacer para la última operación de IA si sigue disponible, o abre **Copias** y elige la revisión que quieras recuperar.
