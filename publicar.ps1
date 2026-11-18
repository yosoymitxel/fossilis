# Publica Fossilis Expedition en itch.io.
# Uso:  powershell -ExecutionPolicy Bypass -File .\publicar.ps1
$ErrorActionPreference = "Stop"

$root   = $PSScriptRoot
$stage  = Join-Path $root "dist_itch"
$zip    = Join-Path $root "fossilis_expedition.zip"
$butler = "C:\butler\butler.exe"
$target = "yosoymitxel/fossilis-expedition:html5"

Write-Host "1/4 Compilando la version rapida..." -ForegroundColor Cyan
if (-not (Test-Path (Join-Path $root "node_modules"))) { throw "Falta node_modules. Ejecuta antes: npm install" }
npm run build
if ($LASTEXITCODE -ne 0) { throw "La compilacion fallo" }

Write-Host "2/4 Preparando paquete..." -ForegroundColor Cyan
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

# Solo lo que el navegador necesita: el bundle, las hojas, las librerias locales y el HTML.
foreach ($item in @("index.html", "juego.js", "estilos", "vendor")) {
    $src = Join-Path $root $item
    if (-not (Test-Path $src)) { throw "Falta $item" }
    Copy-Item -Path $src -Destination $stage -Recurse
}

# El index publicado no debe volver al cargador de desarrollo ni a los CDNs viejos.
$html = Get-Content (Join-Path $stage "index.html") -Raw
if ($html -match 'src/(data|core|fx|ui)/|babel|tailwindcss\.com|fonts\.googleapis') {
    throw "index.html todavia apunta a desarrollo o a un CDN retirado"
}
foreach ($item in @("juego.js", "estilos/app.css", "vendor/react.js", "vendor/react-dom.js", "vendor/anime.js", "vendor/three/three.module.js")) {
    if (-not (Test-Path (Join-Path $stage $item))) { throw "Falta $item en el paquete" }
}

if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path "$stage\*" -DestinationPath $zip -CompressionLevel Optimal
Write-Host "  ZIP: $zip" -ForegroundColor Gray

Write-Host "3/4 Verificando raiz del ZIP..." -ForegroundColor Cyan
$entries = tar -tf $zip
$entries | Where-Object { $_ -notmatch '/' } | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
if (-not ($entries -contains "index.html")) { throw "El ZIP no tiene index.html en la raiz" }

Write-Host "4/4 Subiendo con butler a $target ..." -ForegroundColor Green
if (-not (Test-Path $butler)) { throw "No esta butler en $butler" }
& $butler push $stage $target
if ($LASTEXITCODE -ne 0) { throw "Butler fallo con codigo $LASTEXITCODE" }

Write-Host ""
Write-Host "SUBIDA COMPLETA" -ForegroundColor Green
Write-Host "En la ficha de itch, selecciona el upload del canal html5 como HTML5." -ForegroundColor Yellow
