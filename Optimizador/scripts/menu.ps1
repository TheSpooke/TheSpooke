<#
 Menu principal para TheSpooke Optimizer (PowerShell)
 Idioma: Español
 Ejecutar desde: TheSpooke_Optimizer_Safe_Starter.bat o directamente con PowerShell
#>

function Is-Admin {
    $current = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($current)
    return $principal.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator)
}

try {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
} catch {
    $scriptDir = Get-Location
}

$STAMP = (Get-Date).ToString('yyyyMMdd_HHmmss')
$WORKDIR = Join-Path $env:TEMP "PC_Optimizacion_$STAMP"
if (-not (Test-Path $WORKDIR)) { New-Item -Path $WORKDIR -ItemType Directory | Out-Null }

$DEBUG = Join-Path $WORKDIR 'debug.log'
"=== MENU START $(Get-Date) ===" | Out-File -FilePath $DEBUG -Encoding utf8 -Append

function Log($m) { "$((Get-Date).ToString('s')) - $m" | Out-File -FilePath $DEBUG -Encoding utf8 -Append }

function Pause-PressAny { Write-Host ''; Read-Host 'Presiona ENTER para continuar...' | Out-Null }

while ($true) {
    Clear-Host
    Write-Host '======================================' -ForegroundColor Cyan
    Write-Host '  THE SPOOKE OPTIMIZER - Menu Principal' -ForegroundColor Green
    Write-Host '======================================' -ForegroundColor Cyan
    Write-Host "Carpeta de trabajo: $WORKDIR`n"
    Write-Host 'Elige una opción:'
    Write-Host '  1) Optimización completa (requiere administrador)'
    Write-Host '  2) Modo Gamer (simulado)'
    Write-Host '  3) Limpiar caches de navegadores (opción individual)'
    Write-Host '  4) Ejecutar recon no destructivo (scripts de recon)'
    Write-Host '  5) Abrir carpeta de reportes'
    Write-Host '  6) Programar CHKDSK /f en el próximo arranque'
    Write-Host '  0) Salir'
    $opt = Read-Host 'Selecciona (0-6)'

    switch ($opt) {
        '1' {
            if (-not (Is-Admin)) {
                Write-Warning 'Esta opción requiere privilegios de administrador. Reinicia PowerShell/CMD como administrador.'
                Log 'Usuario no administrador intentó ejecutar Optimización completa.'
                Pause-PressAny
                continue
            }

            Write-Host 'Has elegido: Optimización completa' -ForegroundColor Yellow
            $proceed = Read-Host 'Deseas continuar? (Y/N) [N]'
            if ($proceed -ne 'Y') { Log 'Optimización completa cancelada por usuario.'; continue }

            $rp = Read-Host 'Crear punto de restauración antes? (Y/N) [Y]'
            $createRP = $false
            if ($rp -eq '' -or $rp -eq 'Y') { $createRP = $true }

            Log "Iniciando Optimización completa. CrearRestorePoint=$createRP"
            try {
                # Ejecutar optimize.ps1
                if ($createRP) { & "${scriptDir}\optimize.ps1" -WorkDir $WORKDIR -CreateRestorePoint } else { & "${scriptDir}\optimize.ps1" -WorkDir $WORKDIR }
                Log 'optimize.ps1 finalizó.'
            } catch {
                Log "Error ejecutando optimize.ps1: $($_.Exception.Message)"
                Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            }
            Write-Host "Optimización completada. Revisa logs en: $WORKDIR"

            # Preguntar si comprimir backups/logs
            $zipAns = Read-Host '¿Comprimir backups y logs en un ZIP para ahorrar espacio? (Y/N) [Y]'
            if ($zipAns -eq '' -or $zipAns -eq 'Y') {
                try {
                    $zipPath = Join-Path $WORKDIR ("opt_backup_$STAMP.zip")
                    Log "Comprimiendo $WORKDIR a $zipPath"
                    Compress-Archive -Path (Join-Path $WORKDIR '*') -DestinationPath $zipPath -Force
                    Log "Compresión completada: $zipPath"
                    Write-Host "Compresión completada: $zipPath"
                } catch {
                    Log "Error comprimiendo: $($_.Exception.Message)"
                    Write-Host "Error al comprimir: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            Pause-PressAny
        }
        '2' {
            Write-Host 'Modo Gamer (simulado): minimizando procesos en segundo plano (simulación).' -ForegroundColor Yellow
            Log 'Modo Gamer activado (simulado)'
            Start-Sleep -Seconds 2
            Write-Host 'Presiona ENTER para restaurar.'
            Pause-PressAny
            Log 'Modo Gamer desactivado (simulado)'
        }
        '3' {
            Write-Host 'Limpiar caches de navegadores (opción individual)'
            $bk = Read-Host 'Crear backup de caches antes de borrar? (Y/N) [Y]'
            $backupFlag = $false
            if ($bk -eq '' -or $bk -eq 'Y') { $backupFlag = $true }
            Log "Iniciando limpieza de caches de navegadores. Backup=$backupFlag"
            try {
                if ($backupFlag) { & "${scriptDir}\clean_browser_caches.ps1" -WorkDir $WORKDIR -Backup } else { & "${scriptDir}\clean_browser_caches.ps1" -WorkDir $WORKDIR }
                Log 'clean_browser_caches.ps1 finalizó.'
            } catch {
                Log "Error ejecutando clean_browser_caches.ps1: $($_.Exception.Message)"
                Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            }
            Write-Host "Limpieza de caches finalizada. Revisa logs en: $WORKDIR"

            $zipAns = Read-Host '¿Comprimir backups y logs en un ZIP para ahorrar espacio? (Y/N) [Y]'
            if ($zipAns -eq '' -or $zipAns -eq 'Y') {
                try {
                    $zipPath = Join-Path $WORKDIR ("cache_backup_$STAMP.zip")
                    Log "Comprimiendo $WORKDIR a $zipPath"
                    Compress-Archive -Path (Join-Path $WORKDIR '*') -DestinationPath $zipPath -Force
                    Log "Compresión completada: $zipPath"
                    Write-Host "Compresión completada: $zipPath"
                } catch {
                    Log "Error comprimiendo: $($_.Exception.Message)"
                    Write-Host "Error al comprimir: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            Pause-PressAny
        }
        '4' {
            Write-Host 'Ejecutar recon no destructivo'
            $target = Read-Host 'Introduce la URL objetivo (ej: https://example.com)'
            if ($target -and $target -match '^https?://') {
                try {
                    & "${scriptDir}\recon_target.ps1" -Target $target -OutDir (Join-Path $WORKDIR 'scripts_output')
                    Log "Recon ejecutado para $target"
                    Write-Host "Recon ejecutado. Salida en: $(Join-Path $WORKDIR 'scripts_output')"
                } catch {
                    Log "Error recon: $($_.Exception.Message)"
                    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
                }
            } else { Write-Warning 'URL no válida, se requiere http/https.' }
            Pause-PressAny
        }
        '5' {
            Write-Host "Abriendo carpeta de trabajo: $WORKDIR"
            Start-Process explorer.exe -ArgumentList $WORKDIR
            Pause-PressAny
        }
        '6' {
            if (-not (Is-Admin)) {
                Write-Warning 'Programar CHKDSK requiere privilegios de administrador. Reinicia PowerShell/CMD como administrador.'
                Log 'Intento de programar CHKDSK por usuario sin admin.'
                Pause-PressAny
                continue
            }
            Write-Host 'Programar CHKDSK /f en el próximo arranque para unidades de sistema.'
            $confirmCh = Read-Host '¿Deseas programar CHKDSK /f para las unidades detectadas? (Y/N) [N]'
            if ($confirmCh -ne 'Y') { Log 'Programación CHKDSK cancelada por usuario.'; continue }
            try {
                $vols = Get-CimInstance -ClassName Win32_LogicalDisk | Where-Object { $_.DriveType -eq 3 } | Select-Object -ExpandProperty DeviceID
                foreach ($v in $vols) {
                    Log "Programando CHKDSK /F para $v"
                    # Ejecutar chkdsk con confirmación automatizada para programar en próximo arranque si es necesario
                    cmd /c "echo Y|chkdsk $v /F" | Out-Null
                }
                Write-Host 'CHKDSK programado para el próximo arranque en las unidades detectadas (si fue necesario).'
                Log 'CHKDSK programado.'
            } catch {
                Log "Error programando CHKDSK: $($_.Exception.Message)"
                Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            }
            Pause-PressAny
        }
        '0' {
            Log 'Usuario saliendo del menu.'
            break
        }
        default {
            Write-Warning 'Opción no válida.'
            Pause-PressAny
        }
    }
}

"=== MENU END $(Get-Date) ===" | Out-File -FilePath $DEBUG -Encoding utf8 -Append
Write-Host 'Saliendo. Gracias.'
exit 0
