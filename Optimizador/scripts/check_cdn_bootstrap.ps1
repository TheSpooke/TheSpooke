<#
  check_cdn_bootstrap.ps1
  Desc: Descarga un recurso CDN de Bootstrap, muestra cabeceras y calcula el hash SRI (sha384).

  Uso:
    .\check_cdn_bootstrap.ps1
    .\check_cdn_bootstrap.ps1 -Url 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js'

  Nota: este script realiza solo operaciones de lectura (descarga y hash).
#>

param(
  [string]$Url = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  [string]$OutDir = '.\scripts_output'
)

if (-not (Test-Path $OutDir)) { New-Item -Path $OutDir -ItemType Directory | Out-Null }

$fileName = [System.IO.Path]::GetFileName($Url)
$outPath = Join-Path $OutDir $fileName

Write-Output "Fetching: $Url"
try {
  $head = Invoke-WebRequest -Uri $Url -Method Head -UseBasicParsing -ErrorAction Stop
  Write-Output "\n-- Response headers --"
  $head.Headers.GetEnumerator() | ForEach-Object { "{0}: {1}" -f $_.Name, $_.Value }
} catch {
  Write-Warning "No se pudieron obtener cabeceras (HEAD): $_. Exception"
}

try {
  Invoke-WebRequest -Uri $Url -OutFile $outPath -UseBasicParsing -ErrorAction Stop
  Write-Output "\nGuardado en: $outPath"
} catch {
  Write-Error "Error descargando el recurso: $_"
  exit 1
}

# Calcular SHA-384 y formato SRI
[byte[]]$bytes = [System.IO.File]::ReadAllBytes($outPath)
$sha = [System.Security.Cryptography.SHA384]::Create().ComputeHash($bytes)
$b64 = [System.Convert]::ToBase64String($sha)
$sri = "sha384-$b64"
Write-Output "\n-- SRI (sha384) --"
Write-Output $sri

Write-Output "\n-- Recomendaciones rápidas --"
Write-Output "1) Comprueba si en el HTML objetivo el tag <script> que carga este recurso incluye el atributo 'integrity' con el mismo valor SRI (o añade SRI)."
Write-Output "2) Revisa si la página aplica CSP que permita scripts desde 'cdn.jsdelivr.net'."
Write-Output "3) Busca si la versión (5.3.2) tiene vulnerabilidades conocidas (npm audit / Snyk / OSS Index)."

exit 0
