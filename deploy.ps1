# PowerShell Script to Deploy CookFlow to Roku
# Usage: ./deploy.ps1 -Ip "172.19.13.118" -Password "RB86"

param (
    [string]$Ip = "10.130.43.118",
    [string]$User = "rokudev",
    [SecureString]$Password = (ConvertTo-SecureString "RB86" -AsPlainText -Force)
)

$ErrorActionPreference = "Stop"
$SourceDir = "$PSScriptRoot\roku-app"
$ZipFile = "$PSScriptRoot\out\cookflow_app.zip"
$OutDir = "$PSScriptRoot\out"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   COOKFLOW ROKU DEPLOYMENT" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Clean & Prepare
if (Test-Path $OutDir) { Remove-Item $OutDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

# 2. Zip Application
Write-Host "[ACTION] Zipping source directory (Explicit Items)..." -ForegroundColor Yellow
Push-Location -Path $SourceDir
try {
    # Explicitly select the items we want at the root of the zip
    # This prevents accidental inclusion of parent folders or hidden files
    # Compress all items in the current directory to the destination zip
    Get-ChildItem -Path . | Compress-Archive -DestinationPath $ZipFile -Force
}
finally {
    Pop-Location
}

# 3. Verify Zip Structure (Debug)
Write-Host "[DEBUG] Verifying zip structure..." -ForegroundColor Magenta
$VerifyDir = "$OutDir\verify_zip"
Expand-Archive -Path $ZipFile -DestinationPath $VerifyDir -Force
Get-ChildItem -Path $VerifyDir -Recurse | Select-Object FullName
if (-not (Test-Path "$VerifyDir\source\Theme.brs")) {
    Write-Host "[ERROR] SOURCE FOLDER MISSING IN ZIP!" -ForegroundColor Red
    # exit 1 
}

# 4. Deploy to Roku
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
# Decode SecureString for curl
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
$PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
$Auth = "$($User):$($PlainPassword)"

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
