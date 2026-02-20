sub init()
    m.top.functionName = "executeRequest"
end sub

sub executeRequest()
    m.port = CreateObject("roMessagePort")
    http = CreateObject("roUrlTransfer")
    url = m.top.apiUrl + "/get-recipes?query=pasta"
    http.SetUrl(url)
    http.SetCertificatesFile("common:/certs/ca-bundle.crt")
    http.InitClientCertificates()
    http.SetPort(m.port)
    
    if http.AsyncGetToString()
        msg = wait(0, m.port)
        if type(msg) = "roUrlEvent"
            code = msg.GetResponseCode()
            if code = 200
                m.top.response = msg.GetString()
            else
                print "RecipeTask Error: " + Str(code)
                m.top.response = "[]"
            end if
        end if
    else
        m.top.response = "[]"
    end if
end sub