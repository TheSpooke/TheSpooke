@echo off
:: TheSpooke Optimizer - Launcher (intenta PowerShell, con fallback en batch)
setlocal EnableExtensions EnableDelayedExpansion

echo Lanzando el menú PowerShell de TheSpooke Optimizer...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\menu.ps1"
if %ERRORLEVEL% EQU 0 (
	echo Menu PowerShell finalizado correctamente.
	exit /b 0
)

:FALLBACK
echo.
echo [AVISO] No se pudo ejecutar el menú PowerShell; entrando en modo fallback por batch.
echo.
set "WORKDIR=%TEMP%\PC_Optimizacion_%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
if not exist "%WORKDIR%" mkdir "%WORKDIR%" 2>nul

:MENU_B
cls
echo ======================================
echo  THE SPOOKE OPTIMIZER - Modo Batch (Fallback)
echo ======================================
echo.
echo  1) Full Optimization (ejecuta `optimize.ps1` via PowerShell)
echo  2) Gamer Mode (no implementado en batch)
echo  3) Limpiar caches de navegadores (ejecuta `clean_browser_caches.ps1`)
echo  4) Abrir carpeta de reportes (si existe)
echo  5) Ejecutar recon no destructivo (ejecuta `recon_target.ps1`)
echo  6) Limpiar caches con PowerShell (alias 3)
echo  0) Salir
echo.
set /p "CHOICE=Seleccione una opción (0-6): "
if "%CHOICE%"=="1" goto RUN_OPT
if "%CHOICE%"=="2" goto GAMER
if "%CHOICE%"=="3" goto RUN_CLEAN
if "%CHOICE%"=="4" goto OPEN_WORKDIR
if "%CHOICE%"=="5" goto RUN_RECON
if "%CHOICE%"=="6" goto RUN_CLEAN
if "%CHOICE%"=="0" goto FIN
echo Opción inválida.
pause
goto MENU_B

:RUN_OPT
echo Ejecutando `optimize.ps1` via PowerShell (se requiere elevación para algunas acciones)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\optimize.ps1" -WorkDir "%WORKDIR%"
echo Ejecutado. Revise logs en %WORKDIR% si los hay.
pause
goto MENU_B

:RUN_CLEAN
echo Ejecutando `clean_browser_caches.ps1` via PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\clean_browser_caches.ps1" -WorkDir "%WORKDIR%"
echo Ejecutado. Revise logs en %WORKDIR%.
pause
goto MENU_B

:RUN_RECON
echo Ejecutando `recon_target.ps1` via PowerShell (no destructivo)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\recon_target.ps1" -WorkDir "%WORKDIR%"
echo Recon finalizado. Logs en %WORKDIR%.
pause
goto MENU_B

:OPEN_WORKDIR
if exist "%WORKDIR%" (
	start "" "%WORKDIR%"
) else (
	echo No se ha creado la carpeta de trabajo aun: %WORKDIR%
)
pause
goto MENU_B

:GAMER
echo Gamer Mode no disponible en fallback batch. Use el menú PowerShell para más opciones.
pause
goto MENU_B

:FIN
echo Saliendo...
endlocal
exit /b 0
