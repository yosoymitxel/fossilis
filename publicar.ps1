# Publica Fossilis Expedition en itch.io.
# Uso:  powershell -ExecutionPolicy Bypass -File .\publicar.ps1
$ErrorActionPreference = "Stop"

$root   = $PSScriptRoot
$stage  = Join-Path $root "dist_itch"
$zip    = Join-Path $root "fossilis_expedition.zip"
$butler = "C:\butler\butler.exe"
$target = "yosoymitxel/fossilis-expedition:html5"

Write-Host "1/3 Preparando paquete..." -ForegroundColor Cyan
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

foreach ($item in @("index.html", "src", "estilos")) {
    $src = Join-Path $root $item
    if (-not (Test-Path $src)) { throw "Falta $item" }
    Copy-Item -Path $src -Destination $stage -Recurse
}

if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$stage\*" -DestinationPath $zip -CompressionLevel Optimal
Write-Host "  ZIP: $zip" -ForegroundColor Gray

Write-Host "2/3 Verificando raiz del ZIP..." -ForegroundColor Cyan
$entries = tar -tf $zip
$entries | Where-Object { $_ -notmatch '/' } | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
if (-not ($entries -contains "index.html")) { throw "El ZIP no tiene index.html en la raiz" }

Write-Host "3/3 Subiendo con butler a $target ..." -ForegroundColor Green
if (-not (Test-Path $butler)) { throw "No esta butler en $butler" }
& $butler push $stage $target
if ($LASTEXITCODE -ne 0) { throw "Butler fallo con codigo $LASTEXITCODE" }

Write-Host "" -ForegroundColor White
Write-Host "SUBIDA COMPLETA" -ForegroundColor Green
Write-Host "En la ficha de itch, selecciona el upload del canal html5 como HTML5." -ForegroundColor Yellow
