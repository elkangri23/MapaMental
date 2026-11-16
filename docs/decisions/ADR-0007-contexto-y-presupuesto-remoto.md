# ADR-0007: Contexto y presupuesto remoto

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto

Los proveedores remotos necesitan contexto útil, pero el usuario debe saber qué proyecto comparte y controlar gasto.

## Decisión

Enviar por defecto el elemento afectado, sus relaciones pertinentes, resumen del proyecto y conversación reciente. La UI indica proveedor y contenido sin confirmar cada petición. El usuario puede fijar presupuesto mensual en EUR o dejarlo sin límite. Tarifas entrada/salida editables por modelo; al alcanzar el límite conocido se bloquean nuevas peticiones. Si faltan uso o tarifa, avisar y permitir continuar.

## Alternativas

- Enviar siempre el proyecto completo: aumenta coste y exposición de datos sin mejorar toda petición.
- Pedir confirmación en cada uso remoto: añade fricción que el usuario no quiere.
- Solo contar peticiones: no expresa directamente el gasto.

## Consecuencias

El cálculo es estimado, no factura del proveedor. La app debe indicar claramente cuándo no puede garantizar el presupuesto.

