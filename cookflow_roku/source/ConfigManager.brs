' ConfigManager.brs - CookFlow V2.1 (Security-Hardened)
' Gestiona endpoints dinámicos y Smart DNS con validación de seguridad.

function GetConfig() as Object
    appInfo = CreateObject("roAppInfo")
    
    m.config = {
        "is_dev": appInfo.IsDev(),
        "version": appInfo.GetVersion(),
        "timeout": {
            "connect": 5000,
            "request": 10000
        }
    }

    ' Leemos del manifest (inyectado por setup_network.ps1)
    devIp = appInfo.GetValue("api_dev_ip")
    prodUrl = appInfo.GetValue("api_prod_url")

    if m.config.is_dev
        ' Seguridad en Dev: Solo permitimos IPs privadas del segmento configurado (implícito por inyección)
        ' Nota: En un entorno real, podríamos validar regex de IP privada aquí.
        m.config.api_url = "http://" + devIp + ":8000"
        print "[CONFIG] Mode: DEV | Endpoint: " + m.config.api_url
    else
        ' SEGURIDAD EN PROD: Forzamos HTTPS para evitar ataques Man-in-the-Middle
        if prodUrl <> invalid and NOT prodUrl.StartsWith("https://")
            print "[SECURITY ALERT] Production endpoint must use HTTPS! Blocking connection."
            return invalid
        end if
        m.config.api_url = prodUrl
        print "[CONFIG] Mode: PROD | Endpoint: " + m.config.api_url
    end if

    return m.config
end function

' Función segura para construir URLs (Previene inyecciones básicas)
function GetApiUrl(path as String) as String
    config = GetConfig()
    
    ' Fail safe if config is invalid (e.g. insecure prod url)
    if config = invalid then return ""
    
    ' Limpieza básica del path para evitar directory traversal
    cleanPath = path.Replace("..", "") 
    
    ' Ensure no double slashes
    if Left(cleanPath, 1) = "/" then cleanPath = Right(cleanPath, Len(cleanPath) - 1)
    
    return config.api_url + "/" + cleanPath
end function
