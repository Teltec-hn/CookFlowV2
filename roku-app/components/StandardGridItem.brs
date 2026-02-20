sub init()
    m.itemContainer = m.top.findNode("itemContainer")
    m.poster = m.top.findNode("poster")
    m.titleLabel = m.top.findNode("titleLabel")
    m.metaLabel = m.top.findNode("metaLabel")
    m.focusRing = m.top.findNode("focusRing")
end sub

sub showContent()
    item = m.top.itemContent
    if item <> invalid
        m.poster.uri = item.hdPosterUrl
        m.titleLabel.text = item.title

        ' Roku usa el campo "description" del ContentNode para datos extra
        if item.description <> invalid and item.description <> ""
            m.metaLabel.text = item.description
        else
            m.metaLabel.text = "⏱️ Cocina a tu ritmo" ' Fallback por si no hay datos
        end if
    end if
end sub

sub showFocus()
    ' Animación de 0.0 a 1.0 basada en el movimiento del control remoto
    scale = 1.0 + (m.top.focusPercent * 0.05) ' Hace un zoom del 5%
    m.itemContainer.scale = [scale, scale]
    m.focusRing.opacity = m.top.focusPercent
end sub