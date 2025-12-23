param(
    [Parameter(Mandatory=$true)] [string] $WorkDir,
    [switch] $Backup
)

if (-not (Test-Path -LiteralPath $WorkDir)) { New-Item -Path $WorkDir -ItemType Directory | Out-Null }
$log = Join-Path $WorkDir 'clean_browser_caches_log.txt'
"=== Browser Cache Cleaner started: $(Get-Date) ===" | Out-File -FilePath $log -Encoding utf8 -Append

function Log($m) { "$((Get-Date).ToString('s')) - $m" | Out-File -FilePath $log -Encoding utf8 -Append }

# Known cache paths patterns
$paths = @(
    Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data\*\Cache',
    Join-Path $env:LOCALAPPDATA 'Google\Chrome\User Data\*\Media Cache',
    Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data\*\Cache',
    Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\User Data\*\Media Cache',
    Join-Path $env:LOCALAPPDATA 'BraveSoftware\Brave-Browser\User Data\*\Cache',
    Join-Path $env:APPDATA 'Opera Software\*\Cache',
    Join-Path $env:LOCALAPPDATA 'Vivaldi\User Data\*\Cache',
    Join-Path $env:APPDATA 'Mozilla\Firefox\Profiles\*\cache2'
)

$found = @()
foreach ($p in $paths) {
    try { $dirs = Get-ChildItem -Path $p -Directory -ErrorAction SilentlyContinue } catch { $dirs = $null }
    if ($dirs) { foreach ($d in $dirs) { $found += $d.FullName } }
}

if ($found.Count -eq 0) { Log 'No browser cache folders detected.'; Write-Output 'No browser cache folders detected.'; exit 0 }

Write-Output 'Found cache folders:'
$found | ForEach-Object { Write-Output " - $_"; Log "Found: $_" }

if ($Backup) {
    $backupDir = Join-Path $WorkDir ('browser_backup_' + (Get-Date -Format yyyyMMdd_HHmmss))
    New-Item -Path $backupDir -ItemType Directory | Out-Null
    Log "Backing up caches to $backupDir"
    foreach ($d in $found) {
        try {
            $dest = Join-Path $backupDir (Split-Path -Path $d -Leaf)
            robocopy $d $dest /MIR /COPY:DAT /R:1 /W:1 | Out-Null
            Log "Backed up $d to $dest"
        } catch {
            Log "Backup failed for $d: $($_.Exception.Message)"
        }
    }
}

# Deletion (best-effort, non-destructive where possible)
foreach ($d in $found) {
    try {
        Log "Removing $d"
        Remove-Item -LiteralPath $d -Recurse -Force -ErrorAction SilentlyContinue
        Log "Removed $d"
        Write-Output "Removed $d"
    } catch {
        Log "Removal failed for $d: $($_.Exception.Message)"
        Write-Output "Failed to remove $d: $($_.Exception.Message)"
    }
}

Log 'Browser cache cleaning complete.'
"=== Browser Cache Cleaner finished: $(Get-Date) ===" | Out-File -FilePath $log -Encoding utf8 -Append
exit 0
