# Operación de identidad y recuperación

**Estado:** guía para el modo protegido experimental. La configuración OIDC, las passkeys y TOTP aún no se han validado con un proveedor o autenticador real. Consulta [la revisión de seguridad](reviews/2026-11-16-auth-mfa-audit.md) antes de tratar este flujo como terminado.

## Antes de activarlo

- El modo protegido es para una sola persona Windows y solo loopback; no publica la app en la red.
- OIDC requiere Internet. El modo local sin identidad sigue siendo el predeterminado.
- Iniciar sesión con OIDC no cifra los proyectos ni protege frente a malware que ya se ejecute con tu usuario Windows.
- El servidor asigna un puerto loopback al arrancar. El callback actual tiene el formato `http://[::1]:<puerto>/api/session/oidc/callback`. El IdP debe admitir cliente público, Authorization Code + PKCE S256 y callback loopback IPv6 con puerto variable. Si exige un puerto fijo, callback HTTPS o client secret, no es compatible con la implementación actual.
- El alcance OIDC solicitado es `openid`. La aplicación no conserva tokens de acceso o renovación.

## Configurar identidad y primera passkey

1. Inicia en modo local con `scripts\start-windows.cmd` (paquete portátil) o `scripts\start-local.ps1` (repositorio).
2. Abre Ajustes y guarda el issuer OIDC y el client ID de un cliente público registrado en tu IdP. No introduzcas un client secret.
3. Pulsa **Vincular mi identidad OIDC**, completa el login en el navegador y registra la primera passkey desde Ajustes.
4. Cierra y vuelve a iniciar el lanzador con modo protegido:

   ```powershell
   $env:MYMAP_AUTH_MODE = 'protected'
   .\scripts\start-local.ps1
   ```

5. Cada acceso protegido requiere primero el IdP y después la passkey con verificación de usuario. En Ajustes puedes registrar otras passkeys; los cambios de credenciales requieren una reautenticación reciente.
6. Para añadir recuperación opcional, abre **Configurar app autenticadora** desde Ajustes, confirma la passkey y añade la clave manual mostrada a una app TOTP compatible. Introduce el código actual para confirmar. Guarda el secreto de forma segura; la aplicación solo lo vuelve a mostrar durante el enrolamiento.

No continúes al modo protegido hasta haber comprobado que puedes usar al menos una passkey registrada. Conserva más de un método si te resulta posible.

## Recuperar tras perder las passkeys

1. Inicia el modo protegido y completa OIDC con la identidad ya vinculada.
2. En la pantalla del segundo factor, abre **Perdí mi passkey** y escribe el TOTP vigente.
3. Registra una passkey nueva en el autenticador.
4. Al finalizar, la app elimina las passkeys anteriores de su lista y cierra las sesiones protegidas activas. Después vuelve a iniciar sesión con OIDC y la passkey nueva.

La cookie de recuperación dura cinco minutos y solo autoriza registrar la passkey de reemplazo. Si cancelas el autenticador, puedes reanudar desde la misma pantalla mientras la cookie siga vigente; no vuelve a pedir ni consumir el TOTP. Si caduca, inicia otra vez el login OIDC.

Si también perdiste el acceso al IdP o al TOTP, la recuperación automática no está disponible. No hay cuenta de soporte ni método por email/SMS. El restablecimiento local descrito abajo desvincula la identidad y requiere volver a realizar el alta desde una sesión local confiable.

## Volver al modo local

En la misma ventana de PowerShell donde inicias el modo protegido:

```powershell
Remove-Item Env:MYMAP_AUTH_MODE
.\scripts\start-local.ps1
```

El lanzador reinicia el servicio en modo local. Esto no elimina la identidad vinculada, TOTP, passkeys registradas, proyectos ni perfiles de proveedores; solo cambia el requisito de sesión para esa instancia.

## Desvincular y restablecer la identidad local

