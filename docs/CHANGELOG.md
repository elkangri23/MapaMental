# Historial de cambios

## Sin publicar

### Rendimiento

- Se estabilizaron las propiedades de React Flow y el callback de selección para no invalidar el canvas por cambios de estado del panel lateral.
- La vista textual del mapa crea un índice de descendientes en tiempo lineal en vez de recorrer todos los nodos y conexiones por cada idea.
- Los mapas de 100 ideas o más limitan el renderizado de React Flow a los elementos visibles. La vista de lista conserva el acceso a todo el contenido.
- Se documentó el tamaño del bundle y la medición inicial; la auditoría de escalabilidad sigue abierta.
