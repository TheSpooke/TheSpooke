<#
 git_enum.ps1
 Revisa si una web expone contenido de un repositorio Git en la raíz (por ejemplo .git/HEAD) y guarda los archivos encontrados.
 Nota: No clona ni intenta reconstruir el repositorio automáticamente. Solo descarga archivos públicos disponibles.

 Uso:
 .\git_enum.ps1 -Target 'https://example.com' -OutDir '.\scripts_output'
#>

param(
    [Parameter(Mandatory=$true)][string]$Target,
    [string]$OutDir = '.\scripts_output'
)

if(-not (Test-Path $OutDir)) { New-Item -Path $OutDir -ItemType Directory | Out-Null }

$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$workdir = Join-Path $OutDir ("git_enum_$timestamp")
New-Item -Path $workdir -ItemType Directory | Out-Null

function TrimEnd([string]$s) { if($s.EndsWith('/')) { return $s.Substring(0,$s.Length-1) } else { return $s } }

$base = TrimEnd $Target
Write-Output "Iniciando enum .git para: $base"

$paths = @('.git/HEAD','.git/config','.git/logs/HEAD','.git/packed-refs')
foreach($p in $paths) {
    $u = "$base/$p"
    $outFile = Join-Path $workdir ($p -replace '/','_')
    try {
        $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $r.Content | Out-File $outFile -Encoding utf8
        Write-Output "[FOUND] $u -> $outFile"
    } catch {
        Write-Output "[MISSING] $u"
    }
}

Write-Output "\nResultado guardado en: $workdir"
Write-Output "Si se encontraron archivos .git/HEAD o packed-refs, revisa su contenido y pégalo aquí si quieres que lo analice (no compartas secretos)."

exit 0
