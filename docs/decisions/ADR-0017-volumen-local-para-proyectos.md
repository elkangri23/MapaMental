# ADR-0017: Volumen local fijo para proyectos

- **Estado:** Aceptado
- **Fecha:** 2026-11-16
- **Relacionado:** [ADR-0003](ADR-0003-proyecto-json-y-copias.md), [ADR-0015](ADR-0015-formato-persistido-proyecto-v3.md)

## Contexto

El diseño v1 limita proyectos a almacenamiento local fijo, pero el servicio antes solo normalizaba `ESPACIO_VISUAL_PROJECTS_DIR`. UNC, unidades asignadas, carpetas montadas y dispositivos extraíbles no se distinguían antes de escribir.

## Decisión

- Al arrancar, antes de escuchar en el puerto local, Windows comprueba la raíz efectiva de proyectos. Una ruta UNC se rechaza directamente.
- Para una ruta local, PowerShell Storage resuelve el volumen del directorio existente más cercano (`Get-Volume -FilePath`), comprueba `DriveType = Fixed`, asocia sus particiones y consulta el bus de cada disco (`Get-Partition`, `Get-Disk`). Solo se aceptan buses locales reconocidos por el código; USB, SD/MMC, iSCSI, Fibre Channel y tipos desconocidos se rechazan.
- Cualquier fallo de consulta o volumen no permitido detiene el inicio con `PROJECT_STORAGE_VOLUME_INVALID`; el servidor no crea el directorio ni migra proyectos en una ruta no validada.
- El servicio requiere el módulo Storage disponible en Windows PowerShell. En desarrollo en sistemas no Windows no se aplica esta comprobación específica de Windows.

## Alternativas

- **Confiar en la ruta configurada y en permisos NTFS:** no distingue UNC, asignaciones de red ni dispositivos extraíbles.
- **Usar solo `GetDriveTypeW`:** no identifica de manera suficiente la interfaz de algunos medios USB que Windows puede presentar como fijos.
- **Permitir cualquier tipo y advertir:** deja al usuario expuesto a semánticas de bloqueo/renombrado distintas a las requeridas por la escritura atómica.

## Consecuencias y límites

La ubicación se valida una vez por arranque; si el usuario cambia la topología de discos o puntos de montaje mientras la app está abierta, hay que reiniciar para comprobarla de nuevo. Windows puede presentar dispositivos atípicos mediante buses locales; la política refleja la clasificación que expone Storage y no una certificación física del medio. Las APIs consultadas documentan la resolución de volumen por ruta y las propiedades de volumen/disco: [Get-Volume](https://learn.microsoft.com/en-us/powershell/module/storage/get-volume), [Get-Partition](https://learn.microsoft.com/en-us/powershell/module/storage/get-partition), [Get-Disk](https://learn.microsoft.com/en-us/powershell/module/storage/get-disk).
