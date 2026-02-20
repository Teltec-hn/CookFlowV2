sub init()
    m.fillRect = m.top.findNode("fillRect")
    m.maxHeight = 150
end sub

sub onProgressChanged()
    percent = m.top.progress
    if percent = invalid then percent = 0.0
    if percent > 1.0 then percent = 1.0
    if percent < 0.0 then percent = 0.0

    ' Grows from bottom up: Y moves up as height grows
    ' 0%  -> height=0,   Y=150  (empty)
    ' 55% -> height=82,  Y=68   (half full)
    ' 100%-> height=150, Y=0    (full)
    if m.fillRect <> invalid
        newHeight = Int(m.maxHeight * percent)
        m.fillRect.height = newHeight
        m.fillRect.translation = [0, m.maxHeight - newHeight]
    end if
end sub