Este procedimiento elimina la vinculación OIDC local y el secreto TOTP. No borra proyectos, perfiles ni claves API de proveedores.

1. Guarda el proyecto abierto y detén la app con `scripts\stop-windows.cmd` o, desde el repositorio, `scripts\start-local.ps1 -Stop`.
2. Si quieres conservar la configuración para una restauración deliberada, copia `%APPDATA%\EspacioVisual\auth.json` en un lugar protegido. Este archivo contiene el issuer, client ID, identidad y claves **públicas**/metadatos de passkeys. No contiene la clave privada del autenticador ni el secreto TOTP.
3. Elimina o mueve fuera de `%APPDATA%\EspacioVisual` el archivo `auth.json`. Al no encontrarlo, la app olvida la identidad y las passkeys registradas; las sesiones también desaparecen al detener el servidor.
4. Abre **Administrador de credenciales de Windows → Credenciales genéricas** y elimina únicamente el destino `auth:totp-recovery.EspacioVisual`, si existe. Ese nombre sigue el mapeo Windows del almacén `keyring` (`usuario.servicio`; [documentación del almacén](https://docs.rs/windows-native-keyring-store/latest/windows_native_keyring_store/)). No elimines `provider:<UUID>.EspacioVisual`: son claves API de perfiles de proveedor y no forman parte de la identidad.
5. Inicia de nuevo en modo local. Para volver a vincular, configura OIDC y completa el alta inicial como una instalación nueva.
6. Si también quieres quitar la passkey del dispositivo o de un gestor sincronizado, elimínala allí por separado. Borrar `auth.json` solo hace que esta instalación deje de reconocerla; no borra la credencial privada del autenticador ni la cuenta del IdP.

Una copia antigua de `auth.json` puede volver a registrar claves públicas que se habían revocado. No restaures una copia anterior después de recuperar una cuenta: conserva únicamente la configuración actualizada o repite el restablecimiento. Eliminar la configuración de esta app tampoco revoca sesiones ni consentimiento guardados por el IdP; hazlo desde el propio proveedor si quieres retirar ese acceso.

## Perfil personal

Abre **Perfil** en la barra superior para guardar tu nombre y correo. Ambos campos son opcionales. Para borrar los datos, vacía los dos campos y guarda. La misma ficha está disponible con una sesión válida en modo local o protegido. El correo es un dato de perfil, no se verifica ni se usa para iniciar sesión o vincular una cuenta OIDC.

## Datos que permanecen separados

| Dato | Ubicación | ¿Lo elimina el restablecimiento de identidad? |
|---|---|---|
| Issuer, client ID, identidad y passkeys públicas | `%APPDATA%\EspacioVisual\auth.json` | Sí |
| Secreto TOTP y estado anti-replay/bloqueo | Credencial genérica `auth:totp-recovery.EspacioVisual` | Sí, al borrar ese destino |
| Nombre y correo del perfil personal | %APPDATA%\EspacioVisual\profile.json | No |
| Perfiles/configuración de proveedores | `%APPDATA%\EspacioVisual\providers.json` | No |
| Claves API de proveedores | Credenciales `provider:<UUID>.EspacioVisual` | No |
| Proyectos y copias | `Documents\EspacioVisual\Proyectos` | No |
| Uso de proveedores | `%LOCALAPPDATA%\EspacioVisual\provider-usage.json` | No |
| Eventos mínimos de autenticación | `%LOCALAPPDATA%\EspacioVisual\security-events.jsonl` | No; se retienen hasta 30 días (máximo 5.000 eventos/1 MiB) |
| Sesiones de navegador | Memoria del proceso y cookies locales | La memoria se vacía al detener el servicio; las cookies caducan o se limpian en el navegador |

El cierre de identidad no equivale a borrar los datos locales. Para retirar completamente la aplicación, consulta [Instalación y retirada](INSTALLATION.md) y selecciona por separado qué proyectos y perfiles quieres conservar.
