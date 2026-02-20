' ********************************************************************
' ** CountryTask Logic
' ********************************************************************

' Importar utilidades desde source
' Nota: En SceneGraph, para usar funciones de source en un Task, 
' a veces es mejor incluirlas directamente o usar <script> en el XML.
' Como CountryUtils.brs está en source, intentaremos cargarlo.

Sub Init()
    m.top.functionName = "GetCountry"
End Sub

Sub GetCountry()
    ' Copiamos la lógica de CountryUtils aquí para asegurar ejecución en el Task thread
    ' O usamos un objeto global si fuera posible, pero Task es aislado.
    ' Lo más seguro es replicar la lógica o incluir el script en el XML.
    
    ' Usar ip-api.com
    url = "http://ip-api.com/json/?fields=country,countryCode"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    
    response = request.GetToString()
    
    info = { name: "Mundo", code: "US" }
    
    if response <> invalid and response <> ""
        json = ParseJson(response)
        if json <> invalid and json.countryCode <> invalid
            info = {
                name: json.country,
                code: json.countryCode
            }
        end if
    end if
    
    m.top.countryInfo = info
End Sub
