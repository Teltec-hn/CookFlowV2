sub init()
    m.mainUI = m.top.findNode("mainUI")
    m.welcomeLayer = m.top.findNode("welcomeLayer")
    m.welcomeImage = m.top.findNode("welcomeImage")
    m.recipeList = m.top.findNode("recipeList")
    
    ' 1. Configurar el Timer para el Fade Manual
    m.fadeTimer = m.top.findNode("fadeTimer")
    m.fadeTimer.observeField("fire", "onFadeTick")
    m.fadeTimer.control = "start"
    
    print "VP LOG: [UI] Iniciando Fade Manual..."

    ' 2. Carga de datos (Supabase)
    m.loadTask = CreateObject("roSGNode", "RecipeTask")
    m.loadTask.apiUrl = "https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1"
    m.loadTask.observeField("response", "onDataArrived")
    m.loadTask.control = "RUN"
end sub

' Esta función se ejecuta 20 veces por segundo
sub onFadeTick()
    currentOpacity = m.welcomeImage.opacity
    
    if currentOpacity < 1.0
        ' Aumentamos la opacidad gradualmente
        m.welcomeImage.opacity = currentOpacity + 0.05
    else
        ' Cuando llega a 1 (totalmente visible), paramos y esperamos un poco
        m.fadeTimer.control = "stop"
        ' Damos 1.5 segundos de gloria al logo y luego entramos al menú
        print "VP LOG: [UI] Intro completa. Saltando al menú."
        m.welcomeLayer.visible = false
        m.mainUI.visible = true
        m.recipeList.setFocus(true)
    end if
end sub

sub onDataArrived()
    jsonString = m.loadTask.response
    if jsonString <> "" and jsonString <> invalid
        data = ParseJson(jsonString)
        if data <> invalid then renderRecipes(data)
    end if
end sub

sub renderRecipes(data as Object)
    root = CreateObject("roSGNode", "ContentNode")
    row = root.CreateChild("ContentNode")
    for each item in data
        node = row.CreateChild("ContentNode")
        node.title = item.title
        node.hdPosterUrl = item.image
    end for
    m.recipeList.content = root
end sub