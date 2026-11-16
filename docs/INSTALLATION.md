# Instalación y puesta en marcha

## Windows x64 con el paquete portátil

1. Extrae todo el ZIP en una carpeta local donde tengas permiso de escritura.
2. Ejecuta `scripts\start-windows.cmd`. El paquete usa su copia de Node 24 y abre Espacio Visual en tu navegador.
3. Espera a ver «Guardado local» antes de detener la app. Ejecuta `scripts\stop-windows.cmd` para detener su servicio.

Volver a iniciar desde la misma carpeta abre la instancia que ya está en marcha. Si la sesión del navegador caducó o abriste otro perfil de navegador, guarda los cambios en la ventana original, detén el servicio y vuelve a iniciarlo para renovar la sesión.

### Modo protegido experimental

El modo local es el predeterminado. Después de configurar OIDC y registrar la primera passkey en Ajustes, puedes iniciar el modo protegido desde PowerShell en la raíz del repositorio:

```powershell
$env:MYMAP_AUTH_MODE = 'protected'
.\scripts\start-local.ps1
```

El lanzador reinicia una instancia activa si cambia el modo. Para volver al modo local, ejecuta `Remove-Item Env:MYMAP_AUTH_MODE` y vuelve a iniciar el lanzador. OIDC necesita Internet y un proveedor que admita cliente público y callback loopback IPv6 con puerto variable. OIDC, passkeys y recuperación TOTP tienen implementación parcial, pero aún no se han validado con un IdP, app autenticadora ni autenticador real. Si activas TOTP desde Ajustes, usa una app compatible y conserva tu passkey; TOTP solo sirve para registrar una passkey de reemplazo. Consulta la [guía de operación, recuperación y desvinculación](AUTH_OPERATIONS.md).

## Instalador Inno Setup

El proyecto del instalador está preparado en `packaging\windows\setup.iss`. Está configurado para instalar por usuario, crear accesos directos en el menú Inicio y ofrecer un acceso directo opcional en el escritorio. La compilación del instalador y el recorrido de instalación, actualización y desinstalación quedan pendientes.

## Datos, actualización y retirada del paquete portátil

- Los proyectos y sus copias se guardan por defecto en `Documents\EspacioVisual\Proyectos`.
- Los perfiles se guardan en `%APPDATA%\EspacioVisual`, el registro de uso en `%LOCALAPPDATA%\EspacioVisual` y las claves en el almacén de credenciales de Windows.
- Para actualizar el ZIP, guarda y detén la aplicación, extrae la versión nueva en otra carpeta e iníciala desde allí. La carpeta nueva usa los mismos proyectos y perfiles.
- Para retirar el ZIP, detén el servicio y elimina únicamente la carpeta donde lo extrajiste.

## Preparar paquetes desde el repositorio

Usa PowerShell 7, el workspace con sus dependencias instaladas y una distribución de Node 24 para Windows x64 con npm. Desde la raíz:

```powershell
.\scripts\package-windows.ps1 -PortableOnly
.\scripts\package-windows.ps1 -CompilerPath 'C:\ruta\a\ISCC.exe'
```

El script prepara dependencias de producción desde el archivo de bloqueo y genera los artefactos en `release`. Usa `-NodeDirectory` si el runtime de compilación está en otra carpeta y `-Offline` si las dependencias ya están en la caché de npm. Consulta [Desarrollo](DEVELOPMENT.md) para preparar el código.
