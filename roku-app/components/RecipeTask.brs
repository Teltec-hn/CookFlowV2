sub init()
    m.top.functionName = "executeRequest"
end sub

sub executeRequest()
    http = CreateObject("roUrlTransfer")
    url = m.top.apiUrl + "/get-recipes?query=pasta"
    http.SetUrl(url)
    http.SetCertificatesFile("common:/certs/ca-bundle.crt")
    http.InitClientCertificates()
    
    print "VP LOG: [RED] Descargando recetas..."
    ' Ya vimos en el debugger que esto funciona y trae el JSON
    response = http.GetToString()
    
    ' Le pasamos los datos a la escena sin preguntar nada más
    m.top.response = response
end sub