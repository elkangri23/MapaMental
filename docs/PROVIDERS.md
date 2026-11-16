# Proveedores de modelos

**Estado: configuración y prueba de conexión implementadas; chat, sugerencias contextuales y propuesta de expansión del mapa están implementados parcialmente en T-010.**

## Proveedores previstos

| Proveedor | Conexión | Credenciales |
|---|---|---|
| OpenAI | Adaptador de API compatible | Almacén seguro de Windows |
| Anthropic | Adaptador nativo | Almacén seguro de Windows |
| Ollama | API compatible disponible en el servidor local | Ninguna por defecto |
| LM Studio | API compatible en el servidor local | Ninguna por defecto |
| Personalizado | Protocolo compatible con OpenAI, URL base, modelo y credencial opcional | Almacén seguro de Windows |

Cada perfil tendrá nombre, protocolo, URL base cuando corresponda, modelo, estado local/remoto y credencial referenciada fuera del proyecto. La selección de modelos podrá descubrirse si el servidor lo permite o introducirse manualmente. La pantalla incluirá comprobación de conexión y errores accionables.

## Implementación actual

- Los perfiles viven en `%APPDATA%\EspacioVisual\providers.json`; contiene id, nombre, tipo, URL base, modelo, tarifas, presupuesto y proveedor activo. Las credenciales se guardan aparte.
- Las claves se guardan en Windows Credential Manager mediante `@napi-rs/keyring`. La API solo devuelve si existe una clave guardada. Al borrar un perfil se elimina también su credencial.
- Ajustes permite crear, editar, activar y eliminar perfiles; se puede introducir un modelo manualmente o consultarlo al probar la conexión.
- La prueba consulta `/v1/models` para OpenAI, LM Studio y compatibles; `/v1/models?limit=1` para Anthropic, y `/api/tags` para Ollama. Tiene un timeout de 8 segundos y no registra cabeceras ni respuestas.
- URL remotas requieren HTTPS; HTTP solo se acepta para `localhost`, `127.0.0.1` o `::1`. No se permiten credenciales en URL, query o fragmento. La petición no sigue redirecciones, resuelve DNS y fija el socket a las direcciones públicas comprobadas. Los perfiles persistidos se revalidan al leer; la respuesta se limita a 1 MiB.
- El perfil activo alimenta chat, sugerencias y generación de propuesta. En diapositivas, la propuesta incluye solo el borrador activo y las ideas fuente vinculadas; la interfaz indica el número de ideas incluidas y excluye las demás ramas. Hay atajos para ampliar, añadir recorrido o formulario ficticio. La propuesta se revisa antes de aplicar y la última aplicación se puede deshacer de forma persistente. El modelo no modifica directamente el proyecto. La integración comunica etapas de progreso por SSE y persiste el historial por proyecto. Chrome verificó que cancelar cierra el HTTP con un proveedor lento simulado. El proveedor real puede mantener cómputo interno.

Recorrido manual: Chromium guardó un perfil OpenAI con una credencial de marcador y verificó que el archivo JSON no contenía esa cadena; luego eliminó el perfil, lo que elimina también la clave del almacén. Un perfil Ollama simulado verificó chat, sugerencias y cambios de mapa. Otro mock Ollama en `http://localhost` verificó propuesta de diapositiva, revisión, aplicación, persistencia tras recarga y deshacer; esto valida cableado y formato, no conexión a Ollama real ni calidad de modelo.

## Presupuesto

En **Proveedores de IA**, el campo **Límite mensual en EUR** se puede dejar vacío. Introducir 0 bloquea todas las generaciones de ese perfil. Las tarifas de entrada y salida se guardan por modelo y se expresan en EUR por millón de tokens. Los cambios de tarifa se aplican a peticiones futuras. El gasto conocido se acumula por perfil y mes del calendario local en `%LOCALAPPDATA%\EspacioVisual\provider-usage.json`.

Al llegar al presupuesto conocido se bloquean nuevas peticiones. La petición que lo alcanzó puede terminar. Si faltan tarifas o tokens, la app señala el uso incompleto y permite continuar mientras el gasto conocido siga por debajo del límite. Si el registro no se puede leer y hay presupuesto, se pausa el envío hasta que se recupere el registro o se quite el presupuesto.

La cifra es una estimación basada en los tokens reportados y las tarifas indicadas. La factura del proveedor puede incluir impuestos, precios distintos por caché u otros cargos. El servicio admite una generación remota simultánea por perfil. Las peticiones a `localhost`, `127.0.0.1` y `::1` quedan fuera del presupuesto.


La comprobación DNS fijada al socket se incorporó en la auditoría del 2026-11-15; falta un recorrido de conexión con proveedor real/local en Windows. Consulta [`SECURITY.md`](SECURITY.md) y [`reviews/2026-11-15-security-audit.md`](reviews/2026-11-15-security-audit.md).
