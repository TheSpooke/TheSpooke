param(
    [Parameter(Mandatory=$true)] [string] $WorkDir,
    [switch] $CreateRestorePoint
)

# Ensure WorkDir exists
if (-not (Test-Path -LiteralPath $WorkDir)) { New-Item -Path $WorkDir -ItemType Directory | Out-Null }

$log = Join-Path $WorkDir 'optimize_log.txt'
"=== Full Optimization started: $(Get-Date) ===" | Out-File -FilePath $log -Encoding utf8 -Append

function Log($msg) { "$((Get-Date).ToString('s')) - $msg" | Out-File -FilePath $log -Encoding utf8 -Append }

if ($CreateRestorePoint) {
    Log 'Attempting to create System Restore point...'
    try {
        if (Get-Command Checkpoint-Computer -ErrorAction SilentlyContinue) {
            Checkpoint-Computer -Description 'PreOptimization' -RestorePointType 'MODIFY_SETTINGS' -ErrorAction Stop
            Log 'Restore point created.'
        } else {
            Log 'Checkpoint-Computer not available on this system.'
        }
    } catch {
        Log "Restore point creation failed: $($_.Exception.Message)"
    }
}

try {
    Log 'Running SFC /scannow...'
    sfc /scannow *> (Join-Path $WorkDir 'sfc_log.txt')
    Log 'SFC completed.'
} catch {
    Log "SFC failed: $($_.Exception.Message)"
}

try {
    Log 'Running DISM RestoreHealth...'
    dism /Online /Cleanup-Image /RestoreHealth *> (Join-Path $WorkDir 'dism_log.txt')
    Log 'DISM RestoreHealth completed.'
} catch {
    Log "DISM failed: $($_.Exception.Message)"
}

try {
    Log 'Running DISM StartComponentCleanup...'
    dism /Online /Cleanup-Image /StartComponentCleanup *> (Join-Path $WorkDir 'startcomponent_log.txt')
    Log 'StartComponentCleanup completed.'
} catch {
    Log "StartComponentCleanup failed: $($_.Exception.Message)"
}

try {
    Log 'Optimizing volumes (defrag/optimize)...'
    $vols = Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | Select-Object -ExpandProperty DeviceID
    foreach ($v in $vols) {
        $out = Join-Path $WorkDir "defrag_$($v.TrimEnd(':')).txt"
        Log "Defrag $v"
        defrag $v /O *> $out
    }
    Log 'Volume optimization completed.'
} catch {
    Log "Defrag failed: $($_.Exception.Message)"
}

try {
    Log 'Cleaning Temp files older than 3 days...'
    $userTemp = Join-Path $env:LOCALAPPDATA 'Temp'
    $sysTemp = Join-Path $env:windir 'Temp'
    $tempLog = Join-Path $WorkDir 'tempcleanup_log.txt'
    Try {
        if (Test-Path $userTemp) { Get-ChildItem -Path $userTemp -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-3) } | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue }
        if (Test-Path $sysTemp) { Get-ChildItem -Path $sysTemp -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-3) } | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue }
        Log 'Temp cleanup done.'
    } Catch {
        Log "Temp cleanup error: $($_.Exception.Message)"
    }
} catch {
    Log "Temp cleanup failed: $($_.Exception.Message)"
}

try {
    Log 'Clearing Recycle Bin...'
    Clear-RecycleBin -Force -ErrorAction SilentlyContinue
    Log 'Recycle Bin cleared.'
} catch {
    Log "Clear-RecycleBin failed: $($_.Exception.Message)"
}

Log 'Full Optimization finished.'
"=== Full Optimization finished: $(Get-Date) ===" | Out-File -FilePath $log -Encoding utf8 -Append

exit 0
