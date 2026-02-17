# PowerShell Script to Deploy CookFlow to Roku
# Usage: ./deploy.ps1 -Ip "172.19.13.118" -Password "RB86"

param (
    [string]$Ip = "172.19.13.118",
    [string]$User = "rokudev",
    [string]$Password = "RB86"
)

$ErrorActionPreference = "Stop"
$SourceDir = "$PSScriptRoot\cookflow_roku"
$ZipFile = "$PSScriptRoot\out\cookflow_app.zip"
$OutDir = "$PSScriptRoot\out"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   COOKFLOW ROKU DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Clean & Prepare
if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# 2. Zip Application
Write-Host "[ACTION] Zipping source directory..." -ForegroundColor Yellow
# Compress-Archive requires the *contents* of the folder, not the folder itself
Compress-Archive -Path "$SourceDir\*" -DestinationPath $ZipFile -Force

# 3. Deploy to Roku
Write-Host "[ACTION] Uploading to Roku ($Ip)..." -ForegroundColor Yellow
$BaseUrl = "http://$Ip"

# Check if Roku is reachable
if (-not (Test-Connection -ComputerName $Ip -Count 1 -Quiet)) {
    Write-Host "[ERROR] Roku device at $Ip is not reachable." -ForegroundColor Red
    exit 1
}

# Use curl (Windows 10/11 includes curl.exe)
# Roku installer expects the file form field to be named 'archive'
# and the action to be 'Replace' (install)
$UploadUrl = "$BaseUrl/plugin_install"
$Auth = "$($User):$($Password)"

# We use curl.exe directly because Invoke-RestMethod with multipart/form-data is verbose in older PS versions
try {
    # Delete existing app first (optional but clean)
    # curl -u $Auth -X POST "$BaseUrl/plugin_install?mysubmit=Delete" 
    
    # Install new app
    $curlArgs = @(
        "-u", "$Auth",
        "--digest", 
        "-s", "-S",
        "-F", "mysubmit=Install",
        "-F", "archive=@$ZipFile",
        "$UploadUrl"
    )
    
    $result = & curl.exe @curlArgs
    
    if ($LASTEXITCODE -eq 0 -and $result -match "Application Received") {
        Write-Host "[SUCCESS] App deployed and launched!" -ForegroundColor Green
    }
    else {
        Write-Host "[INFO] Deployment finished. Check device." -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Gray
    }

}
catch {
    Write-Host "[ERROR] Deployment failed: $_" -ForegroundColor Red
}

Write-Host "==========================================" -ForegroundColor Cyan
