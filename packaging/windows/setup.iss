#ifndef BundleDir
  #error Define BundleDir using scripts/package-windows.ps1.
#endif
#ifndef AppVersion
  #error Define AppVersion using scripts/package-windows.ps1.
#endif

[Setup]
AppId={{984899E9-CB34-4CCB-87BD-E5349D877699}
AppName=Espacio Visual
AppVersion={#AppVersion}
DefaultDirName={localappdata}\Programs\Espacio Visual
DefaultGroupName=Espacio Visual
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
MinVersion=10.0
DisableProgramGroupPage=yes
UninstallDisplayName=Espacio Visual
OutputBaseFilename=EspacioVisual-{#AppVersion}-Setup-x64
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
CloseApplications=yes
RestartApplications=no

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear un acceso directo en el escritorio"; Flags: unchecked

[Files]
Source: "{#BundleDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Espacio Visual"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy RemoteSigned -File ""{app}\scripts\start-local.ps1"""; WorkingDir: "{app}"
Name: "{group}\Detener Espacio Visual"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy RemoteSigned -File ""{app}\scripts\start-local.ps1"" -Stop"; WorkingDir: "{app}"
Name: "{userdesktop}\Espacio Visual"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy RemoteSigned -File ""{app}\scripts\start-local.ps1"""; WorkingDir: "{app}"; Tasks: desktopicon
