' ConfigManager.brs - CookFlow V2.1 (Cloud-First Edition)
' Versión optimizada para conectar directo a Supabase Edge Functions

function GetConfig() as Object
    ' Hardcodeamos la URL de Producción de Supabase para esta prueba
    ' Esto asegura que el Main.brs reciba una configuración válida y no aborte.
    
    apiUrl = "https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1"

    m.config = {
        "is_dev": true,
        "version": "2.1.0",
        "api_url": apiUrl,
        "timeout": {
            "connect": 5000,
            "request": 10000
        }
    }

    print "[CONFIG] Force-Mode: CLOUD | Endpoint: " + m.config.api_url
    return m.config
end function

function GetApiUrl(path as String) as String
    config = GetConfig()
    if config = invalid then return ""
    
    ' Limpieza básica
    cleanPath = path.Replace("..", "") 
    if Left(cleanPath, 1) = "/" then cleanPath = Right(cleanPath, Len(cleanPath) - 1)
    
    return config.api_url + "/" + cleanPath
end function