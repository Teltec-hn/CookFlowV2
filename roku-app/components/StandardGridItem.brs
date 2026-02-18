sub itemContentChanged()
    ' Obtenemos los datos de la receta
    itemData = m.top.itemContent
    
    ' Referencias a la UI interna
    m.poster = m.top.findNode("poster")
    m.title = m.top.findNode("title")

    ' Inyectamos los datos
    m.poster.uri = itemData.hdPosterUrl
    m.title.text = itemData.title
end sub