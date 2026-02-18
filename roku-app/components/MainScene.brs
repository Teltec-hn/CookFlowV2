sub init()
    m.recipeList = m.top.findNode("recipeList")
    m.statusLabel = m.top.findNode("statusLabel")

    ' 1. Crear el Task
    m.loadTask = CreateObject("roSGNode", "RecipeTask")
    m.loadTask.apiUrl = "https://hcfhvgkucaimchfxbtub.supabase.co/functions/v1"
    
    ' 2. Observar la respuesta
    m.loadTask.observeField("response", "onDataArrived")
    
    ' 3. Ejecutar
    m.loadTask.control = "RUN"
    m.statusLabel.text = "Sincronizando con CookFlow Cloud..."
end sub

sub onDataArrived()
    print "VP LOG: [UI] El Task ha terminado. Procesando JSON..."
    jsonString = m.loadTask.response
    
    if jsonString = "" or jsonString = invalid
        m.statusLabel.text = "Error: Respuesta vacía de la nube."
        return
    end if

    data = ParseJson(jsonString)

    if data <> invalid and type(data) = "roArray"
        print "VP LOG: [UI] JSON válido. Recetas encontradas: " + data.Count().ToStr()
        renderRecipes(data)
    else
        print "VP LOG: [ERROR] El JSON no es un array válido o está corrupto."
        m.statusLabel.text = "Error: Formato de datos no compatible."
    end if
end sub

sub renderRecipes(data as Object)
    ' Limpiamos cualquier rastro anterior
    m.recipeList.content = invalid

    ' Construimos el árbol de contenido (ContentNode)
    root = CreateObject("roSGNode", "ContentNode")
    row = root.CreateChild("ContentNode")
    row.title = "Pastas de la Casa"

    for each item in data
        ' Creamos un nodo por cada plato
        node = row.CreateChild("ContentNode")
        node.title = item.title
        node.hdPosterUrl = item.image ' Esta URL viene de Spoonacular
        node.description = item.summary
        print "VP LOG: [UI] Preparando tarjeta para: " + item.title
    end for

    ' INYECCIÓN FINAL
    m.recipeList.content = root
    m.recipeList.visible = true
    m.recipeList.setFocus(true)
    
    m.statusLabel.text = "CookFlow V2.1 - Menú Actualizado"
    print "VP LOG: [UI] ¡Renderizado completo!"
end sub 