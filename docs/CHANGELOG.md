# Historial de cambios

## Sin publicar

### Autenticación y recuperación

- El renombrado y la revocación de passkeys revalidan sesión, identidad y UV reciente justo antes de modificar el almacén.
- Los errores del Administrador de credenciales de Windows ya no se interpretan como ausencia o baja de TOTP.
- La gestión de passkeys y la confirmación de baja TOTP usan formularios y avisos en página en lugar de `prompt`/`confirm` del navegador.

### Seguridad y persistencia

- Las copias de proyectos limpian archivos destino parciales cuando falla la escritura o la verificación; un destino preexistente por `EEXIST` se conserva.
- La falta de espacio (`ENOSPC`) devuelve HTTP 507 con un mensaje que orienta a liberar espacio, sin revelar rutas del equipo.

### Rendimiento

- Se estabilizaron las propiedades de React Flow y el callback de selección para no invalidar el canvas por cambios de estado del panel lateral.
- La vista textual del mapa crea un índice de descendientes en tiempo lineal en vez de recorrer todos los nodos y conexiones por cada idea.
- Los mapas de 100 ideas o más limitan el renderizado de React Flow a los elementos visibles. La vista de lista conserva el acceso a todo el contenido.
- React Flow y sus estilos se cargan bajo demanda cuando se abre el lienzo; el chunk de entrada baja a 333,57 kB y el canvas queda en un chunk diferido de 185,84 kB. El total de JavaScript no disminuye de forma material.
- Se documentó el tamaño del bundle y la medición inicial; la auditoría de escalabilidad sigue abierta.
