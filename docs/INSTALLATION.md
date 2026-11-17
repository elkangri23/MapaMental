# Instalación y puesta en marcha

## Windows x64 con el paquete portátil

1. Extrae todo el ZIP en una carpeta local donde tengas permiso de escritura.
2. Ejecuta `scripts\start-windows.cmd`. El paquete usa su copia de Node 24 y abre Espacio Visual en tu navegador.
3. Espera a ver «Guardado local» antes de detener la app. Ejecuta `scripts\stop-windows.cmd` para detener su servicio.

Volver a iniciar desde la misma carpeta abre la instancia que ya está en marcha. Si la sesión del navegador caducó o abriste otro perfil de navegador, guarda los cambios en la ventana original, detén el servicio y vuelve a iniciarlo para renovar la sesión.

Si Windows no puede verificar el volumen al arrancar, el lanzador muestra un aviso sobre la carpeta de proyectos. Comprueba que la carpeta esté en un disco interno y vuelve a iniciar la aplicación.

### Modo protegido experimental

El modo local es el predeterminado. Después de configurar OIDC y registrar la primera passkey en Ajustes, puedes iniciar el modo protegido desde PowerShell en la raíz del repositorio:

```powershell
$env:MYMAP_AUTH_MODE = 'protected'
.\scripts\start-local.ps1
```

El lanzador reinicia una instancia activa si cambia el modo. Para volver al modo local, ejecuta `Remove-Item Env:MYMAP_AUTH_MODE` y vuelve a iniciar el lanzador. OIDC necesita Internet y un proveedor que admita cliente público y callback loopback IPv6 con puerto variable. OIDC, passkeys y recuperación TOTP tienen implementación parcial, pero aún no se han validado con un IdP, app autenticadora ni autenticador real. Si activas TOTP desde Ajustes, usa una app compatible y conserva tu passkey; TOTP solo sirve para registrar una passkey de reemplazo. Consulta la [guía de operación, recuperación y desvinculación](AUTH_OPERATIONS.md).

## Instalador Inno Setup

El proyecto del instalador está preparado en `packaging\windows\setup.iss`. Está configurado para instalar por usuario, crear accesos directos en el menú Inicio y ofrecer un acceso directo opcional en el escritorio. Las versiones 0.1.0 y 0.1.1 se compilaron con Inno Setup 6.7.3. El 2026-11-17, una prueba Windows aislada instaló 0.1.0, creó y guardó un proyecto, actualizó en la misma carpeta a 0.1.1, abrió el mapa conservado y desinstaló el programa. El desinstalador retiró el directorio de la app y el proyecto permaneció en la carpeta de datos separada. El recorrido usó los scripts incluidos para iniciar/detener; no valida todavía los accesos directos del menú Inicio, la opción del escritorio ni el flujo desde Configuración de Windows. Detalle en [`VERIFICATION.md`](VERIFICATION.md#actualizacion-del-instalador-windows-y-conservacion-de-proyectos--t-013).

### Recorrido pendiente del instalador

Usa un perfil estándar de Windows de prueba para cerrar la verificación pendiente de accesos directos y desinstalación desde Configuración. La actualización 0.1.0→0.1.1 y la conservación del proyecto ya se probaron con un directorio de instalación temporal.

1. Ejecuta el instalador como usuario estándar. Comprueba que instala bajo el perfil de ese usuario, crea los accesos directos de Inicio y respeta la elección del acceso directo de escritorio.
2. Abre desde Inicio y detén desde el acceso directo correspondiente; inspecciona que el servicio arranca y se cierra correctamente.
3. Ya verificado con los scripts del paquete: instala 0.1.0, guarda un proyecto, actualiza a 0.1.1 en la misma carpeta y comprueba que el mapa se conserva.
4. Desinstala desde Configuración de Windows. Comprueba que se retiran la aplicación y sus accesos directos, y que el mapa sigue en la carpeta de proyectos. La desinstalación mediante `unins000.exe` ya dejó los datos intactos.

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
