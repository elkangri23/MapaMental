# Proveedores de modelos

La aplicación incluye perfiles para OpenAI, Anthropic, Ollama, LM Studio y servidores que implementen el protocolo compatible con OpenAI. La compatibilidad de protocolo no implica que todos los modelos den la misma calidad.

## FreeLLMAPI y clave en .env

En la carpeta principal de MapaMental, crea un archivo `.env` a partir de `.env.example` y rellena `FREELLMAPI_API_KEY`. En **Proveedores de IA**, crea o selecciona un perfil **Compatible con OpenAI** con URL base `http://127.0.0.1:31415/v1`. Deja vacío el campo de clave y usa **Probar conexión** para cargar los modelos.

La clave del archivo tiene prioridad para esa URL exacta. El servicio vuelve a leerla en cada conexión o generación, así que puedes reemplazarla sin reiniciar. Git excluye `.env` y solo versiona la plantilla vacía. FreeLLMAPI puede enviar peticiones a proveedores remotos aunque la URL de entrada sea local.


**Estado (2026-11-18):** configuración y adaptadores implementados. Chat, sugerencias y propuestas se han evaluado con modelos reales a través de FreeLLMAPI; Ollama y LM Studio locales siguen pendientes de aceptación integral en este equipo. La prueba de conexión consulta el catálogo de modelos y no garantiza que el modelo complete una generación.

## Tipos de proveedor disponibles

| Proveedor | Conexión | Credenciales |
|---|---|---|
| OpenAI | API compatible | Almacén seguro de Windows |
| Anthropic | API nativa | Almacén seguro de Windows |
| Ollama | API local; predeterminado `http://127.0.0.1:11434` | Ninguna por defecto |
| LM Studio | API compatible con OpenAI; predeterminado `http://127.0.0.1:1234` | Ninguna por defecto |
| Compatible con OpenAI | URL base y modelo indicados por el usuario | Almacén seguro de Windows o `.env` para el gateway FreeLLMAPI documentado |

Cada perfil tiene nombre, tipo, URL base, modelo, selección activa y credencial referenciada fuera del proyecto. Los modelos se pueden descubrir si el servidor lo permite o introducir manualmente.

## Implementación actual

- Los perfiles viven en `%APPDATA%\EspacioVisual\providers.json`; contiene id, nombre, tipo, URL base, modelo, tarifas, presupuesto y proveedor activo. Las credenciales se guardan aparte.
- Las claves se guardan en Windows Credential Manager mediante `@napi-rs/keyring`. La API solo devuelve si existe una clave guardada. Al borrar un perfil se elimina también su credencial.
- Ajustes permite crear, editar, activar y eliminar perfiles; se puede introducir un modelo manualmente o consultarlo al probar la conexión.
- La prueba consulta `/v1/models` para OpenAI, LM Studio y compatibles; `/v1/models?limit=1` para Anthropic, y `/api/tags` para Ollama. Tiene un timeout de 8 segundos y no registra cabeceras ni respuestas.
- URL remotas requieren HTTPS; HTTP solo se acepta para `localhost`, `127.0.0.1` o `::1`. No se permiten credenciales en URL, query o fragmento. La petición no sigue redirecciones, resuelve DNS y fija el socket a las direcciones públicas comprobadas. Los perfiles persistidos se revalidan al leer; la respuesta se limita a 1 MiB.
- El perfil activo alimenta chat, sugerencias y generación de propuesta. En diapositivas, la propuesta incluye solo el borrador activo y las ideas fuente vinculadas; la interfaz indica el número de ideas incluidas y excluye las demás ramas. Hay atajos para ampliar, añadir recorrido o formulario ficticio. La propuesta se revisa antes de aplicar y la última aplicación se puede deshacer de forma persistente. El modelo no modifica directamente el proyecto. La integración comunica etapas de progreso por SSE y persiste el historial por proyecto. Chrome verificó que cancelar cierra el HTTP con un proveedor lento simulado. El proveedor real puede mantener cómputo interno.

Recorridos: la UI y el servidor se probaron con Ollama simulado para chat, sugerencias, propuestas y ciclo aplicar/persistir/deshacer; una prueba de credenciales verificó que una clave ficticia no aparece en `providers.json`. Con FreeLLMAPI real se evaluaron gpt-oss-20b y gpt-oss-120b para sugerencias por rama, tablas de calendario, recorridos, formularios ficticios, persistencia y deshacer; también se observaron respuestas incompletas y desviaciones con algunos modelos. Estas evaluaciones sirvieron para ajustar prompts, contexto y filtros, pero no constituyen una garantía general de calidad ni un fine-tuning.

### Calidad de sugerencias: qué se afinó y qué no

- El contexto incluye el ámbito seleccionado, ancestros, relaciones pertinentes y fragmentos limitados de diapositivas vinculadas; la vista previa permite revisar qué se enviará.
- Las instrucciones priorizan acciones diferentes, la rama seleccionada y brechas expresamente indicadas en el mapa. El servidor descarta destinos inválidos, etiquetas exactas duplicadas en descendientes y algunos cruces temáticos con ramas hermanas.
- Se recuperan formatos explícitos (tabla, diagrama/recorrido o formulario ficticio) que algunos modelos omiten. Los datos no respaldados pueden marcarse como pendientes de confirmar.
- No se entrenaron ni ajustaron pesos de modelos. El filtro exacto no detecta todas las paráfrasis semánticas; la respuesta depende del modelo, su configuración y el contenido del proyecto.
- LM Studio usa el adaptador compatible con OpenAI y consulta `/v1/models`. El adaptador está compilado y los recorridos simulados comprueban el cableado; falta aceptar chat, sugerencias y propuestas contra un servidor/modelo LM Studio real. La aceptación real de Ollama local también sigue pendiente.

## Presupuesto

En **Proveedores de IA**, el campo **Límite mensual en EUR** se puede dejar vacío. Introducir 0 bloquea todas las generaciones de ese perfil. Las tarifas de entrada y salida se guardan por modelo y se expresan en EUR por millón de tokens. Los cambios de tarifa se aplican a peticiones futuras. El gasto conocido se acumula por perfil y mes del calendario local en `%LOCALAPPDATA%\EspacioVisual\provider-usage.json`.

Al llegar al presupuesto conocido se bloquean nuevas peticiones. La petición que lo alcanzó puede terminar. Si faltan tarifas o tokens, la app señala el uso incompleto y permite continuar mientras el gasto conocido siga por debajo del límite. Si el registro no se puede leer y hay presupuesto, se pausa el envío hasta que se recupere el registro o se quite el presupuesto.

La cifra es una estimación basada en los tokens reportados y las tarifas indicadas. La factura del proveedor puede incluir impuestos, precios distintos por caché u otros cargos. El servicio admite una generación remota simultánea por perfil. Las peticiones a `localhost`, `127.0.0.1` y `::1` quedan fuera del presupuesto.


La comprobación DNS fijada al socket se incorporó en la auditoría del 2026-11-15. FreeLLMAPI real ya se ha usado para evaluación semántica; la aceptación con Ollama/LM Studio locales reales en Windows sigue pendiente. Consulta [`SECURITY.md`](SECURITY.md) y [`reviews/2026-11-15-security-audit.md`](reviews/2026-11-15-security-audit.md).
