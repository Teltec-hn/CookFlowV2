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
        "supabase_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjZmh2Z2t1Y2FpbWNoZnhidHViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNDA1MjQsImV4cCI6MjA4NjkxNjUyNH0.S2Ujl1xsOoz-ZLcEMjOjpSx4Sqi2EIBbByE2TJ-ZBv4",
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