@echo off
set ROKU_IP=172.19.13.118
set AUTH=rokudev:RB86

echo [1/3] Limpiando paquetes antiguos...
if exist cookflow.zip del cookflow.zip

echo [2/3] Creando nuevo ZIP (Excluyendo basura)...
:: Usamos PowerShell para que sea universal en Windows
powershell -Command "Compress-Archive -Path source, components, images, manifest -DestinationPath cookflow.zip -Force"

echo [3/3] Enviando a Roku en %ROKU_IP%...
curl --user %AUTH% --digest -S -F "mysubmit=Replace" -F "archive=@cookflow.zip" -F "passwd=" http://%ROKU_IP%/plugin_install

echo.
echo === ¡PROCESO TERMINADO! ===
pause