# ADR-0006: Adaptadores y credenciales de proveedores

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto

El usuario requiere OpenAI, Anthropic, LM Studio, Ollama y proveedores personalizados sin quedar atado a un único servicio.

## Decisión

Usar adaptadores separados: OpenAI, Anthropic nativo, y OpenAI-compatible para LM Studio, Ollama y perfiles personalizados. Un perfil incluye protocolo, URL base, modelo y credencial opcional. Guardar secretos fuera de archivos de proyecto, en el almacén seguro de Windows.

## Alternativas

- Un protocolo único para todos: no cubre diferencias nativas de Anthropic.
- Sistema de plugins cargables: ampliable, pero introduce carga de código y complejidad no requerida en la primera entrega.

## Consecuencias

Los errores y capacidades varían por adaptador. La UI prueba conexión e identifica el proveedor; modelo puede escribirse a mano si no se anuncia.

