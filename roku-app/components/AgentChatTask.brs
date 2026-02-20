sub init()
    m.top.functionName = "chatWithAgent"
end sub

sub chatWithAgent()
    message = m.top.message
    userId = m.top.userId
    
    ' URL de la Edge Function
    url = "https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1/chat-agent"
    
    request = CreateObject("roUrlTransfer")
    request.SetCertificatesFile("common:/certs/ca-bundle.crt")
    request.InitClientCertificates()
    request.SetUrl(url)
    request.SetRequest("POST")
    request.AddHeader("Content-Type", "application/json")
    
    ' TODO: Add Authorization header if needed (Anon key usually)
    ' request.AddHeader("Authorization", "Bearer " + ANON_KEY) 
    ' Para simplificar, asumimos que la función maneja CORS y es pública o la key está hardcoded/config
    ' Hardcoding Anon Key for demo (NOT SECURE PRODUCTION PRACTICE)
    ' Lo ideal es pasarla desde MainScene appConfig
    
    payload = {
        message: message,
        userId: userId
    }
    
    jsonPayload = FormatJson(payload)
    
    if request.AsyncPostFromString(jsonPayload)
        port = CreateObject("roMessagePort")
        request.SetPort(port)
        
        msg = wait(10000, port) ' 10s timeout
        if type(msg) = "roUrlEvent"
            if msg.GetInt() = 200
                responseStr = msg.GetString()
                json = ParseJson(responseStr)
                if json <> invalid
                    m.top.response = json
                end if
            end if
        end if
    end if
end sub
