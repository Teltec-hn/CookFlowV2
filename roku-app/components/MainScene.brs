sub init()
    m.recipeList = m.top.findNode("recipeList")
    m.statusLabel = m.top.findNode("statusLabel")
    
    ' Lanzar la descarga en segundo plano
    m.loadTask = CreateObject("roSGNode", "RecipeTask")
    m.loadTask.apiUrl = "https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1"
    m.loadTask.observeField("response", "onResponseReceived")
    m.loadTask.control = "RUN"
    
    m.statusLabel.text = "Descargando recetas en segundo plano..."
end sub

sub onResponseReceived()
    jsonString = m.loadTask.response
    if jsonString <> "" and jsonString <> invalid
        json = ParseJson(jsonString)
        if json <> invalid
            populateScreen(json)
            m.statusLabel.text = "Conectado a Cloud"
        else
            m.statusLabel.text = "Error: Datos corruptos"
        end if
    else
        m.statusLabel.text = "Error: Servidor no responde"
    end if
end sub

sub populateScreen(dataArray as Object)
    rootContent = CreateObject("roSGNode", "ContentNode")
    row = rootContent.CreateChild("ContentNode")
    row.title = "Pastas desde Supabase"
    for each item in dataArray
        card = row.CreateChild("ContentNode")
        card.title = item.title
        card.hdPosterUrl = item.image
        card.description = item.summary
    end for
    m.recipeList.content = rootContent
    m.recipeList.visible = true
    m.recipeList.setFocus(true)
end sub