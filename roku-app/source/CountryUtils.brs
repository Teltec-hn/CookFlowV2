' ********************************************************************
' ** Country Detection Utilities
' ********************************************************************

Function GetUserCountry() as Object
    ' Usar ip-api.com para detección simple basada en IP
    ' En producción, esto debería hacerse en el backend para evitar rate limits
    url = "http://ip-api.com/json/?fields=country,countryCode"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    
    response = request.GetToString()
    
    if response <> invalid and response <> ""
        json = ParseJson(response)
        if json <> invalid and json.countryCode <> invalid
            return {
                name: json.country,
                code: json.countryCode
            }
        end if
    end if
    
    ' Fallback por defecto
    return {
        name: "Global",
        code: "US"
    }
End Function

Function GetFlagUrl(countryCode as String) as String
    if countryCode = invalid then return ""
    return "pkg:/images/flags/" + LCase(countryCode) + ".png"
End Function
