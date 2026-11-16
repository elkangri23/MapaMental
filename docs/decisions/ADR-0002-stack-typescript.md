# ADR-0002: Stack TypeScript

- **Estado:** Aceptado
- **Fecha:** 2026-11-14

## Contexto

No hay código anterior ni stack existente. El usuario quiere mantener interfaz y servicio local en una tecnología común.

## Decisión

Usar React y TypeScript con Vite para web; Node.js 24 LTS con Fastify para servicio; npm workspaces con contratos compartidos y React Flow para el lienzo.

## Alternativas

- Servicio Python: ecosistema IA distinto, pero requiere mantener dos lenguajes.
- SVG propio: más control, pero obliga a construir navegación y selección de grafo.
- Motor general de pizarra: flexible, aunque necesita adaptar el modelo de mapa y orden de presentación.

## Consecuencias

Se comparte lenguaje y contratos. Se requiere Node 24 para desarrollo y se incluye runtime compatible en el instalador. El modelo de distribución del mapa sigue siendo código propio sobre React Flow.

