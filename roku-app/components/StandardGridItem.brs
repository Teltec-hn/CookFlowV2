sub init()
    ' Guardamos las referencias a los nodos visuales
    m.poster = m.top.findNode("poster")
    m.title = m.top.findNode("title")
end sub

' Esta función se activa SOLA cuando el RowList le da una receta a la tarjeta
sub showContent()
    itemData = m.top.itemContent
    
    if itemData <> invalid
        ' hdPosterUrl es la URL de la imagen que viene de Supabase
        m.poster.uri = itemData.hdPosterUrl
        m.title.text = itemData.title
        
        print "VP LOG: [Tarjeta] Pintando: " + itemData.title
    end if
end sub