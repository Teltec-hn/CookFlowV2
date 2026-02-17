# PowerShell Script to Automate Network Setup for CookFlow (Roku <-> WSL/Windows)
# Must run as Administrator for NetSh commands

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   COOKFLOW DEVOPS AUTOMATION V2.1.2" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Detect Host IP (Raw IPv4)
# Prioritize actual network adapters over virtual ones
$ipInfo = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { 
    $_.InterfaceAlias -notlike "*vEthernet*" -and 
    $_.InterfaceAlias -notlike "*Loopback*" -and 
    $_.PrefixOrigin -eq "Dhcp" 
} | Select-Object -First 1

if ($null -eq $ipInfo) {
    # Fallback method using .NET DNS resolution (System Default)
    # This is the "Pro Version" user requested
    try {
        $HostIP = (Test-Connection $env:COMPUTERNAME -Count 1).IPv4Address.IPAddressToString
    }
    catch {
        # Ultimate fallback
        $HostIP = "127.0.0.1"
    }
}
else {
    $HostIP = $ipInfo.IPAddress
}

Write-Host "[INFO] Detected Windows LAN IP: $HostIP" -ForegroundColor Green

# 2. Update .env for Docker (The "Smart DNS" Link)
$EnvPath = "C:\Client\CookFlow\.env"
$EnvContent = "WINDOWS_HOST_IP=$HostIP"
Set-Content -Path $EnvPath -Value $EnvContent
Write-Host "[SUCCESS] Updated .env file with WINDOWS_HOST_IP=$HostIP" -ForegroundColor Green

# 3. Update Roku Manifest (Surgical Replace)
$ManifestPath = "C:\Client\CookFlow\cookflow_roku\manifest"
if (Test-Path $ManifestPath) {
    # Read content
    $content = Get-Content $ManifestPath
    
    # Regex replace to update api_dev_ip=ANYTHING with api_dev_ip=ACTUAL_IP
    # Using regex ensures we don't duplicate lines
    $newContent = $content -replace '^api_dev_ip=.*', "api_dev_ip=$HostIP"
    
    # Write back
    $newContent | Set-Content $ManifestPath
    Write-Host "🚀 Manifest sincronizado con IP: $HostIP" -ForegroundColor Cyan
    
}
else {
    Write-Host "[WARN] Manifest file not found at $ManifestPath" -ForegroundColor Gray
}

# 4. Configure Port Proxy (Windows -> WSL) if WSL is active
# (Optional Check: only runs if wsl command works)
if (Get-Command wsl -ErrorAction SilentlyContinue) {
    try {
        $wslIp = (wsl hostname -I).Trim()
        
        if ($wslIp) {
            Write-Host "[INFO] WSL2 Instance Detected at IP: $wslIp" -ForegroundColor Cyan
            
            # Add port proxy
            netsh interface portproxy add v4tov4 listenport=8000 listenaddress=0.0.0.0 connectport=8000 connectaddress=$wslIp
            Write-Host "[SUCCESS] PortProxy (0.0.0.0:8000 -> WSL:8000) configured." -ForegroundColor Green
            
            # Firewall
            New-NetFirewallRule -DisplayName "CookFlow Dev API" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue
            Write-Host "[SUCCESS] Firewall rule verified." -ForegroundColor Green
        }
    }
    catch {
        Write-Host "[INFO] Could not configure WSL PortProxy (WSL might be stopped or not installed)." -ForegroundColor Gray
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETE. Run 'docker-compose up' now." -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
