sub init()
    m.recipeImage = m.top.findNode("recipeImage")
    m.recipeTitle = m.top.findNode("recipeTitle")
    m.recipeMetadata = m.top.findNode("recipeMetadata")
    m.recipeDescription = m.top.findNode("recipeDescription")
end sub

sub onContentChange()
    content = m.top.content
    if content <> invalid
        m.recipeImage.uri = content.hdPosterUrl
        m.recipeTitle.text = content.title
        m.recipeMetadata.text = "⏱️ Tiempo estimado: 20-30 min  |  Nivel: Flow"

        if content.description <> invalid and content.description <> ""
            m.recipeDescription.text = content.description
        else
            m.recipeDescription.text = "Una deliciosa receta seleccionada exclusivamente por FlowChef para deleitar tus sentidos y aportar al Cáliz."
        end if
    end if
end sub

function onKeyEvent(key as string, press as boolean) as boolean
    handled = false
    if press
        if key = "back" or key = "OK" or key = "select"
            ' Disparamos un evento para que MainScene decida cómo ocultarlo
            m.top.closeEvent = true
            handled = true
        end if
    end if
    return handled
end function
