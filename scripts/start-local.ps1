param(
  [switch]$NoBrowser,
  [switch]$Stop,
  [switch]$PassThru
)

$ErrorActionPreference = 'Stop'
$requestedAuthMode = if ($env:MYMAP_AUTH_MODE) { $env:MYMAP_AUTH_MODE } else { 'local' }
if ($requestedAuthMode -notin @('local', 'protected')) { throw 'MYMAP_AUTH_MODE debe ser local o protected.' }
$appRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$nodePath = Join-Path $appRoot 'runtime\node.exe'
if (!(Test-Path -LiteralPath $nodePath)) {
  $nodePath = Join-Path $appRoot '.tools\node-v24.22.2-win-x64\node.exe'
}
if (!(Test-Path -LiteralPath $nodePath)) {
  $nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($nodeCommand) { $nodePath = $nodeCommand.Source }
}
if (!(Test-Path -LiteralPath $nodePath)) { throw 'No encuentro Node.js. El paquete debe incluir runtime\node.exe.' }

function Start-VisualService {
  $serverEntry = Join-Path $appRoot 'apps\server\dist\index.js'
  $webIndex = Join-Path $appRoot 'apps\web\dist\index.html'
  if (!(Test-Path -LiteralPath $serverEntry) -or !(Test-Path -LiteralPath $webIndex)) {
    throw 'Falta la compilación de producción. Ejecuta npm run build antes de iniciar este lanzador.'
  }

  $tcpListenerV4 = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
  $tcpListenerV4.Start()
  $localPort = ([System.Net.IPEndPoint]$tcpListenerV4.LocalEndpoint).Port
  $tcpListenerV6 = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::IPv6Loopback, $localPort)
  try { $tcpListenerV6.Start() }
  catch { $tcpListenerV4.Stop(); throw 'No se pudo reservar el puerto loopback IPv6 requerido por localhost/WebAuthn.' }
  $tcpListenerV4.Stop()
  $tcpListenerV6.Stop()
  $uiOrigin = "http://localhost:$localPort"
  $nonce = (& $nodePath -e "process.stdout.write(require('node:crypto').randomBytes(32).toString('base64url'))").Trim()
  if ($LASTEXITCODE -ne 0 -or $nonce.Length -lt 32) { throw 'No pude generar el nonce de sesión.' }

  $environmentNames = @('NODE_ENV', 'MYMAP_LOCAL_PORT', 'ESPACIO_VISUAL_UI_ORIGIN', 'ESPACIO_VISUAL_SESSION_NONCE')
  $previousEnvironment = @{}
  foreach ($name in $environmentNames) { $previousEnvironment[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }

  try {
    $env:NODE_ENV = 'production'
    $env:MYMAP_LOCAL_PORT = [string]$localPort
    $env:ESPACIO_VISUAL_UI_ORIGIN = $uiOrigin
    $env:ESPACIO_VISUAL_SESSION_NONCE = $nonce

    $serverProcess = Start-Process -FilePath $nodePath -ArgumentList @('"' + $serverEntry + '"') -WorkingDirectory $appRoot -PassThru -WindowStyle Hidden
  }
  finally {
    foreach ($name in $environmentNames) {
      $value = $previousEnvironment[$name]
      if ($null -eq $value) { Remove-Item -LiteralPath "Env:$name" -ErrorAction SilentlyContinue }
      else { [Environment]::SetEnvironmentVariable($name, $value, 'Process') }
    }
  }

  $baseUrl = "$uiOrigin/"
  $ready = $false
  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    if ($serverProcess.HasExited) { throw "El servicio local terminó con código $($serverProcess.ExitCode)." }
    try {
      $response = Invoke-WebRequest -Uri "$uiOrigin/api/health" -TimeoutSec 1 -UseBasicParsing
      if ($response.StatusCode -eq 200) { $ready = $true; break }
    }
    catch { Start-Sleep -Milliseconds 250 }
  }
  if (!$ready) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    throw 'El servicio local no respondió a tiempo.'
  }

  return @{ Process = $serverProcess; Port = $localPort; LaunchUrl = "$baseUrl#session=$nonce"; UiOrigin = $uiOrigin; AuthMode = $requestedAuthMode }
}

