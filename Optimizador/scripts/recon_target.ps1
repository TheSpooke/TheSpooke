<#
 recon_target.ps1
 Descripción: Realiza recon no intrusivo sobre un objetivo web. Descarga robots.txt, sitemap.xml,
 hace HEAD/GET de la raíz, descarga index.html y comprueba la existencia de archivos comunes
 ('.git/HEAD', '.env', copias de seguridad). Guarda resultados en una carpeta de salida.

 Uso:
 .\recon_target.ps1 -Target 'https://example.com' -OutDir '.\scripts_output'

 Nota: Solo operaciones de lectura (no modifica el objetivo).
#>

param(
    [Parameter(Mandatory=$true)][string]$Target,
    [string]$OutDir = '.\scripts_output'
)

if(-not (Test-Path $OutDir)) { New-Item -Path $OutDir -ItemType Directory | Out-Null }

$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$workdir = Join-Path $OutDir $timestamp
New-Item -Path $workdir -ItemType Directory | Out-Null

Write-Output "Recon iniciado para: $Target"
Write-Output "Salida en: $workdir\n"

function Save-IfExists {
    param($url, $outFile)
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
        $r.Content | Out-File -FilePath $outFile -Encoding utf8
        Write-Output "[FOUND] $url -> $outFile"
    } catch {
        Write-Output "[MISSING] $url"
    }
}

# robots.txt
try { (Invoke-WebRequest -Uri (TrimEnd $Target '/') + '/robots.txt' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop).Content | Out-File (Join-Path $workdir 'robots.txt') -Encoding utf8; Write-Output '[FOUND] robots.txt' } catch { Write-Output '[MISSING] robots.txt' }

# sitemap.xml
try { (Invoke-WebRequest -Uri (TrimEnd $Target '/') + '/sitemap.xml' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop).Content | Out-File (Join-Path $workdir 'sitemap.xml') -Encoding utf8; Write-Output '[FOUND] sitemap.xml' } catch { Write-Output '[MISSING] sitemap.xml' }

# HEAD headers root
try {
    $head = Invoke-WebRequest -Uri $Target -Method Head -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    $head.Headers.GetEnumerator() | ForEach-Object { "{0}: {1}" -f $_.Name, $_.Value } | Out-File (Join-Path $workdir 'root_headers.txt') -Encoding utf8
    Write-Output '[FOUND] root headers saved'
} catch {
    Write-Output '[ERROR] Could not fetch HEAD for root'
}

# GET root HTML
try {
    $get = Invoke-WebRequest -Uri $Target -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
    $get.Content | Out-File (Join-Path $workdir 'index.html') -Encoding utf8
    $get.RawContent | Out-File (Join-Path $workdir 'index_raw.txt') -Encoding utf8
    Write-Output '[FOUND] index.html saved'
} catch {
    Write-Output '[ERROR] Could not GET root HTML'
}

# Comprobación de archivos comunes
$files = @('.git/HEAD','.git/config','.env','composer.json','package.json','config.php','backup.zip','backup.tar.gz','index.php~','config.php.bak')
foreach($f in $files) {
    $u = (TrimEnd $Target '/') + '/' + $f
    $outFile = Join-Path $workdir ($f -replace '/','_')
    Save-IfExists -url $u -outFile $outFile
}

Write-Output "\nRecon finalizado. Revisa la carpeta: $workdir"

function TrimEnd([string]$s) { if($s.EndsWith('/')) { return $s.Substring(0,$s.Length-1) } else { return $s } }

exit 0
