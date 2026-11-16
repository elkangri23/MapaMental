# EGM Stage 8 — Zoom intermedio

**Documento:** `docs/designs/espacio-visual-personal.md`  
**Fecha:** 2026-11-14

## Hallazgos

### Mayor — Entrega de funciones en una sola primera entrega

**Ámbito:** Goals, proveedores, persistencia, presentación y Detailed Implementation Plan.  
**Riesgo:** La primera versión final incluye varios conectores, presupuesto, SSE/cancelación, copias, migraciones, visor, exportación e instalador. No se aprecia una frontera de entregas que permita aprender del flujo central antes de completar todas esas piezas.  
**Resolución propuesta:** Conservar el alcance personal confirmado y separar incrementos construibles. El roadmap ya define M0–M4; documentar que esos hitos son pasos internos de v1, no lanzamientos independientes, y que el instalador se deja para el cierre.

### Nit — Recomendaciones de la ronda anterior no estaban incorporadas

El revisor trató recomendaciones de `critic_report.md` como si ya se hubieran aplicado al documento. La especificación no había cambiado entre etapas; por tanto, sus críticas sobre exceso de detalle no describen una regresión. Se consideran sugerencias editoriales, no hallazgos de cambios efectuados.

### Nit — Los detalles de diapositiva se pueden resumir a contratos observables

**Ámbito:** Persistencia, presentación y exportación.  
**Resolución:** Mantener en el contrato que las diapositivas son editables, ordenadas, reflejan el número solicitado y exportan una página por diapositiva. Los tipos internos de bloque y la representación de referencias se documentan en la especificación técnica, no como explicación de la experiencia.