$hasher = [Security.Cryptography.SHA256]::Create()
try {
  $installationId = [BitConverter]::ToString($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($appRoot.ToUpperInvariant()))).Replace('-', '')
} finally { $hasher.Dispose() }
$localData = [Environment]::GetFolderPath('LocalApplicationData')
$stateDirectory = Join-Path $localData 'EspacioVisual\instances'
$stateFile = Join-Path $stateDirectory "$installationId.json"
$mutex = [Threading.Mutex]::new($false, "Local\EspacioVisual-$installationId")
$ownsMutex = $false
try {
  try { $ownsMutex = $mutex.WaitOne([TimeSpan]::FromSeconds(20)) }
  catch [Threading.AbandonedMutexException] { $ownsMutex = $true }
  if (!$ownsMutex) { throw 'Otro inicio de Espacio Visual sigue en curso.' }

  $instance = $null
  if (Test-Path -LiteralPath $stateFile) {
    try {
      $state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
      $knownProcess = Get-Process -Id ([int]$state.processId) -ErrorAction Stop
      $port = [int]$state.port
      if ($knownProcess.Path -eq $nodePath -and
          $knownProcess.StartTime.ToUniversalTime().Ticks -eq [long]$state.startedTicks -and
          $port -ge 1 -and $port -le 65535) {
        $savedOrigin = if ($state.uiOrigin -is [string] -and $state.uiOrigin) { [string]$state.uiOrigin } else { "http://127.0.0.1:$port" }
        $savedAuthMode = if ($state.authMode -in @('local', 'protected')) { [string]$state.authMode } else { 'local' }
        $instance = @{ Process = $knownProcess; Port = $port; LaunchUrl = "$savedOrigin/"; UiOrigin = $savedOrigin; AuthMode = $savedAuthMode }
      }
    } catch { $instance = $null }
  }

  if ($instance -and ($instance.UiOrigin -ne "http://localhost:$($instance.Port)" -or $instance.AuthMode -ne $requestedAuthMode)) {
    Stop-Process -InputObject $instance.Process -ErrorAction SilentlyContinue
    if (!$instance.Process.WaitForExit(5000)) { throw 'El servicio local anterior no se pudo reiniciar para WebAuthn.' }
    Remove-Item -LiteralPath $stateFile -ErrorAction SilentlyContinue
    $instance = $null
  }

  if ($Stop) {
    if ($instance) {
      Stop-Process -InputObject $instance.Process
      if (!$instance.Process.WaitForExit(5000)) { throw 'El servicio local no se detuvo.' }
    }
    if (Test-Path -LiteralPath $stateFile) { Remove-Item -LiteralPath $stateFile }
    return
  }

  if (!$instance) {
    New-Item -ItemType Directory -Path $stateDirectory -Force | Out-Null
    $instance = Start-VisualService
    try {
      @{
        processId = $instance.Process.Id
        startedTicks = $instance.Process.StartTime.ToUniversalTime().Ticks
        port = $instance.Port
        uiOrigin = $instance.UiOrigin
        authMode = $instance.AuthMode
      } | ConvertTo-Json -Compress | Set-Content -LiteralPath $stateFile -Encoding UTF8
    } catch {
      Stop-Process -InputObject $instance.Process -ErrorAction SilentlyContinue
      throw
    }
  }

  if (!$NoBrowser) { Start-Process -FilePath $instance.LaunchUrl }
  if ($PassThru) { [pscustomobject]$instance }
  else { Write-Host 'Espacio Visual ya está disponible en el navegador.' }
} finally {
  if ($ownsMutex) { $mutex.ReleaseMutex() }
  $mutex.Dispose()
}
