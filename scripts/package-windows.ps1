[CmdletBinding()]
param(
  [string]$NodeDirectory,
  [string]$CompilerPath,
  [switch]$PortableOnly,
  [switch]$Offline
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (!$NodeDirectory) { $NodeDirectory = Join-Path $root '.tools\node-v24.22.2-win-x64' }
$NodeDirectory = (Resolve-Path -LiteralPath $NodeDirectory).Path
$node = Join-Path $NodeDirectory 'node.exe'
$npm = Join-Path $NodeDirectory 'npm.cmd'
$platform = & $node -p 'process.platform + ":" + process.arch + ":" + process.versions.node.split(".")[0]'
if ($LASTEXITCODE -ne 0 -or $platform -ne 'win32:x64:24') { throw 'Hace falta una distribución Node 24 para Windows x64.' }
if (!(Test-Path -LiteralPath $npm)) { throw 'La distribución de Node debe incluir npm.cmd.' }

if (!$PortableOnly -and !$CompilerPath) {
  $compiler = Get-Command ISCC.exe -ErrorAction SilentlyContinue
  if ($compiler) { $CompilerPath = $compiler.Source }
  else { throw 'No se encontró ISCC.exe. Indica -CompilerPath o usa -PortableOnly para generar el ZIP.' }
}
if ($CompilerPath) { $CompilerPath = (Resolve-Path -LiteralPath $CompilerPath).Path }

$version = (Get-Content -LiteralPath (Join-Path $root 'package.json') -Raw | ConvertFrom-Json).version
if ($version -notmatch '^\d+\.\d+\.\d+$') { throw 'La versión del paquete debe tener tres componentes numéricos.' }
$release = Join-Path $root 'release'
New-Item -ItemType Directory -Path $release -Force | Out-Null
$stage = Join-Path $release ('.stage-' + [guid]::NewGuid().ToString('N'))
$previousPath = $env:Path
$env:Path = "$NodeDirectory;$previousPath"

function Copy-PackageEntry([string]$RelativePath) {
  $destination = Join-Path $stage $RelativePath
  New-Item -ItemType Directory -Path (Split-Path -Parent $destination) -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $root $RelativePath) -Destination $destination -Recurse
}

try {
  Push-Location $root
  try {
    & $npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Falló la compilación del workspace.' }
  } finally { Pop-Location }

  New-Item -ItemType Directory -Path $stage | Out-Null
  foreach ($entry in @('package.json', 'package-lock.json', 'apps\server\package.json', 'apps\server\dist',
      'apps\web\package.json', 'apps\web\dist', 'packages\domain\package.json', 'packages\domain\dist',
      'scripts\start-local.ps1', 'scripts\start-windows.cmd', 'scripts\stop-windows.cmd', 'docs\INSTALLATION.md')) {
    Copy-PackageEntry $entry
  }

  Push-Location $stage
  try {
    $npmArguments = @('ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund', '--workspace', '@espacio-visual/server', '--workspace', '@espacio-visual/domain')
    if ($Offline) { $npmArguments += '--offline' }
    & $npm @npmArguments
    if ($LASTEXITCODE -ne 0) { throw 'No se pudieron preparar las dependencias de producción.' }

    # npm enlaza los paquetes del workspace. El ZIP necesita archivos propios.
    foreach ($name in @('domain', 'server', 'web')) {
      $link = Join-Path $stage "node_modules\@espacio-visual\$name"
      $item = Get-Item -LiteralPath $link -Force -ErrorAction SilentlyContinue
      if (!$item) { continue }
      if (!($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "La ruta esperada no es un enlace de npm: $link"
      }
      & $node -e 'require("node:fs").unlinkSync(process.argv[1])' $link
      if ($LASTEXITCODE -ne 0) { throw "No se pudo retirar el enlace de npm: $link" }
    }
    $domain = Join-Path $stage 'node_modules\@espacio-visual\domain'
    New-Item -ItemType Directory -Path (Split-Path -Parent $domain) -Force | Out-Null
    Move-Item -LiteralPath (Join-Path $stage 'packages\domain') -Destination $domain
    Remove-Item -LiteralPath (Join-Path $stage 'package-lock.json')
    $nativeKeyring = Join-Path $stage 'node_modules\@napi-rs\keyring-win32-x64-msvc\keyring.win32-x64-msvc.node'
    if (!(Test-Path -LiteralPath $nativeKeyring)) { throw 'Falta el módulo de credenciales de Windows x64.' }
  } finally { Pop-Location }

  $runtime = Join-Path $stage 'runtime'
  New-Item -ItemType Directory -Path $runtime | Out-Null
  Copy-Item -LiteralPath $node, (Join-Path $NodeDirectory 'LICENSE') -Destination $runtime
  $portableZip = Join-Path $release "EspacioVisual-$version-windows-x64.zip"
  $temporaryZip = Join-Path $release ('.portable-' + [guid]::NewGuid().ToString('N') + '.zip')
  try {
    [IO.Compression.ZipFile]::CreateFromDirectory($stage, $temporaryZip)
    Move-Item -LiteralPath $temporaryZip -Destination $portableZip -Force
  } finally {
    if (Test-Path -LiteralPath $temporaryZip) { Remove-Item -LiteralPath $temporaryZip }
  }
  Write-Host "Paquete portátil: $portableZip"

  if (!$PortableOnly) {
    $setup = Join-Path $root 'packaging\windows\setup.iss'
    & $CompilerPath "/DBundleDir=$stage" "/DAppVersion=$version" "/O$release" $setup
    if ($LASTEXITCODE -ne 0) { throw 'Inno Setup no pudo compilar el instalador.' }
  }
} finally {
  $env:Path = $previousPath
  if (Test-Path -LiteralPath $stage) {
    $realStage = (Resolve-Path -LiteralPath $stage).Path
    $realRelease = (Resolve-Path -LiteralPath $release).Path
    if ((Split-Path -Parent $realStage) -eq $realRelease -and (Split-Path -Leaf $realStage) -match '^\.stage-[a-f0-9]{32}$') {
      Remove-Item -LiteralPath $realStage -Recurse -Force
    }
  }
}
