' ********************************************************************
' ** CookFlow V2.1 Kernel - Main Entry Point
' ********************************************************************

sub Main()
    ' 1. INICIAR SISTEMA
    screen = CreateObject("roSGScreen")
    m.port = CreateObject("roMessagePort")
    screen.SetMessagePort(m.port)

    ' 2. CARGAR CONFIGURACIÓN
    config = GetConfig()
    if config = invalid then return

    ' 3. INYECTAR CONTEXTO GLOBAL
    m.global = screen.GetGlobalNode()
    m.global.addField("appConfig", "roAssociativeArray", false)
    m.global.appConfig = config


    ' 5. LANZAR UI
    scene = screen.CreateScene("MainScene")
    screen.Show()
    scene.setFocus(true) ' Fundamental para que el FlowChef reciba inputs

    ' 6. EVENT LOOP
    while(true)
        msg = wait(0, m.port)
        msgType = type(msg)
        if msgType = "roSGScreenEvent"
            if msg.isScreenClosed() then return
        end if
    end while
end sub

' Función Helper para descargar en el Main Thread
function FetchRecipesSync(baseUrl as string) as string
    url = baseUrl + "/get-recipes?query=pasta"

    http = CreateObject("roUrlTransfer")
    http.SetUrl(url)
    http.SetCertificatesFile("common:/certs/ca-bundle.crt")
    http.InitClientCertificates()

    response = http.GetToString()
    if response = "" then return "[]" ' Retornar array vacío si falla
    return response
end function