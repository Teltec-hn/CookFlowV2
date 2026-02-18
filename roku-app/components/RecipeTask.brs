sub init()
    m.top.functionName = "executeRequest"
end sub

sub executeRequest()
    http = CreateObject("roUrlTransfer")
    url = m.top.apiUrl + "/get-recipes?query=pasta"
    http.SetUrl(url)
    http.SetCertificatesFile("common:/certs/ca-bundle.crt")
    http.InitClientCertificates()
    
    ' Aumentamos el tiempo de espera por si la nube está "despertando"
    print "VP LOG: [RED] Petición lanzada a Supabase... esperando respuesta..."
    
    response = http.GetToString()
    
    if response <> ""
        print "VP LOG: [RED] ¡Datos recibidos con éxito!"
        m.top.response = response
    else
        print "VP LOG: [RED] Error: El servidor tardó demasiado o no respondió."
        m.top.response = "[]"
    end if
end sub