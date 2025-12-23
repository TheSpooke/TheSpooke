<#
 check_headers_and_cookies.ps1
 Recolecta cabeceras de seguridad y revisa cookies de una URL objetivo.

 Uso:
 .\check_headers_and_cookies.ps1 -Target 'https://example.com'

 Nota: Solo lectura.
#>

param(
    [Parameter(Mandatory=$true)][string]$Target
)

function TrimEnd([string]$s) { if($s.EndsWith('/')) { return $s.Substring(0,$s.Length-1) } else { return $s } }

$u = TrimEnd $Target
Write-Output "Analizando cabeceras y cookies para: $u\n"

try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 20 -ErrorAction Stop
} catch {
    Write-Error "Error al obtener $u : $_"
    exit 1
}

Write-Output "-- Response Headers --"
$r.Headers.GetEnumerator() | ForEach-Object { "{0}: {1}" -f $_.Name, $_.Value }

Write-Output "\n-- Security header checks --"
$hdrs = @{ 'Content-Security-Policy' = $false; 'Strict-Transport-Security' = $false; 'X-Frame-Options' = $false; 'X-Content-Type-Options' = $false; 'Referrer-Policy' = $false }
foreach($h in $hdrs.Keys) { if($r.Headers[$h]) { $hdrs[$h] = $true; Write-Output "$h : PRESENT" } else { Write-Output "$h : MISSING" } }

Write-Output "\n-- Cookies (if any) --"
try {
    $cookieContainer = $r.Cookies
    if($cookieContainer.Count -eq 0) { Write-Output "No cookies set in this response." } else {
        foreach($c in $cookieContainer) {
            $flags = @()
            if($c.Secure) { $flags += 'Secure' }
            if($c.HttpOnly) { $flags += 'HttpOnly' }
            if($c.Expires -ne [datetime]::MinValue) { $flags += "Expires=$($c.Expires)" }
            Write-Output "Cookie: $($c.Name) = $($c.Value) ; Domain=$($c.Domain) ; Path=$($c.Path) ; Flags=($([string]::Join(',', $flags)))"
        }
    }
} catch {
    Write-Output "No se pudieron parsear cookies: $_"
}

Write-Output "\n-- Quick recommendations --"
if(-not $hdrs['Content-Security-Policy']) { Write-Output "* Considerar añadir Content-Security-Policy para mitigar XSS." }
if(-not $hdrs['Strict-Transport-Security']) { Write-Output "* Considerar añadir HSTS (Strict-Transport-Security)." }
if(-not $hdrs['X-Frame-Options']) { Write-Output "* Considerar X-Frame-Options o CSP frame-ancestors para prevenir clickjacking." }
if(-not $hdrs['X-Content-Type-Options']) { Write-Output "* Considerar X-Content-Type-Options: nosniff." }

exit 0
